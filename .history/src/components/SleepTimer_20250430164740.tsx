import React, { useState } from 'react';
import { cn } from "@/lib/utils";

interface SleepTimerProps {
  onDurationChange: (duration: number) => void;
}

const SleepTimer: React.FC<SleepTimerProps> = ({ onDurationChange }) => {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const durations = [
    { label: '15分钟', value: 15 },
    { label: '30分钟', value: 30 },
    { label: '60分钟', value: 60 },
    { label: '整晚', value: 480 }, // 8小时 = 480分钟
  ];

  const handleSelect = (duration: number) => {
    setSelectedDuration(duration);
    onDurationChange(duration);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h4 className="text-white text-lg font-medium mb-2">设置睡眠时长</h4>
      <div className="flex flex-wrap justify-center gap-3">
        {durations.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "px-6 py-2 rounded-full transition-all duration-300",
              "border border-white/30 backdrop-blur-sm",
              "hover:bg-white/20 hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-white/50",
              selectedDuration === value
                ? "bg-white/30 text-white"
                : "bg-transparent text-white/80"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {selectedDuration && (
        <p className="text-white/80 text-sm mt-2">
          {selectedDuration === 480 
            ? "将持续播放整晚" 
            : `将在 ${selectedDuration} 分钟后停止`}
        </p>
      )}
    </div>
  );
};

export default SleepTimer; 