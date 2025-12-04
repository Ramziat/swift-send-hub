import { Recipient, Transaction } from '@/types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as XXX XX XX XX XX (Benin/West Africa format)
  if (cleaned.length >= 8) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})?/, '$1 $2 $3 $4 $5').trim();
  }
  return cleaned;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 15;
};

export const parseCSV = (content: string): Recipient[] => {
  const lines = content.trim().split('\n');
  const recipients: Recipient[] = [];
  
  // Skip header row if present
  const startIndex = lines[0].toLowerCase().includes('phone') || 
                     lines[0].toLowerCase().includes('name') || 
                     lines[0].toLowerCase().includes('amount') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(/[,;]/).map(v => v.trim().replace(/"/g, ''));
    
    if (values.length >= 3) {
      const recipient: Recipient = {
        id: generateId(),
        phoneNumber: values[0],
        fullName: values[1],
        amount: parseFloat(values[2]) || 0,
        status: 'pending'
      };
      
      if (recipient.phoneNumber && recipient.fullName && recipient.amount > 0) {
        recipients.push(recipient);
      }
    }
  }
  
  return recipients;
};

export const simulatePayment = async (recipient: Recipient): Promise<boolean> => {
  // Simulate API call with random success/failure
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  return Math.random() > 0.1; // 90% success rate
};

export const downloadSampleCSV = (): void => {
  const sampleData = `phone_number,full_name,amount
+22990123456,Jean Dupont,50000
+22991234567,Marie Kokou,75000
+22992345678,Pierre Agbessi,100000
+22993456789,Fatou Diallo,25000
+22994567890,Koffi Mensah,60000`;
  
  const blob = new Blob([sampleData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample_recipients.csv';
  a.click();
  URL.revokeObjectURL(url);
};

export const getTransactionStats = (transactions: Transaction[]) => {
  const total = transactions.length;
  const successful = transactions.filter(t => t.status === 'success').length;
  const failed = transactions.filter(t => t.status === 'failed').length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
  
  return { total, successful, failed, totalAmount };
};
