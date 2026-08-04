import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_KEY = "user_preferred_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<string>("USD");

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const stored = await SecureStore.getItemAsync(CURRENCY_KEY);
        if (stored) {
          setCurrencyState(stored);
        }
      } catch (err) {
        // Silent catch
      }
    };
    loadCurrency();
  }, []);

  const setCurrency = async (code: string) => {
    try {
      setCurrencyState(code);
      await SecureStore.setItemAsync(CURRENCY_KEY, code);
    } catch (err) {
      // Silent catch
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
