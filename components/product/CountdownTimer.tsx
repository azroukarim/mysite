"use client";

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { parseSaleDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: string;
  onEnd?: () => void;
  className?: string;
}

export default function CountdownTimer({ endDate, onEnd, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const targetDate = parseSaleDate(endDate);
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        if (onEnd) onEnd();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onEnd]);

  if (!timeLeft) return null;

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-[9px] sm:text-[11px] font-black leading-none">{value.toString().padStart(2, '0')}</span>
      <span className="text-[5px] sm:text-[7px] uppercase opacity-70 font-bold leading-none mt-0.5">{label}</span>
    </div>
  );

  return (
    <div className={cn(
      "inline-flex items-center gap-1 sm:gap-2 px-1.5 sm:px-3 py-1 bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-lg sm:rounded-full shadow-md border border-white/20 backdrop-blur-sm",
      className
    )}>
      <Timer size={10} className="animate-pulse hidden sm:block" />
      <div className="flex items-center gap-1 sm:gap-1.5">
        <TimeUnit value={timeLeft.days} label="d" />
        <span className="text-[8px] opacity-50 font-bold">:</span>
        <TimeUnit value={timeLeft.hours} label="h" />
        <span className="text-[8px] opacity-50 font-bold">:</span>
        <TimeUnit value={timeLeft.minutes} label="m" />
        <span className="text-[8px] opacity-50 font-bold">:</span>
        <TimeUnit value={timeLeft.seconds} label="s" />
      </div>
    </div>
  );
}
