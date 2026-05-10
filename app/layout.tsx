import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ContentProtection from "@/components/layout/ContentProtection";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stream TV - Premium Entertainment Store",
  description:
    "Discover a wide selection of premium IPTV packages and entertainment services on Stream TV. Enjoy fast activation and 24/7 support. Shop now!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className}  antialiased flex flex-col min-h-screen`}
      >
        <LanguageProvider>
          <CartProvider>
            <ContentProtection />
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
