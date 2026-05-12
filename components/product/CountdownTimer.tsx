'use client';

import { useEffect, useState } from 'react';
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
    <div className="flex items-center gap-1">
      <span className="text-sm sm:text-base font-black tracking-tighter">{value.toString().padStart(2, '0')}</span>
      <span className="text-[8px] sm:text-[10px] uppercase font-bold opacity-70">{label}</span>
    </div>
  );

  return (
    <div className={cn(
      "w-full h-8 sm:h-11 flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white rounded-full shadow-lg shadow-red-500/20 border border-white/20 transition-all hover:scale-[1.01]",
      className
    )}>
      <div className="flex items-center gap-2 sm:gap-3">
        <TimeUnit value={timeLeft.days} label="d" />
        <span className="text-white/40 font-bold">:</span>
        <TimeUnit value={timeLeft.hours} label="h" />
        <span className="text-white/40 font-bold">:</span>
        <TimeUnit value={timeLeft.minutes} label="m" />
        <span className="text-white/40 font-bold">:</span>
        <TimeUnit value={timeLeft.seconds} label="s" />
      </div>
    </div>
  );
}
