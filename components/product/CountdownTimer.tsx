'use client';

import { useEffect, useState } from 'react';
import { parseSaleDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface CountdownTimerProps {
  endDate: string;
  onEnd?: () => void;
  className?: string;
}

export default function CountdownTimer({ endDate, onEnd, className }: CountdownTimerProps) {
  const { language } = useLanguage();
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

  const labels = {
    days: language === 'fr' ? 'j' : 'd',
    hours: 'h',
    minutes: 'm',
    seconds: 's'
  };

  const TimeUnit = ({ value, label, small }: { value: number, label: string, small?: boolean }) => (
    <div className="flex items-baseline gap-px leading-none">
      <span className={cn(
        "font-black tracking-tighter text-white sm:text-base",
        small ? "text-[8.5px]" : "text-[9.5px]"
      )}>{value.toString().padStart(2, '0')}</span>
      <span className={cn(
        "uppercase font-black text-white sm:text-[11px]",
        small ? "text-[8px]" : "text-[9px]"
      )}>{label}</span>
    </div>
  );

  return (
    <div className={cn(
      "mx-auto w-fit px-1.5 py-0.5 sm:px-4 sm:h-11 flex items-center justify-center bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white rounded sm:rounded-full shadow-lg shadow-red-500/20 border border-white/10 transition-all",
      className
    )}>
      <div className="flex items-center gap-0.5 sm:gap-2">
        {/* Days Logic - Smaller on mobile */}
        <div className={cn(
          "flex items-center gap-0.5",
          timeLeft.days <= 0 && "hidden sm:flex"
        )}>
          <TimeUnit value={timeLeft.days} label={labels.days} small />
          <span className="text-white/40 font-bold text-[8px] sm:text-base mx-px sm:mx-0.5 inline-block">:</span>
        </div>

        {/* Hours Logic - Smaller on mobile */}
        <TimeUnit value={timeLeft.hours} label={labels.hours} small />
        <span className="text-white/40 font-bold text-[8px] sm:text-base mx-px sm:mx-0.5 inline-block">:</span>
        <TimeUnit value={timeLeft.minutes} label={labels.minutes} />
        
        {/* Seconds Logic */}
        <div className={cn(
          "flex items-center gap-0.5",
          timeLeft.days > 0 && "hidden sm:flex"
        )}>
          <span className="text-white/40 font-bold text-[8px] sm:text-base mx-px sm:mx-0.5 inline-block">:</span>
          <TimeUnit value={timeLeft.seconds} label={labels.seconds} />
        </div>
      </div>
    </div>
  );
}
