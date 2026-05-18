"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, Star, Tv, Zap } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SplashAd from "@/components/home/SplashAd";

export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const hero2Ref = useRef<HTMLDivElement>(null);
  const [hero2Visible, setHero2Visible] = useState(false);

  useEffect(() => {
    const observer1 = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroVisible(true);
          observer1.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (heroRef.current) observer1.observe(heroRef.current);

    const observer2 = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHero2Visible(true);
          observer2.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (hero2Ref.current) observer2.observe(hero2Ref.current);

    return () => {
      observer1.disconnect();
      observer2.disconnect();
    };
  }, []);
  
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6 animate-text-focus-in" style={{ animationDelay: '0.1s' }}>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-semibold tracking-wide animate-text-shine bg-gradient-to-r from-slate-300 via-white to-slate-300">
              Premium Streaming Experience
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 font-[family-name:var(--font-montserrat)] uppercase animate-text-focus-in" style={{ animationDelay: '0.3s' }}>
            <span className="animate-text-shine bg-gradient-to-r from-white via-slate-300 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">Stream</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-purple-500 animate-gradient-x ml-2 block sm:inline drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              TV Store
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed animate-text-focus-in" style={{ animationDelay: '0.5s' }}>
            {t('hero_desc') || "Discover a wide selection of premium Streaming packages and entertainment apps with 4K quality, 24/7 support, and instant activation. Shop now!"}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center animate-text-focus-in" style={{ animationDelay: '0.7s' }}>
            <Link 
              href="/store" 
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 animate-pulse-glow"
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

        {/* Hero Image 1 */}
        <div ref={heroRef} className="flex flex-row items-center w-full justify-between gap-4 md:gap-10 mt-12 overflow-x-hidden">
          {/* Image coming from right */}
          <div className={`relative w-[40%] sm:w-1/3 md:w-full max-w-[160px] sm:max-w-[200px] md:max-w-xs lg:max-w-md shrink-0 ${heroVisible ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-primary/20 blur-[60px] rounded-full z-0 pointer-events-none" />
            <img 
              src="/hero-tv.png" 
              alt="Premium Smart TV Streaming" 
              className="relative z-0 w-full h-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite]"
            />
          </div>
          
          {/* Text following the image */}
          <div className={`flex-1 ${heroVisible ? 'animate-slide-in-right' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
            <div className="relative group pl-2 md:pl-0">
              <p className="text-[11px] leading-snug sm:text-sm md:text-xl lg:text-2xl text-slate-300 md:leading-relaxed font-light drop-shadow-md">
                Avez-vous une <span className="font-semibold text-white">Smart TV</span>, et vous souhaitez suivre les derniers films et séries, ainsi que regarder en direct les matchs des plus grandes ligues mondiales et tous les événements sportifs majeurs ? 
              </p>
              <p className="text-sm sm:text-base md:text-3xl lg:text-4xl text-white font-bold mt-2 md:mt-6 animate-text-shine bg-gradient-to-r from-primary via-blue-300 to-primary inline-block drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                Nous avons la solution.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Image 2 */}
        <div ref={hero2Ref} className="flex flex-row-reverse items-center w-full justify-between gap-4 md:gap-10 mt-16 md:mt-24 overflow-x-hidden">
          {/* Image coming from left */}
          <div className={`relative w-[30%] sm:w-1/4 md:w-full max-w-[120px] sm:max-w-[150px] md:max-w-[240px] lg:max-w-[280px] shrink-0 ${hero2Visible ? 'animate-slide-in-left' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-blue-600/20 blur-[60px] rounded-full z-0 pointer-events-none" />
            <img 
              src="https://raw.githubusercontent.com/azroukarim/strzone/refs/heads/main/accueuill/hero2.jpg" 
              alt="BOX TV ANDROID" 
              className="relative z-0 w-full h-auto drop-shadow-2xl animate-[float_6s_ease-in-out_infinite_reverse] rounded-2xl"
            />
          </div>
          
          {/* Text following the image */}
          <div className={`flex-1 ${hero2Visible ? 'animate-slide-in-left' : 'opacity-0'} text-right`} style={{ animationDelay: '0.4s' }}>
            <div className="relative group pr-2 md:pr-0">
              <p className="text-[11px] leading-snug sm:text-sm md:text-xl lg:text-2xl text-slate-300 md:leading-relaxed font-light drop-shadow-md">
                Avez-vous une <span className="font-semibold text-white">BOX TV ANDROID</span>, et vous souhaitez transformer votre téléviseur classique en une station de divertissement ultime avec toutes vos applications préférées ?
              </p>
              <p className="text-sm sm:text-base md:text-3xl lg:text-4xl text-white font-bold mt-2 md:mt-6 animate-text-shine bg-gradient-to-r from-blue-400 via-primary to-blue-400 inline-block drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                C'est possible.
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 pb-12 text-left max-w-4xl w-full border-t border-white/10 pt-12">
          <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both">
            <Zap className="w-8 h-8 text-yellow-400 mb-2" />
            <h3 className="text-xl font-bold text-white">Instant Delivery</h3>
            <p className="text-slate-400 text-sm">Get access immediately after purchase directly to your email.</p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[850ms] fill-mode-both">
            <Tv className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="text-xl font-bold text-white">4K & 8K Quality</h3>
            <p className="text-slate-400 text-sm">Enjoy your favorite shows in breathtaking ultra-high definition.</p>
          </div>
          <div className="flex flex-col gap-2 p-4 rounded-2xl hover:bg-white/5 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[1000ms] fill-mode-both">
            <Star className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="text-xl font-bold text-white">Premium Support</h3>
            <p className="text-slate-400 text-sm">Our dedicated team is here to help you 24/7 with any issues.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
