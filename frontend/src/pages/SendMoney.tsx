import { Layout } from '@/components/layout/Layout';
import { IndividualPaymentForm } from '@/components/payment/IndividualPaymentForm';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';

const SendMoney = () => {
  const { toast } = useToast();

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
        <IndividualPaymentForm onTransactionComplete={handleTransactionComplete} />
      </div>
    </Layout>
  );
};

export default SendMoney;
