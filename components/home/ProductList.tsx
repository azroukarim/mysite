import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import { parseSaleDate } from "@/lib/dateUtils";
import { X, ShoppingCart, Check, Zap, MonitorPlay, Star, ShieldCheck } from "lucide-react";
import ProductCard from "./ProductCard";
import NewsTicker from "./NewsTicker";
import CountdownTimer from "@/components/product/CountdownTimer";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { paymentMethods } from "@/lib/payment-methods";

export default function ProductList() {
  const { t, language } = useLanguage();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm, setSearchTerm } = useSearch();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to top of products
    const element = document.getElementById('products-grid');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const PaginationControls = ({ className = "py-2 sm:py-3" }: { className?: string }) => {
    if (totalPages <= 1) return null;
    return (
      <div className={cn("flex flex-col items-center gap-1.5 sm:gap-2", className)}>
        <div className="flex items-center gap-0.5 sm:gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={cn(
              "px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black transition-all flex items-center gap-0.5 sm:gap-2",
              currentPage === 1 
                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100" 
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"><path d="m15 18-6-6 6-6"/></svg>
            PREV
          </button>

          <div className="flex items-center gap-0.5 sm:gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "w-6 h-6 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black transition-all flex items-center justify-center",
                  currentPage === page
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "bg-white border border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600 shadow-sm"
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={cn(
              "px-2 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black transition-all flex items-center gap-0.5 sm:gap-2",
              currentPage === totalPages 
                ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100" 
                : "bg-white border border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 shadow-sm"
            )}
          >
            NEXT
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <p className="text-[8px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest">
          Page {currentPage} of {totalPages}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="max-w-md mx-auto h-12 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid gap-2 grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 max-w-full mx-auto px-2 sm:px-4">
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

      {/* Category Filter */}
      <div className="max-w-full px-2 sm:px-4">
        <div className="flex flex-wrap items-center justify-start gap-1.5 sm:gap-2 pb-2">
          {categories.map((category: any) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 sm:gap-2 ${
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



      {/* Top Pagination and Products Grid Grouped for Close Spacing */}
      <div className="space-y-0">
        {/* Top Row: Currency Switcher & Pagination */}
        <div className="relative flex items-center justify-between w-full h-auto py-0 px-2 sm:px-4">
          <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() => setCurrency(currency === 'EUR' ? 'MAD' : 'EUR')}
              className="flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 shadow-sm active:scale-95 text-[9px] sm:text-xs font-black select-none"
            >
              <span className={currency === 'EUR' ? 'text-blue-600' : 'text-slate-400'}>EUR</span>
              <span className="text-slate-300">/</span>
              <span className={currency === 'MAD' ? 'text-green-600' : 'text-slate-400'}>MAD</span>
            </button>
          </div>

          <PaginationControls className="mx-auto py-0" />
        </div>

        <div id="products-grid" className="grid gap-1 grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 max-w-full mx-auto px-1 sm:px-4">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
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

      {/* Bottom Pagination */}
      <PaginationControls className="py-6 sm:py-8" />

      {/* Payment Methods Under Pagination */}
      <div className="w-full max-w-4xl mx-auto pt-8 pb-4 border-t border-slate-100 flex flex-col items-center gap-4">
        <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">
          {t('payment_methods_title')}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3 opacity-90">
          {paymentMethods.map((method: any) => (
            <div 
              key={method.name} 
              className="h-8 w-16 md:h-12 md:w-24 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-105 hover:border-slate-300"
              title={method.name}
            >
              <img 
                src={method.image} 
                alt={method.name} 
                className="h-full w-full object-contain filter drop-shadow-sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
);
}
