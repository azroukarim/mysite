'use client';
// Force re-deploy for action bar updates

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Lock, LogOut, 
  ChevronLeft, Package, Image as ImageIcon, 
  Euro, Tag, Search, CheckCircle2, Shield, ShieldAlert,
  Eye, EyeOff, Copy, ChevronUp, ChevronDown, LayoutGrid, List, Megaphone
} from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/home/ProductCard';
import CountdownTimer from '@/components/product/CountdownTimer';
import { parseSaleDate, formatToGMTPlus1Date } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useCurrency } from '@/context/CurrencyContext';




interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
  duration?: string;
  sale_end_date?: string | null;
}

const PREDEFINED_DURATIONS = ['1M', '3M', '6M', '12M', '24M', 'LIFETIME'];

const CATEGORIES = [
  'PREMIUM STREAMING',
  'GOLD STREAMING',
  '4K STREAMING',
  'SMART TV',
  'ANDROID BOX',
  'RESELLER PANELS'
];

const EUR_TO_MAD = 11; // Ensure consistency with context

const CopyableDescription = ({ text, setStatus }: { text: string, setStatus: (s: string) => void }) => {
  if (!text) return null;
  const parts = text.split(/(\d{4,})/g); // Match 4 or more digits
  return (
    <>
      {parts.map((part, i) => {
        if (/^\d{4,}$/.test(part)) {
          return (
            <span 
              key={i} 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(part);
                setStatus(`Copied: ${part}`);
                setTimeout(() => setStatus(''), 2000);
              }}
              className="cursor-pointer font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 transition-colors inline-flex items-center gap-1"
              title="Click to copy code"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
};

const PreviewModal = ({ isOpen, onClose, originalData, updatedData }: { 
  isOpen: boolean, 
  onClose: () => void, 
  originalData?: Product | null, 
  updatedData: Product 
}) => {
  const [viewMode, setViewMode] = useState<'after' | 'before'>('before');
  
  if (!isOpen) return null;
  
  // If no original data (like adding new), always show updated
  const activeData = (viewMode === 'before' && originalData) ? originalData : updatedData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[1.5rem] p-3 shadow-2xl relative max-w-[220px] w-full animate-in zoom-in-95 duration-300 border border-slate-100 flex flex-col gap-3">
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-900 rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-100 z-10 hover:rotate-90 duration-300"
        >
          <X size={20} />
        </button>
        
        <div className="space-y-4 text-center">
          {/* Compact Header */}
          <div className="flex items-center justify-center gap-2 border-b border-slate-50 pb-2">
            <Eye size={16} className="text-blue-600" />
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Aperçu</h4>
          </div>

          {/* Before/After Toggle Buttons - Only show if data is different */}
          {originalData && updatedData && (
            // Use a more robust check for differences, ignoring id if necessary or comparing relevant fields
            (originalData.name !== updatedData.name || 
             originalData.description !== updatedData.description || 
             originalData.price !== updatedData.price || 
             originalData.duration !== updatedData.duration || 
             originalData.category !== updatedData.category ||
             originalData.image !== updatedData.image ||
             originalData.sale_end_date !== updatedData.sale_end_date)
          ) && (
            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
              <button 
                onClick={() => setViewMode('before')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5",
                  viewMode === 'before' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <ShieldAlert size={12} className={viewMode === 'before' ? "text-red-500" : "text-slate-300"} />
                ORIGINAL
              </button>
              <button 
                onClick={() => setViewMode('after')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5",
                  viewMode === 'after' ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <CheckCircle2 size={12} className={viewMode === 'after' ? "text-green-400" : "text-slate-300"} />
                MODIFIÉ
              </button>
            </div>
          )}

          {/* The Product Card Preview - Scaled for smaller modal */}
          <div className="relative group perspective-1000 transform scale-[0.7] origin-top mb-[-70px]">
             <ProductCard product={activeData} isReadOnly={true} />
          </div>

          <button 
            onClick={onClose}
            className="w-full py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={14} className="text-blue-400" />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProduct: Partial<Product>;
  setNewProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  addProduct: () => Promise<void>;
  setShowAddPreview: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDurations: Record<string, { price: string; normalPrice?: string; oldPrice: string }>;
  setSelectedDurations: React.Dispatch<React.SetStateAction<Record<string, { price: string; normalPrice?: string; oldPrice: string }>>>;
  symbol: string;
}

const AddProductModal = ({ 
  isOpen, 
  onClose, 
  newProduct, 
  setNewProduct, 
  addProduct, 
  setShowAddPreview, 
  selectedDurations, 
  setSelectedDurations, 
  symbol 
}: AddProductModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-[2rem] p-8 shadow-2xl relative max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-white scroll-smooth custom-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 bg-white text-slate-900 rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-100 z-10 hover:rotate-90 duration-300"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Create New Package</h3>
            <p className="text-sm text-slate-500 font-medium">Add a new streaming package to your catalog.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Premium 4K Streaming"
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-base font-bold shadow-sm"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. PREMIUM STREAMING..."
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-base font-bold shadow-sm"
                  value={newProduct.category?.replace('HIDDEN:', '') || ''}
                  onChange={(e) => {
                    const isCurrentlyHidden = newProduct.category?.startsWith('HIDDEN:');
                    setNewProduct({ 
                      ...newProduct, 
                      category: isCurrentlyHidden ? `HIDDEN:${e.target.value}` : e.target.value 
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all text-base font-bold shadow-sm"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  placeholder="Package details..."
                  rows={4}
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all resize-none text-base font-medium shadow-sm"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={addProduct}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 text-lg"
              >
                <CheckCircle2 size={22} />
                Add Package
              </button>
              <button
                onClick={() => setShowAddPreview(true)}
                className="flex-1 bg-white hover:bg-slate-50 text-blue-600 border-2 border-blue-100 font-black py-4.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg shadow-sm"
              >
                <Eye size={22} />
                Aperçu
              </button>
            </div>
          </div>

          {/* Right Column: Pricing */}
          <div className="space-y-6">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1">Durations & Prices</label>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">Sale</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={!!newProduct.sale_end_date}
                    onChange={(e) => {
                      setNewProduct({
                        ...newProduct, 
                        sale_end_date: e.target.checked ? formatToGMTPlus1Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
                      });
                    }}
                    className="w-3.5 h-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                </div>
                {newProduct.sale_end_date && (
                  <div className="flex gap-2">
                    <input 
                      type="date"
                      className="flex-[2] p-1.5 text-[10px] bg-white border border-amber-200 rounded-lg outline-none text-amber-900 shadow-inner"
                      value={formatToGMTPlus1Date(newProduct.sale_end_date)}
                      onChange={(e) => setNewProduct({ ...newProduct, sale_end_date: e.target.value })}
                    />
                    <div className="flex-1 relative">
                      <input 
                        type="number"
                        placeholder="Hours"
                        className="w-full p-1.5 pl-5 text-[10px] bg-white border border-amber-200 rounded-lg outline-none text-amber-900 shadow-inner"
                        onChange={(e) => {
                          const hrs = parseInt(e.target.value);
                          if (hrs > 0) {
                            const expiry = Date.now() + hrs * 60 * 60 * 1000;
                            setNewProduct({ ...newProduct, sale_end_date: expiry.toString() });
                          }
                        }}
                      />
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-amber-600">H:</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-slate-600" />
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">Visible</span>
                </div>
                <input 
                  type="checkbox"
                  checked={!newProduct.category?.startsWith('HIDDEN:')}
                  onChange={(e) => {
                    const isCurrentlyHidden = newProduct.category?.startsWith('HIDDEN:');
                    if (e.target.checked && isCurrentlyHidden) {
                      setNewProduct({ ...newProduct, category: newProduct.category?.replace('HIDDEN:', '') });
                    } else if (!e.target.checked && !isCurrentlyHidden) {
                      setNewProduct({ ...newProduct, category: `HIDDEN:${newProduct.category || ''}` });
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Duration Selectors */}
            <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
              {PREDEFINED_DURATIONS.map(dur => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => {
                    if (selectedDurations[dur]) {
                      const next = { ...selectedDurations };
                      delete next[dur];
                      setSelectedDurations(next);
                    } else {
                      setSelectedDurations({ ...selectedDurations, [dur]: { price: '0', oldPrice: '' } });
                    }
                  }}
                  className={`flex-1 py-1.5 px-1 rounded-lg text-[11px] font-black transition-all border ${
                    selectedDurations[dur]
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-slate-50 text-slate-500 border-slate-100 hover:border-blue-300"
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>

            {/* Price Inputs */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {Object.keys(selectedDurations).length > 0 ? (
                PREDEFINED_DURATIONS.filter(dur => selectedDurations[dur]).map(dur => (
                  <div key={dur} className="flex items-center gap-4 p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <span className="text-sm font-black text-slate-900 w-10">{dur}</span>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-blue-600 uppercase tracking-tighter ml-1">Promo Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">{symbol}</span>
                          <input 
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-14 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                              onFocus={(e) => e.target.select()}
                              value={selectedDurations[dur].price}
                              onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], price: e.target.value } })}
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-slate-900 uppercase tracking-tighter ml-1">Normal Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">{symbol}</span>
                          <input 
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-14 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                              onFocus={(e) => e.target.select()}
                              value={selectedDurations[dur].normalPrice || ''}
                              onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], normalPrice: e.target.value } })}
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-red-500 uppercase tracking-tighter ml-1">Strike Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">{symbol}</span>
                          <input 
                            type="number"
                            placeholder="0.00"
                            className="w-full pl-14 pr-3 py-2.5 bg-red-50/30 border border-red-100 rounded-xl text-sm font-bold outline-none text-red-400 line-through placeholder:text-red-300"
                              onFocus={(e) => e.target.select()}
                              value={selectedDurations[dur].oldPrice}
                              onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], oldPrice: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-xs font-black text-slate-300 uppercase tracking-widest bg-slate-50/50">
                  Select durations above to set prices
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName, itemCount }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  itemName?: string,
  itemCount?: number
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="bg-white rounded-[2.5rem] w-full max-w-md relative z-10 shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
            <Trash2 size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Confirmer la suppression</h3>
          <p className="text-slate-500 font-medium mb-8">
            {itemCount ? (
              <>Êtes-vous sûr de vouloir supprimer <span className="text-red-600 font-bold">{itemCount}</span> produits ? Cette action est irréversible.</>
            ) : (
              <>Êtes-vous sûr de vouloir supprimer <span className="text-red-600 font-bold">{itemName}</span> ? Cette action est irréversible.</>
            )}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 active:scale-95"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function AdminDashboard() {
  const { currency, symbol, formatPrice, convertPrice, setCurrency } = useCurrency();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
    name: '', 
    price: 0, 
    description: '', 
    image: '', 
    category: 'PREMIUM STREAMING',
    duration: '',
    sale_end_date: null
  });
  
  // State for duration checkboxes and prices
  // { label: { price, oldPrice } }
  const [selectedDurations, setSelectedDurations] = useState<Record<string, { price: string; normalPrice?: string; oldPrice: string }>>({});
  const [editSelectedDurations, setEditSelectedDurations] = useState<Record<string, { price: string; normalPrice?: string; oldPrice: string }>>({});

  const [status, setStatus] = useState('');


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [protectionEnabled, setProtectionEnabled] = useState<boolean | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkSaleDate, setBulkSaleDate] = useState<string | null>(null);
  const [bulkSaleHours, setBulkSaleHours] = useState<number>(0);
  
  const [activeTab, setActiveTab] = useState<'products' | 'news'>('products');
  const [news, setNews] = useState<string[]>([]);
  const [newsSpeed, setNewsSpeed] = useState(30);
  const [newsDirection, setNewsDirection] = useState<'left' | 'right'>('left');
  const [newNewsItem, setNewNewsItem] = useState('');

  // Preview States
  const [showAddPreview, setShowAddPreview] = useState(false);
  const [showEditPreview, setShowEditPreview] = useState(false);
  const [quickPreviewProduct, setQuickPreviewProduct] = useState<Product | null>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id?: number, ids?: number[], name?: string } | null>(null);

  // Load session and products on load
  useEffect(() => {
    // Check for reset mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    const hasRecoveryToken = window.location.hash.includes('type=recovery') || 
                            window.location.hash.includes('access_token=') ||
                            urlParams.get('mode') === 'reset';
                            
    if (hasRecoveryToken) {
      setIsResetMode(true);
      setIsRecoveryFlow(true);
    }

    // Listen for auth state changes (specifically for password recovery)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResetMode(true);
        setIsRecoveryFlow(true);
      }
    });

    const savedSession = localStorage.getItem('adminSession');
    if (savedSession) {
      const { loggedIn, email: savedEmail, pass } = JSON.parse(savedSession);
      if (loggedIn) {
        setEmail(savedEmail);
        setPassword(pass);
        setIsLoggedIn(true);
      }
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data.filter((p: any) => p.category !== 'SETTINGS_NEWS' && p.id !== 999999));
        } else {
          setProducts([]);
        }
      });

    // Fetch news
    fetch('/api/admin/news')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setNews(data.items);
          setNewsSpeed(data.speed || 30);
          setNewsDirection(data.direction || 'left');
        }
      });

    // Fetch settings
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProtectionEnabled(data.protection_enabled);
      });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update existing input values when currency changes to keep them consistent
  useEffect(() => {
    // For New Product Durations
    if (Object.keys(selectedDurations).length > 0) {
      const next = { ...selectedDurations };
      Object.keys(next).forEach(dur => {
        // We need to know the PREVIOUS currency to convert correctly
        // But since we only have two, we can infer: if current is MAD, previous was EUR, and vice versa.
        // Actually, it's better to just use the base EUR value if we had it, 
        // but since we are mid-input, we'll just do a simple toggle conversion.
        const priceVal = Number(next[dur].price);
        const normalPriceVal = next[dur].normalPrice ? Number(next[dur].normalPrice) : null;
        const oldPriceVal = next[dur].oldPrice ? Number(next[dur].oldPrice) : null;
        
        if (!isNaN(priceVal)) {
          next[dur].price = currency === 'MAD' 
            ? Math.round(priceVal * EUR_TO_MAD).toString()
            : (priceVal / EUR_TO_MAD).toFixed(2);
        }
        if (normalPriceVal !== null && !isNaN(normalPriceVal)) {
          next[dur].normalPrice = currency === 'MAD'
            ? Math.round(normalPriceVal * EUR_TO_MAD).toString()
            : (normalPriceVal / EUR_TO_MAD).toFixed(2);
        }
        if (oldPriceVal !== null && !isNaN(oldPriceVal)) {
          next[dur].oldPrice = currency === 'MAD'
            ? Math.round(oldPriceVal * EUR_TO_MAD).toString()
            : (oldPriceVal / EUR_TO_MAD).toFixed(2);
        }
      });
      setSelectedDurations(next);
    }

    // For Editing Product Durations
    if (editingProduct && Object.keys(editSelectedDurations).length > 0) {
      const next = { ...editSelectedDurations };
      Object.keys(next).forEach(dur => {
        const priceVal = Number(next[dur].price);
        const normalPriceVal = next[dur].normalPrice ? Number(next[dur].normalPrice) : null;
        const oldPriceVal = next[dur].oldPrice ? Number(next[dur].oldPrice) : null;
        
        if (!isNaN(priceVal)) {
          next[dur].price = currency === 'MAD' 
            ? Math.round(priceVal * EUR_TO_MAD).toString()
            : (priceVal / EUR_TO_MAD).toFixed(2);
        }
        if (normalPriceVal !== null && !isNaN(normalPriceVal)) {
          next[dur].normalPrice = currency === 'MAD'
            ? Math.round(normalPriceVal * EUR_TO_MAD).toString()
            : (normalPriceVal / EUR_TO_MAD).toFixed(2);
        }
        if (oldPriceVal !== null && !isNaN(oldPriceVal)) {
          next[dur].oldPrice = currency === 'MAD'
            ? Math.round(oldPriceVal * EUR_TO_MAD).toString()
            : (oldPriceVal / EUR_TO_MAD).toFixed(2);
        }
      });
      setEditSelectedDurations(next);
    }
  }, [currency]);

  // Helper to render Preview Modal with Before/After Toggle




  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('adminSession', JSON.stringify({ loggedIn: true, email: email, pass: password }));
      } else {
        alert(data.error || 'Invalid credentials!');
      }
    } catch (error) {
      alert('An error occurred during login');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending reset link...');
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Password reset link has been sent to your email!');
        setIsResetMode(false);
      } else {
        alert(data.error || 'Failed to send reset link');
      }
    } catch (error) {
      alert('Error sending reset link');
    } finally {
      setStatus('');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    setStatus('Updating password...');
    try {
      const { data, error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      
      alert('Password updated successfully! You can now login.');
      setIsResetMode(false);
      setPassword('');
      setConfirmPassword('');
      window.location.hash = ''; // Clear the recovery token from URL
    } catch (error: any) {
      alert('Error updating password: ' + error.message);
    } finally {
      setStatus('');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    localStorage.removeItem('adminSession');
  };

  const handleDuplicate = async (product: Product) => {
    setStatus('Duplicating...');
    
    // Create a new ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    // Create the cloned product object
    const clonedProduct: Product = {
      ...product,
      id: newId,
      name: `${product.name} (Copy)`,
      // Ensure the category logic is preserved
    };

    // Find the index of the original product to insert the clone right after it
    const originalIndex = products.findIndex(p => p.id === product.id);
    const newProducts = [...products];
    newProducts.splice(originalIndex + 1, 0, clonedProduct);
    
    // Save to database immediately
    const success = await handleSave(newProducts);
    
    if (success) {
      setStatus('Product Duplicated!');
      setTimeout(() => setStatus(''), 2000);
    } else {
      setStatus('Failed to duplicate');
    }
  };

  const moveProduct = async (index: number, direction: 'up' | 'down') => {
    const newProducts = [...products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newProducts.length) return;
    
    [newProducts[index], newProducts[targetIndex]] = [newProducts[targetIndex], newProducts[index]];
    
    const success = await handleSave(newProducts);
    if (success) {
      setStatus('Order updated');
      setTimeout(() => setStatus(''), 1000);
    }
  };

  const toggleProtection = async () => {
    const newValue = !protectionEnabled;
    setProtectionEnabled(newValue);
    setStatus('Updating protection...');
    
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, protection_enabled: newValue }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatus('Protection updated!');
          setTimeout(() => setStatus(''), 2000);
        } else {
          setProtectionEnabled(!newValue);
          alert('Error: ' + (data.error || 'Failed to update'));
          setStatus('');
        }
      } else {
        setProtectionEnabled(!newValue);
        alert('Server error: Failed to update protection');
        setStatus('');
      }
    } catch (error) {
      setProtectionEnabled(!newValue);
      alert('Network error updating protection');
      setStatus('');
    }
  };

  const handleSave = async (allProducts: Product[]) => {
    setStatus('Saving...');
    try {
      const updatedProducts = allProducts.map(p => {
        // Ensure sale_end_date is always a valid ISO string if it's a timestamp
        if (p.sale_end_date && /^\d+$/.test(p.sale_end_date)) {
          try {
            return { ...p, sale_end_date: new Date(parseInt(p.sale_end_date)).toISOString() };
          } catch (e) {
            return p;
          }
        }
        return p;
      });

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, products: updatedProducts }),
      });

      if (res.ok) {
        setProducts(updatedProducts);
        setStatus('Saved!');
        setTimeout(() => setStatus(''), 2000);
        return true;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save');
      }
    } catch (error: any) {
      const msg = error?.message || 'Error occurred';
      alert('Error saving data: ' + msg);
      setStatus('');
      return false;
    }
  };

  // Helper to format duration string from object
  const formatDurationString = (durMap: Record<string, { price: string; normalPrice?: string; oldPrice: string }>) => {
    return Object.entries(durMap)
      .filter(([_, v]) => v.price !== '')
      .map(([label, v]) => `${label}|${v.price}|${v.normalPrice || v.price}|${v.oldPrice}`)
      .join(', ');
  };

  // Helper to parse duration string to object
  // Helper to normalize duration labels (e.g. "12 months" -> "12M")
  const normalizeDurationLabel = (label: string): string => {
    const l = label.toLowerCase().trim();
    if (l.includes('12 month') || l === '12m' || l === '12 months') return '12M';
    if (l.includes('6 month') || l === '6m' || l === '6 months') return '6M';
    if (l.includes('3 month') || l === '3m' || l === '3 months') return '3M';
    if (l.includes('1 month') || l === '1m' || l === '1 months') return '1M';
    if (l.includes('lifetime') || l === 'lif') return 'Lifetime';
    return label;
  };

  const parseDurationString = (durStr: string): Record<string, { price: string; normalPrice?: string; oldPrice: string }> => {
    const res: Record<string, { price: string; normalPrice?: string; oldPrice: string }> = {};
    if (!durStr) return res;
    durStr.split(',').forEach(opt => {
      const parts = opt.split('|');
      const rawLabel = parts[0]?.trim();
      const label = normalizeDurationLabel(rawLabel);
      const price = parts[1]?.trim() || '';
      const normalPrice = parts[2]?.trim() || '';
      const oldPrice = parts[3]?.trim() || '';
      if (label && price) res[label] = { price, normalPrice, oldPrice };
    });
    return res;
  };

  // Price conversion helpers
  const fromStoragePrice = (eurPrice: number | string): string => {
    const val = Number(eurPrice);
    if (isNaN(val)) return '0';
    if (currency === 'MAD') return Math.round(val * EUR_TO_MAD).toString();
    return val.toString();
  };

  const toStoragePrice = (displayPrice: string): number => {
    const val = Number(displayPrice);
    if (isNaN(val)) return 0;
    if (currency === 'MAD') return val / EUR_TO_MAD;
    return val;
  };

  const addProduct = async () => {
    if (!newProduct.name) {
      alert('Veuillez entrer le nom du produit');
      return;
    }

    const durationStr = Object.entries(selectedDurations)
      .filter(([_, v]) => v.price !== '')
      .map(([label, v]) => {
        const p = toStoragePrice(v.price);
        const np = toStoragePrice(v.normalPrice || v.price);
        const op = toStoragePrice(v.oldPrice || '0');
        return `${label}|${p}|${np}|${op}`;
      })
      .join(', ');

    const firstVal = Object.values(selectedDurations)[0];
    const mainPrice = firstVal ? toStoragePrice(firstVal.normalPrice || firstVal.price) : 0;

    const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const productToAdd = { 
      ...newProduct, 
      id, 
      price: mainPrice,
      duration: durationStr
    } as Product;
    
    const success = await handleSave([...products, productToAdd]);
    if (success) {
      setNewProduct({ name: '', price: 0, description: '', image: '', category: 'PREMIUM STREAMING', duration: '', sale_end_date: null });
      setSelectedDurations({});
      setIsAddProductModalOpen(false);
    }
  };

  const deleteProduct = (id: number) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setDeleteConfirm({ id, name: product.name });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.ids) {
      // Bulk delete
      const updated = products.filter(p => !deleteConfirm.ids?.includes(p.id));
      const success = await handleSave(updated);
      if (success) {
        setSelectedIds([]);
        setStatus(`${updated.length} items restants`);
        setTimeout(() => setStatus(''), 2000);
      }
    } else if (deleteConfirm.id) {
      // Single delete
      const updated = products.filter((p) => p.id !== deleteConfirm.id);
      handleSave(updated);
    }
    setDeleteConfirm(null);
  };

  const toggleVisibility = async (id: number) => {
    const updated = products.map((p) => {
      if (p.id === id) {
        const currentlyHidden = p.category?.startsWith('HIDDEN:');
        return {
          ...p,
          category: currentlyHidden 
            ? p.category?.replace('HIDDEN:', '') 
            : `HIDDEN:${p.category || ''}`
        };
      }
      return p;
    });
    handleSave(updated);
  };

  const applyBulkVisibility = async (hide: boolean) => {
    if (selectedIds.length === 0) return;
    
    const updated = products.map((p) => {
      if (selectedIds.includes(p.id)) {
        const currentlyHidden = p.category?.startsWith('HIDDEN:');
        if (hide && !currentlyHidden) {
          return { ...p, category: `HIDDEN:${p.category || ''}` };
        } else if (!hide && currentlyHidden) {
          return { ...p, category: p.category?.replace('HIDDEN:', '') };
        }
      }
      return p;
    });
    
    const success = await handleSave(updated);
    if (success) {
      setSelectedIds([]);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct({ ...product });
    // Convert EUR prices to current currency for display in edit form
    const parsed = parseDurationString(product.duration || '');
    const converted: Record<string, { price: string; normalPrice: string; oldPrice: string }> = {};
    Object.entries(parsed).forEach(([rawLabel, v]) => {
      const label = normalizeDurationLabel(rawLabel);
      if (label) {
        converted[label] = {
          price: fromStoragePrice(v.price),
          normalPrice: fromStoragePrice(v.normalPrice || v.price),
          oldPrice: fromStoragePrice(v.oldPrice || '')
        };
      }
    });
    setEditSelectedDurations(converted);
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    
    const durationStr = Object.entries(editSelectedDurations || {})
      .filter(([_, v]) => v.price !== '')
      .map(([label, v]) => {
        const p = toStoragePrice(v.price);
        const np = toStoragePrice(v.normalPrice || v.price);
        const op = toStoragePrice(v.oldPrice || '0');
        return `${label}|${p}|${np}|${op}`;
      })
      .join(', ');

    const firstVal = Object.values(editSelectedDurations || {})[0];
    const mainPrice = firstVal ? toStoragePrice(firstVal.normalPrice || firstVal.price) : (editingProduct?.price || 0);

    const updated = products.map((p) => 
      p.id === editingProduct.id ? { ...editingProduct, price: mainPrice, duration: durationStr, sale_end_date: editingProduct.sale_end_date } : p
    );
    const success = await handleSave(updated);
    if (success) {
      setEditingProduct(null);
      setEditSelectedDurations({});
    }
  };
  
  const applyBulkSaleDate = async () => {
    if (selectedIds.length === 0) return;
    
    const expiry = bulkSaleHours > 0 
      ? (Date.now() + bulkSaleHours * 60 * 60 * 1000).toString()
      : bulkSaleDate;

    const updated = products.map(p => 
      selectedIds.includes(p.id) ? { ...p, sale_end_date: expiry } : p
    );
    
    const success = await handleSave(updated);
    if (success) {
      setSelectedIds([]);
      setBulkSaleDate(null);
      setBulkSaleHours(0);
    }
  };

  const applyBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirm({ ids: [...selectedIds] });
  };

  const removeBulkSaleDate = async () => {
    if (selectedIds.length === 0) return;
    
    const updated = products.map(p => 
      selectedIds.includes(p.id) ? { ...p, sale_end_date: null } : p
    );
    
    const success = await handleSave(updated);
    if (success) {
      setSelectedIds([]);
      setStatus('Countdown removed from selected items');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  const handleSaveNews = async (updatedNews: string[], updatedSpeed: number = newsSpeed, updatedDirection: 'left' | 'right' = newsDirection) => {
    setStatus('Saving news...');
    try {
      const res = await fetch('/api/admin/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedNews, speed: updatedSpeed, direction: updatedDirection }),
      });
      if (res.ok) {
        setNews(updatedNews);
        setNewsSpeed(updatedSpeed);
        setNewsDirection(updatedDirection);
        setStatus('News saved!');
        setTimeout(() => setStatus(''), 2000);
      }
    } catch (error) {
      alert('Error saving news');
    }
  };

  const addNewsItem = () => {
    if (!newNewsItem) return;
    const updated = [...news, newNewsItem];
    handleSaveNews(updated);
    setNewNewsItem('');
  };

  const deleteNewsItem = (index: number) => {
    const updated = news.filter((_, i) => i !== index);
    handleSaveNews(updated);
  };

  // Filter products without automatic sorting to allow manual order
  const adminCategories = [
    'All', 
    'Promos',
    ...Array.from(new Set(products.map(p => p.category?.replace('HIDDEN:', '')).filter(Boolean)))
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cleanCategory = p.category?.replace('HIDDEN:', '') || '';
    
    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Promos') {
      if (!p.sale_end_date) return false;
      const target = parseSaleDate(p.sale_end_date);
      return matchesSearch && target && target > Date.now();
    }
    
    return matchesSearch && cleanCategory === selectedCategory;
  });

  if (!isLoggedIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://raw.githubusercontent.com/azroukarim/strzone/main/png/background/background-admin.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >

        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-0" />
        



        <div className="max-w-md w-full relative z-10 text-center">

          <div className="animate-flag-wave mb-8">
            <h1 className="text-6xl font-black text-white drop-shadow-[0_2px_30px_rgba(0,0,0,0.5)] uppercase tracking-tight">
              STREAM<span className="text-white ml-2">TV</span>
            </h1>

          </div>
          <div className="mb-10">
            <p className="text-blue-100 font-bold drop-shadow-md uppercase tracking-[0.2em] text-xs">Admin Panel</p>
          </div>



          <div className="bg-transparent p-8 rounded-[3rem] shadow-none border border-white/5 animate-in fade-in zoom-in duration-1000">


            {!isResetMode ? (
              <form onSubmit={handleLogin} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em] ml-2">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Password</label>
                    <button 
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-[10px] font-bold text-blue-400 hover:text-blue-300 tracking-wider drop-shadow-sm"
                    >
                      FORGOT?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400 shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-[0.98] mt-4 border border-white/10"
                >
                  Enter Dashboard
                </button>

              </form>

            ) : (
              <form 
                onSubmit={isRecoveryFlow ? handleUpdatePassword : handleResetPassword} 
                className="space-y-6"
              >
                {isRecoveryFlow ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reset Password</label>
                    <p className="text-sm text-slate-500 mb-4 ml-1">Enter your email to receive a password reset link.</p>
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg"
                  >
                    {isRecoveryFlow ? 'Update Password' : 'Send Reset Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(false);
                      setIsRecoveryFlow(false);
                    }}
                    className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-all"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/" className="text-sm font-bold text-white/70 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
              <ChevronLeft size={20} />
            </Link>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />
            <div>
            <div className="animate-flag-wave">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">STREAM <span className="text-blue-600">TV</span> Admin</h1>
            </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {status && (
              <span className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {status}
              </span>
            )}

            {/* Currency Switcher */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button 
                onClick={() => setCurrency('EUR')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${currency === 'EUR' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EUR
              </button>
              <button 
                onClick={() => setCurrency('MAD')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${currency === 'MAD' ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
              >
                MAD
              </button>
            </div>

            <button 
              onClick={toggleProtection}
              disabled={protectionEnabled === null}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium border ${
                protectionEnabled === null
                ? "bg-slate-50 text-slate-300 border-slate-100 cursor-wait"
                : protectionEnabled 
                ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
              title={protectionEnabled === null ? "Loading settings..." : (protectionEnabled ? "Disable Content Protection" : "Enable Content Protection")}
            >
              {protectionEnabled === null ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              ) : protectionEnabled ? (
                <ShieldAlert size={18} />
              ) : (
                <Shield size={18} />
              )}
              <span className="hidden sm:inline">
                {protectionEnabled === null ? "Loading..." : (protectionEnabled ? "Protection ON" : "Protection OFF")}
              </span>
            </button>

            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tight">Streaming Manager</h2>
              <p className="text-lg text-slate-500 font-medium">Configure your streaming packages and multi-duration pricing.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit border border-slate-200">
              <button 
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-black transition-all ${
                  activeTab === 'products' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Package size={22} />
                Products
              </button>
              <button 
                onClick={() => setActiveTab('news')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-black transition-all ${
                  activeTab === 'news' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Megaphone size={22} />
                News Ticker
              </button>
            </div>

            {activeTab === 'products' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <button 
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="px-6 py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:translate-y-[-2px] active:scale-95 flex items-center gap-2.5 text-sm"
                >
                  <div className="bg-white/20 p-1 rounded-lg">
                      <Plus size={16} />
                  </div>
                  Create New Package
                </button>
              </div>
            )}
          </div>
          
          {activeTab === 'products' && (
            <div className="relative flex-1 md:w-80 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search packages..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {activeTab === 'news' ? (
          /* News Management View */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                  <Megaphone size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">News Ticker Manager</h3>
                  <p className="text-sm text-slate-500">Manage the scrolling news bar on your storefront.</p>
                </div>
              </div>

              <div className="flex gap-3 mb-8">
                <input 
                  type="text"
                  placeholder="Type a new announcement here..."
                  className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                  value={newNewsItem}
                  onChange={(e) => setNewNewsItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNewsItem()}
                />
                <button 
                  onClick={addNewsItem}
                  className="px-8 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                  Post News
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex-1 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Scrolling Speed</h4>
                    <div className="flex gap-2">
                      {[
                        { label: 'Slow', value: 60 },
                        { label: 'Normal', value: 30 },
                        { label: 'Fast', value: 15 },
                        { label: 'Very Fast', value: 8 }
                      ].map((s) => (
                        <button
                          key={s.value}
                          onClick={() => handleSaveNews(news, s.value, newsDirection)}
                          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                            newsSpeed === s.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Direction</h4>
                    <div className="flex gap-2">
                      {[
                        { label: 'Left (LTR)', value: 'left' },
                        { label: 'Right (RTL)', value: 'right' }
                      ].map((d) => (
                        <button
                          key={d.value}
                          onClick={() => handleSaveNews(news, newsSpeed, d.value as 'left' | 'right')}
                          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                            newsDirection === d.value
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Current Announcements</h4>
                  {news.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                      No active news. Post something above to show it on your store!
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {news.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                              {i + 1}
                            </div>
                            <span className="font-medium text-slate-700">{item}</span>
                          </div>
                          <button 
                            onClick={() => deleteNewsItem(i)}
                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete news item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-xl text-white max-w-4xl mx-auto shadow-2xl shadow-blue-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Live Preview</h3>
                <p className="text-blue-100 text-sm mb-6">This is how your news ticker looks on the home page:</p>
                 <div className="space-y-2">
                   {(news.length > 0 ? news : ['Welcome to Stream TV Store! New packages added daily...']).map((item, index) => (
                    <div key={index} className="w-full py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="px-3 bg-white text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-lg mr-4 ml-1">
                          NEWS
                        </div>
                        <div 
                          className={`${newsDirection === 'right' ? 'animate-marquee-preview-rtl' : 'animate-marquee-preview'} inline-block text-white text-xs font-bold`}
                          style={{ animationDuration: `${newsSpeed / 2}s` }}
                        >
                          {item}
                        </div>
                      </div>
                    </div>
                   ))}
                 </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <AddProductModal 
              isOpen={isAddProductModalOpen} 
              onClose={() => setIsAddProductModalOpen(false)} 
              newProduct={newProduct}
              setNewProduct={setNewProduct}
              addProduct={addProduct}
              setShowAddPreview={setShowAddPreview}
              selectedDurations={selectedDurations}
              setSelectedDurations={setSelectedDurations}
              symbol={symbol}
            />


          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* View Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* Category Filter for List */}
            <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar scroll-smooth flex-1">
              {adminCategories.map((category: any) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
                    selectedCategory === category
                      ? (category === 'Promos' 
                          ? "bg-gradient-to-r from-red-600 to-amber-500 text-white border-red-600 shadow-md" 
                          : "bg-slate-900 text-white border-slate-900 shadow-md")
                      : (category === 'Promos'
                          ? "bg-red-50 text-red-600 border-red-100 hover:border-red-600"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 shadow-sm")
                  }`}
                >
                  {category === 'Promos' && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  {category === 'All' ? 'ALL PRODUCTS' : category === 'Promos' ? 'EN PROMOS' : category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <Package size={20} />
                </div>
                <h3 className="text-lg font-bold">Product Catalog</h3>
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-100">
                {products.length} Products Total
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-5 w-12">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-slate-300 text-blue-600"
                          checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(filteredProducts.map(p => p.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider w-24">Package</th>
                      <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-5 text-sm font-bold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                      <tr key={product.id} className={`group hover:bg-blue-50/30 transition-colors ${selectedIds.includes(product.id) ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-6 py-5 align-top">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-slate-300 text-blue-600"
                            checked={selectedIds.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds([...selectedIds, product.id]);
                              } else {
                                setSelectedIds(selectedIds.filter(id => id !== product.id));
                              }
                            }}
                          />
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner">
                            <img 
                              src={editingProduct?.id === product.id ? editingProduct.image : product.image} 
                              alt="" 
                              className="w-full h-full object-contain p-1 transition-all" 
                              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Logo')}
                            />
                          </div>
                        </td>
                        <td colSpan={4} className="px-6 py-8 align-top bg-slate-50/50">
                          {editingProduct?.id === product.id ? (
                            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                            <div className="space-y-6">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Package Name</label>
                                <input
                                  type="text"
                                  className="w-full p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                  onFocus={(e) => e.target.select()}
                                  value={editingProduct.name}
                                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                                <input
                                  type="text"
                                  placeholder="Category"
                                  className="w-full p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                  onFocus={(e) => e.target.select()}
                                  value={editingProduct.category?.replace('HIDDEN:', '') || ''}
                                  onChange={(e) => {
                                    const isCurrentlyHidden = editingProduct.category?.startsWith('HIDDEN:');
                                    setEditingProduct({
                                      ...editingProduct, 
                                      category: isCurrentlyHidden ? `HIDDEN:${e.target.value}` : e.target.value
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Image URL</label>
                                <input
                                  type="text"
                                  placeholder="Image URL (Logo)"
                                  className="w-full p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500"
                                  onFocus={(e) => e.target.select()}
                                  value={editingProduct.image || ''}
                                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                                />
                              </div>

                              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-amber-600">
                                    <Tag size={16} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Flash Sale</span>
                                  </div>
                                  <input 
                                    type="checkbox"
                                    checked={!!editingProduct.sale_end_date}
                                    onChange={(e) => {
                                      setEditingProduct({
                                        ...editingProduct, 
                                        sale_end_date: e.target.checked ? formatToGMTPlus1Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
                                      });
                                    }}
                                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                  />
                                </div>
                                {editingProduct.sale_end_date && (
                                  <div className="flex gap-2">
                                    <div className="flex-[2] space-y-1">
                                      <label className="text-[8px] font-black text-amber-700 uppercase ml-1">Expiry Date</label>
                                      <input 
                                        type="date"
                                        className="w-full p-2 text-sm bg-white border border-amber-200 rounded-xl outline-none text-amber-900"
                                        value={formatToGMTPlus1Date(editingProduct.sale_end_date)}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, sale_end_date: e.target.value })}
                                      />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <label className="text-[8px] font-black text-amber-700 uppercase ml-1">Quick Hours</label>
                                      <div className="relative">
                                        <input 
                                          type="number"
                                          placeholder="24"
                                          className="w-full p-2 pl-6 text-sm bg-white border border-amber-200 rounded-xl outline-none text-amber-900"
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (!val) {
                                              setEditingProduct({ ...editingProduct, sale_end_date: null });
                                              return;
                                            }
                                            const hrs = parseInt(val);
                                            if (hrs > 0) {
                                              const expiry = Date.now() + hrs * 60 * 60 * 1000;
                                              setEditingProduct({ ...editingProduct, sale_end_date: expiry.toString() });
                                            }
                                          }}
                                        />
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black text-amber-600">H:</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase">Durations & Prices</label>
                                {/* Edit Duration Selectors in one line */}
                                <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-white rounded-xl border border-slate-200">
                                  {PREDEFINED_DURATIONS.map(dur => (
                                    <button
                                      key={dur}
                                      type="button"
                                      onClick={() => {
                                        const currentMap = editSelectedDurations || {};
                                        if (currentMap[dur]) {
                                          const next = { ...currentMap };
                                          delete next[dur];
                                          setEditSelectedDurations(next);
                                        } else {
                                          // Check if this duration exists in the original product data
                                          const originalParsed = parseDurationString(product.duration || '');
                                          const original = originalParsed[dur];
                                          
                                          setEditSelectedDurations({ 
                                            ...currentMap, 
                                            [dur]: original ? {
                                              price: fromStoragePrice(original.price),
                                              normalPrice: fromStoragePrice(original.normalPrice || original.price),
                                              oldPrice: fromStoragePrice(original.oldPrice || '')
                                            } : { price: '0', normalPrice: '0', oldPrice: '' }
                                          });
                                        }
                                      }}
                                      className={`flex-1 py-1 px-0.5 rounded-lg text-[10px] font-black transition-all border ${
                                        (editSelectedDurations || {})[dur]
                                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                          : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                                      }`}
                                    >
                                      {dur}
                                    </button>
                                  ))}
                                </div>

                                {/* Price Inputs for Selected Edit Durations */}
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                  {Object.keys(editSelectedDurations || {}).length > 0 ? (
                                    Object.keys(editSelectedDurations || {})
                                      .sort((a, b) => {
                                        const idxA = PREDEFINED_DURATIONS.indexOf(a);
                                        const idxB = PREDEFINED_DURATIONS.indexOf(b);
                                        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                                        if (idxA !== -1) return -1;
                                        if (idxB !== -1) return 1;
                                        return a.localeCompare(b);
                                      })
                                      .map(dur => (
                                      <div key={dur} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                                        <span className="text-xs font-black text-slate-900 w-8">{dur}</span>
                                        <div className="flex items-center gap-2 flex-1">
                                          <div className="flex-1 space-y-1">
                                            <label className="text-[9px] font-black text-blue-600 uppercase tracking-tighter ml-1">Promo</label>
                                            <div className="relative group">
                                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black pointer-events-none group-focus-within:text-blue-500 transition-colors">{symbol}</span>
                                               <input 
                                                 type="number"
                                                 placeholder="0.0"
                                                 className="w-full pl-14 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                 onFocus={(e) => e.target.select()}
                                                 value={(editSelectedDurations || {})[dur]?.price || ''}
                                                 onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], price: e.target.value } })}
                                               />
                                             </div>
                                          </div>
                                          <div className="flex-1 space-y-1">
                                            <label className="text-[9px] font-black text-slate-900 uppercase tracking-tighter ml-1">Normal</label>
                                            <div className="relative group">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black pointer-events-none group-focus-within:text-blue-500 transition-colors">{symbol}</span>
                                              <input 
                                                type="number"
                                                placeholder="0.0"
                                                className="w-full pl-14 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                                                onFocus={(e) => e.target.select()}
                                                value={(editSelectedDurations || {})[dur]?.normalPrice || ''}
                                                onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], normalPrice: e.target.value } })}
                                              />
                                            </div>
                                          </div>
                                          <div className="flex-1 space-y-1">
                                            <label className="text-[9px] font-black text-red-400 uppercase tracking-tighter ml-1">Strike</label>
                                            <div className="relative group">
                                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-black pointer-events-none transition-colors">{symbol}</span>
                                               <input 
                                                 type="number"
                                                 placeholder="0.0"
                                                 className="w-full pl-14 pr-2 py-2 bg-red-50/20 border border-red-50 rounded-lg text-xs font-bold outline-none text-red-400 line-through placeholder:text-red-200"
                                                 onFocus={(e) => e.target.select()}
                                                 value={(editSelectedDurations || {})[dur]?.oldPrice || ''}
                                                 onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], oldPrice: e.target.value } })}
                                               />
                                             </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 border border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-400 uppercase">
                                      No durations selected
                                    </div>
                                  )}
                                </div>
                              </div>

                              <textarea
                                className="w-full p-3 text-xs border border-slate-200 rounded-xl outline-none resize-none"
                                rows={3}
                                onFocus={(e) => e.target.select()}
                                value={editingProduct.description}
                                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                              />
                                <div className="flex gap-2 pt-4">
                                  <button onClick={saveEdit} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-base font-black transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                                    <Save size={18} />
                                    Save Changes
                                  </button>
                                  <button 
                                    onClick={() => setShowEditPreview(true)}
                                    className="flex-1 bg-white hover:bg-slate-50 text-blue-600 border-2 border-blue-100 py-4 rounded-xl text-base font-black transition-all flex items-center justify-center gap-2"
                                  >
                                    <Eye size={18} />
                                    Aperçu
                                  </button>
                                  <button onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-xl text-base font-black transition-all">Cancel</button>
                                </div>
                              </div>

                              {/* Edit Preview Modal */}
                              <PreviewModal 
                                isOpen={showEditPreview} 
                                onClose={() => setShowEditPreview(false)} 
                                originalData={products.find(p => p.id === editingProduct.id)}
                                updatedData={{
                                  ...editingProduct,
                                  price: (() => {
                                    const durs = PREDEFINED_DURATIONS.filter(d => (editSelectedDurations || {})[d]);
                                    const firstDur = durs[0];
                                    if (!firstDur) return editingProduct.price;
                                    const val = editSelectedDurations[firstDur];
                                    return Number(toStoragePrice(val.normalPrice || val.price));
                                  })(),
                                  duration: PREDEFINED_DURATIONS
                                    .filter(d => (editSelectedDurations || {})[d])
                                    .map(d => {
                                      const v = editSelectedDurations[d];
                                      const p = toStoragePrice(v.price);
                                      const np = toStoragePrice(v.normalPrice || v.price);
                                      const op = toStoragePrice(v.oldPrice || '0');
                                      return `${d}|${p}|${np}|${op}`;
                                    })
                                    .join(',')
                                } as Product}
                              />
                            </div>
                          ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl font-black text-slate-900 flex items-center gap-3">
                                    {product.name}
                                    {product.category?.startsWith('HIDDEN:') && (
                                      <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                        <EyeOff size={14} /> Hidden
                                      </span>
                                    )}
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest">
                                      {product.category?.replace('HIDDEN:', '') || 'PREMIUM STREAMING'}
                                    </span>
                                  </span>
                                </div>
                                
                                {/* Countdown Timer below the name */}
                                {product.sale_end_date && (
                                  <div className="w-fit scale-[0.8] origin-left">
                                    <CountdownTimer endDate={product.sale_end_date} />
                                  </div>
                                )}
                                 <p className="text-base text-slate-500 font-medium leading-relaxed line-clamp-2">
                                  <CopyableDescription text={product.description} setStatus={setStatus} />
                                </p>
                              {product.duration && (
                                <div className="flex flex-wrap gap-1.5">
                                  {product.duration.split(',').map((opt, i) => {
                                    const [rawLabel, promo, normal, strike] = opt.split('|').map(s => s.trim());
                                    const label = normalizeDurationLabel(rawLabel);
                                    if (!label) return null;
                                    return (
                                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px]">
                                        <span className="font-bold text-slate-800">{label}</span>
                                        <div className="w-[1px] h-3 bg-slate-200" />
                                        <span className="font-black text-blue-600 text-sm" title="Promo Price">
                                          {formatPrice(Number(promo))}
                                        </span>
                                        {normal && normal !== promo && (
                                          <span className="text-slate-900 font-bold" title="Normal Price">
                                            ({formatPrice(Number(normal))})
                                          </span>
                                        )}
                                        {strike && Number(strike) > 0 && (
                                          <span className="text-slate-400 line-through decoration-red-400/50 font-medium" title="Strike Price">
                                            {formatPrice(Number(strike))}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 align-top">
                          {!editingProduct && (
                            <div className="flex items-center justify-end gap-2">
                              {/* Sorting Group */}
                              <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                                <button 
                                  onClick={() => moveProduct(products.findIndex(p => p.id === product.id), 'up')}
                                  disabled={products.findIndex(p => p.id === product.id) === 0}
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg disabled:opacity-20 transition-all"
                                  title="Move Up"
                                >
                                  <ChevronUp size={20} />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                <button 
                                  onClick={() => moveProduct(products.findIndex(p => p.id === product.id), 'down')}
                                  disabled={products.findIndex(p => p.id === product.id) === products.length - 1}
                                  className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg disabled:opacity-20 transition-all"
                                  title="Move Down"
                                >
                                  <ChevronDown size={20} />
                                </button>
                              </div>

                              {/* Aperçu Quick Button */}
                              <button 
                                onClick={() => setQuickPreviewProduct(product)}
                                className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all"
                                title="Aperçu rapide"
                              >
                                <Eye size={20} />
                              </button>

                              {/* Visibility Toggle */}
                              <button 
                                onClick={() => toggleVisibility(product.id)} 
                                className="p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all" 
                                title={product.category?.startsWith('HIDDEN:') ? "Show Product" : "Hide Product"}
                              >
                                {product.category?.startsWith('HIDDEN:') ? <EyeOff size={20} /> : <Eye size={20} className="opacity-40" />}
                              </button>

                              {/* Duplicate Button */}
                              <button 
                                onClick={() => handleDuplicate(product)}
                                className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all"
                                title="Duplicate Product"
                              >
                                <Copy size={20} />
                              </button>

                              {/* Edit Button */}
                              <button 
                                onClick={() => startEdit(product)} 
                                className="p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all" 
                                title="Edit"
                              >
                                <Edit size={20} />
                              </button>

                              {/* Delete Button */}
                              <button 
                                onClick={() => deleteProduct(product.id)} 
                                className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border border-red-200 transition-all" 
                                title="Delete"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-10 py-20 text-center">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                              <Search size={40} />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-lg font-bold text-slate-800">Product Not Found</h3>
                              <p className="text-sm text-slate-500 max-w-[300px] mx-auto">
                                You can contact us on WhatsApp to provide this product:
                                <br />
                                <a 
                                  href="https://wa.me/212670965351" 
                                  target="_blank" 
                                  className="font-bold text-green-600 hover:underline"
                                >
                                  +212 670 965 351
                                </a>
                              </p>
                            </div>
                            <button 
                              onClick={() => setSearchTerm('')}
                              className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                            >
                              Clear search
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-slate-50 p-10 flex items-center justify-center">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => {
                          if (selectedIds.includes(product.id)) {
                            setSelectedIds(selectedIds.filter(id => id !== product.id));
                          } else {
                            setSelectedIds([...selectedIds, product.id]);
                          }
                        }}
                        className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 bg-white/90 backdrop-blur shadow-sm cursor-pointer"
                      />
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => toggleVisibility(product.id)} className="p-2 bg-white/90 backdrop-blur shadow-sm rounded-xl text-slate-600 hover:text-blue-600 transition-colors">
                        {product.category?.startsWith('HIDDEN:') ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="p-5 flex-grow space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.category?.replace('HIDDEN:', '')}</span>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{product.name}</h4>
                        {product.sale_end_date && (
                          <div className="mt-1 scale-[0.7] origin-left">
                            <CountdownTimer endDate={product.sale_end_date} />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900">
                          {(() => {
                            const target = product.sale_end_date ? parseSaleDate(product.sale_end_date) : null;
                            const isSale = target && target > Date.now();
                            if (!product.duration) return formatPrice(product.price);
                            const firstOpt = product.duration.split(',')[0];
                            const [_, promo, normal] = firstOpt.split('|').map((s: string) => s.trim());
                            const displayPrice = isSale ? Number(promo) : Number(normal || promo);
                            return formatPrice(displayPrice);
                          })()}
                        </span>
                      </div>
                    </div>
                     <p className="text-xs text-slate-500 line-clamp-2">
                      <CopyableDescription text={product.description} setStatus={setStatus} />
                    </p>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDuplicate(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Duplicate">
                        <Copy size={16} />
                      </button>
                    </div>
                    <button onClick={() => deleteProduct(product.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl border border-red-200 transition-all" title="Delete">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </main>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {selectedIds.length}
              </div>
              <span className="text-sm font-medium text-slate-300">Items selected</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Set Flash Sale</span>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                <input 
                  type="date" 
                  className="bg-transparent border-none outline-none text-sm px-2 text-white [color-scheme:dark]"
                  value={bulkSaleDate || ''}
                  onChange={(e) => {
                    setBulkSaleDate(e.target.value);
                    setBulkSaleHours(0);
                  }}
                />
                <div className="w-[1px] h-4 bg-slate-700 mx-1" />
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-blue-400 ml-1">OR</span>
                  <input 
                    type="number" 
                    placeholder="Hrs"
                    className="bg-slate-900 border border-slate-700 rounded-lg outline-none text-[10px] px-2 py-1 text-white w-12"
                    value={bulkSaleHours || ''}
                    onChange={(e) => {
                      setBulkSaleHours(parseInt(e.target.value) || 0);
                      if (parseInt(e.target.value) > 0) setBulkSaleDate(null);
                    }}
                  />
                </div>
                <button 
                  onClick={applyBulkSaleDate}
                  disabled={!bulkSaleDate && !bulkSaleHours}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 px-4 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <CheckCircle2 size={16} />
                  Apply to All
                </button>
              </div>

              <div className="h-6 w-[1px] bg-slate-700 mx-2" />

              <button 
                onClick={removeBulkSaleDate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/40 text-slate-300 hover:text-red-400 border border-slate-700 rounded-xl transition-all text-sm font-bold"
                title="Remove Countdown from selected items"
              >
                <Trash2 size={16} />
                <span>Remove Countdown</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => applyBulkVisibility(true)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors"
                  title="Hide Selected"
                >
                  <EyeOff size={20} />
                </button>
                <button 
                  onClick={() => applyBulkVisibility(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-green-400 transition-colors"
                  title="Show Selected"
                >
                  <Eye size={20} />
                </button>
              </div>

              <div className="h-6 w-[1px] bg-slate-700 mx-2" />

              <button 
                onClick={applyBulkDelete}
                className="p-2 hover:bg-red-900/40 rounded-xl text-slate-400 hover:text-red-500 transition-colors"
                title="Bulk Delete"
              >
                <Trash2 size={20} />
              </button>

              <button 
                onClick={() => setSelectedIds([])}
                className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                title="Clear selection"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Preview Modal */}
      {quickPreviewProduct && (
        <PreviewModal 
          isOpen={!!quickPreviewProduct}
          onClose={() => setQuickPreviewProduct(null)}
          originalData={quickPreviewProduct}
          updatedData={quickPreviewProduct}
        />
      )}

      <DeleteConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        itemName={deleteConfirm?.name}
        itemCount={deleteConfirm?.ids?.length}
      />
    </div>
  );
}
