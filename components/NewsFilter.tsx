'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NewsFilterProps {
  categories: { id: string; name: string }[];
}

export function NewsFilter({ categories }: NewsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const currentCategory = searchParams.get('category') || '';
  const currentQuery = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  
  const [query, setQuery] = useState(currentQuery);

  const updateFilters = React.useCallback((q: string, cat: string, sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (q) params.set('q', q);
    else params.delete('q');
    
    if (cat) params.set('category', cat);
    else params.delete('category');

    if (sort && sort !== 'newest') params.set('sort', sort);
    else params.delete('sort');

    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  }, [router, searchParams]);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== currentQuery) {
        updateFilters(query, currentCategory, currentSort);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, currentQuery, currentCategory, currentSort, updateFilters]);

  return (
    <div className="mb-8 border-b-2 border-foreground pb-4 space-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Categories Tab-style list */}
        <div className="flex items-center space-x-6 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <button 
            onClick={() => updateFilters(query, '', currentSort)}
            className={`font-sans text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-colors ${!currentCategory ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All News
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => updateFilters(query, cat.id, currentSort)}
              className={`font-sans text-xs uppercase font-bold tracking-widest whitespace-nowrap transition-colors ${currentCategory === cat.id ? 'text-foreground border-b-2 border-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search news..." 
              className="w-full pl-9 rounded-none border-border focus-visible:ring-0 focus-visible:border-foreground font-sans text-sm h-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="w-36 hidden md:block">
            <Select value={currentSort} onValueChange={(val) => updateFilters(query || '', currentCategory || '', val || '')}>
              <SelectTrigger className="h-9 rounded-none border-border focus:ring-0 font-sans text-[10px] uppercase tracking-widest font-bold">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="font-sans text-xs uppercase tracking-widest">Newest First</SelectItem>
                <SelectItem value="oldest" className="font-sans text-xs uppercase tracking-widest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Mobile Sort */}
      <div className="md:hidden flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        <Select value={currentSort} onValueChange={(val) => updateFilters(query || '', currentCategory || '', val || '')}>
          <SelectTrigger className="w-full h-9 rounded-none border-border focus:ring-0 font-sans text-[10px] uppercase tracking-widest font-bold">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest" className="font-sans text-xs uppercase tracking-widest">Newest First</SelectItem>
            <SelectItem value="oldest" className="font-sans text-xs uppercase tracking-widest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
