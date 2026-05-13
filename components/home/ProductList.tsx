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
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<any>(null);

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

  // Set default duration when quickViewProduct changes
  useEffect(() => {
    if (quickViewProduct) {
      if (quickViewProduct.duration && quickViewProduct.duration.includes('|')) {
        const options = quickViewProduct.duration.split(',').map((opt: string) => {
          const parts = opt.split('|').map(s => s.trim());
          const label = parts[0];
          if (parts.length >= 4) {
            return { label, promo: parseFloat(parts[1]), normal: parseFloat(parts[2]), strike: parseFloat(parts[3]) };
          } else {
            const promo = parseFloat(parts[1]);
            const strike = parseFloat(parts[2]);
            return { label, promo, normal: strike || promo, strike };
          }
        });
        setSelectedDuration(options[0]);
      } else {
        setSelectedDuration({ 
          label: quickViewProduct.duration || 'Standard', 
          promo: quickViewProduct.price, 
          normal: quickViewProduct.price, 
          strike: null 
        });
      }
    } else {
      setSelectedDuration(null);
      setJustAdded(false);
    }
  }, [quickViewProduct]);

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
              onQuickView={(p) => setQuickViewProduct(p)}
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

    {/* Quick View Modal */}
    {quickViewProduct && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl relative max-w-4xl w-full max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-300 border border-white/20 custom-scrollbar">
          <button 
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 sm:top-8 right-4 sm:right-8 w-10 sm:h-12 sm:w-12 h-10 bg-white/80 backdrop-blur-md text-slate-900 rounded-2xl shadow-xl flex items-center justify-center hover:bg-white transition-all border border-slate-100 z-50 hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 sm:gap-8 p-4 sm:p-10">
            {/* Left: Product Image */}
            <div className="space-y-6">
              <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-slate-50 flex items-center justify-center p-8 border border-slate-100 shadow-inner">
                <Image
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  fill
                  className="object-contain p-8"
                />
                
                {/* Sale Badge */}
                {isProductOnSale(quickViewProduct) && (
                  <div className="absolute top-6 left-6 px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded-full shadow-lg shadow-red-500/20 uppercase tracking-widest animate-bounce">
                    {t('sale')}
                  </div>
                )}
              </div>
              
              <div className="hidden md:flex flex-wrap gap-2 justify-center">
                {['4K QUALITY', '24/7 SUPPORT', 'INSTANT'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black rounded-full border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="flex flex-col h-full py-4 sm:py-0">
              <div className="flex-grow space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      {quickViewProduct.category?.replace('HIDDEN:', '')}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-blue-600 text-blue-600" />)}
                    </div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {quickViewProduct.name}
                  </h2>
                </div>

                {quickViewProduct.sale_end_date && isProductOnSale(quickViewProduct) && (
                  <div className="scale-90 origin-left">
                    <CountdownTimer endDate={quickViewProduct.sale_end_date} />
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t('subscription_duration')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(quickViewProduct.duration?.includes('|') ? quickViewProduct.duration.split(',') : [quickViewProduct.duration || 'Standard']).map((optStr: string, idx: number) => {
                      const parts = optStr.split('|').map(s => s.trim());
                      const label = parts[0] || 'Standard';
                      const isSelected = selectedDuration?.label === label;
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (parts.length >= 4) {
                              setSelectedDuration({ label, promo: parseFloat(parts[1]), normal: parseFloat(parts[2]), strike: parseFloat(parts[3]) });
                            } else if (parts.length === 2) {
                              setSelectedDuration({ label, promo: parseFloat(parts[1]), normal: parseFloat(parts[1]), strike: null });
                            } else {
                              setSelectedDuration({ label, promo: quickViewProduct.price, normal: quickViewProduct.price, strike: null });
                            }
                          }}
                          className={cn(
                            "px-4 py-3 rounded-xl border-2 text-left transition-all",
                            isSelected ? "border-blue-600 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"
                          )}
                        >
                          <div className={cn("text-xs font-black", isSelected ? "text-blue-600" : "text-slate-900")}>{label}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Abonnement</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-baseline gap-3">
                     <span className={cn(
                       "text-3xl font-black tracking-tighter",
                       isProductOnSale(quickViewProduct) ? "text-red-600" : "text-slate-900"
                     )}>
                       {formatPrice(isProductOnSale(quickViewProduct) ? (selectedDuration?.promo || quickViewProduct.price) : (selectedDuration?.normal || quickViewProduct.price))}
                     </span>
                     {(selectedDuration?.strike || quickViewProduct.oldPrice) && (
                       <span className="text-lg text-slate-300 line-through font-bold">
                         {formatPrice(selectedDuration?.strike || quickViewProduct.oldPrice)}
                       </span>
                     )}
                   </div>
                </div>

                <div className="prose prose-slate prose-sm line-clamp-3">
                   <p className="text-slate-500 font-medium">{quickViewProduct.description}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  onClick={async () => {
                    setIsAdding(true);
                    await new Promise(r => setTimeout(r, 600));
                    addToCart({
                      id: quickViewProduct.id,
                      name: `${quickViewProduct.name} (${selectedDuration?.label || 'Standard'})`,
                      price: isProductOnSale(quickViewProduct) ? (selectedDuration?.promo || quickViewProduct.price) : (selectedDuration?.normal || quickViewProduct.price),
                      image: quickViewProduct.image,
                      quantity: 1
                    });
                    setIsAdding(false);
                    setJustAdded(true);
                    setTimeout(() => setJustAdded(false), 2000);
                  }}
                  className={cn(
                    "w-full h-14 sm:h-16 rounded-2xl sm:rounded-[1.5rem] text-lg font-black transition-all shadow-xl",
                    justAdded ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  )}
                >
                  {isAdding ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : justAdded ? (
                    <div className="flex items-center gap-2"><Check /> Added!</div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={22} />
                      {t('add_to_cart')}
                    </div>
                  )}
                </Button>
                <Link 
                  href={`/product/${quickViewProduct.id}`}
                  className="block w-full py-4 text-center text-sm font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
