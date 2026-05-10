'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Lock, LogOut, 
  ChevronLeft, Package, Image as ImageIcon, 
  Euro, Tag, Search, CheckCircle2, Shield, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import CountdownTimer from '@/components/product/CountdownTimer';
import { parseSaleDate } from '@/lib/dateUtils';

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

const PREDEFINED_DURATIONS = [
  '1 month',
  '3 months',
  '6 months',
  '12 months',
  '24 months',
  'Lifetime'
];

const CATEGORIES = [
  'PREMIUM IPTV',
  'GOLD IPTV',
  '4K STREAMING',
  'SMART TV',
  'ANDROID BOX',
  'RESELLER PANELS'
];

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ 
    name: '', 
    price: 0, 
    description: '', 
    image: '', 
    category: 'PREMIUM IPTV',
    duration: '',
    sale_end_date: null
  });
  
  // State for duration checkboxes and prices
  // { label: { price, oldPrice } }
  const [selectedDurations, setSelectedDurations] = useState<Record<string, { price: string; oldPrice: string }>>({});
  const [editSelectedDurations, setEditSelectedDurations] = useState<Record<string, { price: string; oldPrice: string }>>({});

  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [protectionEnabled, setProtectionEnabled] = useState<boolean | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkSaleDate, setBulkSaleDate] = useState<string | null>(null);

  // Load session and products on load
  useEffect(() => {
    const savedSession = localStorage.getItem('adminSession');
    if (savedSession) {
      const { loggedIn, user, pass } = JSON.parse(savedSession);
      if (loggedIn) {
        setUsername(user);
        setPassword(pass);
        setIsLoggedIn(true);
      }
    }

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));

    // Fetch settings
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProtectionEnabled(data.protection_enabled);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLoggedIn(true);
        localStorage.setItem('adminSession', JSON.stringify({ loggedIn: true, user: username, pass: password }));
      } else {
        alert(data.error || 'بيانات الدخول غير صحيحة!');
      }
    } catch (error) {
      alert('حدث خطأ أثناء محاولة الدخول');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('adminSession');
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

  const addProduct = async () => {
    if (!newProduct.name) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    const durationStr = formatDurationString(selectedDurations);
    const firstVal = Object.values(selectedDurations)[0];
    const mainPrice = firstVal?.price || "0";

    const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const productToAdd = { 
      ...newProduct, 
      id, 
      price: Number(mainPrice),
      duration: durationStr
    } as Product;
    
    const success = await handleSave([...products, productToAdd]);
    if (success) {
      setNewProduct({ name: '', price: 0, description: '', image: '', category: 'PREMIUM IPTV', duration: '', sale_end_date: null });
      setSelectedDurations({});
    }
  };

  const deleteProduct = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = products.filter((p) => p.id !== id);
      handleSave(updated);
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setEditSelectedDurations(parseDurationString(product.duration || ''));
  };

  const saveEdit = async () => {
    if (!editingProduct) return;
    
    const durationStr = formatDurationString(editSelectedDurations || {});
    const firstVal = Object.values(editSelectedDurations || {})[0];
    const mainPrice = firstVal?.price || editingProduct.price.toString();

    const updated = products.map((p) => 
      p.id === editingProduct.id ? { ...editingProduct, price: Number(mainPrice), duration: durationStr } : p
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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dashboard is now directly accessible
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
              <ChevronLeft size={20} />
            </Link>
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Stream <span className="text-blue-600">TV</span> Admin</h1>
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

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight">IPTV Manager</h2>
            <p className="text-slate-500">Configure your IPTV packages and multi-duration pricing.</p>
          </div>
          
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-28">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-200">
                  <Plus size={20} />
                </div>
                <h3 className="text-lg font-bold">Create New Package</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Package Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium 4K IPTV"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. PREMIUM IPTV, RESELLER..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-700 block">Subscription Durations & Prices</label>
                  
                  {/* Flash Sale Date Picker for New Product */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-amber-600" />
                        <label className="text-xs font-bold text-amber-700 uppercase tracking-wider">Flash Sale End Date</label>
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
                        className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                      />
                    </div>
                    {newProduct.sale_end_date && (
                      <input 
                        type="date"
                        className="w-full p-2 text-sm bg-white border border-amber-200 rounded-xl outline-none text-amber-900"
                        value={newProduct.sale_end_date.split('T')[0]}
                        onChange={(e) => setNewProduct({ ...newProduct, sale_end_date: e.target.value })}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {PREDEFINED_DURATIONS.map(dur => (
                      <div key={dur} className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors flex-wrap">
                        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                          <input 
                            type="checkbox"
                            id={`dur-${dur}`}
                            className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={!!selectedDurations[dur]}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDurations({ ...selectedDurations, [dur]: { price: '0', oldPrice: '' } });
                              } else {
                                const next = { ...selectedDurations };
                                delete next[dur];
                                setSelectedDurations(next);
                              }
                            }}
                          />
                          <label htmlFor={`dur-${dur}`} className="text-sm font-medium text-slate-600 cursor-pointer">{dur}</label>
                        </div>
                        {selectedDurations[dur] !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="relative w-24">
                              <Euro className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                              <input 
                                type="number"
                                placeholder="Price"
                                className="w-full pl-6 pr-2 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                                value={selectedDurations[dur].price}
                                onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], price: e.target.value } })}
                              />
                            </div>
                            <div className="relative w-24">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-red-300 text-xs font-bold line-through">€</span>
                              <input 
                                type="number"
                                placeholder="Old"
                                className="w-full pl-5 pr-2 py-2 bg-red-50 border border-red-100 rounded-xl text-sm focus:border-red-300 outline-none text-red-400"
                                value={selectedDurations[dur].oldPrice}
                                onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: { ...selectedDurations[dur], oldPrice: e.target.value } })}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <textarea
                    placeholder="Enter package details..."
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all resize-none"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                <button
                  onClick={addProduct}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Save Package
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
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
                      <th className="px-6 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider w-24">Package</th>
                      <th className="px-6 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
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
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
                            {product.image && (
                              <img src={product.image} alt="" className="w-full h-full object-contain p-1" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          {editingProduct?.id === product.id ? (
                            <div className="space-y-4">
                              <input
                                type="text"
                                className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none"
                                value={editingProduct.name}
                                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                              />
                               <input
                                type="text"
                                placeholder="Category"
                                className="w-full p-3 text-sm border border-slate-200 rounded-xl outline-none"
                                value={editingProduct.category}
                                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                              />

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
                                {PREDEFINED_DURATIONS.map(dur => (
                                  <div key={dur} className="flex items-center gap-2 flex-wrap">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4"
                                      checked={(editSelectedDurations || {})[dur] !== undefined}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { price: '0', oldPrice: '' } });
                                        } else {
                                          const next = { ...(editSelectedDurations || {}) };
                                          delete next[dur];
                                          setEditSelectedDurations(next);
                                        }
                                      }}
                                    />
                                    <span className="text-xs font-medium flex-1">{dur}</span>
                                    {(editSelectedDurations || {})[dur] !== undefined && (
                                      <div className="flex items-center gap-1">
                                        <input 
                                          type="number"
                                          placeholder="Price"
                                          className="w-16 p-1.5 text-xs border border-slate-200 rounded-lg outline-none"
                                          value={(editSelectedDurations || {})[dur]?.price || ''}
                                          onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], price: e.target.value } })}
                                        />
                                        <input 
                                          type="number"
                                          placeholder="Old€"
                                          className="w-16 p-1.5 text-xs border border-red-100 bg-red-50 rounded-lg outline-none text-red-400"
                                          value={(editSelectedDurations || {})[dur]?.oldPrice || ''}
                                          onChange={(e) => setEditSelectedDurations({ ...(editSelectedDurations || {}), [dur]: { ...(editSelectedDurations || {})[dur], oldPrice: e.target.value } })}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
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
                                <span className="font-bold text-slate-900">{product.name}</span>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase tracking-tight">
                                  {product.category}
                                </span>
                                {product.sale_end_date && (() => {
                                  const target = parseSaleDate(product.sale_end_date);
                                  return target && target > Date.now();
                                })() && (
                                  <div className="scale-75 origin-left">
                                    <CountdownTimer endDate={product.sale_end_date} />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 line-clamp-2">{product.description}</p>
                              {product.duration && (
                                <div className="flex flex-wrap gap-1.5">
                                  {product.duration.split(',').map((opt, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                      {opt.trim()}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 align-top">
                          {!editingProduct && (
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => startEdit(product)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => deleteProduct(product.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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
