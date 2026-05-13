"use client";
// Force rebuild: 2026-05-11 21:07

import ProductList from "@/components/home/ProductList";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-background px-2 py-4 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-10 sm:mb-18 space-y-2 sm:space-y-3">
        <h1 className="leading-tighter text-2xl sm:text-5xl tracking-tight text-balance lg:leading-[1.1] xl:text-8xl xl:tracking-tighter uppercase font-[family-name:var(--font-montserrat)] font-extrabold">
          <span className="text-slate-950">STREAM</span>
          <span className="text-primary ml-1.5 sm:ml-0">TV STORE</span>
        </h1>
        <p className="text-foreground text-[10px] sm:text-base max-w-3xl mx-auto text-balance sm:text-lg font-medium opacity-80 px-4">
          {t('hero_desc')}
        </p>
      </div>
      <section id="products">
        <ProductList />
      </section>
    </div>
  );
}
