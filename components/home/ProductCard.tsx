"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import { Check, Eye, Heart, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CountdownTimer from "@/components/product/CountdownTimer";
import { parseSaleDate } from "@/lib/dateUtils";
import { useLanguage } from "@/context/LanguageContext";

interface Product {
  id: number;
  image: string;
  name: string;
  price: number;
  category?: string;
  link?: string;
  duration?: string;
  sale_end_date?: string | null;
}

export default function ProductCard({ product, isReadOnly = false }: { product: Product, isReadOnly?: boolean }) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [saleEnded, setSaleEnded] = useState(false);
  
  // Reset sale status when date changes
  useEffect(() => {
    setSaleEnded(false);
  }, [product.sale_end_date]);

  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  // Parse prices from the first duration option
  const getPrices = () => {
    if (!product.duration) return { promo: product.price, normal: product.price, strike: null };
    const firstOption = product.duration.split(',')[0];
    const parts = firstOption.split('|').map(s => s.trim());
    
    // New Format: Label | Promo | Normal | Strike
    if (parts.length >= 4) {
      const promo = parseFloat(parts[1]) || product.price;
      const normal = parseFloat(parts[2]) || promo;
      const strike = parseFloat(parts[3]) || null;
      return { promo, normal, strike };
    } 
    // Legacy Format: Label | Price | OldPrice
    else if (parts.length === 3) {
      const promo = parseFloat(parts[1]) || product.price;
      const strike = parseFloat(parts[2]) || null;
      const normal = strike || promo; // Revert to strike price if it exists
      return { promo, normal, strike };
    }
    
    return { promo: product.price, normal: product.price, strike: null };
  };

  const prices = getPrices();
  
  const hasSaleEndDate = !!product.sale_end_date;
  const isSaleActive = hasSaleEndDate && !saleEnded && (() => {
    const target = parseSaleDate(product.sale_end_date);
    return target ? target > Date.now() : false;
  })();

  // 3-Tier Pricing Logic:
  // 1. Current Price: Toggles between Promo (if sale active) and Normal (after sale)
  const currentPrice = isSaleActive ? prices.promo : prices.normal;

  // 2. Strikethrough Price: Always shows the Strike price (Market reference)
  const strikethroughPrice = prices.strike;

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isReadOnly) return;

    if (product.link) {
      window.open(product.link, '_blank');
      return;
    }

    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: product.id,
      name: product.name,
      price: currentPrice,
      image: product.image,
      quantity: 1,
    });

    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isReadOnly) return;
    setIsLiked(!isLiked);
  };

  return (
    <div className="relative group pt-1 sm:pt-5">
      {/* Flash Sale Countdown - Floating Badge Design */}
      {product.sale_end_date && !saleEnded && (
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center -translate-y-0.5 sm:-translate-y-2 group-hover:-translate-y-3 transition-transform duration-500">
          <CountdownTimer 
            endDate={product.sale_end_date} 
            onEnd={() => setSaleEnded(true)}
            className="shadow-2xl scale-95 sm:scale-105"
          />
        </div>
      )}

      <Card className={cn(
        "bg-white border-slate-200 rounded-lg sm:rounded-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 shadow-xl shadow-slate-200/50 overflow-hidden",
        isReadOnly && "sm:rounded-2xl"
      )}>
        <div className="relative overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            name="Like Button"
            className={cn(
              "absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background h-6 w-6",
              isLiked && "opacity-100 text-destructive"
            )}
            onClick={handleToggleLike}
            disabled={isReadOnly}
          >
            <Heart
              name="Like Icon"
              className={cn("h-3 w-3", isLiked && "fill-current")}
            />
          </Button>

          <div className={cn("block relative", isReadOnly && "pointer-events-none")}>
            <div className={cn(
              "aspect-square overflow-hidden bg-slate-50/40 flex items-center justify-center p-1 sm:p-6 group-hover:bg-slate-50/80 transition-colors duration-500",
              isReadOnly && "sm:p-4"
            )}>
              {!imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-muted-foreground text-[8px]">
                    No Image
                  </div>
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {t('quick_view')}
                </Button>
              </div>
            )}
          </div>
        </div>

        <CardContent className={cn("p-1 sm:p-4 space-y-0.5 sm:space-y-3", isReadOnly && "sm:p-3 sm:space-y-2")}>
          <div className={cn(isReadOnly && "pointer-events-none")}>
            <div className="flex items-center justify-between mb-0.5">
              {product.category && (
                <span className="text-[6px] sm:text-[11px] font-black text-primary uppercase tracking-tighter block truncate">
                  {product.category.replace('HIDDEN:', '')}
                </span>
              )}
              {isReadOnly && product.category?.startsWith('HIDDEN:') && (
                <span className="text-[6px] sm:text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                  Hidden
                </span>
              )}
              {isSaleActive && (
                <span className="text-[6px] sm:text-[11px] font-black bg-red-100 text-red-600 px-0.5 py-0 rounded uppercase">
                  {t('sale')}
                </span>
              )}
            </div>
            <h2 className={cn(
              "font-black text-foreground text-[8px] sm:text-lg line-clamp-1 hover:text-primary transition-colors leading-none",
              isReadOnly && "sm:text-sm"
            )}>
              {product.name}
              {product.duration && !product.duration.includes(',') && (
                <span className="ml-0.5 text-[6px] sm:text-xs text-slate-400 font-medium">
                  ({product.duration.split('|')[0].trim()})
                </span>
              )}
            </h2>
            {product.duration && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {product.duration.split(',').slice(0, 2).map((opt, i) => (
                  <span key={i} className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded sm:rounded-md text-[8px] sm:text-[9px] font-bold border border-slate-200">
                    {opt.split('|')[0].trim()}
                  </span>
                ))}
              </div>
            )}

          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <span className={cn(
              "text-[10px] sm:text-xl font-black transition-colors",
              isSaleActive ? "text-red-600" : "text-foreground",
              isReadOnly && "sm:text-base"
            )}>
              {formatPrice(currentPrice)}
            </span>
            {strikethroughPrice && (
              <span className={cn(
                "text-[8px] sm:text-base text-slate-400 line-through font-medium ml-1",
                isReadOnly && "sm:text-xs"
              )}>
                {formatPrice(strikethroughPrice)}
              </span>
            )}
          </div>

          <Button
            className={cn(
              "w-full h-6 sm:h-12 p-0 sm:p-4 transition-all duration-300 font-black text-[7px] sm:text-base",
              justAdded
                ? "bg-green-600 text-white hover:bg-green-600"
                : isSaleActive 
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90",
              isReadOnly && "sm:h-9 sm:text-xs"
            )}
            onClick={handleAction}
            disabled={isAdding || isReadOnly}
          >
            {isAdding ? (
              <div className="w-2 h-2 sm:w-5 sm:h-5 border border-current border-t-transparent rounded-full animate-spin" />
            ) : justAdded ? (
              <Check className="h-2 w-2 sm:h-5 sm:w-5" />
            ) : (
              <div className="flex items-center justify-center gap-0.5 w-full">
                <ShoppingCart className="h-2 w-2 sm:h-5 sm:w-5" />
                <span>
                  {product.link ? 'Buy' : 'Add'}
                </span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
