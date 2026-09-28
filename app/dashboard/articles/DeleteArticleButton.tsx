'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteArticle } from '@/app/actions/article-actions';
import { useRouter } from 'next/navigation';

export function DeleteArticleButton({ articleId }: { articleId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteArticle(articleId);
    
    if (result.error) {
      alert(result.error);
      setIsDeleting(false);
    } else {
      router.refresh();
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="w-4 h-4 text-red-500" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}
