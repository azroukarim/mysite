import { Button } from "@/components/ui/button";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "@/components/home/ProductCard";
import { useState, useEffect } from "react";
import Link from "next/link";

interface RelatedProductsProps {
  product: any;
}

export default function RelatedProducts({ product }: RelatedProductsProps) {
  const { t } = useLanguage();
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const filtered = data
            .filter((p: any) => 
              p.id !== product.id && 
              p.category === product.category && 
              !p.category?.startsWith('HIDDEN:')
            )
            .slice(0, 4);
          
          // Fallback if no products in same category
          if (filtered.length === 0) {
            setRelated(data.filter((p: any) => p.id !== product.id && !p.category?.startsWith('HIDDEN:')).slice(0, 4));
          } else {
            setRelated(filtered);
          }
        }
      });
  }, [product.id, product.category]);

  if (related.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
          <div className="w-1.5 h-8 bg-primary rounded-full" />
          {t('related_products')}
        </h2>
        <Button variant="ghost" asChild className="font-bold text-primary hover:bg-primary/5">
          <Link href="/">
            {t('view_all') || 'View All'}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}
