import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from './LocationContext';

export type TargetMarket = 'Nigeria' | 'Global';

export interface MarketSettings {
  market: TargetMarket;
  suggestedQueries: string[];
  defaultOwnBrand: string;
  defaultOwnWebsite: string;
  defaultOwnAliases: string[];
  defaultCompetitors: { name: string; aliases: string[]; website: string }[];
}

const NIGERIAN_SETTINGS: MarketSettings = {
  market: 'Nigeria',
  defaultOwnBrand: 'Paystack',
  defaultOwnWebsite: 'paystack.com',
  defaultOwnAliases: ['Paystack', 'Paystack Nigeria', '@paystack', 'paystack.com'],
  defaultCompetitors: [
    { name: 'Flutterwave', aliases: ['Flutterwave', 'Flutter wave', '@flutterwave'], website: 'flutterwave.com' },
    { name: 'Moniepoint', aliases: ['Moniepoint', 'Monie point', '@moniepoint'], website: 'moniepoint.com' },
  ],
  suggestedQueries: [
    'What is the best payment gateway in Nigeria for developers?',
    'Which payment platform supports automated recurring billing in Lagos?',
    'What are the top-rated business banking apps for small merchants in Nigeria?',
    'Is Paystack reliable for collecting card payments?',
    'Which fintech offers the most reliable POS terminal in Nigeria?',
    'How to collect online payments on a Shopify store in Nigeria?',
    'What are the best platforms to get business loans for small businesses in Nigeria?',
    'Which payment solution has the lowest transaction fees in Lagos?',
  ],
};

const GLOBAL_SETTINGS: MarketSettings = {
  market: 'Global',
  defaultOwnBrand: 'Stripe',
  defaultOwnWebsite: 'stripe.com',
  defaultOwnAliases: ['Stripe', 'Stripe Payments', '@stripe', 'stripe.com'],
  defaultCompetitors: [
    { name: 'PayPal', aliases: ['PayPal', 'Pay Pal', '@paypal'], website: 'paypal.com' },
    { name: 'Adyen', aliases: ['Adyen', 'Adyen Payments', '@adyen'], website: 'adyen.com' },
  ],
  suggestedQueries: [
    'What is the best payment gateway for global SaaS startups?',
    'Which payment platform supports automated recurring subscription billing?',
    'What are the top-rated business banking accounts for digital nomads?',
    'Is Stripe reliable for high-volume enterprise credit card payments?',
    'Which online provider offers the lowest card processing fees globally?',
    'How to collect international payments on a Shopify store easily?',
    'What are the best online platforms to get working capital loans?',
    'Which merchant gateway provides the most robust fraud prevention?',
  ],
};

interface LocaleContextType {
  market: TargetMarket;
  settings: MarketSettings;
  setMarket: (market: TargetMarket) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const { region } = useLocation();

  // Try to load saved preference, default to detected region or Nigeria
  const [market, setMarketState] = useState<TargetMarket>(() => {
    const saved = localStorage.getItem('sightline_market');
    if (saved) return saved as TargetMarket;
    return region !== 'Detecting' ? region : 'Nigeria';
  });

  useEffect(() => {
    if (region !== 'Detecting' && !localStorage.getItem('sightline_market')) {
      setMarketState(region);
    }
  }, [region]);


  const setMarket = (newMarket: TargetMarket) => {
    setMarketState(newMarket);
    localStorage.setItem('sightline_market', newMarket);
  };

  const settings = market === 'Nigeria' ? NIGERIAN_SETTINGS : GLOBAL_SETTINGS;

  return (
    <LocaleContext.Provider value={{ market, settings, setMarket }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
