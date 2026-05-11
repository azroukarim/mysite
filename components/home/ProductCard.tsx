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

export default function ProductCard({ product }: { product: Product }) {
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

  // Parse the first duration to get an old price if it exists
  const getOldPrice = () => {
    if (!product.duration) return null;
    const firstOption = product.duration.split(',')[0];
    const parts = firstOption.split('|');
    return parts[2] ? parseFloat(parts[2].trim()) : null;
  };

  const oldPrice = getOldPrice();
  
  const hasSaleEndDate = !!product.sale_end_date;
  const isSaleActive = hasSaleEndDate && !saleEnded && (() => {
    const target = parseSaleDate(product.sale_end_date);
    return target ? target > Date.now() : false;
  })();

  // Pricing logic based on sale status
  // 1. If it's a flash sale and it's active: show discounted price (product.price) and strike through oldPrice
  // 2. If it's a flash sale and it's EXPIRED: revert to original price (oldPrice)
  // 3. If it's NOT a flash sale: show product.price as current and strike through oldPrice if it exists
  const currentPrice = hasSaleEndDate 
    ? (isSaleActive ? product.price : (oldPrice || product.price))
    : product.price;

  const strikethroughPrice = hasSaleEndDate
    ? (isSaleActive ? oldPrice : null)
    : oldPrice;

  const handleAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
    setIsLiked(!isLiked);
  };

  return (
    <Card className="group overflow-hidden bg-card border-slate-100 rounded-xl sm:rounded-3xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        {/* Flash Sale Countdown */}
        {product.sale_end_date && !saleEnded && (
          <div className="absolute top-1 left-1 sm:top-3 sm:left-3 z-10">
            <CountdownTimer 
              endDate={product.sale_end_date} 
              onEnd={() => setSaleEnded(true)}
              className="scale-[0.8] sm:scale-100 origin-top-left"
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          name="Like Button"
          className={cn(
            "absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/80 backdrop-blur-sm hover:bg-background",
            isLiked && "opacity-100 text-destructive"
          )}
          onClick={handleToggleLike}
        >
          <Heart
            name="Like Icon"
            className={cn("h-4 w-4", isLiked && "fill-current")}
          />
        </Button>

        <Link href={`/product/${product.id}`} className="block relative">
          <div className="aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-3 sm:p-6">
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
                <div className="text-muted-foreground text-sm">
                  Image not available
                </div>
              </div>
            )}
          </div>

          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('quick_view')}
            </Button>
          </div>
        </Link>
      </div>

      <CardContent className="p-1 sm:p-4 space-y-1 sm:space-y-3">
        <Link href={`/product/${product.id}`}>
          <div className="flex items-center justify-between mb-1">
            {product.category && (
              <span className="text-[7px] sm:text-[10px] font-bold text-primary uppercase tracking-tight sm:tracking-widest block truncate">
                {product.category.replace('HIDDEN:', '')}
              </span>
            )}
            {isSaleActive && (
              <span className="text-[8px] sm:text-[9px] font-black bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase animate-bounce">
                {t('sale')}
              </span>
            )}
          </div>
          <h2 className="font-bold text-foreground text-[10px] sm:text-base line-clamp-1 hover:text-primary transition-colors">
            {product.name}
            {product.duration && !product.duration.includes(',') && (
              <span className="ml-1 text-[8px] sm:text-[10px] text-slate-400 font-medium">
                ({product.duration.split('|')[0].trim()})
              </span>
            )}
          </h2>
          {product.duration && (
            <div className="flex flex-wrap gap-0.5 sm:gap-1.5 mt-0.5 sm:mt-1.5">
              {product.duration.split(',').slice(0, 2).map((opt, i) => (
                <span key={i} className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded sm:rounded-md text-[8px] sm:text-[9px] font-bold border border-slate-200">
                  {opt.split('|')[0].trim()}
                </span>
              ))}
            </div>
          )}
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <span className={cn(
            "text-[12px] sm:text-lg font-bold transition-colors",
            isSaleActive ? "text-red-600" : "text-foreground"
          )}>
            {formatPrice(currentPrice)}
          </span>
          {strikethroughPrice && (
            <span className="text-[9px] sm:text-sm text-slate-400 line-through">
              {formatPrice(strikethroughPrice)}
            </span>
          )}
        </div>

        <Button
          className={cn(
            "w-full h-7 sm:h-10 p-1 sm:p-4 transition-all duration-300",
            justAdded
              ? "bg-green-600 text-white hover:bg-green-600"
              : isSaleActive 
                ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={handleAction}
          disabled={isAdding}
        >
          {isAdding ? (
            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : justAdded ? (
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">
                {product.link ? t('order_now') : t('add_to_cart')}
              </span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
