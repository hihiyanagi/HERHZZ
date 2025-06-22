import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Moon, MoonStar } from 'lucide-react';

interface SleepTimerProps {
  onDurationChange: (duration: number) => void;
}

// 自定义月相图标组件
const WaxingGibbousMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
    <path d="M12 2a10 10 0 0 1 0 20" />
  </svg>
);

const FullMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const SleepTimer: React.FC<SleepTimerProps> = ({ onDurationChange }) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const durations = [
    { label: '15分钟', value: 15, icon: Moon },      // 新月
    { label: '30分钟', value: 30, icon: MoonStar },  // 弦月
    { label: '60分钟', value: 60, icon: WaxingGibbousMoon },  // 亏凸月
    { label: '整晚', value: 480, icon: FullMoon },    // 满月
  ];

  const handleSelect = (duration: number) => {
    setSelectedDuration(duration);
    onDurationChange(duration);
  };

  return (
    <div className="flex flex-col items-start w-full">
      <h3 className="text-xl font-semibold text-white mb-4 text-left">设置定时</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full mb-6">
        {durations.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "px-6 py-3 rounded-full transition-all duration-300",
              "border border-white/30 backdrop-blur-sm",
              "hover:bg-white/20 hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-white/50",
              "flex items-center justify-center space-x-3",
              selectedDuration === value
                ? "bg-white/30 text-white"
                : "bg-transparent text-white/80"
            )}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {selectedDuration && (
        <p className="text-white/80 text-sm">
          {selectedDuration === 480 
            ? "将持续播放整晚" 
            : `将在 ${selectedDuration} 分钟后停止`}
        </p>
      )}
    </div>
  );
};

export default SleepTimer; 