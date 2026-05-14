'use client';

import { useEffect, useState } from 'react';
import { parseSaleDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface CountdownTimerProps {
  endDate: string;
  startDate?: string | null;
  onEnd?: () => void;
  className?: string;
  compact?: boolean;
}

export default function CountdownTimer({ endDate, startDate, onEnd, className, compact }: CountdownTimerProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUpcoming?: boolean;
  } | null>(null);

  useEffect(() => {
    const targetEndDate = parseSaleDate(endDate);
    const targetStartDate = startDate ? parseSaleDate(startDate) : 0;
    if (!targetEndDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      
      // If sale hasn't started yet, count down to start
      const isUpcoming = targetStartDate && now < targetStartDate;
      const difference = isUpcoming ? targetStartDate - now : targetEndDate - now;

      if (difference <= 0) {
        if (!isUpcoming && onEnd) onEnd();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isUpcoming: !!isUpcoming
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (!remaining) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, startDate, onEnd]);

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
      "mx-auto w-fit flex flex-col items-center justify-center bg-gradient-to-r text-white rounded shadow-lg border border-white/10 transition-all",
      compact ? "px-2 py-1 sm:h-auto" : "px-1.5 py-0.5 sm:px-4 sm:h-11 sm:rounded-full flex-row",
      timeLeft.isUpcoming 
        ? "from-blue-600 via-blue-500 to-indigo-500 shadow-blue-500/20" 
        : "from-red-600 via-red-500 to-amber-500 shadow-red-500/20",
      className
    )}>
      {/* Status Label (Positioned above or beside based on mode) */}
      <div className={cn(
        "flex items-center",
        compact ? "mb-0.5" : "mr-2 border-r border-white/20 pr-2"
      )}>
        <span className={cn(
          "font-black uppercase tracking-tighter text-white/90",
          compact ? "text-[6px] leading-none" : "text-[7px] sm:text-[9px]"
        )}>
          {timeLeft.isUpcoming ? (language === 'fr' ? 'Débute' : 'Starts') : (language === 'fr' ? 'Expire' : 'Ends')}
        </span>
      </div>

      <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-0.5 sm:gap-2")}>
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
