"use client";

import ProductList from "@/components/home/ProductList";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-18 space-y-3">
        <h1 className="leading-tighter text-5xl tracking-tight text-balance lg:leading-[1.1] xl:text-8xl xl:tracking-tighter uppercase font-[family-name:var(--font-montserrat)] font-extrabold">
          <span className="text-slate-950">STREAM</span>
          <span className="text-primary">TV STORE</span>
        </h1>
        <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg font-medium opacity-80">
          {t('hero_desc')}
        </p>
      </div>
      <section id="products">
        <ProductList />
      </section>
    </div>
  );
}
