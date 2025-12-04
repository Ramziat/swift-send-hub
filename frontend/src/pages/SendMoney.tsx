import { Layout } from '@/components/layout/Layout';
import { IndividualPaymentForm } from '@/components/payment/IndividualPaymentForm';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

const SendMoney = () => {
  const { toast } = useToast();
  const { t } = useI18n();

  const handleTransactionComplete = (transaction: Transaction) => {
    // In a real app, this would save to a database or context
    const existingTransactions = JSON.parse(
      localStorage.getItem('transactions') || '[]'
    );
    existingTransactions.unshift({
      ...transaction,
      createdAt: transaction.createdAt.toISOString(),
    });
    localStorage.setItem('transactions', JSON.stringify(existingTransactions));
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-4">{t('send.title')}</h1>
        <IndividualPaymentForm onTransactionComplete={handleTransactionComplete} />
      </div>
    </Layout>
  );
};

export default SendMoney;
