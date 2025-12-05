import { useState } from 'react';
import { Send, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CSVUploader } from '@/components/payment/CSVUploader';
import { BulkPaymentTable } from '@/components/payment/BulkPaymentTable';
import { PaymentReportTable } from '@/components/payment/PaymentReportTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipient, Transaction } from '@/types';
import { formatCurrency, generateId, simulatePayment } from '@/utils/helpers';
import { isApiEnabled } from '@/lib/api';
import { sendIndividualPayment } from '@/lib/paymentApi';
import { useToast } from '@/hooks/use-toast';
import { notifySuccess } from '@/utils/notify';
import { speakMultiLanguage, getBulkSuccessMessage } from '@/utils/voiceAssistant';
import { useI18n } from '@/lib/i18n';

const BulkPayment = () => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [results, setResults] = useState<{
    successCount: number;
    failedCount: number;
    totalAmount: number;
  } | null>(null);
  const [reportRecipients, setReportRecipients] = useState<Recipient[]>([]);

  const handleCSVUpload = (uploadedRecipients: Recipient[]) => {
    setRecipients(uploadedRecipients);
  };

  const handleUpdateRecipients = (updatedRecipients: Recipient[]) => {
    setRecipients(updatedRecipients);
  };

  const handleSendAll = async () => {
    if (recipients.length === 0) {
      toast({
        title: t('Aucun bénéficiaire') || 'Aucun bénéficiaire',
        description: t("Veuillez ajouter des bénéficiaires avant d'envoyer.") || "Veuillez ajouter des bénéficiaires avant d'envoyer.",
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let failedCount = 0;
    let totalSuccessAmount = 0;

    // Process each recipient (prefer backend if configured)
    const updatedRecipients = [...recipients];
    for (let i = 0; i < updatedRecipients.length; i++) {
      const recipient = updatedRecipients[i];
      try {
        let success = false;
        if (isApiEnabled()) {
          try {
            const resp = await sendIndividualPayment({
              phone_number: recipient.phoneNumber,
              full_name: recipient.fullName,
              amount: recipient.amount,
            });
            success = !!resp.ok;
          } catch {
            success = false;
          }
        } else {
          success = await simulatePayment(recipient);
        }
        updatedRecipients[i] = {
          ...recipient,
          status: success ? 'success' : 'failed',
        };

        if (success) {
          successCount++;
          totalSuccessAmount += recipient.amount;
        } else {
          failedCount++;
        }

        // Update UI progressively
        setRecipients([...updatedRecipients]);
      } catch (error) {
        updatedRecipients[i] = { ...recipient, status: 'failed' };
        failedCount++;
        setRecipients([...updatedRecipients]);
      }
    }

    setIsProcessing(false);
    setResults({
      successCount,
      failedCount,
      totalAmount: totalSuccessAmount,
    });
    setReportRecipients(updatedRecipients);
    setShowSuccess(true);

    // Notification de réussite
    if (successCount > 0) {
      const notifTitle = t('Paiements de masse terminés') || 'Paiements de masse terminés';
      const notifBody = `${successCount} réussis, ${failedCount} échecs • Total ${totalSuccessAmount.toLocaleString()} FCFA`;
      const voiceMsg = getBulkSuccessMessage(successCount, failedCount, totalSuccessAmount);
      console.log('[BulkPayment] Appel notifySuccess', notifTitle, notifBody);
      await notifySuccess(notifTitle, notifBody);
      // Affiche le message vocal dans un toast en haut pendant la lecture
      toast({
        title: notifTitle,
        description: (
          <div
            className="flex flex-row items-center gap-4 whitespace-nowrap overflow-x-auto text-base max-w-full"
            style={{ lineHeight: 1.3 }}
          >
            <span className="truncate font-medium">{voiceMsg.fr}</span>
            <span className="ml-2 italic text-xs text-muted-foreground shrink-0">(Lecture vocale en cours...)</span>
          </div>
        ),
        variant: 'success',
        className: 'fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-fit',
        duration: 10000,
      });
      await speakMultiLanguage(voiceMsg);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    // Reset for new batch
    setRecipients([]);
    setResults(null);
  };

  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);
  const pendingCount = recipients.filter(r => r.status === 'pending' || !r.status).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('bulk.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('bulk.subtitle')}
          </p>
        </div>

        {/* Mode Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 p-4 rounded-xl bg-accent border-2 border-primary">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{t('bulk.mode.csv')}</p>
                    <p className="text-sm text-muted-foreground">{t('bulk.mode.desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CSV Uploader */}
        <CSVUploader onUpload={handleCSVUpload} />

        {/* Recipients Table */}
        <BulkPaymentTable
          recipients={recipients}
          onUpdate={handleUpdateRecipients}
          isProcessing={isProcessing}
        />

        {/* Summary & Send Button */}
        {recipients.length > 0 && (
          <Card className="sticky bottom-24 md:bottom-4 z-40">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 md:gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('bulk.summary.recipients')}</p>
                    <p className="text-xl font-bold text-foreground">{recipients.length}</p>
                  </div>
                  <div className="w-px h-10 bg-border hidden sm:block" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t('bulk.summary.total')}</p>
                    <p className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
                  </div>
                  {isProcessing && (
                    <>
                      <div className="w-px h-10 bg-border hidden sm:block" />
                      <div>
                        <p className="text-sm text-muted-foreground">{t('bulk.summary.pending')}</p>
                        <p className="text-xl font-bold text-secondary">{pendingCount}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <Button
                  size="lg"
                  onClick={handleSendAll}
                  disabled={isProcessing || recipients.length === 0}
                  className="w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('bulk.send.processing')}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t('bulk.send.cta')} ({recipients.length})
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        {recipients.length > 100 && (
          <Card className="border-orange-500/50 bg-orange-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <p className="text-sm text-foreground">
                  <strong>{t('bulk.warning.title')}</strong> {t('bulk.summary.recipients')} {recipients.length}. 
                  {t('bulk.warning.body')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Rapport de paiement en bas, sous forme de tableau */}
      {showSuccess && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Rapport de paiement</h2>
          <div className="mb-4 flex flex-wrap gap-6">
            <div>
              <span className="text-muted-foreground">Succès :</span> <span className="font-bold text-primary">{results?.successCount || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Échecs :</span> <span className="font-bold text-destructive">{results?.failedCount || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Montant total :</span> <span className="font-bold">{formatCurrency(results?.totalAmount || 0)}</span>
            </div>
            <button onClick={handleCloseSuccess} className="ml-auto text-sm underline text-muted-foreground">Réinitialiser</button>
          </div>
          <div className="mb-8">
            <PaymentReportTable recipients={reportRecipients} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BulkPayment;
