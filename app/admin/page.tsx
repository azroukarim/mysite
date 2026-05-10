'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Lock, LogOut, 
  ChevronLeft, Package, Image as ImageIcon, 
  DollarSign, Tag, Search, CheckCircle2, Shield, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category?: string;
  duration?: string;
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
    duration: ''
  });
  
  // State for duration checkboxes and prices
  const [selectedDurations, setSelectedDurations] = useState<Record<string, string>>({});
  const [editSelectedDurations, setEditSelectedDurations] = useState<Record<string, string>>({});

  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [protectionEnabled, setProtectionEnabled] = useState(false);

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
        setStatus('Protection updated!');
        setTimeout(() => setStatus(''), 2000);
      } else {
        setProtectionEnabled(!newValue); // revert on error
        alert('Failed to update protection');
      }
    } catch (error) {
      setProtectionEnabled(!newValue);
      alert('Error updating protection');
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
  const formatDurationString = (durMap: Record<string, string>) => {
    return Object.entries(durMap)
      .filter(([_, price]) => price !== '')
      .map(([label, price]) => `${label}|${price}`)
      .join(', ');
  };

  // Helper to parse duration string to object
  const parseDurationString = (durStr: string) => {
    const res: Record<string, string> = {};
    if (!durStr) return res;
    durStr.split(',').forEach(opt => {
      const [label, price] = opt.split('|');
      if (label && price) res[label.trim()] = price.trim();
    });
    return res;
  };

  const addProduct = async () => {
    if (!newProduct.name) {
      alert('يرجى إدخال اسم المنتج');
      return;
    }

    const durationStr = formatDurationString(selectedDurations);
    // Use the first duration's price as the main price if available
    const mainPrice = Object.values(selectedDurations)[0] || "0";

    const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const productToAdd = { 
      ...newProduct, 
      id, 
      price: Number(mainPrice),
      duration: durationStr
    } as Product;
    
    const success = await handleSave([...products, productToAdd]);
    if (success) {
      setNewProduct({ name: '', price: 0, description: '', image: '', category: 'PREMIUM IPTV', duration: '' });
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
    
    const durationStr = formatDurationString(editSelectedDurations);
    const mainPrice = Object.values(editSelectedDurations)[0] || editingProduct.price.toString();

    const updated = products.map((p) => 
      p.id === editingProduct.id ? { ...editingProduct, price: Number(mainPrice), duration: durationStr } : p
    );
    const success = await handleSave(updated);
    if (success) {
      setEditingProduct(null);
      setEditSelectedDurations({});
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 space-y-8 border border-white/10">
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
              <Lock size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400">Secure access to Bloom dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <input
                type="text"
                placeholder="admin"
                className="w-full bg-slate-800/50 text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-800/50 text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium border ${
                protectionEnabled 
                ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
              title={protectionEnabled ? "Disable Content Protection" : "Enable Content Protection"}
            >
              {protectionEnabled ? <ShieldAlert size={18} /> : <Shield size={18} />}
              <span className="hidden sm:inline">{protectionEnabled ? "Protection ON" : "Protection OFF"}</span>
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
                  <div className="grid grid-cols-1 gap-3">
                    {PREDEFINED_DURATIONS.map(dur => (
                      <div key={dur} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-2 flex-1">
                          <input 
                            type="checkbox"
                            id={`dur-${dur}`}
                            className="w-5 h-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={!!selectedDurations[dur]}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDurations({ ...selectedDurations, [dur]: '0' });
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
                          <div className="relative w-28">
                            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input 
                              type="number"
                              placeholder="Price"
                              className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                              value={selectedDurations[dur]}
                              onChange={(e) => setSelectedDurations({ ...selectedDurations, [dur]: e.target.value })}
                            />
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
                      <th className="px-6 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider w-24">Package</th>
                      <th className="px-6 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-5 text-[13px] font-bold text-slate-500 uppercase tracking-wider w-32 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="group hover:bg-blue-50/30 transition-colors">
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
                              
                              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase">Durations & Prices</label>
                                {PREDEFINED_DURATIONS.map(dur => (
                                  <div key={dur} className="flex items-center gap-2">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4"
                                      checked={editSelectedDurations[dur] !== undefined}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setEditSelectedDurations({ ...editSelectedDurations, [dur]: '0' });
                                        } else {
                                          const next = { ...editSelectedDurations };
                                          delete next[dur];
                                          setEditSelectedDurations(next);
                                        }
                                      }}
                                    />
                                    <span className="text-xs font-medium flex-1">{dur}</span>
                                    {editSelectedDurations[dur] !== undefined && (
                                      <input 
                                        type="number"
                                        className="w-20 p-1.5 text-xs border border-slate-200 rounded-lg outline-none"
                                        value={editSelectedDurations[dur]}
                                        onChange={(e) => setEditSelectedDurations({ ...editSelectedDurations, [dur]: e.target.value })}
                                      />
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
    </div>
  );
}
