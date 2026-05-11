'use client';

import { useState, useEffect } from 'react';

export default function NewsTicker() {
  const [news, setNews] = useState<string[]>([]);
  const [speed, setSpeed] = useState(30);
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/admin/news');
        const data = await res.json();
        if (data && Array.isArray(data.items)) {
          setNews(data.items);
          setSpeed(data.speed || 30);
          setDirection(data.direction || 'left');
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || news.length === 0) return null;

  const newsString = news.join('  •  ');

  return (
    <div className="w-full bg-blue-600/5 border-y border-blue-100 py-2 overflow-hidden whitespace-nowrap mb-4 rounded-xl">
      <div className="flex items-center">
        <div className="px-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-r-lg mr-4 z-10 shadow-lg shadow-blue-200">
          NEWS
        </div>
        <div 
          className={`${direction === 'right' ? 'animate-marquee-rtl' : 'animate-marquee'} inline-block text-blue-800 text-xs font-bold`}
          style={{ animationDuration: `${speed}s` }}
        >
          <span className="px-4">{newsString}</span>
          <span className="px-4">{newsString}</span>
          <span className="px-4">{newsString}</span>
        </div>
      </div>
    </div>
  );
}
