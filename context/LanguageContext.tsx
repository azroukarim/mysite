'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

const translations: any = {
  // Header & Nav
  home: { en: 'Home', fr: 'Accueil' },
  contact: { en: 'Contact', fr: 'Contact' },
  search_placeholder: { en: 'Search products...', fr: 'Rechercher des produits...' },
  cart: { en: 'Cart', fr: 'Panier' },
  
  // Home Page
  hero_title: { 
    en: 'STREAMTV STORE', 
    fr: 'STREAMTV STORE' 
  },
  hero_desc: { 
    en: 'Discover a wide selection of premium Streaming packages and entertainment apps with 4K quality, 24/7 support, and instant activation. Shop now!', 
    fr: 'Découvrez une large sélection de forfaits Streaming premium et d\'applications de divertissement avec une qualité 4K, un support 24/7 et une activation instantanée. Achetez maintenant !' 
  },
  
  // Product Page
  add_to_cart: { en: 'Add to Cart', fr: 'Ajouter au panier' },
  buy_now: { en: 'Buy Now', fr: 'Acheter maintenant' },
  order_whatsapp: { en: 'Order via WhatsApp', fr: 'Commander via WhatsApp' },
  select_duration: { en: 'Select Duration', fr: 'Choisir la durée' },
  subscription_duration: { en: 'Subscription Duration', fr: 'Durée d\'abonnement' },
  quantity: { en: 'Quantity', fr: 'Quantité' },
  related_products: { en: 'Related Products', fr: 'Produits associés' },
  quick_view: { en: 'Quick View', fr: 'Aperçu' },
  sale: { en: 'Sale', fr: 'Promo' },
  order_now: { en: 'Order Now', fr: 'Commander' },
  product_desc_title: { en: 'Product Description', fr: 'Description du produit' },
  no_desc: { en: 'No detailed description available for this product.', fr: 'Aucune description détaillée disponible pour ce produit.' },
  our_guarantee: { en: 'Our Guarantee', fr: 'Notre Garantie' },
  guarantee_1: { en: '24/7 Premium Support', fr: 'Support Premium 24/7' },
  guarantee_2: { en: '99.9% Server Uptime', fr: 'Disponibilité du serveur à 99,9%' },
  guarantee_3: { en: 'Full Money Back Guarantee', fr: 'Garantie de remboursement intégral' },
  guarantee_4: { en: 'Secure Payment Method', fr: 'Méthode de paiement sécurisée' },
  guarantee_5: { en: 'Antifreeze Technology', fr: 'Technologie Anti-Coupure' },
  need_help: { en: 'Need Help?', fr: 'Besoin d\'aide ?' },
  need_help_desc: { en: 'If you have any questions about this product, feel free to contact our support team.', fr: 'Si vous avez des questions sur ce produit, n\'hésitez pas à contacter notre équipe d\'assistance.' },
  contact_support: { en: 'Contact Support', fr: 'Contacter le support' },
  flash_sale_active: { en: 'Flash Sale Active', fr: 'Vente Flash Active' },
  full_access: { en: 'Full Access', fr: 'Accès Complet' },
  
  // Footer
  stay_loop: { en: 'Stay in the loop', fr: 'Restez informé' },
  newsletter_desc: { en: 'Subscribe to our newsletter for exclusive offers and updates.', fr: 'Abonnez-vous à notre newsletter pour des offres exclusives et des mises à jour.' },
  all_rights: { en: '© 2025 Stream TV™. All Rights Reserved.', fr: '© 2025 Stream TV™. Tous droits réservés.' },
  developed_by: { en: 'Developed by', fr: 'Développé par' },
  distributed_by: { en: 'Distributed by', fr: 'Distribué par' },

  // Footer Links
  footer_installation: { en: 'Installation Guide', fr: 'Guide d\'installation' },
  footer_supported_devices: { en: 'Supported Devices', fr: 'Appareils supportés' },
  footer_refund_policy: { en: 'Refund Policy', fr: 'Politique de remboursement' },
  refund_policy_title: { en: 'Refund Policy', fr: 'Politique de remboursement' },
  refund_policy_subtitle: { en: 'Transparent terms to protect our customers and our service.', fr: 'Des conditions transparentes pour protéger nos clients et notre service.' },
  refund_no_refund_after_delivery_title: { en: 'No Refunds After Delivery', fr: 'Pas de remboursement après livraison' },
  refund_no_refund_after_delivery_desc: { 
    en: 'Once your streaming credentials have been delivered via WhatsApp or Email, the service is considered consumed. Due to the nature of digital products, we cannot offer refunds once the account is active.', 
    fr: 'Une fois vos identifiants de streaming livrés via WhatsApp ou Email, le service est considéré comme consommé. En raison de la nature des produits numériques, nous ne pouvons pas proposer de remboursement une fois le compte actif.' 
  },
  refund_technical_issues_title: { en: 'Technical Support First', fr: 'Support technique d\'abord' },
  refund_technical_issues_desc: { 
    en: 'If you experience technical difficulties, our support team is available 24/7 to assist you. Refunds are only considered if we are unable to resolve a major service disruption on our end within 48 hours.', 
    fr: 'Si vous rencontrez des difficultés techniques, notre équipe de support est disponible 24/7 pour vous aider. Les remboursements ne sont envisagés que si nous ne sommes pas en mesure de résoudre une interruption majeure de service de notre côté dans les 48 heures.' 
  },
  refund_compatibility_title: { en: 'Device Compatibility', fr: 'Compatibilité des appareils' },
  refund_compatibility_desc: { 
    en: 'It is the customer\'s responsibility to ensure their device is compatible with our service before purchasing. No refunds will be issued for compatibility issues with personal hardware or internet speed.', 
    fr: 'Il est de la responsabilité du client de s\'assurer que son appareil est compatible avec notre service avant l\'achat. Aucun remboursement ne sera effectué pour des problèmes de compatibilité avec le matériel personnel ou la vitesse Internet.' 
  },
  footer_whatsapp: { en: 'WhatsApp Support', fr: 'Support WhatsApp' },
  footer_desc_streaming: { 
    en: 'Your #1 source for premium Streaming worldwide. Enjoy 20,000+ channels and VOD in 4K/UHD quality.', 
    fr: 'Votre source n°1 pour le Streaming premium dans le monde. Profitez de plus de 20 000 chaînes et VOD en qualité 4K/UHD.' 
  },

  // Contact Page
  contact_get_in_touch: { en: 'Get in Touch', fr: 'Contactez-nous' },
  contact_hear_from_you_title: { en: "We'd love to hear from you", fr: "Nous serions ravis de vous entendre" },
  contact_desc: { 
    en: "Have a question, suggestion, or just want to say hello? We're here to help and would love to hear from you.", 
    fr: "Vous avez une question, une suggestion ou vous voulez simplement nous dire bonjour ? Nous sommes là pour vous aider et serions ravis de vous entendre." 
  },
  contact_send_message: { en: 'Send us a message', fr: 'Envoyez-nous un message' },
  contact_form_desc: { 
    en: "Fill out the form below and we'll get back to you as soon as possible.", 
    fr: "Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais." 
  },
  contact_name_label: { en: 'Your Name', fr: 'Votre Nom' },
  contact_email_label: { en: 'Your Email', fr: 'Votre Email' },
  contact_subject_label: { en: 'Subject', fr: 'Sujet' },
  contact_message_label: { en: 'Your Message', fr: 'Votre Message' },
  contact_send_btn: { en: 'Send Message', fr: 'Envoyer le message' },
  contact_sending_btn: { en: 'Sending...', fr: 'Envoi en cours...' },
  contact_sent_btn: { en: 'Message Sent!', fr: 'Message envoyé !' },
  contact_info_title: { en: 'Contact Information', fr: 'Informations de contact' },
  contact_email_us: { en: 'Email Us', fr: 'Envoyez-nous un email' },
  contact_call_us: { en: 'Call Us', fr: 'Appelez-nous' },
  contact_visit_us: { en: 'Visit Us', fr: 'Visitez-nous' },
  contact_working_hours: { en: 'Working Hours', fr: 'Heures de travail' },
  contact_open_all_week: { en: 'Open all week', fr: 'Ouvert toute la semaine' },
  contact_why_contact_us: { en: 'Why Contact Us?', fr: 'Pourquoi nous contacter ?' },
  contact_faq_title: { en: 'Frequently Asked Questions', fr: 'Questions fréquemment posées' },
  contact_faq_desc: { 
    en: "Find quick answers to common questions about our products and services.", 
    fr: "Trouvez des réponses rapides aux questions courantes sur nos produits et services." 
  },
  contact_still_questions: { en: 'Still have questions?', fr: 'Vous avez encore des questions ?' },
  contact_still_desc: { 
    en: "Can't find what you're looking for? Our customer support team is here to help.", 
    fr: "Vous ne trouvez pas ce que vous cherchez ? Notre équipe de support client est là pour vous aider." 
  },
  contact_call_now: { en: 'Call Us Now', fr: 'Appelez-nous maintenant' },
  contact_live_chat: { en: 'Live Chat', fr: 'Chat en direct' },

  // Streaming FAQs
  faq_q1: { en: 'How do I receive my subscription?', fr: 'Comment vais-je recevoir mon abonnement ?' },
  faq_a1: { en: 'Your login details will be sent immediately via WhatsApp or Email after payment confirmation.', fr: 'Vos identifiants seront envoyés immédiatement via WhatsApp ou Email après confirmation du paiement.' },
  faq_q2: { en: 'Which devices are supported?', fr: 'Quels appareils sont supportés ?' },
  faq_a2: { en: 'We support all devices: Smart TVs, Android, iOS, Firestick, MAG, and PC.', fr: 'Nous supportons tous les appareils : Smart TVs, Android, iOS, Firestick, MAG et PC.' },
  faq_q3: { en: 'How long does activation take?', fr: 'Combien de temps prend l\'activation ?' },
  faq_a3: { en: 'Activation is usually instant, but it can take up to 15 minutes during peak hours.', fr: 'L\'activation est généralement instantanée, mais cela peut prendre jusqu\'à 15 minutes pendant les heures de pointe.' },
  faq_q4: { en: 'Do you offer a free trial?', fr: 'Proposez-vous un essai gratuit ?' },
  faq_a4: { en: 'Yes, contact us on WhatsApp to get a 24-hour free trial to test our service quality.', fr: 'Oui, contactez-nous sur WhatsApp pour obtenir un essai gratuit de 24 heures afin de tester la qualité de notre service.' },
  payment_methods_title: { en: 'Our Available Payment Methods', fr: 'Nos moyens de paiement disponibles' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation['en'] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
