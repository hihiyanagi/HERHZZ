import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  title: string;
  audioSrc: string;
  className?: string;
  sleepDuration?: number; // 新增：睡眠时长（分钟）
}

const AudioPlayer = ({ title, audioSrc, className, sleepDuration }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理定时器
  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // 停止播放
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    clearTimers();
  };

  // 开始定时播放
  const startTimedPlayback = (durationMinutes: number) => {
    if (durationMinutes === 480) { // 整晚模式，不设定时
      return;
    }

    const durationMs = durationMinutes * 60 * 1000;

    // 设置主定时器
    timerRef.current = setTimeout(() => {
      stopPlaying();
    }, durationMs);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        stopPlaying();
      } else {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
        });
        setIsPlaying(true);
        
        // 如果设置了睡眠时长，开始定时
        if (sleepDuration && sleepDuration > 0) {
          startTimedPlayback(sleepDuration);
        }
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  return (
    <div className={cn("flex flex-col items-center p-3 rounded-lg backdrop-blur-sm border border-white/20", className)}>
      <audio ref={audioRef} src={audioSrc} loop />
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-medium text-white">{title}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "rounded-full w-10 h-10", 
            isPlaying ? "bg-white/20 text-white" : "bg-transparent border border-white/30 text-white"
          )}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </Button>
      </div>
      
      <div className="flex items-center w-full">
        <Volume2 className="w-4 h-4 mr-2 text-white/70" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/30"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
