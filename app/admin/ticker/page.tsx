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
  Sparkles,
  Layers,
  ArrowRight,
  PlusCircle,
  GripVertical,
  Activity,
  History
} from 'lucide-react';

export default function TickerManager() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPass = localStorage.getItem('admin_pass') || 
                        JSON.parse(localStorage.getItem('adminSession') || '{}').pass;
      return !!savedPass;
    }
    return false;
  });
  const [password, setPassword] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_pass') || 
             JSON.parse(localStorage.getItem('adminSession') || '{}').pass || '';
    }
    return '';
  });
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // News Ticker State (Multiple Bars)
  const [tickerBars, setTickerBars] = useState<any[]>([]);
  const [activeBarId, setActiveBarId] = useState<number | null>(null);

  // Splash Ads State
  const [adQueue, setAdQueue] = useState<any[]>([]);

  // New Item Temporary States
  const [newNewsText, setNewNewsText] = useState('');
  const [newAd, setNewAd] = useState({ 
    image_url: '', 
    start_time: new Date().toISOString().slice(0, 16), 
    end_time: new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16) 
  });

  useEffect(() => {
    // Session Loading - Already handled by initial state, but keeping for data sync
    if (password) {
      // Fetch News Bars
    fetch('/api/admin/news')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.bars) && data.bars.length > 0) {
          setTickerBars(data.bars);
          setActiveBarId(data.bars[0].id);
        } else if (data && Array.isArray(data.items)) {
          const initialBar = {
            id: Date.now(),
            name: 'Main Ticker',
            items: data.items,
            speed: data.speed || 30,
            direction: data.direction || 'left',
            active: true
          };
          setTickerBars([initialBar]);
          setActiveBarId(initialBar.id);
        } else {
          const defaultBar = { id: Date.now(), name: 'New Ticker', items: [], speed: 30, direction: 'left', active: true };
          setTickerBars([defaultBar]);
          setActiveBarId(defaultBar.id);
        }
      });

    // Fetch Ads Queue
    fetch('/api/admin/splash-ads')
      .then(res => res.json())
      .then(data => {
        if (data && data.ads) {
          setAdQueue(data.ads);
        } else if (Array.isArray(data)) {
           setAdQueue(data.map(ad => ({ 
             ...ad, 
             start_time: new Date().toISOString().slice(0, 16),
             end_time: new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16)
           })));
        }
      });
    }
  }, [password]);

  const handleSaveAll = async () => {
    if (!password) return alert('Session expired');
    setIsSaving(true);
    setStatus('🕒 Saving changes...');
    
    try {
      const newsRes = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, bars: tickerBars }),
      });

      const adsRes = await fetch('/api/admin/splash-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password, 
          ads: adQueue, 
          queueStartTime: null 
        }),
      });

      if (newsRes.ok && adsRes.ok) {
        setStatus('✅ Success! Dashboard updated.');
        setTimeout(() => setStatus(''), 3000);
      } else {
        setStatus('❌ Error saving data');
        setTimeout(() => setStatus(''), 3000);
      }
    } catch (err) {
      setStatus('❌ Connection error');
      setTimeout(() => setStatus(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const addNewBar = () => {
    const newBar = {
      id: Date.now(),
      name: `Ticker ${tickerBars.length + 1}`,
      items: [],
      speed: 30,
      direction: 'left',
      active: true
    };
    setTickerBars([...tickerBars, newBar]);
    setActiveBarId(newBar.id);
  };

  const removeBar = (id: number) => {
    if (tickerBars.length <= 1) return alert("You must have at least one ticker bar.");
    const updated = tickerBars.filter(b => b.id !== id);
    setTickerBars(updated);
    if (activeBarId === id) setActiveBarId(updated[0].id);
  };

  const updateActiveBar = (field: string, value: any) => {
    setTickerBars(tickerBars.map(b => b.id === activeBarId ? { ...b, [field]: value } : b));
  };

  const addNewsItem = () => {
    if (!newNewsText) return;
    const bar = tickerBars.find(b => b.id === activeBarId);
    if (bar) {
      updateActiveBar('items', [...bar.items, newNewsText]);
      setNewNewsText('');
    }
  };

  const removeNewsItem = (index: number) => {
    const bar = tickerBars.find(b => b.id === activeBarId);
    if (bar) {
      const updatedItems = bar.items.filter((_: any, i: number) => i !== index);
      updateActiveBar('items', updatedItems);
    }
  };

  const addAdToQueue = () => {
    if (!newAd.image_url) return alert("Please provide an image URL");
    setAdQueue([...adQueue, { ...newAd, id: Date.now() }]);
    setNewAd({ 
      image_url: '', 
      start_time: new Date().toISOString().slice(0, 16), 
      end_time: new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 16) 
    });
  };

  const removeAd = (id: number) => {
    setAdQueue(adQueue.filter(ad => ad.id !== id));
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 w-full max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/30">
            <Settings className="text-blue-400" size={40} />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tight">Access Restricted</h1>
          <p className="text-slate-400 mb-10 leading-relaxed font-medium">Please authenticate through the main dashboard to access the Ticker Manager.</p>
          <Link href="/admin" className="block w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">
            Return to Admin
          </Link>
        </div>
      </div>
    );
  }

  const currentBar = tickerBars.find(b => b.id === activeBarId) || tickerBars[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32 selection:bg-blue-100 font-sans">
      {/* Premium Header */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="w-12 h-12 flex items-center justify-center bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all text-slate-600 hover:text-slate-900 shadow-sm">
              <ChevronLeft size={24} />
            </Link>
            <div className="h-10 w-[1px] bg-slate-200" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Megaphone className="text-blue-600" size={28} />
                SYSTEM <span className="text-blue-600">BROADCAST</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status && (
              <div className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-black tracking-widest uppercase animate-in fade-in zoom-in duration-300">
                {status}
              </div>
            )}
            <button 
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10 disabled:opacity-50"
            >
              <Save size={18} />
              SAVE CHANGES
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-8 py-12 grid gap-12 lg:grid-cols-[400px_1fr]">
        
        {/* SIDEBAR: Management Panels */}
        <aside className="space-y-8">
          
          {/* Ticker Selector */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-slate-900">
                <Layers size={20} className="text-blue-600" />
                <h2 className="font-black text-sm uppercase tracking-widest">Ticker Channels</h2>
              </div>
              <button 
                onClick={addNewBar}
                className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {tickerBars.map((bar) => (
                <div 
                  key={bar.id}
                  onClick={() => setActiveBarId(bar.id)}
                  className={`group flex items-center justify-between p-5 rounded-2xl cursor-pointer border transition-all duration-300 ${
                    activeBarId === bar.id 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl translate-x-2' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${bar.active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`} />
                    <span className="font-black text-sm uppercase tracking-tight">{bar.name}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeBar(bar.id); }}
                    className={`p-2 rounded-lg transition-all ${activeBarId === bar.id ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'text-slate-300 hover:text-red-500'}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-indigo-500/20">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles size={20} className="text-indigo-400" />
                <h2 className="font-black text-sm uppercase tracking-widest opacity-80">Campaign Management</h2>
              </div>
              <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-6">
                Each image now has an absolute start and end time. This allows you to schedule promotions precisely for future events.
              </p>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-indigo-500 animate-[progress_3s_infinite]" />
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT: Active Editor */}
        <div className="space-y-12">
          
          {/* Ticker Bar Editor */}
          {currentBar && (
            <section className="bg-white rounded-[3rem] border border-slate-200/60 overflow-hidden shadow-sm">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      value={currentBar.name}
                      onChange={(e) => updateActiveBar('name', e.target.value)}
                      className="bg-transparent border-none p-0 text-2xl font-black text-slate-900 outline-none focus:ring-0 w-full max-w-[200px]"
                    />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Live Ticker Configuration</p>
                  </div>
                </div>
                <button 
                  onClick={() => updateActiveBar('active', !currentBar.active)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    currentBar.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {currentBar.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  {currentBar.active ? 'Channel Active' : 'Channel Hidden'}
                </button>
              </div>

              <div className="p-10 space-y-10">
                {/* News Items List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Broadcast Messages</label>
                    <span className="text-xs font-bold text-slate-400">{currentBar.items.length} Items</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <input 
                      type="text"
                      placeholder="Type a new broadcast message..."
                      className="flex-1 px-8 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-slate-700"
                      value={newNewsText}
                      onChange={(e) => setNewNewsText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addNewsItem()}
                    />
                    <button 
                      onClick={addNewsItem}
                      className="px-8 bg-blue-600 text-white rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                      <PlusCircle size={22} />
                      ADD
                    </button>
                  </div>

                  <div className="grid gap-3 pt-4">
                    {currentBar.items.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all shadow-sm group">
                        <div className="flex items-center gap-4">
                          <GripVertical size={18} className="text-slate-300" />
                          <span className="font-bold text-slate-700">{item}</span>
                        </div>
                        <button 
                          onClick={() => removeNewsItem(idx)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {currentBar.items.length === 0 && (
                      <div className="py-12 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
                        <p className="text-slate-400 font-medium italic">No messages scheduled for this channel.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Settings Grid */}
                <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Scrolling Speed</label>
                      <span className="text-sm font-black text-blue-600">{currentBar.speed}px/s</span>
                    </div>
                    <input 
                      type="range" min="10" max="150" 
                      className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={currentBar.speed}
                      onChange={(e) => updateActiveBar('speed', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Flow Direction</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => updateActiveBar('direction', 'left')}
                        className={`py-3.5 rounded-xl font-black text-xs uppercase transition-all ${currentBar.direction === 'left' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        To Left
                      </button>
                      <button 
                        onClick={() => updateActiveBar('direction', 'right')}
                        className={`py-3.5 rounded-xl font-black text-xs uppercase transition-all ${currentBar.direction === 'right' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        To Right
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Sequential Splash Ads Editor */}
          <section className="bg-white rounded-[3rem] border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-10 border-b border-slate-100 bg-indigo-50/30 flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sequential Splash Ads</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">Automatic Timeline Queue</p>
              </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Ad Creation Form */}
              <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6 border border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Promotional Image URL</label>
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {newAd.image_url ? <img src={newAd.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" size={24} />}
                    </div>
                    <input 
                      type="text"
                      placeholder="https://your-domain.com/banners/promo-01.jpg"
                      className="flex-1 px-6 py-4 bg-white border border-slate-200 rounded-[1.2rem] outline-none focus:border-indigo-500 transition-all font-medium"
                      value={newAd.image_url}
                      onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Start Appearance</label>
                    <input 
                      type="datetime-local"
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.2rem] outline-none focus:border-indigo-500 transition-all font-black"
                      value={newAd.start_time}
                      onChange={(e) => setNewAd({ ...newAd, start_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Stop Appearance</label>
                    <input 
                      type="datetime-local"
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.2rem] outline-none focus:border-indigo-500 transition-all font-black"
                      value={newAd.end_time}
                      onChange={(e) => setNewAd({ ...newAd, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <button 
                  onClick={addAdToQueue}
                  className="w-full h-16 bg-indigo-600 text-white rounded-[1.2rem] font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                  <Plus size={20} />
                  SCHEDULE PROMOTION
                </button>
              </div>

              {/* Queue Timeline Visualization */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Campaign Timeline</label>
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">
                    <Clock size={12} />
                    Absolute Time Scheduling
                  </div>
                </div>

                <div className="space-y-4">
                  {adQueue.length === 0 && (
                    <div className="py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
                      <ImageIcon className="text-slate-300" size={48} />
                      <p className="text-slate-400 font-bold italic">No promotional ads in the queue.</p>
                    </div>
                  )}
                  
                  {adQueue.map((ad, index) => {
                    const now = new Date();
                    const adStart = new Date(ad.start_time);
                    const adEnd = new Date(ad.end_time);
                    const isLive = now >= adStart && now < adEnd;
                    const isPassed = now >= adEnd;

                    return (
                      <div key={ad.id} className={`flex gap-6 p-6 rounded-[2rem] border-2 transition-all relative ${
                        isLive 
                        ? 'bg-blue-50 border-blue-200 shadow-lg translate-x-2' 
                        : isPassed 
                        ? 'bg-slate-50 border-slate-100 opacity-60 grayscale' 
                        : 'bg-white border-slate-100 hover:border-slate-300'
                      }`}>
                        {index < adQueue.length - 1 && (
                          <div className="absolute left-10 -bottom-8 w-[2px] h-8 bg-slate-100 z-0" />
                        )}
                        <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-shrink-0 z-10">
                          <img src={ad.image_url} alt="Ad" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">#{index + 1}</span>
                            {isLive ? (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase animate-pulse">
                                <Activity size={10} />
                                Live Now
                              </span>
                            ) : isPassed ? (
                              <span className="px-3 py-1 bg-slate-200 text-slate-500 rounded-full text-[10px] font-black uppercase">Completed</span>
                            ) : (
                              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase">Upcoming</span>
                            )}
                          </div>
                          <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] opacity-60">Starts</span>
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <Calendar size={12} className="text-blue-500" />
                                {adStart.toLocaleString()}
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-slate-200 self-end mb-1" />
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] opacity-60">Ends</span>
                              <div className="flex items-center gap-1.5 text-slate-700">
                                <Clock size={12} className="text-red-500" />
                                {adEnd.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center px-4">
                           <button 
                            onClick={() => removeAd(ad.id)}
                            className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                           >
                            <Trash2 size={22} />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
