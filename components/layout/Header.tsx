"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useSearch } from "@/context/SearchContext";
import { Menu, ShoppingCart, X, Globe, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export default function Header() {
  const { cart } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { searchTerm, setSearchTerm, isSearchOpen, setIsSearchOpen } = useSearch();
  const cartCount =
    cart?.reduce((total, item) => total + item.quantity, 0) || 0;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  const isActivePath = (path: string) => pathname === path;

  const navItems = [{ href: "/contact", label: t('contact') }];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg"
          : "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8 lg:space-x-12">
            <Link
              className="text-2xl font-black tracking-tighter text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-1 group"
              href="/"
              aria-label="Stream TV Home"
            >
              <div className="animate-flag-wave">
                STREAM<span className="text-blue-600">TV</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Expandable Search Overlay next to Cart */}
              <div ref={searchContainerRef} className="flex items-center gap-1 sm:gap-1.5 relative">
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out flex items-center bg-slate-50 border border-slate-200/60 rounded-xl",
                    isSearchOpen ? "w-[120px] sm:w-[180px] px-2.5 py-1 sm:py-1.5" : "w-0 border-none px-0 py-0"
                  )}
                >
                  <input
                    type="text"
                    placeholder={language === 'fr' ? 'Rechercher...' : 'Search...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[10px] sm:text-xs font-semibold text-slate-700 placeholder-slate-400"
                    ref={(input) => {
                      if (input && isSearchOpen) {
                        input.focus();
                      }
                    }}
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")} 
                      className="text-slate-400 hover:text-slate-600 transition-colors ml-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group active:scale-95"
                  aria-label="Toggle search bar"
                >
                  {isSearchOpen ? (
                    <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
                  ) : (
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
                  )}
                </button>
              </div>

              {/* Shopping Cart */}
              <Link
                href="/cart"
                className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-all duration-200 group"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
                {cartCount > 0 && (
                  <span
                    className="absolute top-0 right-0 bg-primary text-white text-[8px] sm:text-xs font-bold rounded-full min-w-[14px] h-3.5 sm:min-w-[20px] sm:h-5 flex items-center justify-center px-1"
                    aria-label={`${cartCount} items in cart`}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="relative p-1.5 sm:p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200"
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileOpen}
              >
                {isMobileOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileOpen && (
          <div className="absolute top-[80px] right-4 sm:right-6 w-72 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col space-y-3">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              {language === 'en' ? 'Navigation' : 'Navigation'}
            </div>
            
            <Link
              href="/"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 text-xs sm:text-sm font-bold ${
                pathname === '/' ? 'bg-orange-50 text-primary border border-orange-100' : 'text-slate-700'
              }`}
            >
              <span>🏠</span>
              <span>{language === 'en' ? 'Home' : 'Accueil'}</span>
            </Link>

            <Link
              href="/offers"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 text-xs sm:text-sm font-bold ${
                pathname === '/offers' ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'text-slate-700'
              }`}
            >
              <span>🔥</span>
              <span>{language === 'en' ? 'Flash Sales' : 'Offres Flash'}</span>
            </Link>

            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 text-xs sm:text-sm font-bold ${
                pathname === '/contact' ? 'bg-orange-50 text-primary border border-orange-100' : 'text-slate-700'
              }`}
            >
              <span>📞</span>
              <span>{t('contact')}</span>
            </Link>

            <Link
              href="/refund-policy"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-200 text-xs sm:text-sm font-bold ${
                pathname === '/refund-policy' ? 'bg-orange-50 text-primary border border-orange-100' : 'text-slate-700'
              }`}
            >
              <span>🛡️</span>
              <span>{language === 'en' ? 'Refund Policy' : 'Politique de remboursement'}</span>
            </Link>

            <div className="border-t border-slate-100 pt-4 flex flex-col space-y-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pb-1">
                {language === 'en' ? 'Quick Preferences' : 'Préférences Rapides'}
              </div>
              
              <div className="flex items-center justify-between px-3">
                <span className="text-xs font-semibold text-slate-500">{language === 'en' ? 'Currency' : 'Devise'}</span>
                <button
                  onClick={() => {
                    setCurrency(currency === 'EUR' ? 'MAD' : 'EUR');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold"
                >
                  <span className={currency === 'EUR' ? 'text-blue-600' : 'text-slate-400'}>EUR</span>
                  <span className="text-gray-300">/</span>
                  <span className={currency === 'MAD' ? 'text-green-600' : 'text-gray-400'}>MAD</span>
                </button>
              </div>

              <div className="flex items-center justify-between px-3">
                <span className="text-xs font-semibold text-slate-500">{language === 'en' ? 'Language' : 'Langue'}</span>
                <button
                  onClick={() => {
                    setLanguage(language === 'en' ? 'fr' : 'en');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold uppercase"
                >
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  <span>{language === 'en' ? 'English' : 'Français'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
