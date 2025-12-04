import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '@/types';

type Messages = Record<string, { fr: string; en: string }>;

const messages: Messages = {
  // Home Page
  'home.hero.badge': { fr: "Transfert d'argent mobile", en: 'Mobile money transfer' },
  'home.hero.title.pre': { fr: "Envoyez de l'argent", en: 'Send money' },
  'home.hero.title.highlight': { fr: 'facilement', en: 'easily' },
  'home.hero.desc': { fr: "Transférez de l'argent à vos proches en toute simplicité. Paiements individuels ou en masse, avec confirmation vocale.", en: 'Transfer money to your loved ones with ease. Individual or bulk payments, with voice confirmation.' },
  'home.hero.cta.send': { fr: "Envoyer de l'argent", en: 'Send money' },
  'home.hero.cta.bulk': { fr: 'Paiement de masse', en: 'Bulk payment' },
  'home.feature.fast': { fr: 'Rapide & Simple', en: 'Fast & Simple' },
  'home.feature.fast.desc': { fr: "Envoyez de l'argent en quelques secondes", en: 'Send money in seconds' },
  'home.feature.secure': { fr: 'Sécurisé', en: 'Secure' },
  'home.feature.secure.desc': { fr: 'Transactions protégées et cryptées', en: 'Protected and encrypted transactions' },
  'home.feature.multilang': { fr: 'Multilingue', en: 'Multilingual' },
  'home.feature.multilang.desc': { fr: 'Confirmation vocale en Français et Anglais', en: 'Voice confirmation in French and English' },
  'home.quick.individual.title': { fr: 'Paiement Individuel', en: 'Individual Payment' },
  'home.quick.individual.desc': { fr: "Envoyez de l'argent à une personne rapidement et simplement.", en: 'Send money to one person quickly and easily.' },
  'home.quick.individual.cta': { fr: 'Commencer', en: 'Start' },
  'home.quick.bulk.title': { fr: 'Paiement de Masse', en: 'Bulk Payment' },
  'home.quick.bulk.desc': { fr: 'Envoyez à plusieurs personnes en une seule opération.', en: 'Send to multiple people in one operation.' },
  'home.quick.bulk.cta': { fr: 'Mode Admin', en: 'Admin Mode' },
  'home.stats.users': { fr: 'Utilisateurs', en: 'Users' },
  'home.stats.transactions': { fr: 'Transactions', en: 'Transactions' },
  'home.stats.reliability': { fr: 'Fiabilité', en: 'Reliability' },
  'home.stats.availability': { fr: 'Disponibilité', en: 'Availability' },
    // Misc, actions, and helpers
    'Ajouter': { fr: 'Ajouter', en: 'Add' },
    'Actions': { fr: 'Actions', en: 'Actions' },
    'Étape 1': { fr: 'Étape 1', en: 'Step 1' },
    'Téléversement CSV': { fr: 'Téléversement CSV', en: 'CSV Upload' },
    'Exemple CSV': { fr: 'Exemple CSV', en: 'Sample CSV' },
    'Format invalide': { fr: 'Format invalide', en: 'Invalid format' },
    'Veuillez télécharger  un fichier CSV.': { fr: 'Veuillez télécharger  un fichier CSV.', en: 'Please upload a CSV file.' },
    'Fichier vide': { fr: 'Fichier vide', en: 'Empty file' },
    'Aucun bénéficiaire valide trouvé dans le fichier.': { fr: 'Aucun bénéficiaire valide trouvé dans le fichier.', en: 'No valid recipient found in the file.' },
    'Fichier importé': { fr: 'Fichier importé', en: 'File imported' },
    'Erreur de lecture': { fr: 'Erreur de lecture', en: 'Read error' },
    'Impossible de lire le fichier. Vérifiez le format.': { fr: 'Impossible de lire le fichier. Vérifiez le format.', en: 'Cannot read file. Check format.' },
    'Glissez-déposez votre fichier CSV ici': { fr: 'Glissez-déposez votre fichier CSV ici', en: 'Drag and drop your CSV file here' },
    'ou cliquez pour sélectionner depuis votre appareil': { fr: 'ou cliquez pour sélectionner depuis votre appareil', en: 'or click to select from your device' },
    'Format attendu: CSV avec colonnes': { fr: 'Format attendu: CSV avec colonnes', en: 'Expected format: CSV with columns' },
    'téléphone, nom, montant': { fr: 'téléphone, nom, montant', en: 'phone, name, amount' },
    'Maximum 10 000 lignes.': { fr: 'Maximum 10 000 lignes.', en: 'Maximum 10,000 rows.' },
    'Aucun bénéficiaire. Ajoutez des destinataires ou importez un fichier CSV.': { fr: 'Aucun bénéficiaire. Ajoutez des destinataires ou importez un fichier CSV.', en: 'No recipients. Add manually or import a CSV file.' },
  // App & Nav
  'app.name': { fr: 'MoJaPay', en: 'MoJaPay' },
  'nav.home': { fr: 'Accueil', en: 'Home' },
  'nav.send': { fr: "Envoyer de l'argent", en: 'Send Money' },
  'nav.bulk': { fr: 'Paiements de Masse', en: 'Bulk Payments' },
  'nav.history': { fr: 'Historique', en: 'History' },

  // Common
  amountTotal: { fr: 'Montant Total', en: 'Total Amount' },
  success: { fr: 'Réussis', en: 'Success' },
  failed: { fr: 'Échecs', en: 'Failed' },
  all: { fr: 'Tous', en: 'All' },
  downloadCSV: { fr: 'Télécharger CSV', en: 'Download CSV' },
  downloadPDF: { fr: 'Télécharger PDF', en: 'Download PDF' },
  close: { fr: 'Fermer', en: 'Close' },

  // Bulk Payment page
  'bulk.title': { fr: 'Paiements de Masse', en: 'Bulk Payments' },
  'bulk.subtitle': {
    fr: "Envoyez de l'argent à plusieurs bénéficiaires en une seule opération",
    en: 'Send money to multiple recipients in one operation',
  },
  'bulk.mode.csv': { fr: 'Paiement en masse (CSV)', en: 'Bulk payment (CSV)' },
  'bulk.mode.desc': { fr: 'Importez un fichier ou ajoutez manuellement', en: 'Import a file or add manually' },
  'bulk.summary.recipients': { fr: 'Bénéficiaires', en: 'Recipients' },
  'bulk.summary.total': { fr: 'Montant Total', en: 'Total Amount' },
  'bulk.summary.pending': { fr: 'En cours', en: 'Pending' },
  'bulk.send.processing': { fr: 'Envoi en cours...', en: 'Sending...' },
  'bulk.send.cta': { fr: 'Envoyer tout', en: 'Send all' },
  'bulk.warning.title': { fr: 'Attention:', en: 'Warning:' },
  'bulk.warning.body': { fr: "L'envoi peut prendre plusieurs minutes.", en: 'Sending may take several minutes.' },

  // Send Money page
  'send.title': { fr: "Envoyer de l'argent", en: 'Send Money' },
  'send.form.name': { fr: 'Nom complet', en: 'Full name' },
  'send.form.phone': { fr: 'Numéro de téléphone', en: 'Phone number' },
  'send.form.amount': { fr: 'Montant', en: 'Amount' },
  'send.form.submit': { fr: 'Envoyer', en: 'Send' },
  'send.success': { fr: 'Paiement réussi', en: 'Payment successful' },
  'send.failed': { fr: 'Paiement échoué', en: 'Payment failed' },

  // Success Modal / Report
  'report.title.bulk': { fr: 'Rapport des paiements', en: 'Payments report' },
  'report.title.single': { fr: 'Résumé du paiement', en: 'Payment summary' },
  'report.filters.all': { fr: 'Tous', en: 'All' },
  'report.filters.success': { fr: 'Réussis', en: 'Success' },
  'report.filters.failed': { fr: 'Échecs', en: 'Failed' },
  'report.export.csv': { fr: 'Télécharger CSV', en: 'Download CSV' },
  'report.export.pdf': { fr: 'Télécharger PDF', en: 'Download PDF' },
  'report.table.beneficiary': { fr: 'Bénéficiaire', en: 'Beneficiary' },
  'report.table.phone': { fr: 'Téléphone', en: 'Phone' },
  'report.table.amount': { fr: 'Montant', en: 'Amount' },
  'report.table.status': { fr: 'Statut', en: 'Status' },
};

type I18nContextValue = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof messages | string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Always default to French unless explicitly changed
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('lang');
    if (stored === 'fr' || stored === 'en') return stored as Language;
    return 'fr';
  });

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: keyof typeof messages | string) => (messages as any)[key]?.[lang] || (key as string);

  const value = useMemo(() => ({ lang, setLang, t }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};
