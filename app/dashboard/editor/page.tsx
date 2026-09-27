'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

export default function EditorPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from('categories').select('id, name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Please fill out the title and content.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('articles').insert({
      title,
      content,
      type: 'exclusive',
      category_id: categoryId || null,
      published_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      alert('Failed to save article.');
      console.error(error);
    } else {
      alert('Article published successfully!');
      router.push('/dashboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Write New Article</h1>
        <p className="text-slate-500 mt-2">Publish an exclusive local story.</p>
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
            {loading ? 'Publishing...' : 'Publish Article'}
          </Button>
        </div>
      </form>
    </div>
  );
}
