'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

const translations: Translations = {
  // Header & Nav
  home: { en: 'Home', fr: 'Accueil' },
  contact: { en: 'Contact', fr: 'Contact' },
  search_placeholder: { en: 'Search products...', fr: 'Rechercher des produits...' },
  cart: { en: 'Cart', fr: 'Panier' },
  
  // Home Page
  hero_title: { en: 'Beyond Streaming: The Ultimate IPTV & App Store Experience', fr: 'Au-delà du Streaming : L\'Expérience Ultime de l\'IPTV et de l\'App Store' },
  hero_desc: { en: 'Discover a wide selection of premium IPTV packages and entertainment apps with 4K quality, 24/7 support, and instant activation. Shop now!', fr: 'Découvrez une large sélection de forfaits IPTV premium et d\'applications de divertissement avec une qualité 4K, un support 24/7 et une activation instantanée. Achetez maintenant !' },
  
  // Product Page
  add_to_cart: { en: 'Add to Cart', fr: 'Ajouter au panier' },
  buy_now: { en: 'Buy Now', fr: 'Acheter maintenant' },
  order_whatsapp: { en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' },
  select_duration: { en: 'Select Duration', fr: 'Choisir la durée' },
  subscription_duration: { en: 'Subscription Duration', fr: 'Durée d\'abonnement' },
  quantity: { en: 'Quantity', fr: 'Quantité' },
  related_products: { en: 'Related Products', fr: 'Produits associés' },
  
  // Footer
  stay_loop: { en: 'Stay in the loop', fr: 'Restez informé' },
  newsletter_desc: { en: 'Subscribe to our newsletter for exclusive offers and updates.', fr: 'Abonnez-vous à notre newsletter pour des offres exclusives et des mises à jour.' },
  all_rights: { en: '© 2025 Stream TV™. All Rights Reserved.', fr: '© 2025 Stream TV™. Tous droits réservés.' },
  developed_by: { en: 'Developed by', fr: 'Développé par' },
  distributed_by: { en: 'Distributed by', fr: 'Distribué par' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
