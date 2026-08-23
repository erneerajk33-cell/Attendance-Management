import React from 'react';

interface SkillLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const SkillLogo: React.FC<SkillLogoProps> = ({ size = 'md', showText = false }) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 18, text: 'text-sm' },
    md: { box: 'w-9 h-9', icon: 22, text: 'text-base' },
    lg: { box: 'w-12 h-12', icon: 28, text: 'text-lg' },
    xl: { box: 'w-16 h-16', icon: 38, text: 'text-xl' },
  };

  const current = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${current.box} rounded-xl bg-gradient-to-tr from-blue-700 via-emerald-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Hexagonal / Circuit Skill Motif */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4/5 h-4/5"
          >
            {/* Blue trust node */}
            <path
              d="M16 3L27 9.5V22.5L16 29L5 22.5V9.5L16 3Z"
              stroke="url(#blue-grad)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Green growth spark */}
            <path
              d="M16 9L22 13V19L16 23L10 19V13L16 9Z"
              fill="url(#green-grad)"
              opacity="0.8"
            />
            {/* Yellow energy center */}
            <circle cx="16" cy="16" r="3.5" fill="#f59e0b" />
            <path d="M16 6V11" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M25 21L21 18.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 21L11 18.5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="blue-grad" x1="5" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#38bdf8" />
                <stop offset="0.5" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="green-grad" x1="10" y1="9" x2="22" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34d399" />
                <stop offset="1" stopColor="#059669" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-slate-900 leading-tight ${current.text}`}>
            SKILL<span className="text-blue-600">Gov</span>
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Attendance Portal
          </span>
        </div>
      )}
    </div>
  );
};
