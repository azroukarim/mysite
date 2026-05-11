import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScrollToTop from "@/components/layout/ScrollToTop";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

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
  title: "STREAMTV STORE - Best Premium IPTV & Entertainment Services",
  description: "Get the ultimate streaming experience with STREAMTV STORE. Best 4K IPTV packages, instant activation, and 24/7 support. Upgrade your entertainment today!",
  keywords: ["IPTV Morocco", "Premium IPTV", "4K Streaming", "Best IPTV Store", "Stream TV", "Arabic IPTV", "IPTV Subscription"],
  openGraph: {
    title: "STREAMTV STORE - Premium Entertainment",
    description: "Discover the best IPTV packages with 4K quality and 24/7 support.",
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
    description: "Best IPTV packages with 4K quality and 24/7 support.",
    images: ["https://bloomtpl-100.vercel.app/og-image.jpg"],
  },
};

import ContentProtection from "@/components/layout/ContentProtection";

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
        <ContentProtection />
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
              <ScrollToTop />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
