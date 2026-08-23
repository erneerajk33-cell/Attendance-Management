import React, { useState, useEffect } from 'react';
import { Megaphone, ChevronLeft, ChevronRight, AlertCircle, Info, Flame } from 'lucide-react';
import { BroadcastMessage } from '../types';

interface BroadcastBannerProps {
  broadcasts: BroadcastMessage[];
  compact?: boolean;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({ broadcasts, compact = false }) => {
  const activeBroadcasts = broadcasts.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeBroadcasts.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBroadcasts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBroadcasts.length, isPaused]);

  if (activeBroadcasts.length === 0) {
    return (
      <div className="w-full bg-white border-y border-slate-200 px-4 py-2 flex items-center gap-2 text-xs text-slate-700 shadow-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0" />
        <span>No active broadcast announcements at this time. Attendance servers running normally.</span>
      </div>
    );
  }

  const current = activeBroadcasts[currentIndex] || activeBroadcasts[0];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          badge: 'bg-rose-600 text-white font-bold',
          tag: 'bg-rose-100 text-rose-800',
          icon: <Flame className="w-3.5 h-3.5 text-white animate-bounce" />,
        };
      case 'IMPORTANT':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
          badge: 'bg-amber-500 text-slate-900 font-bold',
          tag: 'bg-amber-100 text-amber-800',
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-900" />,
        };
      default:
        return {
          bg: 'bg-blue-50/90 border-blue-200 text-blue-950',
          badge: 'bg-blue-600 text-white font-bold',
          tag: 'bg-blue-100 text-blue-800',
          icon: <Info className="w-3.5 h-3.5 text-white" />,
        };
    }
  };

  const style = getPriorityStyle(current.priority);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`w-full ${style.bg} border-y border-slate-200/90 transition-colors duration-300 relative overflow-hidden shadow-xs ${
        compact ? 'py-1.5 px-3' : 'py-2.5 px-4'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs shadow-xs uppercase font-extrabold bg-blue-700 text-white tracking-wide">
            <Megaphone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>BROADCAST</span>
          </div>

          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${style.badge}`}
          >
            {style.icon}
            <span>{current.priority}</span>
          </div>
        </div>

        {/* Scrolling / Fading Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="font-extrabold text-slate-900 truncate shrink-0 max-w-[200px] sm:max-w-none">
              {current.title}:
            </span>
            <span className="truncate text-slate-700 font-medium">{current.message}</span>
            <span className="text-[10px] text-slate-500 whitespace-nowrap hidden md:inline font-mono">
              ({current.createdAt})
            </span>
          </div>
        </div>

        {/* Slide Controls */}
        {activeBroadcasts.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline mr-1">
              {currentIndex + 1}/{activeBroadcasts.length}
            </span>
            <button
              onClick={() =>
                setCurrentIndex(
                  (prev) => (prev - 1 + activeBroadcasts.length) % activeBroadcasts.length
                )
              }
              className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-700 transition cursor-pointer"
              title="Previous Announcement"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBroadcasts.length)}
              className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-700 transition cursor-pointer"
              title="Next Announcement"
              aria-label="Next announcement"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
