"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
  Facebook,
  Github,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Footer() {
  const { t, language } = useLanguage();

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Github, label: "GitHub" },
  ];

  const essentialLinks = [
    { href: "/contact", label: t('contact') },
    { href: "/refund-policy", label: t('footer_refund_policy') },
    { href: "https://wa.me/212670965351", label: t('footer_whatsapp') },
  ];

  return (
    <footer className="bg-white border-t border-slate-100 overflow-hidden relative">
      {/* Main Footer Row */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto text-center md:text-left">
          {/* Left Column: Logo + Socials + Copyright */}
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <Link
              className="text-base font-black tracking-tighter text-gray-900 hover:text-gray-700 transition-colors"
              href="/"
            >
              STREAM<span className="text-blue-600">TV</span>
            </Link>
             <p className="text-xs text-slate-400 font-medium">
              <Link href="/admin" className="hover:text-slate-400 cursor-default">{t('all_rights')}</Link>
             </p>
             <p className="text-[10px] text-slate-400">
               Developed by <span className="text-slate-700 font-bold">Karim Abu Rida</span>
             </p>
            
            {/* Socials */}
            <div className="flex gap-1.5 mt-1">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all duration-300 border border-slate-100"
                  aria-label={label}
                >
                  <Icon className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>

          {/* Middle Column: Essential Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {essentialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
