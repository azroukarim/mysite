'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SplashAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [adData, setAdData] = useState<{ id: number; url: string; enabled: boolean } | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Only check once on mount (refresh or first visit)
    fetch('/api/admin/splash-ads', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
          const now = new Date();
          let activeAd = null;

          // Find ad active in its own specific time window
          if (data.ads && Array.isArray(data.ads)) {
            activeAd = data.ads.find((ad: any) => {
              const start = new Date(ad.start_time);
              const end = new Date(ad.end_time);
              return now >= start && now < end;
            });
          }

          if (activeAd) {
            setAdData({ 
              id: activeAd.id, 
              url: activeAd.image_url, 
              enabled: true 
            });
            setIsClosing(false);
            setTimeout(() => setIsVisible(true), 800);
            
            // Auto-close after 3 seconds
            setTimeout(() => {
              handleClose();
            }, 3000);
          }
      })
      .catch(err => console.error("Splash fetch error:", err));
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 800);
  };

  if (!isVisible || !adData) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[9999] flex items-center justify-center p-6 transition-all duration-1000",
      isClosing ? "opacity-0 backdrop-blur-0" : "opacity-100 backdrop-blur-md bg-slate-950/40"
    )}>
      <div className={cn(
        "relative max-w-[280px] sm:max-w-xs w-full",
        isClosing ? "animate-spiral-out" : "animate-spiral-in"
      )}>
        {/* Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2.5rem] blur-2xl opacity-20 animate-pulse" />
        
        <div className="relative bg-white/10 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/20 shadow-2xl overflow-hidden group">
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 animate-[progress_1.5s_linear_forwards]" />
          
          <img 
            src={adData.url} 
            alt="Promotion" 
            className="w-full h-auto rounded-[1.5rem] shadow-inner select-none pointer-events-none"
          />
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/40 transition-all border border-white/20 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes spiral-in {
          0% { 
            transform: scale(0) rotate(-720deg); 
            opacity: 0;
            filter: blur(10px);
          }
          100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1;
            filter: blur(0);
          }
        }
        @keyframes spiral-out {
          0% { 
            transform: scale(1) rotate(0deg); 
            opacity: 1;
            filter: blur(0);
          }
          100% { 
            transform: scale(0) rotate(720deg); 
            opacity: 0;
            filter: blur(10px);
          }
        }
        .animate-spiral-in {
          animation: spiral-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-spiral-out {
          animation: spiral-out 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
