import { Language, VoiceMessage } from '@/types';

export const speak = (text: string, lang: Language = 'fr'): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      resolve(); // Resolve anyway to not block the flow
    };

    // Get available voices and select appropriate one
    const voices = window.speechSynthesis.getVoices();
    const targetLang = lang === 'fr' ? 'fr' : 'en';
    const voice = voices.find(v => v.lang.startsWith(targetLang));
    if (voice) {
      utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
  });
};

export const speakMultiLanguage = async (message: VoiceMessage): Promise<void> => {
  await speak(message.fr, 'fr');
  await new Promise(resolve => setTimeout(resolve, 500));
  await speak(message.en, 'en');
};

export const getSuccessMessage = (
  recipientName: string,
  amount: number
): VoiceMessage => ({
  fr: `Paiement réussi. ${amount.toLocaleString()} francs CFA ont été envoyés à ${recipientName}. Merci d'utiliser notre service.`,
  en: `Payment successful. ${amount.toLocaleString()} CFA francs have been sent to ${recipientName}. Thank you for using our service.`
});

export const getBulkSuccessMessage = (
  successCount: number,
  failedCount: number,
  totalAmount: number
): VoiceMessage => ({
  fr: `Paiement de masse terminé. ${successCount} transferts réussis pour un total de ${totalAmount.toLocaleString()} francs CFA. ${failedCount > 0 ? `${failedCount} échecs.` : ''} Merci.`,
  en: `Bulk payment completed. ${successCount} successful transfers totaling ${totalAmount.toLocaleString()} CFA francs. ${failedCount > 0 ? `${failedCount} failed.` : ''} Thank you.`
});
