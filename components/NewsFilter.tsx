'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React, { useState, useEffect, useTransition } from 'react';

interface NewsFilterProps {
  categories: { id: string; name: string }[];
}

export function NewsFilter({ categories }: NewsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentCategory = searchParams.get('category') || '';
  const currentQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(currentQuery);

  const updateFilters = React.useCallback((q: string, cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q);
    else params.delete('q');
    
    if (cat) params.set('category', cat);
    else params.delete('category');

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, [router, searchParams]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== currentQuery) {
        updateFilters(query, currentCategory);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, currentQuery, currentCategory, updateFilters]);

  return (
    <div className="mb-8 border-b-2 border-foreground pb-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Categories Tab-style list */}
        <div className="flex items-center space-x-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button
            onClick={() => updateFilters(query, '')}
            className={`font-sans text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-colors ${
              !currentCategory ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All News
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilters(query, cat.id)}
              className={`font-sans text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-colors ${
                currentCategory === cat.id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="w-full pl-9 rounded-none border-border focus-visible:ring-0 focus-visible:border-foreground font-sans text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
      </div>
    </div>
  );
}
