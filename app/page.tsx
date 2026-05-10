"use client";

import ProductList from "@/components/home/ProductList";
import { useLanguage } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-background px-4 py-8 sm:py-12 lg:py-16 lg:px-8 min-h-screen">
      <div className="text-center mx-auto mb-18 space-y-3">
        <h1 className="text-primary leading-tighter text-4xl font-bold tracking-tight text-balance lg:leading-[1.1] lg:font-extrabold xl:text-6xl xl:tracking-tighter uppercase italic">
          {t('hero_title')}
        </h1>
        <p className="text-foreground text-base max-w-3xl mx-auto text-balance sm:text-lg font-medium opacity-80">
          {t('hero_desc')}
        </p>
      </div>
      <ProductList />
    </div>
  );
}
