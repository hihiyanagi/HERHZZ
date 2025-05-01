import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Clock } from 'lucide-react';

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
    <div className="flex flex-col items-start space-y-4">
      <h3 className="text-xl font-semibold text-white mb-4">设置定时</h3>
      <div className="flex flex-wrap gap-3">
        {durations.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            className={cn(
              "px-6 py-2 rounded-full transition-all duration-300",
              "border border-white/30 backdrop-blur-sm",
              "hover:bg-white/20 hover:scale-105",
              "focus:outline-none focus:ring-2 focus:ring-white/50",
              "flex items-center space-x-2",
              selectedDuration === value
                ? "bg-white/30 text-white"
                : "bg-transparent text-white/80"
            )}
          >
            <Clock className="w-4 h-4" />
            <span>{label}</span>
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