"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle, Star, Tv, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SplashAd from "@/components/home/SplashAd";

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-950 text-white relative overflow-hidden flex flex-col pt-12 lg:pt-20 items-center">
      <SplashAd />
      
      {/* Abstract Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col">
        
        {/* Top Text Section (Exactly under the header) */}
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 animate-fade-in">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-medium tracking-wide text-slate-200">
              Premium Streaming Experience
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 font-[family-name:var(--font-montserrat)] uppercase">
            <span className="text-white drop-shadow-sm">Stream</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary animate-pulse ml-2 block sm:inline">
              TV Store
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
            {t('hero_desc') || "Discover a wide selection of premium Streaming packages and entertainment apps with 4K quality, 24/7 support, and instant activation. Shop now!"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link 
              href="/store" 
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(var(--primary),0.4)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Tv className="w-5 h-5" />
                Enter the Store
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Link>
            
            <a 
              href="#features" 
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white rounded-full font-semibold text-lg border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-md"
            >
              <PlayCircle className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              Learn More
            </a>
          </div>
        </div>

        {/* Small Hero Image on the Left */}
        <div className="flex w-full justify-start">
          <div className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md animate-[fade-in-up_1s_ease-out_0.5s_both]">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 bottom-0 h-1/4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-primary/20 blur-[60px] rounded-full z-0" />
            <img 
              src="/hero-tv.png" 
              alt="Premium Smart TV Streaming" 
              className="relative z-0 w-full h-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pb-12 text-left max-w-4xl w-full border-t border-white/10 pt-12">
          <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors">
            <Zap className="w-8 h-8 text-yellow-400 mb-2" />
            <h3 className="text-xl font-bold text-white">Instant Delivery</h3>
            <p className="text-slate-400 text-sm">Get access immediately after purchase directly to your email.</p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors">
            <Tv className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="text-xl font-bold text-white">4K & 8K Quality</h3>
            <p className="text-slate-400 text-sm">Enjoy your favorite shows in breathtaking ultra-high definition.</p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors">
            <Star className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="text-xl font-bold text-white">Premium Support</h3>
            <p className="text-slate-400 text-sm">Our dedicated team is here to help you 24/7 with any issues.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
