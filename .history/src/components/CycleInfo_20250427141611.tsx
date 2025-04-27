import React, { useState } from "react";
import { format, addDays } from "date-fns";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { FaCalendarAlt } from "react-icons/fa";

interface CycleInfoProps {
  onContinue?: () => void;
}

const CycleInfo = ({ onContinue }: CycleInfoProps) => {
  const [cycleLength, setCycleLength] = useState("28");
  const [periodLength, setPeriodLength] = useState("5");
  const [lastPeriod, setLastPeriod] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const cycleDays = parseInt(cycleLength);
  const periodDays = parseInt(periodLength);

  const calculatePhase = () => {
    if (!lastPeriod) return { phase: "未知", daysIn: 0, daysLeft: 0 };

    const today = new Date();
    const start = new Date(lastPeriod);
    
    // Calculate days since last period started
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate current position in cycle (considering cycles repeating)
    const dayInCycle = diffDays % cycleDays;
    
    // Determine which phase the user is in
    if (dayInCycle < periodDays) {
      // During period
      return {
        phase: "经期",
        daysIn: dayInCycle + 1,
        daysLeft: periodDays - dayInCycle,
        totalDays: periodDays,
        color: "#E57C9E"
      };
    } else if (dayInCycle < 7 + periodDays) {
      // Follicular phase (after period, before ovulation)
      return {
        phase: "卵泡期",
        daysIn: dayInCycle - periodDays + 1,
        daysLeft: 7 + periodDays - dayInCycle,
        totalDays: 7,
        color: "#F5B17A"
      };
    } else if (dayInCycle < 14 + periodDays) {
      // Ovulation phase
      return {
        phase: "排卵期",
        daysIn: dayInCycle - (7 + periodDays) + 1,
        daysLeft: 14 + periodDays - dayInCycle,
        totalDays: 7,
        color: "#8FC7E3"
      };
    } else {
      // Luteal phase
      return {
        phase: "黄体期",
        daysIn: dayInCycle - (14 + periodDays) + 1,
        daysLeft: cycleDays - dayInCycle,
        totalDays: cycleDays - (14 + periodDays),
        color: "#A58FE3"
      };
    }
  };

  const getNextPeriodDate = () => {
    if (!lastPeriod) return "未知";
    
    const nextPeriod = addDays(lastPeriod, cycleDays);
    return format(nextPeriod, 'MM月dd日');
  };

  const phaseInfo = calculatePhase();
  const progress = (phaseInfo.daysIn / phaseInfo.totalDays) * 100;

  return (
    <div className="lavender-bg flex flex-col items-center justify-center min-h-screen text-center p-6">
      <h2 className="text-4xl font-bold font-playwrite mb-6">周期追踪</h2>
      
      <div className="moon-circle mb-10"></div>
      
      <div className="content-card w-full max-w-md">
        <h3 className="text-lg font-semibold mb-6 text-gray-700">你现在正处于...</h3>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-48 h-48 mb-4">
            <CircularProgressbar
              value={progress}
              text={`${phaseInfo.phase}`}
              styles={buildStyles({
                textSize: '16px',
                textColor: phaseInfo.color || '#7E69AB',
                pathColor: phaseInfo.color || '#7E69AB',
                trailColor: 'rgba(126, 105, 171, 0.2)',
              })}
            />
          </div>
          
          <p className="text-gray-700 mt-2">
            {phaseInfo.phase}第 {phaseInfo.daysIn} 天，还剩 {phaseInfo.daysLeft} 天
          </p>
          <p className="text-gray-700 mt-1">
            下次经期预计：{getNextPeriodDate()}
          </p>
        </div>
        
        <Separator className="my-4 bg-purple-200" />
        
        <div className="space-y-6 mt-6">
          <div className="flex justify-between items-center">
            <label className="text-gray-700">周期长度</label>
            <Select
              value={cycleLength}
              onValueChange={setCycleLength}
            >
              <SelectTrigger className="w-24 bg-white/80 border-purple-200">
                <SelectValue placeholder="选择天数" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 15 }, (_, i) => i + 21).map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} 天
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center">
            <label className="text-gray-700">经期长度</label>
            <Select
              value={periodLength}
              onValueChange={setPeriodLength}
            >
              <SelectTrigger className="w-24 bg-white/80 border-purple-200">
                <SelectValue placeholder="选择天数" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 2).map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} 天
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-between items-center">
            <label className="text-gray-700">上次经期开始日期</label>
            <div className="relative">
              <Button
                variant="outline"
                className="bg-white/80 border-purple-200 px-3"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <FaCalendarAlt className="mr-2 text-purple-500" />
                {lastPeriod ? format(lastPeriod, 'MM/dd') : '选择日期'}
              </Button>
              
              {showCalendar && (
                <div className="absolute right-0 mt-2 z-10 bg-white shadow-lg rounded-lg border border-purple-200">
                  <Calendar
                    mode="single"
                    selected={lastPeriod}
                    onSelect={(date) => {
                      setLastPeriod(date);
                      setShowCalendar(false);
                    }}
                    className="rounded-md"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <Button 
            onClick={onContinue} 
            className="bg-purple-600 hover:bg-purple-700 text-white w-full"
          >
            开始聆听
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CycleInfo;
