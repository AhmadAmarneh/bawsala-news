'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleSaveArticle } from '@/app/actions/save-article';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  articleId: string;
  initialIsSaved: boolean;
  className?: string;
}

export function BookmarkButton({ articleId, initialIsSaved, className = '' }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    startTransition(async () => {
      const result = await toggleSaveArticle(articleId, previousState);
      if (!result.success) {
        // Revert on failure
        setIsSaved(previousState);
        
        if (result.error === 'unauthenticated') {
          toast.error(result.message, {
            action: {
              label: 'Sign In',
              onClick: () => window.location.href = '/login',
            },
          });
        } else {
          toast.error(result.message || 'An error occurred while saving the article.');
        }
      } else {
        toast.success(result.isSaved ? 'Article saved to your bookmarks!' : 'Article removed from bookmarks.');
      }
    });
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
      }}
      disabled={isPending}
      className={`p-2 rounded-full transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${className}`}
      aria-label={isSaved ? "Remove bookmark" : "Bookmark article"}
      title={isSaved ? "Remove bookmark" : "Bookmark article"}
    >
      <Bookmark
        className={`w-5 h-5 transition-all duration-200 ${
          isSaved ? 'fill-blue-600 text-blue-600 scale-110' : 'text-slate-500 hover:text-slate-700'
        }`}
      />
    </button>
  );
}
