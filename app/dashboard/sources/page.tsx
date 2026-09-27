'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Rss } from 'lucide-react';

const sourceSchema = z.object({
  name: z.string().min(1, 'Source name is required'),
  rss_url: z.string().url('Must be a valid URL (e.g., https://example.com/rss)'),
});

type SourceFormValues = z.infer<typeof sourceSchema>;

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<string | null>(null);
  
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SourceFormValues>({
    resolver: zodResolver(sourceSchema),
  });

  const fetchSources = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sources').select('*').order('name');
    if (data) setSources(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async (data: SourceFormValues) => {
    const { error } = await supabase.from('sources').insert({
      name: data.name,
      rss_url: data.rss_url,
      is_active: true,
    });
    if (!error) {
      setAddOpen(false);
      reset();
      fetchSources();
    } else {
      alert(error.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('sources').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      setSources(sources.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    } else {
      alert(error.message);
    }
  };

  const confirmDelete = (id: string) => {
    setSourceToDelete(id);
    setDeleteOpen(true);
  };

  const handleDeleteSource = async () => {
    if (!sourceToDelete) return;
    const { error } = await supabase.from('sources').delete().eq('id', sourceToDelete);
    if (!error) {
      setDeleteOpen(false);
      setSourceToDelete(null);
      fetchSources();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sources Management</h1>
          <p className="text-slate-500 mt-2">Manage RSS feeds for the news aggregator.</p>
        </div>
        
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" /> Add Source
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Source</DialogTitle>
              <DialogDescription>Add a new RSS feed to the aggregator.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddSource)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Source Name</Label>
                <Input id="name" placeholder="e.g. The New York Times" {...register('name')} />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rss_url">RSS Feed URL</Label>
                <Input id="rss_url" placeholder="https://example.com/feed.xml" {...register('rss_url')} />
                {errors.rss_url && <p className="text-xs text-red-500">{errors.rss_url.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit">Save Source</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source Name</TableHead>
              <TableHead>RSS URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">Loading sources...</TableCell>
              </TableRow>
            ) : sources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">No sources added yet.</TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-slate-500">
                    <div className="flex items-center gap-2">
                      <Rss className="w-4 h-4" />
                      <a href={source.rss_url} target="_blank" className="hover:underline hover:text-blue-600 truncate max-w-[300px] inline-block" title={source.rss_url}>
                        {source.rss_url}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={source.is_active} 
                        onCheckedChange={() => handleToggleActive(source.id, source.is_active)}
                      />
                      <span className={`text-sm ${source.is_active ? 'text-green-600' : 'text-slate-400'}`}>
                        {source.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(source.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this source? This action cannot be undone. 
              Note: Deleting a source might fail if there are articles linked to it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSource}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
