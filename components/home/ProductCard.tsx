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
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  image: string;
  name: string;
  price: number;
  category?: string;
  link?: string;
  duration?: string;
  sale_start_date?: string | null;
  sale_end_date?: string | null;
}

export default function ProductCard({ 
  product, 
  isReadOnly = false,
  onQuickView 
}: { 
  product: Product, 
  isReadOnly?: boolean,
  onQuickView?: (product: Product) => void
}) {
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
  const { formatPrice, hidePrices } = useCurrency();
  const { t, language } = useLanguage();
  const router = useRouter();

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
    const end = parseSaleDate(product.sale_end_date);
    const start = product.sale_start_date ? parseSaleDate(product.sale_start_date) : 0;
    const now = Date.now();
    return end ? (now >= (start || 0) && now < end) : false;
  })();

  // 3-Tier Pricing Logic:
  // 1. Current Price: Toggles between Promo (if sale active) and Normal (after sale)
  const currentPrice = isSaleActive ? prices.promo : prices.normal;

  // 2. Strikethrough Price: Shows Normal Price during sale, or Strike Price (Market reference) normally
  const strikethroughPrice = isSaleActive ? prices.normal : prices.strike;

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

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="relative group pt-1 sm:pt-5 h-full">
      {/* Flash Sale Countdown - Floating Badge Design */}
      {product.sale_end_date && !saleEnded && (
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center -translate-y-0.5 sm:-translate-y-2 group-hover:-translate-y-3 transition-transform duration-500">
          <CountdownTimer 
            endDate={product.sale_end_date} 
            startDate={product.sale_start_date}
            onEnd={() => setSaleEnded(true)}
            className="shadow-2xl scale-[0.95] sm:scale-100"
            compact
          />
        </div>
      )}

      <Card className={cn(
        "bg-white border-slate-200 rounded-lg sm:rounded-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-500 hover:-translate-y-1 shadow-xl shadow-slate-200/50 overflow-hidden h-full flex flex-col",
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

          <Link href={`/product/${product.id}`} className={cn("block relative", isReadOnly && "pointer-events-none")}>
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

          </Link>
          

        </div>

        <CardContent className={cn("p-2 sm:p-4 space-y-1 sm:space-y-3 flex-1 flex flex-col justify-between", isReadOnly && "sm:p-3 sm:space-y-2")}>
          <div className={cn(isReadOnly && "pointer-events-none")}>
            <div className="flex flex-col gap-0.5 mb-1.5">
              <div className="flex items-center justify-between">

                {isReadOnly && product.category?.startsWith('HIDDEN:') && (
                  <span className="text-[8px] sm:text-[10px] font-black bg-slate-900 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    Hidden
                  </span>
                )}
                {isSaleActive && (
                  <span className="text-[9px] sm:text-[11px] font-black bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase">
                    {t('sale')}
                  </span>
                )}
              </div>
              
              {isSaleActive && (
                <div className="text-[8px] sm:text-[9px] font-bold text-slate-500 space-y-0">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-600 uppercase text-[7px] sm:text-[8px]">Promo expire at:</span>
                    <span>{new Date(product.sale_end_date!).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 w-full mt-1">
              <h2 className={cn(
                "font-black text-foreground text-[13px] sm:text-base line-clamp-1 hover:text-primary transition-colors leading-none text-left",
                isReadOnly && "sm:text-sm"
              )} dir="ltr">
                {product.name.trim()}
              </h2>
              {product.category && (
                <span className="text-[9px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider shrink-0" dir="ltr">
                  ({product.category.replace('HIDDEN:', '').trim()})
                </span>
              )}
            </div>
            {product.duration && (
              <div className="flex flex-wrap gap-0.5 mt-0.5">
                {product.duration.split(',').slice(0, 2).map((opt, i) => (
                  <span key={i} className="px-1 py-0.5 bg-slate-100 text-slate-500 rounded sm:rounded-md text-[9px] sm:text-[9px] font-bold border border-slate-200">
                    {opt.split('|')[0].trim()}
                  </span>
                ))}
              </div>
            )}

          </div>

          <div className="flex items-center gap-1 sm:gap-3 my-1 w-full">
            {hidePrices ? (
              <a
                href={`https://wa.me/212670965351?text=${encodeURIComponent(
                  language === 'fr' 
                    ? `Bonjour, je souhaite connaître le prix du produit: ${product.name}` 
                    : `Hello, I want to know the price of the product: ${product.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight transition-all duration-300 shadow-md hover:shadow-green-500/20 active:scale-95 border border-green-400"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.906-6.99C16.555 1.875 14.077.844 11.44 1.841c-5.438 0-9.863 4.42-9.867 9.864-.001 1.73.457 3.419 1.32 4.933l-.994 3.635 3.723-.976zM17.487 14.4c-.27-.136-1.6-.79-1.848-.879-.249-.09-.43-.136-.61.136-.18.27-.697.879-.855 1.059-.158.18-.315.203-.585.068-1.228-.614-2.03-1.086-2.769-2.353-.195-.348-.195-.568-.02-.75.158-.163.315-.36.473-.54.158-.18.21-.315.315-.525.105-.21.053-.393-.027-.53-.079-.136-.61-1.472-.835-2.015-.22-.527-.459-.446-.61-.454-.15-.007-.33-.009-.51-.009-.18 0-.473.068-.72.338-.248.27-.946.923-.946 2.25 0 1.328.968 2.61 1.103 2.79.135.18 1.902 2.904 4.609 4.072.645.278 1.148.445 1.54.569.65.207 1.241.178 1.708.108.52-.078 1.6-.653 1.826-1.28.225-.628.225-1.168.158-1.28-.068-.113-.248-.18-.518-.316z"/>
                </svg>
                <span>{language === 'fr' ? 'Demander le prix' : 'Ask Price'}</span>
              </a>
            ) : (
              <>
                <span className={cn(
                  "text-[14px] sm:text-xl font-black transition-colors",
                  isSaleActive && !hidePrices ? "text-red-600" : "text-foreground",
                  isReadOnly && "sm:text-base",
                  hidePrices && "text-[12px] sm:text-sm font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-tight"
                )}>
                  {formatPrice(currentPrice)}
                </span>
                {strikethroughPrice && !hidePrices && (
                  <span className={cn(
                    "text-[11px] sm:text-lg ml-1 animate-x-strike",
                    isReadOnly && "sm:text-sm"
                  )}>
                    {formatPrice(strikethroughPrice)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex gap-1 sm:gap-1.5 pt-0.5">
            <Button
              variant="outline"
              className={cn(
                "flex-1 h-6 sm:h-8 px-0 transition-all duration-300 font-black text-[8px] sm:text-[10px] border-slate-200 hover:bg-slate-50 hover:border-primary/30 text-slate-600 rounded-lg",
                isReadOnly && "sm:h-7 sm:text-[9px]"
              )}
              onClick={handleQuickViewClick}
              disabled={isReadOnly}
            >
              <Eye className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5" />
              <span>{t('buy_now')}</span>
            </Button>

            <Button
              className={cn(
                "flex-1 h-6 sm:h-8 px-0 transition-all duration-300 font-black text-[8px] sm:text-[10px] rounded-lg",
                justAdded
                  ? "bg-green-600 text-white hover:bg-green-600"
                  : isSaleActive 
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
                isReadOnly && "sm:h-7 sm:text-[9px]"
              )}
              onClick={handleAction}
              disabled={isAdding || isReadOnly}
            >
              {isAdding ? (
                <div className="w-2 h-2 sm:w-3 sm:h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : justAdded ? (
                <Check className="h-2 w-2 sm:h-3 sm:w-3" />
              ) : (
                <div className="flex items-center justify-center gap-0.5 w-full">
                  <ShoppingCart className="h-2 w-2 sm:h-3 sm:w-3" />
                  <span>
                    {language === 'fr' ? 'Ajouter' : 'Add'}
                  </span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
