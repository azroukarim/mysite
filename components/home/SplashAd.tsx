'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SplashAd() {
  const [isVisible, setIsVisible] = useState(false);
  const [adData, setAdData] = useState<{ url: string; enabled: boolean } | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // 1. Fetch scheduled ads
    fetch('/api/admin/splash-ads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const now = new Date();
          // Find the first active ad for the current time
          const activeAd = data.find(ad => {
            const start = new Date(ad.start_date);
            const end = new Date(ad.end_date);
            return ad.is_active && now >= start && now <= end;
          });

          if (activeAd) {
            setAdData({ url: activeAd.image_url, enabled: true });
            // Show after a tiny delay for effect
            setTimeout(() => setIsVisible(true), 500);
            
            // 2. Auto-close after 1.5 seconds of visibility
            setTimeout(() => {
              handleClose();
            }, 2500);
          }
        }
      });
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 800); // Animation duration
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
