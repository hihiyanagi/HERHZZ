import React, { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  title: string;
  audioSrc: string;
  className?: string;
}

const AudioPlayer = ({ title, audioSrc, className }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.volume = volume;
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className={cn("flex flex-col items-center p-3 rounded-lg bg-white/10 backdrop-blur-sm", className)}>
      <audio ref={audioRef} src={audioSrc} loop />
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-sm font-medium text-white font-serif">{title}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "rounded-full w-10 h-10", 
            isPlaying ? "bg-white text-blue-900" : "bg-white/20 text-white hover:bg-white/30"
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
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20"
        />
      </div>
    </div>
  );
};

export default AudioPlayer;
