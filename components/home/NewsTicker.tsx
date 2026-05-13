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
    <div className="flex flex-col gap-2 mb-4">
      {news.map((item, index) => (
        <div key={index} className="w-full bg-blue-600/5 border-y border-blue-100 py-5 overflow-hidden whitespace-nowrap rounded-2xl shadow-sm animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: `${index * 100}ms` }}>
          <div className="flex items-center">
            <div className="px-6 py-2 bg-blue-600 text-white text-[16px] font-black uppercase tracking-widest rounded-r-2xl mr-6 z-10 shadow-lg shadow-blue-500/20">
              NEWS
            </div>
            <div 
              className={`${direction === 'right' ? 'animate-marquee-rtl' : 'animate-marquee'} inline-block text-blue-950 text-2xl font-black`}
              style={{ animationDuration: `${speed}s` }}
            >
              <span className="px-4">{item}</span>
              <span className="px-4">{item}</span>
              <span className="px-4">{item}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
