"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";

// 1 EUR = 10 MAD (سعر ثابت قابل للتعديل)
export const EUR_TO_MAD = 11; // تم تحديث السعر ليكون أكثر واقعية (11 DH)

type Currency = "EUR" | "MAD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (eurPrice: number) => string;
  convertPrice: (eurPrice: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("EUR");

  // Load from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("selectedCurrency") as Currency;
    if (savedCurrency && (savedCurrency === "EUR" || savedCurrency === "MAD")) {
      setCurrencyState(savedCurrency);
    }
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
      if (currency === "MAD") {
        const mad = Math.round(eurPrice * EUR_TO_MAD);
        return `${mad} MAD`;
      }
      return `€${eurPrice.toFixed(2)}`;
    };

    const symbol = currency === "MAD" ? "MAD" : "€";

    return {
      currency,
      setCurrency,
      formatPrice,
      convertPrice,
      symbol
    };
  }, [currency]);

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
