'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Wrench, MessageCircle, Clock, Settings2 } from 'lucide-react';

export default function MaintenanceMode() {
  const { t, language } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Skip maintenance check for admin paths
        if (window.location.pathname.startsWith('/admin')) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setIsEnabled(!!data.maintenance_enabled);
        }
      } catch (error) {
        console.error('Failed to check maintenance status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
    // Re-check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !isEnabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl w-full flex flex-col items-center">
        {/* Animated Icon */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl animate-pulse scale-150 opacity-50" />
          <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Wrench className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce-slow" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-orange-500 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
            <Settings2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin-slow" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          {t('maintenance_title')}
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 mb-12 max-w-lg font-medium leading-relaxed">
          {t('maintenance_desc')}
        </p>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center gap-4 text-left hover:border-blue-200 transition-colors">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-slate-700">Back Shortly</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center gap-4 text-left hover:border-orange-200 transition-colors">
            <div className="bg-orange-100 p-3 rounded-2xl">
              <MessageCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Support</p>
              <p className="text-sm font-bold text-slate-700">24/7 Available</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a 
            href="https://wa.me/212670965351"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm sm:text-base hover:bg-blue-600 transition-all duration-300 shadow-2xl shadow-slate-900/20 hover:shadow-blue-500/40 active:scale-95"
          >
            <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            {t('maintenance_whatsapp')}
          </a>

          <button 
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm sm:text-base hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-lg shadow-slate-100/50 active:scale-95"
          >
            <Clock className="w-5 h-5" />
            {language === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
          </button>
        </div>

        {/* Hidden Admin Access */}
        <p className="mt-12 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <a href="/admin" className="hover:text-slate-600 transition-colors cursor-default">
            STREAMTV STORE &copy; 2026
          </a>
        </p>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
