"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";

interface SettingsContextType {
  hidePrices: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hidePrices, setHidePrices] = useState<boolean>(false);

  const refreshSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setHidePrices(!!data.hide_prices);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  useEffect(() => {
    refreshSettings();
    // Refresh settings every 10 seconds for real-time visibility updates
    const interval = setInterval(refreshSettings, 10000);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(() => ({
    hidePrices,
    refreshSettings
  }), [hidePrices]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
