import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { deleteArticle } from '@/app/actions/article-actions';
import { DeleteArticleButton } from './DeleteArticleButton';

export default async function ArticlesManagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role;

  if (role !== 'admin' && role !== 'journalist') {
    redirect('/');
  }

  // Fetch articles. If admin, see all exclusive. If journalist, see own.
  let query = supabase
    .from('articles')
    .select('id, title, published_at, categories(name)')
    .eq('type', 'exclusive')
    .order('published_at', { ascending: false });

  if (role === 'journalist') {
    query = query.eq('author_id', user.id);
  }

  const { data: articles, error } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Articles Management</h1>
          <p className="text-slate-500 mt-2">Manage your published local stories.</p>
        </div>
        <Link href="/dashboard/editor">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!articles || articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  No articles found. Start writing!
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {Array.isArray(article.categories) ? article.categories[0]?.name : (article.categories as any)?.name || 'Uncategorized'}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(article.published_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/editor?id=${article.id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4 text-blue-600" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <DeleteArticleButton articleId={article.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
