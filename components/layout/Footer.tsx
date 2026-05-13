"use client";

import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowRight,
  Facebook,
  Github,
  Heart,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { t } = useLanguage();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      console.log("Newsletter subscription:", email);
      setEmail("");
    }
  };

  const footerSections = [
    {
      title: "Shop",
      links: [
        { href: "/#products", label: "All Products" },
        { href: "/#products", label: "New Arrivals" },
        { href: "/#products", label: "Sale" },
        { href: "/#products", label: "Featured" },
      ],
    },
    {
      title: "Customer Care",
      links: [
        { href: "/contact", label: "Contact Us" },
        { href: "/installation", label: t('footer_installation') },
        { href: "/supported-devices", label: t('footer_supported_devices') },
        { href: "/refund-policy", label: t('footer_refund_policy') },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "https://wa.me/212670965351", label: t('footer_whatsapp') },
        { href: "#", label: "Blog" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/", label: "Privacy Policy" },
        { href: "/", label: "Terms & Conditions" },
        { href: "/", label: "Cookie Policy" },
        { href: "/", label: "Accessibility" },
      ],
    },
  ];

  const socialLinks = [
    { href: "#", icon: Facebook, label: "Facebook" },
    { href: "#", icon: Twitter, label: "Twitter" },
    { href: "#", icon: Instagram, label: "Instagram" },
    { href: "#", icon: Github, label: "GitHub" },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">


        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            <div className="lg:col-span-2">
              <Link
                className="text-2xl font-black tracking-tighter text-gray-900 hover:text-gray-700 transition-colors flex items-center gap-1 group"
                href="/"
                aria-label="Stream TV Home"
              >
                <div className="animate-flag-wave">
                  STREAM<span className="text-blue-600">TV</span>
                </div>
              </Link>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t('footer_desc_streaming')}
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>ifrane . maroc</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+212 670965351</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>support@streamtv.com</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {socialLinks.map(({ href, icon: Icon, label }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-10 w-10 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Link href={href} aria-label={label}>
                      <Icon className="h-4 w-4" />
                    </Link>
                  </Button>
                ))}
              </div>
            </div>

            {footerSections.map((section, index) => (
              <div
                key={section.title}
                className={`${index >= 2 ? "lg:col-span-1" : ""}`}
              >
                <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/admin" className="hover:text-muted-foreground cursor-default decoration-transparent">
                <span>{t('all_rights')}</span>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">Developed by <span className="font-bold text-slate-900">karim Abu rida</span> • enjoy</p>
          </div>



          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 opacity-60 hover:opacity-100 transition-all duration-500 max-w-lg">
            {['BINANCE', 'CASHPLUS', 'WAFACASH', 'REMITLY', 'MONEYGRAM', 'CIH BANK', 'BARID CASH', 'DAMAN CASH', 'WESTERN UNION', 'RIA MONEYTRANS', 'SENDWAVE'].map((method) => (
              <div key={method} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold tracking-wider">{method}</div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
