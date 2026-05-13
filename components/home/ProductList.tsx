import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { parseSaleDate } from "@/lib/dateUtils";
import { X, ShoppingCart, Check, Zap, MonitorPlay, Star, ShieldCheck } from "lucide-react";
import ProductCard from "./ProductCard";
import NewsTicker from "./NewsTicker";
import CountdownTimer from "@/components/product/CountdownTimer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductList() {
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          // Keep the exact order from the API
          const visibleProducts = data.filter((p: any) => 
            !p.category?.startsWith('HIDDEN:') && 
            p.category !== 'SETTINGS_NEWS' &&
            p.id !== 999999
          );
          setProducts(visibleProducts);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);



  const isProductOnSale = (p: any) => {
    if (!p.sale_end_date) return false;
    const target = parseSaleDate(p.sale_end_date);
    return target ? target > Date.now() : false;
  };

  const categories = [
    'All', 
    'Promos',
    ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Promos') return matchesSearch && isProductOnSale(p);
    
    return matchesSearch && p.category === selectedCategory;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="max-w-md mx-auto h-12 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid gap-2 grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 max-w-full mx-auto px-2 sm:px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[350px] bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* News Bar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-0">
        <NewsTicker />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto px-4 sm:px-0">
        <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </div>
        <input 
          type="text"
          placeholder={t('search_placeholder')}
          className="w-full pl-10 sm:pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((category: any) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                selectedCategory === category
                  ? (category === 'Promos' 
                      ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg shadow-red-500/20" 
                      : "bg-blue-600 text-white shadow-lg shadow-blue-500/20")
                  : (category === 'Promos'
                      ? "bg-red-50 text-red-600 border border-red-100 hover:border-red-200"
                      : "bg-white border border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600")
              } shadow-sm`}
            >
              {category === 'Promos' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
              {category === 'All' 
                ? (language === 'fr' ? 'Tous' : 'All') 
                : category === 'Promos'
                  ? (language === 'fr' ? 'En Promos' : 'PROMOS')
                  : category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-1 grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 max-w-full mx-auto px-1 sm:px-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
            />
          ))
        ) : (
        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <div className="text-6xl mb-6 opacity-20">🔍</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            Product Not Found
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Sorry, we couldn't find what you're looking for. You can contact us directly on WhatsApp to provide this product for you:
            <br />
            <a 
              href="https://wa.me/212670965351" 
              target="_blank" 
              className="inline-block mt-4 px-6 py-3 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200"
            >
              Contact us on WhatsApp
            </a>
          </p>
        </div>
      )}
    </div>
  </div>
);
}
