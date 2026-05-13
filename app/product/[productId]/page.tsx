"use client";

import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

import Features from "@/components/product/Features";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import ProductNotFound from "@/components/product/ProductNotFound";
import RelatedProducts from "@/components/product/RelatedProducts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { cn } from "@/lib/utils";
import {
  Check,
  Heart,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
  Package,
  Zap,
  MonitorPlay,
  ShieldCheck,
} from "lucide-react";
import CountdownTimer from "@/components/product/CountdownTimer";
import { parseSaleDate } from "@/lib/dateUtils";

export default function Product() {
  const { addToCart } = useCart();
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<any>(null);
  const [showCopied, setShowCopied] = useState(false);
  const [saleEnded, setSaleEnded] = useState(false);
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();

  // Reset sale status when date changes
  useEffect(() => {
    setSaleEnded(false);
  }, [product?.sale_end_date]);

  const handleShare = async () => {
    const shareData = {
      title: product?.name || "Check this out!",
      text: product?.description || "",
      url: typeof window !== "undefined" ? window.location.href : "",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        console.error("Error copying to clipboard:", err);
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch('/api/products');
        const allProducts = await res.json();
        const idInt = parseInt(productId as string);
        const found = allProducts.find((p: any) => 
          (p.id === idInt || p.name.toLowerCase().replace(/\s+/g, '-') === (productId as string).toLowerCase()) &&
          !p.category?.startsWith('HIDDEN:')
        );
        setProduct(found);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Memoize durationOptions to prevent infinite re-renders or resets
  const durationOptions = useMemo(() => {
    if (!product?.duration?.includes('|')) return null;
    return product.duration.split(',').map((opt: string) => {
      const parts = opt.split('|').map(s => s.trim());
      const label = parts[0];
      
      if (parts.length >= 4) {
        const promo = parseFloat(parts[1]) || 0;
        const normal = parseFloat(parts[2]) || promo;
        const strike = parseFloat(parts[3]) || null;
        return { label, promo, normal, strike };
      } else {
        const promo = parseFloat(parts[1]) || 0;
        const strike = parseFloat(parts[2]) || null;
        const normal = strike || promo;
        return { label, promo, normal, strike };
      }
    });
  }, [product?.duration]);

  useEffect(() => {
    if (!selectedDuration) {
      if (durationOptions && durationOptions.length > 0) {
        setSelectedDuration(durationOptions[0]);
      } else if (product?.duration) {
        // Fallback for non-multi-price strings (though unlikely now)
        setSelectedDuration({ label: product.duration, promo: product.price, normal: product.price, strike: null });
      }
    }
  }, [product, durationOptions, selectedDuration]);

  const hasSaleEndDate = !!product?.sale_end_date;
  const isSaleActive = hasSaleEndDate && !saleEnded && (() => {
    const target = parseSaleDate(product.sale_end_date);
    return target ? target > Date.now() : false;
  })();

  const currentPrices = selectedDuration || { promo: product?.price || 0, normal: product?.price || 0, strike: null };
  
  const finalPrice = isSaleActive ? currentPrices.promo : currentPrices.normal;
  const finalOldPrice = currentPrices.strike;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const handleAddToCart = async () => {
    setIsAdding(true);
    await new Promise((resolve) => setTimeout(resolve, 300));

    addToCart({
      id: product.id,
      name: `${product.name} (${selectedDuration?.label || product.duration || 'Standard'})`,
      price: finalPrice,
      image: product.image,
      quantity: quantity,
    });

    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => router.push("/cart"), 500);
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductBreadcrumb />

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Left Column: Image Gallery Style */}
        <div className="space-y-6">
          <div className="relative group">
            <div className="relative aspect-square sm:h-[450px] w-full rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-2xl flex items-center justify-center p-12 sm:p-20 transition-all duration-700 hover:shadow-primary/10">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-contain p-12 sm:p-20 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
            </div>
            
            {/* Trust Badges on Image */}
            <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto no-scrollbar">
              {['4K QUALITY', 'INSTANT ACTIVATION', '24/7 SUPPORT'].map((tag) => (
                <div key={tag} className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black tracking-widest text-slate-900 shadow-xl whitespace-nowrap border border-white/20">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 tracking-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              (4.8) • 127 reviews
            </span>
          </div>

          {product.sale_end_date && !saleEnded && (
            <div className="w-full py-4">
              <CountdownTimer 
                endDate={product.sale_end_date} 
                onEnd={() => setSaleEnded(true)}
                className="shadow-2xl"
              />
            </div>
          )}

          <div className="flex items-baseline gap-4 flex-wrap">
            <span className={cn(
              "text-5xl font-black transition-all tracking-tighter",
              isSaleActive ? "text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.2)]" : "text-slate-900"
            )}>
              {formatPrice(finalPrice)}
            </span>
            {finalOldPrice && (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-slate-300 line-through decoration-slate-300/50">
                  {formatPrice(finalOldPrice)}
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-black rounded-full shadow-lg shadow-red-500/20">
                  -{Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100)}%
                </span>
              </div>
            )}
          </div>



          <Separator />

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-bold text-foreground mb-1 block uppercase tracking-wider opacity-70">
                {durationOptions ? t('select_duration') : (product.duration ? t('subscription_duration') : t('quantity'))}
              </label>
              
              {durationOptions ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {durationOptions.map((opt: any, idx: number) => {
                    const isLifetime = opt.label.toLowerCase().includes('lifetime');
                    const isSelected = selectedDuration?.label === opt.label;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDuration(opt)}
                        className={cn(
                          "relative group px-5 py-5 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center justify-between overflow-hidden",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-xl shadow-primary/10 translate-y-[-2px]"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-4 z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                            isSelected ? "bg-primary text-white rotate-6" : "bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            {isLifetime ? (
                              <Zap className="w-6 h-6 fill-current" />
                            ) : (
                              <MonitorPlay className="w-6 h-6" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className={cn(
                              "font-black text-base tracking-tight leading-none mb-1",
                              isSelected ? "text-slate-900" : "text-slate-600"
                            )}>
                              {opt.label}
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                              {t('full_access')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right z-10">
                          <div className={cn(
                            "text-xl font-black tracking-tighter",
                            isSelected ? "text-primary" : "text-slate-900"
                          )}>
                            {formatPrice(isSaleActive ? opt.promo : opt.normal)}
                          </div>
                          {opt.strike && (
                            <div className="text-xs text-slate-300 line-through font-bold">{formatPrice(opt.strike)}</div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-primary/10 rounded-full blur-2xl animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {product.duration ? (
                    <div className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl border border-blue-100 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {product.duration}
                    </div>
                  ) : (
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange("decrement")}
                        disabled={quantity <= 1}
                        className="h-10 w-10 rounded-r-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleQuantityChange("increment")}
                        className="h-10 w-10 rounded-l-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-14 text-lg font-bold transition-all duration-300 rounded-xl shadow-lg",
                  justAdded
                    ? "bg-green-600 text-white hover:bg-green-700 shadow-green-500/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                )}
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {language === 'en' ? 'Adding...' : 'Ajout...'}
                  </div>
                ) : justAdded ? (
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    {language === 'en' ? 'Added to Cart!' : 'Ajouté au panier !'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    {t('add_to_cart')}
                  </div>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                className="flex-1 h-14 text-lg font-bold rounded-xl border-2"
              >
                {t('buy_now')}
              </Button>
            </div>

            <Button
              size="lg"
              className="w-full h-14 bg-[#25D366] text-white hover:bg-[#128C7E] flex items-center justify-center gap-2 font-black text-lg rounded-xl shadow-xl shadow-green-500/20 mt-2"
              onClick={() => {
                const WHATSAPP_NUMBER = "212670965351";
                const typeLabel = language === 'en' ? 'Type' : "Type d'abonnement";
                const qtyLabel = language === 'en' ? 'Quantity' : "Quantité";
                const durationText = selectedDuration ? `${typeLabel}: ${selectedDuration.label}` : (product.duration ? `${typeLabel}: ${product.duration}` : `${qtyLabel}: ${quantity}`);
                const greeting = language === 'en' ? 'Hello, I would like to order:' : "Bonjour, je souhaite commander le produit :";
                const totalLabel = language === 'en' ? 'Total Price' : "Prix total :";
                const message = `${greeting} ${product.name}\n${durationText}\n${totalLabel} ${formatPrice(finalPrice * quantity)}`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
              }}
            >
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('order_whatsapp')}
            </Button>

            <div className="flex items-center gap-4 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "text-muted-foreground hover:text-foreground",
                  isLiked && "text-destructive"
                )}
              >
                <Heart
                  className={cn("h-4 w-4 mr-2", isLiked && "fill-current")}
                />
                {language === 'en' ? 'Add to Wishlist' : 'Ajouter à la liste'}
              </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className={cn(
                "text-muted-foreground hover:text-foreground transition-colors",
                showCopied && "text-green-600"
              )}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {showCopied ? "Link Copied!" : "Share"}
            </Button>
          </div>

          {/* Safe Payment Methods */}
          <div className="pt-6 mt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider text-center">
              {language === 'en' ? 'Guaranteed Safe Checkout' : 'Paiement Sécurisé Garanti'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 opacity-80">
              {['BINANCE', 'CASHPLUS', 'WAFACASH', 'REMITLY', 'MONEYGRAM', 'CIH BANK', 'BARID CASH', 'DAMAN CASH', 'WESTERN UNION', 'RIA MONEYTRANS', 'SENDWAVE'].map((method) => (
                <div key={method} className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded text-[9px] font-bold tracking-wider">
                  {method}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* New Detailed Description Section */}
      <div className="grid lg:grid-cols-3 gap-12 mb-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              {t('product_desc_title')}
            </h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {product.description || t('no_desc')}
              </p>
            </div>
          </div>


        </div>

        <div className="space-y-6">
          <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              {t('our_guarantee')}
            </h3>
            <ul className="space-y-4">
              {[
                t('guarantee_1'),
                t('guarantee_2'),
                t('guarantee_3'),
                t('guarantee_4'),
                t('guarantee_5')
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 mb-4">{t('need_help')}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              {t('need_help_desc')}
            </p>
            <Button 
              className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold"
              onClick={() => window.open('https://wa.me/212670965351', '_blank')}
            >
              {t('contact_support')}
            </Button>
          </div>
        </div>
      </div>

      <Features />


    </div>
  );
}
