'use client';

import { useTweaks } from '@/components/TweaksPanel';
import { Clock } from 'lucide-react';

const WORDS_PER_MINUTE = 200;

/** Strip HTML tags and estimate word count */
function estimateReadTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function ReadTimeBadge({ content }: { content: string }) {
  const { readingExperience } = useTweaks();

  if (!readingExperience) return null;

  const minutes = estimateReadTime(content);

  return (
    <span className="inline-flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      <Clock className="w-3 h-3" />
      {minutes} min read
    </span>
  );
}
