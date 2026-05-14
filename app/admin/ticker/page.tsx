'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Megaphone, 
  Plus, 
  Trash2, 
  Calendar, 
  Image as ImageIcon,
  Clock,
  Eye,
  EyeOff,
  Save,
  ArrowLeft,
  Settings,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function TickerManager() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // News Ticker State
  const [news, setNews] = useState<string[]>([]);
  const [newNewsItem, setNewNewsItem] = useState('');
  const [newsSpeed, setNewsSpeed] = useState(30);
  const [newsDirection, setNewsDirection] = useState<'left' | 'right'>('left');

  // Splash Ads State
  const [scheduledAds, setScheduledAds] = useState<any[]>([]);
  const [newAd, setNewAd] = useState({
    image_url: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    // Session Loading
    const savedPass = localStorage.getItem('admin_pass') || 
                      JSON.parse(localStorage.getItem('adminSession') || '{}').pass;
    if (savedPass) {
      setPassword(savedPass);
      setIsLoggedIn(true);
    }

    // Fetch News
    fetch('/api/admin/news')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.items)) {
          setNews(data.items);
          setNewsSpeed(data.speed || 30);
          setNewsDirection(data.direction || 'left');
        }
      });

    // Fetch Ads
    fetch('/api/admin/splash-ads')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setScheduledAds(data);
      });
  }, []);

  const handleSaveNews = async (updatedNews: string[], speed = newsSpeed, direction = newsDirection) => {
    if (!password) return alert('Session expired');
    setStatus('Saving news...');
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, items: updatedNews, speed, direction }),
      });
      if (res.ok) {
        setNews(updatedNews);
        setStatus('✅ News saved!');
        setTimeout(() => setStatus(''), 2000);
      }
    } catch (error) {
      alert('Error saving news');
    }
  };

  const handleSaveAds = async (updatedAds: any[]) => {
    if (!password) return alert('Session expired');
    setIsSaving(true);
    setStatus('🕒 Saving ads...');
    try {
      const res = await fetch('/api/admin/splash-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ads: updatedAds }),
      });
      const data = await res.json();
      if (data.success) {
        setScheduledAds([...updatedAds]);
        setStatus('✅ Ads saved!');
        setTimeout(() => setStatus(''), 2000);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Failed to save ads: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full max-w-md text-center">
          <Settings className="mx-auto text-blue-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-white mb-6">Ticker & Ads Manager</h1>
          <p className="text-slate-400 mb-8">Please login via the main admin dashboard first.</p>
          <Link href="/admin" className="block w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
            Go to Main Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Ticker & <span className="text-blue-600">Ads</span> Manager
            </h1>
          </div>
          {status && (
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
              {status}
            </span>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid gap-12 lg:grid-cols-2">
        {/* News Ticker Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">News Ticker</h2>
              <p className="text-sm text-slate-500">Manage scrolling announcements</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
            <div className="flex gap-3">
              <input 
                type="text"
                placeholder="Add new announcement..."
                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                value={newNewsItem}
                onChange={(e) => setNewNewsItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (()=>{
                  if (!newNewsItem) return;
                  const updated = [...news, newNewsItem];
                  handleSaveNews(updated);
                  setNewNewsItem('');
                })()}
              />
              <button 
                onClick={() => {
                  if (!newNewsItem) return;
                  const updated = [...news, newNewsItem];
                  handleSaveNews(updated);
                  setNewNewsItem('');
                }}
                className="px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {news.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <span className="font-medium text-slate-700">{item}</span>
                  <button 
                    onClick={() => {
                      const updated = news.filter((_, i) => i !== index);
                      handleSaveNews(updated);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {news.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  No news items added yet.
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Scrolling Speed</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="10" max="100" 
                    className="flex-1 accent-blue-600"
                    value={newsSpeed}
                    onChange={(e) => setNewsSpeed(parseInt(e.target.value))}
                    onMouseUp={() => handleSaveNews(news, newsSpeed, newsDirection)}
                  />
                  <span className="text-sm font-bold text-slate-600 w-8">{newsSpeed}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Direction</label>
                <select 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm"
                  value={newsDirection}
                  onChange={(e) => {
                    const dir = e.target.value as 'left' | 'right';
                    setNewsDirection(dir);
                    handleSaveNews(news, newsSpeed, dir);
                  }}
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Splash Ads Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Scheduled Splash Ads</h2>
              <p className="text-sm text-slate-500">Timed promotional popups</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-8">
            {/* Ad Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Image URL</label>
                <input 
                  type="text"
                  placeholder="https://example.com/ad.jpg"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                  value={newAd.image_url}
                  onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm"
                    value={newAd.start_date}
                    onChange={(e) => setNewAd({ ...newAd, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="datetime-local"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm"
                    value={newAd.end_date}
                    onChange={(e) => setNewAd({ ...newAd, end_date: e.target.value })}
                  />
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!newAd.image_url || !newAd.start_date || !newAd.end_date) return alert('Fill all fields');
                  const updated = [...scheduledAds, { ...newAd, is_active: true, id: Date.now() }];
                  handleSaveAds(updated);
                  setNewAd({ image_url: '', start_date: '', end_date: '' });
                }}
                disabled={isSaving}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
              >
                <Save size={20} />
                Schedule Ad
              </button>
            </div>

            {/* Ad List */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-4 flex justify-between">
                Active Campaigns
                <span className="text-blue-600">({scheduledAds.length})</span>
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {scheduledAds.map((ad, index) => {
                   const now = new Date();
                   const start = new Date(ad.start_date);
                   const end = new Date(ad.end_date);
                   const isActiveNow = ad.is_active && now >= start && now <= end;

                   return (
                    <div key={index} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                      <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                        <img src={ad.image_url} alt="Ad" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isActiveNow ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded-md text-[10px] font-black uppercase">Live Now</span>
                          ) : ad.is_active ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-md text-[10px] font-black uppercase">Scheduled</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded-md text-[10px] font-black uppercase">Hidden</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => {
                            const updated = scheduledAds.map((a, i) => i === index ? { ...a, is_active: !a.is_active } : a);
                            handleSaveAds(updated);
                          }}
                          className={`p-2 rounded-lg transition-colors ${ad.is_active ? 'text-blue-600 bg-blue-50' : 'text-slate-400 bg-white'}`}
                        >
                          {ad.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button 
                          onClick={() => {
                            const updated = scheduledAds.filter((_, i) => i !== index);
                            handleSaveAds(updated);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 bg-white rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
