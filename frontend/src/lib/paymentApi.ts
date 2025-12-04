import { Recipient } from '@/types';
import { apiFetch } from './api';

const INDIVIDUAL_PATH = import.meta.env.VITE_API_INDIVIDUAL_PAYMENT_PATH || '/api/payments/individual/';
const BULK_PATH = import.meta.env.VITE_API_BULK_PAYMENT_PATH || '/api/payments/bulk/';
const TRANSACTIONS_PATH = import.meta.env.VITE_API_TRANSACTIONS_PATH || '/api/transactions/';

export async function sendIndividualPayment(params: {
  phone_number: string;
  full_name: string;
  amount: number;
}) {
  return apiFetch(INDIVIDUAL_PATH, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

export async function sendBulkPayment(recipients: Recipient[]) {
  const payload = recipients.map((r) => ({
    phone_number: r.phoneNumber,
    full_name: r.fullName,
    amount: r.amount,
  }));
  return apiFetch(BULK_PATH, {
    method: 'POST',
    body: JSON.stringify({ recipients: payload }),
  });
}

export async function fetchTransactions() {
  return apiFetch(TRANSACTIONS_PATH, { method: 'GET' });
}
