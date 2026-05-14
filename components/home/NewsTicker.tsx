'use client';

import { useState, useEffect } from 'react';

export default function NewsTicker() {
  const [bars, setBars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/admin/news');
        const data = await res.json();
        if (data && Array.isArray(data.bars)) {
          setBars(data.bars);
        } else if (data && Array.isArray(data.items)) {
          // Fallback/Legacy
          setBars([{
            id: 1,
            name: 'Legacy',
            items: data.items,
            speed: data.speed || 30,
            direction: data.direction || 'left',
            active: true
          }]);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading || bars.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mb-10 px-4">
      {bars.filter(bar => bar.active && bar.items.length > 0).map((bar, barIndex) => (
        <div key={bar.id || barIndex} className="space-y-2 max-w-4xl mx-auto w-full">
          {bar.items.map((item: string, itemIndex: number) => {
            const isArabic = /[\u0600-\u06FF]/.test(item);
            const scrollDir = isArabic ? 'right' : (bar.direction || 'left');
            
            return (
              <div 
                key={itemIndex} 
                className="w-full bg-blue-600/5 border border-blue-100 py-2.5 overflow-hidden whitespace-nowrap rounded-full shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500" 
                style={{ animationDelay: `${barIndex * 200 + itemIndex * 100}ms` }}
              >
                <div className="flex items-center">
                  <div className="px-6 py-1.5 bg-blue-600 text-white text-[11px] font-black uppercase tracking-tighter rounded-full ml-2 mr-6 z-10 shadow-lg shadow-blue-500/20 flex-shrink-0">
                    {bar.name.toUpperCase()}
                  </div>
                  <div 
                    className={`${scrollDir === 'right' ? 'animate-marquee-rtl' : 'animate-marquee'} inline-block text-blue-950 text-base font-black`}
                    style={{ animationDuration: `${bar.speed || 30}s` }}
                  >
                    <span className="px-6"><bdi dir={isArabic ? 'rtl' : 'ltr'}>{item}{isArabic ? '\u200F' : ''}</bdi></span>
                    <span className="px-6"><bdi dir={isArabic ? 'rtl' : 'ltr'}>{item}{isArabic ? '\u200F' : ''}</bdi></span>
                    <span className="px-6"><bdi dir={isArabic ? 'rtl' : 'ltr'}>{item}{isArabic ? '\u200F' : ''}</bdi></span>
                    <span className="px-6"><bdi dir={isArabic ? 'rtl' : 'ltr'}>{item}{isArabic ? '\u200F' : ''}</bdi></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
