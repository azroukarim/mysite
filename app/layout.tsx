import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STREAMTV STORE - Best Premium Streaming & Entertainment Services",
  description: "Get the ultimate streaming experience with STREAMTV STORE. Best 4K Streaming packages, instant activation, and 24/7 support. Upgrade your entertainment today!",
  keywords: ["Streaming Morocco", "Premium Streaming", "4K Streaming", "Best TV Store", "Stream TV", "Arabic Streaming", "TV Subscription"],
  openGraph: {
    title: "STREAMTV STORE - Premium Entertainment",
    description: "Discover the best Streaming packages with 4K quality and 24/7 support.",
    url: "https://bloomtpl-100.vercel.app",
    siteName: "STREAMTV STORE",
    images: [
      {
        url: "https://bloomtpl-100.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "STREAMTV STORE - Premium Entertainment",
    description: "Best Streaming packages with 4K quality and 24/7 support.",
    images: ["https://bloomtpl-100.vercel.app/og-image.jpg"],
  },
};

import ContentProtection from "@/components/layout/ContentProtection";

import AuthRedirectHandler from "@/components/auth/AuthRedirectHandler";
import MaintenanceMode from "@/components/layout/MaintenanceMode";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${montserrat.variable} antialiased flex flex-col min-h-screen`}
      >
        <MaintenanceMode />
        <AuthRedirectHandler />
        <ContentProtection />
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <ScrollToTop />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
