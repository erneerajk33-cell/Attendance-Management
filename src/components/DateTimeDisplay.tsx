import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { formatIndianDateTime } from '../utils/geoUtils';

interface DateTimeDisplayProps {
  compact?: boolean;
  dark?: boolean;
}

export const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({ compact = false, dark = false }) => {
  const [timeData, setTimeData] = useState(formatIndianDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(formatIndianDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
          dark
            ? 'bg-blue-900/60 border-blue-600/50 text-white shadow-xs'
            : 'bg-white border-slate-200 text-slate-800 shadow-xs'
        }`}
      >
        <span className="flex items-center gap-1 text-emerald-400 font-bold">
          <Calendar className="w-3.5 h-3.5" />
          {timeData.dateStr}
        </span>
        <span className="text-white/40">|</span>
        <span className="flex items-center gap-1 text-amber-300 font-bold font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          {timeData.timeStr}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border ${
        dark
          ? 'bg-blue-950/60 border-blue-700/60 text-white backdrop-blur-md'
          : 'bg-white border-slate-200/90 shadow-xs text-slate-800'
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-700/60">
        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
        <span>{timeData.dayName}, {timeData.dateStr}</span>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-extrabold font-mono text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-700/60">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>{timeData.timeStr}</span>
      </div>
    </div>
  );
};
