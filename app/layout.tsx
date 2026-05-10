import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
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
          <CurrencyProvider>
            <CartProvider>
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>

        {/* Synchronous absolute protection script */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var isProtected = function() {
              return !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/dashboard-master');
            };
            
            var prevent = function(e) {
              if (isProtected()) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            };
            
            document.addEventListener('contextmenu', prevent, true);
            document.addEventListener('selectstart', prevent, true);
            document.addEventListener('copy', prevent, true);
            
            document.addEventListener('mousedown', function(e) {
              if (isProtected() && (e.button === 2 || e.button === 3)) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }, true);
            
            document.addEventListener('keydown', function(e) {
              if (isProtected()) {
                var forbidden = ['F12', 'PrintScreen'];
                if (forbidden.indexOf(e.key) !== -1 || 
                   (e.ctrlKey && ['u','s','c','p','i','j'].indexOf(e.key.toLowerCase()) !== -1)) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
            }, true);
            
            setInterval(function() {
              if (isProtected()) {
                document.oncontextmenu = prevent;
                document.body.style.userSelect = 'none';
                document.body.style.webkitUserSelect = 'none';
              } else {
                document.oncontextmenu = null;
                document.body.style.userSelect = 'auto';
                document.body.style.webkitUserSelect = 'auto';
              }
            }, 500);
          })();
        `}} />
      </body>
    </html>
  );
}
