import { useEffect, useState } from 'react';
import { CheckCircle, Volume2, VolumeX, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/utils/helpers';
import { speak, speakMultiLanguage, getSuccessMessage, getBulkSuccessMessage } from '@/utils/voiceAssistant';
import { Language, Recipient } from '@/types';
import { cn } from '@/lib/utils';
import { PaymentReportTable } from './PaymentReportTable';
import { exportRecipientsToCSV, exportRecipientsToPDF } from '@/utils/export';
import { useI18n } from '@/lib/i18n';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'individual' | 'bulk';
  recipientName?: string;
  amount?: number;
  successCount?: number;
  failedCount?: number;
  totalAmount?: number;
  recipients?: Recipient[]; // for bulk report
}

export const SuccessModal = ({
  isOpen,
  onClose,
  type,
  recipientName,
  amount,
  successCount = 0,
  failedCount = 0,
  totalAmount = 0,
  recipients = [],
}: SuccessModalProps) => {
  const { t } = useI18n();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language | 'both'>('both');
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (isOpen) {
      // Auto-play voice after a short delay
      const timer = setTimeout(() => {
        handleSpeak('both');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSpeak = async (lang: Language | 'both') => {
    setIsSpeaking(true);
    setSelectedLang(lang);

    try {
      if (type === 'individual' && recipientName && amount) {
        const message = getSuccessMessage(recipientName, amount);
        if (lang === 'both') {
          await speakMultiLanguage(message);
        } else {
          await speak(message[lang], lang);
        }
      } else if (type === 'bulk') {
        const message = getBulkSuccessMessage(successCount, failedCount, totalAmount);
        if (lang === 'both') {
          await speakMultiLanguage(message);
        } else {
          await speak(message[lang], lang);
        }
      }
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const filteredRecipients = (recipients || []).filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'success') return r.status === 'success';
    if (filter === 'failed') return r.status === 'failed';
    return true;
  });

  const onExportCSV = () => {
    exportRecipientsToCSV(filteredRecipients, 'rapport_paiement.csv');
  };

  const onExportPDF = () => {
    const subtitle =
      type === 'bulk'
        ? `Réussis: ${successCount} | Échecs: ${failedCount} | Total: ${totalAmount} FCFA`
        : '';
    exportRecipientsToPDF(filteredRecipients, {
      filename: 'rapport_paiement.pdf',
      subtitle,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md overflow-hidden animate-scale-in">
        {/* Success Header */}
        <div className="gradient-success p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-foreground/20 mb-4 animate-float">
            <CheckCircle className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-primary-foreground mb-2">
            {type === 'individual' ? t('send.success') : t('report.title.bulk')}
          </h2>
          <p className="text-primary-foreground/80">
            {type === 'individual' ? t('send.success') : t('report.title.bulk')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {type === 'individual' ? (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">{t('report.title.single')}</p>
                <p className="text-xl font-bold text-foreground">{recipientName}</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(amount || 0)}
                </p>
              </div>
              {/* Single-row report for clarity */}
              <div className="max-h-64 overflow-auto">
                <PaymentReportTable
                  recipients={[
                    {
                      id: 'single',
                      fullName: recipientName || '-',
                      phoneNumber: '-',
                      amount: amount || 0,
                      status: 'success',
                    },
                  ]}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-accent">
                  <p className="text-3xl font-bold text-primary">{successCount}</p>
                  <p className="text-sm text-muted-foreground">{t('success')}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-destructive/10">
                  <p className="text-3xl font-bold text-destructive">{failedCount}</p>
                  <p className="text-sm text-muted-foreground">{t('failed')}</p>
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted">
                <p className="text-sm text-muted-foreground mb-1">{t('bulk.summary.total')}</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              {/* Controls: filters + export */}
              {recipients && recipients.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
                      {t('report.filters.all')} ({recipients.length})
                    </Button>
                    <Button
                      variant={filter === 'success' ? 'success' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('success')}
                    >
                      {t('report.filters.success')} ({recipients.filter((r) => r.status === 'success').length})
                    </Button>
                    <Button
                      variant={filter === 'failed' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setFilter('failed')}
                    >
                      {t('report.filters.failed')} ({recipients.filter((r) => r.status === 'failed').length})
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onExportCSV}>
                      {t('report.export.csv')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={onExportPDF}>
                      {t('report.export.pdf')}
                    </Button>
                  </div>
                </div>
              )}
              {/* Detailed report table */}
              {recipients && recipients.length > 0 && (
                <div className="max-h-64 overflow-auto border rounded-xl">
                  <PaymentReportTable recipients={filteredRecipients} />
                </div>
              )}
            </div>
          )}

          {/* Voice Assistant */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Voice Confirmation
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={selectedLang === 'fr' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSpeak('fr')}
                disabled={isSpeaking}
              >
                🇫🇷 Français
              </Button>
              <Button
                variant={selectedLang === 'en' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => handleSpeak('en')}
                disabled={isSpeaking}
              >
                🇬🇧 English
              </Button>
              <Button
                variant={selectedLang === 'both' ? 'success' : 'outline'}
                size="sm"
                onClick={() => handleSpeak('both')}
                disabled={isSpeaking}
              >
                🌍 Both
              </Button>
            </div>
            
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2 text-primary animate-pulse-soft">
                <Volume2 className="w-5 h-5" />
                <span className="text-sm font-medium">Speaking...</span>
                <Button variant="ghost" size="sm" onClick={stopSpeaking}>
                  <VolumeX className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="glass"
            size="lg"
            className="w-full"
            onClick={onClose}
          >
            {t('close')}
          </Button>
        </div>

        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </Card>
    </div>
  );
};
