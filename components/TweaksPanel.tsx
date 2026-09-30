'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Settings, X, ImageIcon, BookOpen, LayoutDashboard, Palette, Type, LayoutGrid } from 'lucide-react';

interface TweaksState {
  vintageImages: boolean;
  readingExperience: boolean;
  sidebarWidgets: boolean;
  accentColor: string;
  fontScale: 'small' | 'default' | 'large';
  layoutDensity: 'compact' | 'relaxed';
}

const defaultTweaks: TweaksState = {
  vintageImages: false,
  readingExperience: false,
  sidebarWidgets: false,
  accentColor: '#C9A96E', // Default fallback
  fontScale: 'default',
  layoutDensity: 'relaxed',
};

const TweaksContext = createContext<TweaksState>(defaultTweaks);

export const useTweaks = () => useContext(TweaksContext);

const STORAGE_KEY = 'bawsala-tweaks-v2';

const loadTweaks = (): TweaksState => {
  if (typeof window === 'undefined') return defaultTweaks;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultTweaks, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return defaultTweaks;
};

export function TweaksProvider({ children }: { children: React.ReactNode }) {
  const [tweaks, setTweaks] = useState<TweaksState>(defaultTweaks);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTweaks(loadTweaks());
  }, []);

  // Apply CSS classes and variables to <html> whenever tweaks change
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    // Features
    root.classList.toggle('tweak-vintage-images', tweaks.vintageImages);
    root.classList.toggle('tweak-reading', tweaks.readingExperience);
    root.classList.toggle('tweak-widgets', tweaks.sidebarWidgets);

    // Dynamic Accent Color
    if (tweaks.accentColor) {
      root.style.setProperty('--primary', tweaks.accentColor);
      root.style.setProperty('--primary-color', tweaks.accentColor);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-color');
    }

    // Typography Scaling
    const scaleMap = { small: '0.9', default: '1', large: '1.1' };
    root.style.setProperty('--font-scale', scaleMap[tweaks.fontScale]);

    // Layout Density
    root.classList.toggle('tweak-compact', tweaks.layoutDensity === 'compact');

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tweaks));
  }, [tweaks, mounted]);

  const toggleFeature = useCallback((key: keyof Pick<TweaksState, 'vintageImages' | 'readingExperience' | 'sidebarWidgets'>) => {
    setTweaks(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const updateSetting = useCallback((key: keyof TweaksState, value: any) => {
    setTweaks(prev => ({ ...prev, [key]: value }));
  }, []);

  const features = [
    { key: 'vintageImages' as const, label: 'Vintage Images', description: 'Grayscale → color on hover', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'readingExperience' as const, label: 'Reading Exp.', description: 'Progress bar & read time', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'sidebarWidgets' as const, label: 'Sidebar Widgets', description: 'Sports ticker & daily challenge', icon: <LayoutDashboard className="w-4 h-4" /> },
  ];

  return (
    <TweaksContext value={tweaks}>
      {children}

      {/* Reading Progress Bar */}
      {mounted && tweaks.readingExperience && <ReadingProgressBar />}

      {/* Floating Gear Button */}
      {mounted && (
        <button
          onClick={() => setOpen(prev => !prev)}
          className="fixed bottom-6 right-6 z-[9999] w-12 h-12 bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200 group"
          aria-label="Open Design Tweaks"
        >
          <Settings className={`w-5 h-5 transition-transform duration-500 ${open ? 'rotate-180' : 'group-hover:rotate-90'}`} />
        </button>
      )}

      {/* Panel Overlay */}
      {mounted && open && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[9998] backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 right-6 z-[9999] w-80 max-h-[80vh] overflow-y-auto bg-background border border-border shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
              <div>
                <h3 className="font-sans text-xs font-black uppercase tracking-widest text-foreground">
                  Theme Customizer
                </h3>
                <p className="font-sans text-[10px] text-muted-foreground mt-0.5">Advanced granular control</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Dynamic Accent Color */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Accent Color</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={tweaks.accentColor}
                    onChange={(e) => updateSetting('accentColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-sans text-xs font-medium text-muted-foreground">{tweaks.accentColor}</span>
                </div>
              </div>

              {/* Typography Scaling */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <Type className="w-4 h-4 text-muted-foreground" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Typography Scale</span>
                </div>
                <div className="flex bg-muted p-1 rounded-sm">
                  {['small', 'default', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontScale', size)}
                      className={`flex-1 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        tweaks.fontScale === size ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Density */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-foreground">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <span className="font-sans text-[10px] font-bold uppercase tracking-widest">Layout Density</span>
                </div>
                <div className="flex bg-muted p-1 rounded-sm">
                  {['compact', 'relaxed'].map((density) => (
                    <button
                      key={density}
                      onClick={() => updateSetting('layoutDensity', density)}
                      className={`flex-1 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        tweaks.layoutDensity === density ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-border" />

              {/* Toggles */}
              <div className="space-y-1">
                <div className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-1">Features</div>
                {features.map((item) => {
                  const isActive = tweaks[item.key];
                  return (
                    <button
                      key={item.key}
                      onClick={() => toggleFeature(item.key)}
                      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-sm transition-colors text-left ${
                        isActive ? 'bg-foreground/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`shrink-0 w-7 h-7 flex items-center justify-center border transition-colors ${
                        isActive ? 'bg-foreground text-background border-foreground' : 'bg-background text-muted-foreground border-border'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-[11px] font-bold uppercase tracking-wider text-foreground">
                          {item.label}
                        </div>
                      </div>
                      <div className={`shrink-0 w-8 h-4 rounded-full relative transition-colors duration-200 ${
                        isActive ? 'bg-foreground' : 'bg-border'
                      }`}>
                        <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-background shadow-sm transition-transform duration-200 ${
                          isActive ? 'translate-x-[18px]' : 'translate-x-[2px]'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/30">
              <p className="font-sans text-[9px] uppercase tracking-widest text-muted-foreground text-center">
                Changes are saved locally
              </p>
            </div>
          </div>
        </>
      )}
    </TweaksContext>
  );
}

/** Thin reading progress bar at the very top of the viewport */
function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[9997] bg-border/30">
      <div
        className="h-full bg-foreground transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
