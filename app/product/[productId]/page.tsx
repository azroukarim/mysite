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
import { paymentMethods } from "@/lib/payment-methods";

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
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { formatPrice, hidePrices } = useCurrency();

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
        const res = await fetch(`/api/products?t=${Date.now()}`);
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
    const end = parseSaleDate(product.sale_end_date);
    const start = product.sale_start_date ? parseSaleDate(product.sale_start_date) : 0;
    const now = Date.now();
    return end ? (now >= (start || 0) && now < end) : false;
  })();

  const currentPrices = selectedDuration || { promo: product?.price || 0, normal: product?.price || 0, strike: null };
  
  const finalPrice = isSaleActive ? currentPrices.promo : currentPrices.normal;
  const finalOldPrice = isSaleActive ? currentPrices.normal : currentPrices.strike;

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

      <div className="flex flex-col gap-8 mb-16 items-start">
        {/* Top Section: Image Frame with Vertical Payment Logos */}
        <div className="w-full flex flex-row items-center gap-4 lg:gap-8 justify-start">
          <div className="relative group w-full max-w-sm lg:mx-0">
            <div className="relative aspect-square h-[320px] sm:h-[280px] w-full rounded-[1.5rem] overflow-hidden bg-white border border-slate-100 shadow-lg flex items-center justify-center p-4 sm:p-20 transition-all duration-700 hover:shadow-primary/10">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 sm:p-20 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent pointer-events-none" />
            </div>
            
            {/* Downloader Code Copy Button */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4 z-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  // Extract code from description if it exists (Very robust regex)
                  const codeMatch = product.description?.match(/(?:downloader\s+)?code\s*[:\s]\s*(\d+)/i);
                  const code = codeMatch ? codeMatch[1] : "295325"; 
                  
                  navigator.clipboard.writeText(code);
                  const btn = document.getElementById('copy-code-btn');
                  if (btn) {
                    const originalContent = btn.innerHTML;
                    btn.innerHTML = language === 'en' ? 'Copied!' : 'Copié !';
                    btn.classList.add('bg-green-600', 'text-white');
                    setTimeout(() => {
                      btn.innerHTML = originalContent;
                      btn.classList.remove('bg-green-600', 'text-white');
                    }, 2000);
                  }
                }}
                id="copy-code-btn"
                className="group/btn px-4 py-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ring-1 ring-black/5"
              >
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Downloader Code</span>
                  <span className="text-sm font-black text-slate-900">
                    {(() => {
                      const codeMatch = product.description?.match(/(?:downloader\s+)?code\s*[:\s]\s*(\d+)/i);
                      return codeMatch ? codeMatch[1] : "295325";
                    })()}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                </div>
              </button>
            </div>
          </div>

          <div className="hidden sm:flex flex-col gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-primary pl-3 py-1">
              {t('payment_methods_title')}
            </p>
            <div className="grid grid-cols-3 gap-4 lg:gap-6">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.name;
                return (
                  <button 
                    key={method.name} 
                    onClick={() => setSelectedPayment(method.name)}
                    className={cn(
                      "relative h-12 w-20 lg:h-16 lg:w-28 bg-white rounded-2xl border transition-all duration-500 overflow-hidden flex items-center justify-center p-1 group hover:shadow-2xl hover:scale-110",
                      isSelected 
                        ? "border-primary ring-4 ring-primary/20 shadow-xl scale-110 z-10" 
                        : "border-slate-200 shadow-lg",
                      (method.name === 'Remitly' || method.name === 'Sendwave') && !isSelected ? 'ring-2 ring-primary/20 scale-105' : ''
                    )}
                  >
                    <img 
                      src={method.image} 
                      alt={method.name} 
                      className={cn(
                        "max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-110",
                        (method.name === 'Remitly' || method.name === 'Sendwave') ? 'scale-125' : ''
                      )}
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-primary text-white rounded-full p-0.5 shadow-sm">
                        <Check size={8} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Details */}
        <div className="space-y-4 w-full max-w-sm">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-1 tracking-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground font-bold">
              (4.8) • 127 reviews
            </span>
          </div>

          {product.sale_end_date && !saleEnded && (
            <div className="w-full space-y-3 py-2">
              <div className="flex flex-col gap-1">
                <div className={cn(
                  "flex items-center gap-2 text-xs font-black uppercase w-fit px-3 py-1 rounded-lg border",
                  isSaleActive 
                    ? "text-amber-600 bg-amber-50 border-amber-100" 
                    : "text-blue-600 bg-blue-50 border-blue-100"
                )}>
                  <Zap size={14} className="fill-current" /> 
                  {isSaleActive ? "Promo Active" : "Upcoming Promo"}
                </div>
                <div className="text-[11px] font-bold text-slate-500 flex items-center gap-4 ml-1">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">{isSaleActive ? "Ends at:" : "Starts at:"}</span>
                    <span className={isSaleActive ? "text-red-500" : "text-blue-500"}>
                      {new Date(isSaleActive ? product.sale_end_date : (product.sale_start_date || product.sale_end_date)).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
              <CountdownTimer 
                endDate={product.sale_end_date} 
                startDate={product.sale_start_date}
                onEnd={() => setSaleEnded(true)}
                className="shadow-2xl !mx-0"
              />
            </div>
          )}

          <div className="flex items-baseline gap-3 flex-wrap w-full">
            {hidePrices ? (
              <a
                href={`https://wa.me/212670965351?text=${encodeURIComponent(
                  language === 'fr' 
                    ? `Bonjour, je souhaite connaître le prix du produit: ${product.name}` 
                    : `Hello, I want to know the price of the product: ${product.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-green-500/20 active:scale-95 border border-green-400"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.114-2.906-6.99C16.555 1.875 14.077.844 11.44 1.841c-5.438 0-9.863 4.42-9.867 9.864-.001 1.73.457 3.419 1.32 4.933l-.994 3.635 3.723-.976zM17.487 14.4c-.27-.136-1.6-.79-1.848-.879-.249-.09-.43-.136-.61.136-.18.27-.697.879-.855 1.059-.158.18-.315.203-.585.068-1.228-.614-2.03-1.086-2.769-2.353-.195-.348-.195-.568-.02-.75.158-.163.315-.36.473-.54.158-.18.21-.315.315-.525.105-.21.053-.393-.027-.53-.079-.136-.61-1.472-.835-2.015-.22-.527-.459-.446-.61-.454-.15-.007-.33-.009-.51-.009-.18 0-.473.068-.72.338-.248.27-.946.923-.946 2.25 0 1.328.968 2.61 1.103 2.79.135.18 1.902 2.904 4.609 4.072.645.278 1.148.445 1.54.569.65.207 1.241.178 1.708.108.52-.078 1.6-.653 1.826-1.28.225-.628.225-1.168.158-1.28-.068-.113-.248-.18-.518-.316z"/>
                </svg>
                <span>{language === 'fr' ? 'Demander le prix sur WhatsApp' : 'Ask Price on WhatsApp'}</span>
              </a>
            ) : (
              <>
                <span className={cn(
                  "text-3xl font-black transition-all tracking-tighter",
                  isSaleActive && !hidePrices ? "text-red-600" : "text-slate-900",
                  hidePrices && "text-xl font-black text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl uppercase tracking-tight"
                )}>
                  {formatPrice(finalPrice)}
                </span>
                {finalOldPrice && !hidePrices && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-x-strike">
                      {formatPrice(finalOldPrice)}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] font-black rounded-full shadow-xl">
                      -{Math.round(((finalOldPrice - finalPrice) / finalOldPrice) * 100)}%
                    </span>
                  </div>
                )}
              </>
            )}
          </div>



          <Separator />

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-foreground mb-0.5 block uppercase tracking-wider opacity-60">
                {durationOptions ? t('select_duration') : (product.duration ? t('subscription_duration') : t('quantity'))}
              </label>
              
              {durationOptions ? (
                <div className="flex flex-col gap-2 items-start w-full">
                  {durationOptions.map((opt: any, idx: number) => {
                    const isLifetime = opt.label.toLowerCase().includes('lifetime');
                    const isSelected = selectedDuration?.label === opt.label;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDuration(opt)}
                        className={cn(
                          "relative group px-4 py-2 rounded-xl border-2 transition-all duration-300 flex items-center justify-between overflow-hidden w-full",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 translate-y-[-1px]"
                            : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3 z-10">
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500",
                            isSelected ? "bg-primary text-white rotate-3" : "bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary"
                          )}>
                            {isLifetime ? (
                              <Zap className="w-4 h-4 fill-current" />
                            ) : (
                              <MonitorPlay className="w-4 h-4" />
                            )}
                          </div>
                          <div className="text-left">
                            <div className={cn(
                              "font-black text-sm tracking-tight leading-none mb-0.5",
                              isSelected ? "text-slate-900" : "text-slate-600"
                            )}>
                              {opt.label}
                            </div>
                            <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                              {t('full_access')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right z-10">
                          <div className={cn(
                            "text-lg font-black tracking-tighter",
                            isSelected ? "text-primary" : "text-slate-900"
                          )}>
                            {formatPrice(isSaleActive ? opt.promo : opt.normal)}
                          </div>
                          {opt.strike && !hidePrices && (
                            <div className="text-[11px] animate-x-strike ml-1">{formatPrice(opt.strike)}</div>
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



            <Button
              size="lg"
              className={cn(
                "w-full h-12 text-white flex items-center justify-center gap-3 font-black text-[13px] rounded-xl shadow-lg mt-2 transition-all active:scale-95",
                selectedPayment 
                  ? "bg-[#25D366] hover:bg-[#128C7E] shadow-green-500/20 hover:scale-[1.02]" 
                  : "bg-slate-400 cursor-not-allowed grayscale"
              )}
              onClick={() => {
                if (!selectedPayment) {
                  alert(language === 'en' ? 'Please select a payment method first!' : 'يرجى اختيار وسيلة دفع أولاً!');
                  return;
                }
                const WHATSAPP_NUMBER = "212670965351";
                const typeLabel = language === 'en' ? 'Type' : "Type d'abonnement";
                const qtyLabel = language === 'en' ? 'Quantity' : "Quantité";
                const paymentLabel = language === 'en' ? 'Payment Method' : "Moyen de paiement";
                const durationText = selectedDuration ? `${typeLabel}: ${selectedDuration.label}` : (product.duration ? `${typeLabel}: ${product.duration}` : `${qtyLabel}: ${quantity}`);
                const greeting = language === 'en' ? 'Hello, I would like to order:' : "Bonjour, je souhaite commander le produit :";
                const totalLabel = language === 'en' ? 'Total Price' : "Prix total :";
                const message = `${greeting} ${product.name}\n${durationText}\n${paymentLabel}: ${selectedPayment}\n${totalLabel} ${formatPrice(finalPrice * quantity)}`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
              }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
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

          <div className="pt-6 mt-6 border-t border-slate-100 sm:hidden">
            <p className="text-[11px] font-black text-slate-900 mb-4 uppercase tracking-widest text-center">
              {t('payment_methods_title')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 opacity-100">
              {paymentMethods.map((method) => {
                const isSelected = selectedPayment === method.name;
                return (
                  <button 
                    key={method.name} 
                    onClick={() => setSelectedPayment(method.name)}
                    className={cn(
                      "relative h-10 w-16 bg-white rounded-xl border transition-all duration-300 overflow-hidden flex items-center justify-center p-0.5 group hover:shadow-lg hover:scale-105",
                      isSelected 
                        ? "border-primary ring-2 ring-primary/20 shadow-md scale-105 z-10" 
                        : "border-slate-200 shadow-md",
                      (method.name === 'Remitly' || method.name === 'Sendwave') && !isSelected ? 'ring-2 ring-primary/10 scale-105' : ''
                    )}
                  >
                    <img 
                      src={method.image} 
                      alt={method.name} 
                      className={cn(
                        "max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-110",
                        (method.name === 'Remitly' || method.name === 'Sendwave') ? 'scale-125' : ''
                      )}
                    />
                  </button>
                );
              })}
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
