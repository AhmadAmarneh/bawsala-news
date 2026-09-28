'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import type { Article, Category } from '@/lib/types';

interface EditorFormProps {
  categories: Category[];
  article: Article | null;
}

export function EditorForm({ categories, article }: EditorFormProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [categoryId, setCategoryId] = useState<string>(article?.category_id || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const articleId = article?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please fill out the title and content.');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    let error;
    if (articleId) {
      // Update
      const result = await supabase.from('articles').update({
        title,
        content,
        category_id: categoryId || null,
      }).eq('id', articleId);
      error = result.error;
    } else {
      // Insert
      const result = await supabase.from('articles').insert({
        title,
        content,
        type: 'exclusive',
        category_id: categoryId || null,
        author_id: user?.id,
        published_at: new Date().toISOString(),
      });
      error = result.error;
    }

    setLoading(false);

    if (error) {
      alert('Failed to save article.');
      console.error(error);
    } else {
      alert(articleId ? 'Article updated successfully!' : 'Article published successfully!');
      router.push('/dashboard/articles');
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{articleId ? 'Edit Article' : 'Write New Article'}</h1>
        <p className="text-slate-500 mt-2">{articleId ? 'Update your local story.' : 'Publish an exclusive local story.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Article Title</Label>
          <Input 
            id="title" 
            placeholder="Enter an engaging title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (articleId ? 'Update Article' : 'Publish Article')}
          </Button>
        </div>
      </form>
    </div>
  );
}
