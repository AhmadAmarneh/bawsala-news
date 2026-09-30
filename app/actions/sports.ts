'use server';

import { createClient } from '@/lib/supabase/server';

export async function getLiveMatches() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sports_ticker')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch sports ticker:', error);
    return [];
  }

  return data || [];
}
