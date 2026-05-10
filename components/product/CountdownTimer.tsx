"use client";

import { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

interface CountdownTimerProps {
  endDate: string;
  onEnd?: () => void;
}

export default function CountdownTimer({ endDate, onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const targetDate = new Date(endDate).getTime();

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

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-full text-[11px] font-bold shadow-lg animate-pulse">
      <Timer size={14} className="animate-spin-slow" />
      <div className="flex items-center gap-1 uppercase tracking-wider">
        <span>{timeLeft.days}d</span>
        <span>:</span>
        <span>{timeLeft.hours}h</span>
        <span>:</span>
        <span>{timeLeft.minutes}m</span>
        <span>:</span>
        <span>{timeLeft.seconds}s</span>
      </div>
    </div>
  );
}
