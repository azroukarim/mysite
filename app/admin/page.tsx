'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Lock, LogOut, 
  ChevronLeft, Package, Image as ImageIcon, 
  Euro, Tag, Search, CheckCircle2, Shield, ShieldAlert,
  Eye, EyeOff, Copy, ChevronUp, ChevronDown, LayoutGrid, List, Megaphone
} from 'lucide-react';
import Link from 'next/link';
import CountdownTimer from '@/components/product/CountdownTimer';
import { parseSaleDate } from '@/lib/dateUtils';
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

export default function AdminDashboard() {
  const { currency, symbol, formatPrice, convertPrice } = useCurrency();
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
  const [selectedDurations, setSelectedDurations] = useState<Record<string, { price: string; oldPrice: string }>>({});
  const [editSelectedDurations, setEditSelectedDurations] = useState<Record<string, { price: string; oldPrice: string }>>({});

  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [protectionEnabled, setProtectionEnabled] = useState<boolean | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkSaleDate, setBulkSaleDate] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'products' | 'news'>('products');
  const [news, setNews] = useState<string[]>([]);
  const [newsSpeed, setNewsSpeed] = useState(30);
  const [newsDirection, setNewsDirection] = useState<'left' | 'right'>('left');
  const [newNewsItem, setNewNewsItem] = useState('');

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
        const oldPriceVal = next[dur].oldPrice ? Number(next[dur].oldPrice) : null;
        
        if (!isNaN(priceVal)) {
          next[dur].price = currency === 'MAD' 
            ? Math.round(priceVal * EUR_TO_MAD).toString()
            : (priceVal / EUR_TO_MAD).toFixed(2);
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
        const oldPriceVal = next[dur].oldPrice ? Number(next[dur].oldPrice) : null;
        
        if (!isNaN(priceVal)) {
          next[dur].price = currency === 'MAD' 
            ? Math.round(priceVal * EUR_TO_MAD).toString()
            : (priceVal / EUR_TO_MAD).toFixed(2);
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

  const handleSave = async (updatedProducts: Product[]) => {
    setStatus('Saving...');
    try {
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
      alert('Error saving data: ' + error.message);
      setStatus('');
      return false;
    }
  };

  // Helper to format duration string from object
  const formatDurationString = (durMap: Record<string, { price: string; oldPrice: string }>) => {
    return Object.entries(durMap)
      .filter(([_, v]) => v.price !== '')
      .map(([label, v]) => v.oldPrice ? `${label}|${v.price}|${v.oldPrice}` : `${label}|${v.price}`)
      .join(', ');
  };

  // Helper to parse duration string to object
  const parseDurationString = (durStr: string): Record<string, { price: string; oldPrice: string }> => {
    const res: Record<string, { price: string; oldPrice: string }> = {};
    if (!durStr) return res;
    durStr.split(',').forEach(opt => {
      const parts = opt.split('|');
      const label = parts[0]?.trim();
      const price = parts[1]?.trim() || '';
      const oldPrice = parts[2]?.trim() || '';
      if (label && price) res[label] = { price, oldPrice };
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
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    const durationStr = Object.entries(selectedDurations)
      .filter(([_, v]) => v.price !== '')
      .map(([label, v]) => {
        const p = toStoragePrice(v.price);
        const op = v.oldPrice ? toStoragePrice(v.oldPrice) : null;
        return op ? `${label}|${p}|${op}` : `${label}|${p}`;
      })
      .join(', ');

    const firstVal = Object.values(selectedDurations)[0];
    const mainPrice = firstVal ? toStoragePrice(firstVal.price) : 0;

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
    }
  };

  const deleteProduct = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = products.filter((p) => p.id !== id);
      handleSave(updated);
    }
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
    const converted: Record<string, { price: string; oldPrice: string }> = {};
    Object.entries(parsed).forEach(([label, v]) => {
      converted[label] = {
        price: fromStoragePrice(v.price),
        oldPrice: v.oldPrice ? fromStoragePrice(v.oldPrice) : ''
      };
    });
    setEditSelectedDurations(converted);
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    
    const durationStr = Object.entries(editSelectedDurations || {})
      .filter(([_, v]) => v.price !== '')
      .map(([label, v]) => {
        const p = toStoragePrice(v.price);
        const op = v.oldPrice ? toStoragePrice(v.oldPrice) : null;
        return op ? `${label}|${p}|${op}` : `${label}|${p}`;
      })
      .join(', ');

    const firstVal = Object.values(editSelectedDurations || {})[0];
    const mainPrice = firstVal ? toStoragePrice(firstVal.price) : editingProduct.price;

    const updated = products.map((p) => 
      p.id === editingProduct.id ? { ...editingProduct, price: mainPrice, duration: durationStr } : p
    );
    const success = await handleSave(updated);
    if (success) {
      setEditingProduct(null);
      setEditSelectedDurations({});
    }
  };
  
  const applyBulkSaleDate = async () => {
    if (selectedIds.length === 0) return;
    
    const updated = products.map(p => 
      selectedIds.includes(p.id) ? { ...p, sale_end_date: bulkSaleDate } : p
    );
    
    const success = await handleSave(updated);
    if (success) {
      setSelectedIds([]);
      setBulkSaleDate(null);
    }
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
  const adminCategories = ['All', ...Array.from(new Set(products.map(p => p.category?.replace('HIDDEN:', '')).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const cleanCategory = p.category?.replace('HIDDEN:', '') || '';
    const matchesCategory = selectedCategory === 'All' || cleanCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-500/20 mb-6">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Admin Portal</h1>
            <p className="text-slate-500">Secure access to Stream TV management</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            {!isResetMode ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="admin@example.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <button 
                      type="button"
                      onClick={() => setIsResetMode(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
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
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
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
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
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
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg"
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
            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
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
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Stream <span className="text-blue-600">TV</span> Admin</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {status && (
              <span className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-sm font-medium border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {status}
              </span>
            )}
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
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
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
          </div>
          
          {activeTab === 'products' && (
            <div className="relative flex-1 md:w-80 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search packages..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {activeTab === 'news' ? (
          /* News Management View */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
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
                  className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                  value={newNewsItem}
                  onChange={(e) => setNewNewsItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNewsItem()}
                />
                <button 
                  onClick={addNewsItem}
                  className="px-8 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
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
                          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${
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
                          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold transition-all border ${
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
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                      No active news. Post something above to show it on your store!
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {news.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
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

            <div className="bg-blue-600 p-8 rounded-3xl text-white max-w-4xl mx-auto shadow-2xl shadow-blue-500/20 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Live Preview</h3>
                <p className="text-blue-100 text-sm mb-6">This is how your news ticker looks on the home page:</p>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                   <div className="w-full py-2 overflow-hidden whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="px-3 bg-white text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-lg mr-4">
                        NEWS
                      </div>
                      <div 
                        className={`${newsDirection === 'right' ? 'animate-marquee-preview-rtl' : 'animate-marquee-preview'} inline-block text-white text-xs font-bold`}
                        style={{ animationDuration: `${newsSpeed / 2}s` }}
                      >
                        {news.length > 0 ? news.join('  •  ') : 'Welcome to Stream TV Store! New packages added daily...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20">
                <Plus size={20} />
              </div>
              <h3 className="text-xl font-black">Create New Package</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Package Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium 4K Streaming"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-base font-bold"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. PREMIUM STREAMING..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-base font-bold"
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
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-base font-bold"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block ml-1">Durations & Prices</label>
                
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
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
                          sale_end_date: e.target.checked ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
                        });
                      }}
                      className="w-3.5 h-3.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
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

                {/* Duration Selectors in one line */}
                <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
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
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      {dur}
                    </button>
                  ))}
                </div>

                {/* Price Inputs for Selected Durations */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {Object.keys(selectedDurations).length > 0 ? (
                    PREDEFINED_DURATIONS.filter(dur => selectedDurations[dur]).map(dur => (
                      <div key={dur} className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        <span className="text-sm font-black text-slate-900 w-10">{dur}</span>
                        
                        <div className="flex items-center gap-3 flex-1">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">{symbol}</span>
                            <input 
                              type="number"
                              placeholder="Price"
                              className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all"
                              value={selectedDurations[dur].price}
                              onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], price: e.target.value } })}
                            />
                          </div>
                          <div className="relative flex-1">
                            <input 
                              type="number"
                              placeholder={`Old ${symbol}`}
                              className="w-full p-2.5 bg-red-50/30 border border-red-50 rounded-xl text-sm font-bold outline-none text-red-400 line-through placeholder:text-red-300"
                              value={selectedDurations[dur].oldPrice}
                              onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], oldPrice: e.target.value } })}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest">
                      Select durations above
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    placeholder="Package details..."
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all resize-none text-base font-medium"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                <button
                  onClick={addProduct}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4.5 rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 text-lg mt-auto"
                >
                  <CheckCircle2 size={22} />
                  Add New Package
                </button>
              </div>
            </div>
          </div>

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
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                    selectedCategory === category
                      ? "bg-slate-900 text-white border-slate-900 shadow-md"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900 shadow-sm"
                  }`}
                >
                  {category === 'All' ? 'ALL PRODUCTS' : category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
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
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-inner">
                            <img 
                              src={editingProduct?.id === product.id ? editingProduct.image : product.image} 
                              alt="" 
                              className="w-full h-full object-contain p-1 transition-all" 
                              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Logo')}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          {editingProduct?.id === product.id ? (
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Package Name</label>
                                <input
                                  type="text"
                                  className="w-full p-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500"
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
                                  value={editingProduct.image || ''}
                                  onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                                />
                              </div>

                              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-amber-700 uppercase tracking-wider">Flash Sale Countdown</label>
                                  <input 
                                    type="checkbox"
                                    checked={!!editingProduct.sale_end_date}
                                    onChange={(e) => {
                                      setEditingProduct({
                                        ...editingProduct, 
                                        sale_end_date: e.target.checked ? new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
                                      });
                                    }}
                                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                  />
                                </div>
                                {editingProduct.sale_end_date && (
                                  <input 
                                    type="date"
                                    className="w-full p-2 text-sm bg-white border border-amber-200 rounded-xl outline-none text-amber-900"
                                    value={editingProduct.sale_end_date.split('T')[0]}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, sale_end_date: e.target.value })}
                                  />
                                )}
                              </div>
                              
                              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase">Durations & Prices</label>
                                {/* Edit Duration Selectors in one line */}
                                <div className="flex flex-wrap gap-1.5 mb-2 p-1.5 bg-white rounded-xl border border-slate-200">
                                  {PREDEFINED_DURATIONS.map(dur => (
                                    <button
                                      key={dur}
                                      type="button"
                                      onClick={() => {
                                        if ((editSelectedDurations || {})[dur]) {
                                          const next = { ...(editSelectedDurations || {}) };
                                          delete next[dur];
                                          setEditSelectedDurations(next);
                                        } else {
                                          setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { price: '0', oldPrice: '' } });
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
                                    PREDEFINED_DURATIONS.filter(dur => (editSelectedDurations || {})[dur]).map(dur => (
                                      <div key={dur} className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                                        <span className="text-xs font-black text-slate-900 w-8">{dur}</span>
                                        <div className="flex items-center gap-2 flex-1">
                                          <div className="relative flex-1">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">{symbol}</span>
                                            <input 
                                              type="number"
                                              className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black outline-none focus:border-blue-500 focus:bg-white transition-all"
                                              value={(editSelectedDurations || {})[dur]?.price || ''}
                                              onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], price: e.target.value } })}
                                            />
                                          </div>
                                          <div className="relative flex-1">
                                            <input 
                                              type="number"
                                              placeholder={`Old ${symbol}`}
                                              className="w-full p-2 bg-red-50/30 border border-red-50 rounded-lg text-xs font-bold outline-none text-red-400 line-through placeholder:text-red-200"
                                              value={(editSelectedDurations || {})[dur]?.oldPrice || ''}
                                              onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], oldPrice: e.target.value } })}
                                            />
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
                                value={editingProduct.description}
                                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                              />
                              <div className="flex gap-2">
                                <button onClick={saveEdit} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold">Save Changes</button>
                                <button onClick={() => setEditingProduct(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-sm font-bold">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
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
                                {product.sale_end_date && (() => {
                                  const target = parseSaleDate(product.sale_end_date);
                                  return target && target > Date.now();
                                })() && (
                                  <div className="w-full max-w-[320px]">
                                    <CountdownTimer endDate={product.sale_end_date} />
                                  </div>
                                )}
                              </div>
                              <p className="text-base text-slate-500 font-medium leading-relaxed line-clamp-2">{product.description}</p>
                              {product.duration && (
                                <div className="flex flex-wrap gap-1.5">
                                  {product.duration.split(',').map((opt, i) => {
                                    const [label, price, oldPrice] = opt.split('|').map(s => s.trim());
                                    return (
                                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-[11px]">
                                        <span className="font-bold text-slate-800">{label}</span>
                                        <div className="w-[1px] h-3 bg-slate-200" />
                                        <span className="font-black text-blue-600 text-sm">
                                          {formatPrice(Number(price))}
                                        </span>
                                        {oldPrice && (
                                          <span className="text-slate-400 line-through decoration-red-400/50 font-medium">
                                            {formatPrice(Number(oldPrice))}
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

                              {/* Visibility Toggle */}
                              <button 
                                onClick={() => toggleVisibility(product.id)} 
                                className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all" 
                                title={product.category?.startsWith('HIDDEN:') ? "Show Product" : "Hide Product"}
                              >
                                {product.category?.startsWith('HIDDEN:') ? <EyeOff size={20} /> : <Eye size={20} />}
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
                <div key={product.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-lg transition-all flex flex-col">
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
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-slate-900">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
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
                    <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={16} />
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
          <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-6 border border-slate-800 backdrop-blur-md">
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
              
              <div className="flex items-center gap-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                <input 
                  type="date" 
                  className="bg-transparent border-none outline-none text-sm px-2 text-white [color-scheme:dark]"
                  value={bulkSaleDate || ''}
                  onChange={(e) => setBulkSaleDate(e.target.value)}
                />
                <button 
                  onClick={applyBulkSaleDate}
                  disabled={!bulkSaleDate}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 px-4 py-1.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
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
    </div>
  );
}
