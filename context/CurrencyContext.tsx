"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// 1 EUR = 10 MAD (سعر ثابت قابل للتعديل)
export const EUR_TO_MAD = 10;

type Currency = "EUR" | "MAD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (usdPrice: number) => string;
  convertPrice: (usdPrice: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "EUR",
  setCurrency: () => {},
  formatPrice: (p) => `€${p.toFixed(2)}`,
  convertPrice: (p) => p,
  symbol: "€",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("EUR");

  const convertPrice = (eurPrice: number): number => {
    if (currency === "MAD") return Math.round(eurPrice * EUR_TO_MAD);
    return eurPrice;
  };

  const formatPrice = (eurPrice: number): string => {
    if (currency === "MAD") {
      const mad = Math.round(eurPrice * EUR_TO_MAD);
      return `${mad} MAD`;
    }
    return `€${eurPrice.toFixed(2)}`;
  };

  const symbol = currency === "MAD" ? "MAD" : "€";

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, convertPrice, symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
