"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/home/ProductCard";
import { useLanguage } from "@/context/LanguageContext";
import { parseSaleDate } from "@/lib/dateUtils";

export default function OffersPage() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Parse local translations
  const content = {
    en: {
      title: "Limited-Time Offers",
      subtitle: "Grab the best active deals and flash sales before time runs out!",
      noOffers: "No Active Offers Right Now",
      noOffersDesc: "All our products are currently at their standard, highly-competitive prices. Check back soon for new flash sales!",
      backHome: "Back to Home",
      loading: "Loading active promotions...",
    },
    fr: {
      title: "Offres Limitées",
      subtitle: "Profitez des meilleures promotions en cours avant la fin du temps imparti !",
      noOffers: "Aucune offre active pour le moment",
      noOffersDesc: "Tous nos produits sont actuellement à leurs tarifs compétitifs standard. Revenez bientôt pour de nouvelles ventes flash !",
      backHome: "Retour à l'accueil",
      loading: "Chargement des promotions actives...",
    }
  }[language === 'fr' ? 'fr' : 'en'];

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Filter to show only active sale products
          const visibleOffers = data.filter((p: any) => {
            if (p.category?.startsWith("HIDDEN:") || p.category === "SETTINGS_NEWS" || p.id === 999999) {
              return false;
            }
            if (!p.sale_end_date) return false;
            const target = parseSaleDate(p.sale_end_date);
            return target ? target > Date.now() : false;
          });
          setProducts(visibleOffers);
        }
      } catch (error) {
        console.error("Failed to fetch offers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm animate-pulse">{content.loading}</p>
      </div>
    );
  }

  return (
    <div className="bg-background px-4 py-8 sm:py-16 lg:px-8 min-h-screen">
      {/* Decorative gradient top background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-72 bg-gradient-to-b from-primary/5 via-accent/2 to-transparent rounded-full pointer-events-none blur-3xl" />

      <div className="text-center mx-auto mb-12 max-w-3xl space-y-3 relative z-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider animate-bounce">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          🔥 Promo Flash
        </span>
        
        <h1 className="leading-tight text-3xl sm:text-6xl tracking-tight text-balance uppercase font-extrabold text-slate-950 font-[family-name:var(--font-montserrat)]">
          {content.title}
        </h1>
        <p className="text-foreground/80 text-[11px] sm:text-base max-w-xl mx-auto font-medium">
          {content.subtitle}
        </p>
      </div>

      <section className="relative z-10 max-w-7xl mx-auto">
        {products.length > 0 ? (
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 max-w-full mx-auto px-1 sm:px-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="text-7xl mb-6 animate-pulse">🎁</div>
            <h3 className="text-xl font-black text-slate-900 mb-2">
              {content.noOffers}
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              {content.noOffersDesc}
            </p>
            <Link 
              href="/" 
              className="inline-block px-6 py-3 bg-slate-950 hover:bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-lg transition-all"
            >
              {content.backHome}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
