export interface Recipient {
  id: string;
  phoneNumber: string;
  fullName: string;
  amount: number;
  status?: 'pending' | 'success' | 'failed';
}

export interface Transaction {
  id: string;
  type: 'individual' | 'bulk';
  recipient?: Recipient;
  recipients?: Recipient[];
  totalAmount: number;
  status: 'pending' | 'success' | 'failed' | 'partial';
  createdAt: Date;
  successCount?: number;
  failedCount?: number;
}

export type Language = 'fr' | 'en';

export interface VoiceMessage {
  fr: string;
  en: string;
}
