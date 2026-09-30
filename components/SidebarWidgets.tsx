'use client';

import { useEffect, useState } from 'react';
import { useTweaks } from '@/components/TweaksPanel';
import { Trophy, Puzzle, Timer, Zap, Newspaper } from 'lucide-react';
import { getLiveMatches } from '@/app/actions/sports';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  match_status: string;
  match_time: string;
}

export function SidebarWidgets() {
  const { sidebarWidgets } = useTweaks();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrivia, setSelectedTrivia] = useState<string | null>(null);

  useEffect(() => {
    if (!sidebarWidgets) return;

    let mounted = true;
    async function fetchMatches() {
      try {
        const data = await getLiveMatches();
        if (mounted) {
          setMatches(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchMatches();
    const interval = setInterval(fetchMatches, 15000); // Poll every 15s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sidebarWidgets]);

  if (!sidebarWidgets) return null;

  return (
    <div className="space-y-8">
      {/* Sports Ticker */}
      <div className="border border-border bg-background">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-foreground" />
            <h4 className="font-sans text-[10px] font-black uppercase tracking-widest text-foreground">
              Live Sports
            </h4>
          </div>
          {!isLoading && matches.some(m => m.match_status === 'LIVE' || m.match_status === 'HT') && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" title="Live Updates Active" />
          )}
        </div>
        <div className="divide-y divide-border relative min-h-[100px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center font-sans text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Loading...
            </div>
          ) : matches.length === 0 ? (
            <div className="px-4 py-4 text-center font-sans text-xs text-muted-foreground">
              No live matches
            </div>
          ) : (
            matches.map((match) => (
              <div key={match.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                    Top Fixture
                  </span>
                  <span className={`font-sans text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5 ${
                    match.match_status === 'FT' ? 'text-muted-foreground' : 'text-red-500'
                  }`}>
                    {match.match_status === 'FT' ? 'Final' : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        {match.match_time}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-serif text-sm font-bold text-foreground truncate max-w-[140px]">
                    {match.home_team} v {match.away_team}
                  </span>
                  <span className="font-sans text-sm font-black text-foreground tabular-nums shrink-0">
                    {match.home_score} – {match.away_score}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-4 py-2 border-t border-border">
          <p className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground text-center font-bold">
            European Club Football • Live Scores
          </p>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="border border-border bg-background">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Puzzle className="w-3.5 h-3.5 text-foreground" />
          <h4 className="font-sans text-[10px] font-black uppercase tracking-widest text-foreground">
            Daily Challenge
          </h4>
        </div>
        <div className="p-4 space-y-4">
          {/* Logic Puzzle */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="font-sans text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Logic Puzzle #347
              </span>
            </div>
            <p className="font-serif text-sm text-foreground leading-relaxed">
              A train leaves Amman at 8:00 AM traveling 120 km/h. Another leaves Irbid at 9:00 AM at 150 km/h toward Amman. If the distance is 90 km, when do they meet?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['9:20 AM', '9:12 AM', '9:30 AM', '9:24 AM'].map((opt) => (
                <button
                  key={opt}
                  className="font-sans text-xs font-bold uppercase tracking-wider border border-border px-3 py-2 hover:bg-foreground hover:text-background transition-colors text-foreground"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Timer className="w-3 h-3 text-muted-foreground" />
              <span className="font-sans text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Speed Challenge
              </span>
            </div>
            <p className="font-serif text-sm text-foreground mb-3">
              Solve this 3×3 Rubik&apos;s pattern. Can you beat the avg. of <strong>42 seconds</strong>?
            </p>
            {/* Mini Rubik visual */}
            <div className="flex items-center justify-center gap-1 py-2">
              {[
                ['bg-red-500', 'bg-blue-500', 'bg-yellow-400'],
                ['bg-green-500', 'bg-white', 'bg-red-500'],
                ['bg-yellow-400', 'bg-orange-500', 'bg-blue-500'],
              ].map((row, ri) => (
                <div key={ri} className="flex flex-col gap-1">
                  {row.map((color, ci) => (
                    <div key={ci} className={`w-6 h-6 ${color} border border-black/10`} />
                  ))}
                </div>
              ))}
            </div>
            <button className="w-full mt-3 font-sans text-xs font-black uppercase tracking-widest border border-foreground px-3 py-2.5 hover:bg-foreground hover:text-background transition-colors text-foreground">
              Start Timer
            </button>
          </div>

          {/* News Trivia */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Newspaper className="w-3 h-3 text-muted-foreground" />
              <span className="font-sans text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                News Trivia
              </span>
            </div>
            <p className="font-serif text-sm text-foreground mb-3">
              Where did the Iranian National Football team set up their training camp for the 2026 World Cup?
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {['USA', 'Mexico', 'Canada', 'Qatar'].map((opt) => {
                let btnClass = "font-sans text-xs font-bold uppercase tracking-wider border border-border px-3 py-2 transition-all text-foreground";
                
                if (selectedTrivia !== null) {
                  if (opt === 'Mexico') {
                    btnClass += " bg-green-500 border-green-500 text-white";
                  } else if (selectedTrivia === opt) {
                    btnClass += " bg-red-500 border-red-500 text-white";
                  } else {
                    btnClass += " opacity-50";
                  }
                } else {
                  btnClass += " hover:bg-foreground hover:text-background";
                }
                
                return (
                  <button
                    key={opt}
                    disabled={selectedTrivia !== null}
                    onClick={() => setSelectedTrivia(opt)}
                    className={btnClass}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
