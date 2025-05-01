import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SleepTimerProps {
  onDurationChange: (duration: number) => void;
}

const SleepTimer: React.FC<SleepTimerProps> = ({ onDurationChange }) => {
  const [selectedDuration, setSelectedDuration] = useState<string>('');

  const durations = [
    { value: '15', label: '15分钟' },
    { value: '30', label: '30分钟' },
    { value: '60', label: '60分钟' },
    { value: 'allnight', label: '整晚' },
  ];

  const handleDurationChange = (value: string) => {
    setSelectedDuration(value);
    const duration = value === 'allnight' ? 480 : parseInt(value); // 整晚默认为8小时（480分钟）
    onDurationChange(duration);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-semibold text-white mb-2">睡眠定时</h3>
      <div className="flex items-center gap-2">
        <Select value={selectedDuration} onValueChange={handleDurationChange}>
          <SelectTrigger className="w-[180px] bg-white/10 text-white border-none">
            <SelectValue placeholder="选择时长" />
          </SelectTrigger>
          <SelectContent>
            {durations.map((duration) => (
              <SelectItem key={duration.value} value={duration.value}>
                {duration.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SleepTimer; 