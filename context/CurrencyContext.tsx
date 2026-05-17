"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

// 1 EUR = 10 MAD (سعر ثابت قابل للتعديل)
export const EUR_TO_MAD = 10;

type Currency = "EUR" | "MAD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (eurPrice: number) => string;
  convertPrice: (eurPrice: number) => number;
  symbol: string;
  hidePrices: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [hidePrices, setHidePrices] = useState<boolean>(false);
  const { language } = useLanguage();

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setHidePrices(!!data.hide_prices);
      }
    } catch (error) {
      console.error("Failed to fetch price visibility settings:", error);
    }
  };

  // Load from localStorage on mount & start settings polling
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "MAD")) {
      setCurrencyState(savedCurrency);
    }

    fetchSettings();
    const interval = setInterval(fetchSettings, 5000);
    return () => clearInterval(interval);
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("selectedCurrency", c);
  };

  const value = useMemo(() => {
    const convertPrice = (eurPrice: number): number => {
      if (currency === "MAD") return Math.round(eurPrice * EUR_TO_MAD);
      return eurPrice;
    };

    const formatPrice = (eurPrice: number): string => {
      if (hidePrices) {
        return language === "fr" ? "Prix masqué" : "Price Hidden";
      }
      if (currency === "MAD") {
        const mad = Math.round(eurPrice * EUR_TO_MAD);
        return `${mad} MAD`;
      }
      return `€${eurPrice.toFixed(2)}`;
    };

    const symbol = hidePrices ? "" : (currency === "MAD" ? "MAD" : "€");

    return {
      currency,
      setCurrency,
      formatPrice,
      convertPrice,
      symbol,
      hidePrices
    };
  }, [currency, hidePrices, language]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
