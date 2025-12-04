import { useState } from 'react';
import { Phone, User, Banknote, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuccessModal } from './SuccessModal';
import { formatPhoneNumber, validatePhoneNumber, generateId, simulatePayment } from '@/utils/helpers';
import { isApiEnabled } from '@/lib/api';
import { sendIndividualPayment } from '@/lib/paymentApi';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';
import { Transaction, Recipient } from '@/types';
import { notifySuccess } from '@/utils/notify';
import { speakMultiLanguage, getSuccessMessage } from '@/utils/voiceAssistant';

interface IndividualPaymentFormProps {
  onTransactionComplete: (transaction: Transaction) => void;
}

export const IndividualPaymentForm = ({ onTransactionComplete }: IndividualPaymentFormProps) => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    amount: '',
  });
  const [completedPayment, setCompletedPayment] = useState<{
    name: string;
    amount: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validatePhoneNumber(formData.phoneNumber)) {
      toast({
        title: t('Numéro invalide') || 'Numéro invalide',
        description: t('Veuillez entrer un numéro de téléphone valide.') || 'Veuillez entrer un numéro de téléphone valide.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.fullName.trim()) {
      toast({
        title: t('Nom requis') || 'Nom requis',
        description: t('Veuillez entrer le nom complet du bénéficiaire.') || 'Veuillez entrer le nom complet du bénéficiaire.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: t('Montant invalide') || 'Montant invalide',
        description: t('Veuillez entrer un montant valide.') || 'Veuillez entrer un montant valide.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const recipient: Recipient = {
        id: generateId(),
        phoneNumber: formData.phoneNumber,
        fullName: formData.fullName,
        amount: amount,
        status: 'pending',
      };

      // Try backend first if configured, otherwise simulate
      let success = false;
      if (isApiEnabled()) {
        try {
          const resp = await sendIndividualPayment({
            phone_number: recipient.phoneNumber,
            full_name: recipient.fullName,
            amount: recipient.amount,
          });
          success = !!resp.ok;
        } catch (e) {
          success = false;
        }
      } else {
        success = await simulatePayment(recipient);
      }

      if (success) {
        recipient.status = 'success';
        setCompletedPayment({ name: formData.fullName, amount });
        setShowSuccess(true);

        const transaction: Transaction = {
          id: generateId(),
          type: 'individual',
          recipient,
          totalAmount: amount,
          status: 'success',
          createdAt: new Date(),
        };

        onTransactionComplete(transaction);

        // Notify sender (web notification)
        notifySuccess(t('send.success') || 'Paiement effectué', `${formData.fullName} ${t('success')} ${amount.toLocaleString()} FCFA`);

        // Voice confirmation (mock)
        await speakMultiLanguage(getSuccessMessage(formData.fullName, amount));

        // Reset form
        setFormData({ phoneNumber: '', fullName: '', amount: '' });
      } else {
        toast({
          title: t('send.failed') || 'Échec du paiement',
          description: t('Le transfert a échoué. Veuillez réessayer.') || 'Le transfert a échoué. Veuillez réessayer.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('Erreur') || 'Erreur',
        description: t('Une erreur est survenue. Veuillez réessayer.') || 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="animate-fade-up">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-glow">
            <Send className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle>{t('send.title')}</CardTitle>
          <CardDescription>
            {t("Transférez de l'argent facilement et en toute sécurité") || "Transférez de l'argent facilement et en toute sécurité"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                {t('send.form.phone')}
              </label>
              <Input
                type="tel"
                placeholder="+229 90 12 34 56"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="text-lg"
              />
              {formData.phoneNumber && (
                <p className="text-xs text-muted-foreground">
                  Formaté: {formatPhoneNumber(formData.phoneNumber)}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {t('send.form.name')}
              </label>
              <Input
                type="text"
                placeholder="Jean Dupont"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="text-lg"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Banknote className="w-4 h-4 text-primary" />
                {t('send.form.amount')} (FCFA)
              </label>
              <Input
                type="number"
                placeholder="50 000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                min="100"
                step="100"
                className="text-2xl font-bold"
              />
              <div className="flex gap-2 flex-wrap">
                {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, amount: preset.toString() })
                    }
                    className="px-3 py-1 text-sm rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors"
                  >
                    {preset.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="xl"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {t('bulk.send.processing')}
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  {t('send.form.submit')}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        type="individual"
        recipientName={completedPayment?.name}
        amount={completedPayment?.amount}
      />
    </>
  );
};
