import { Recipient } from '@/types';
import { apiFetch, isApiEnabled } from './api';

const INDIVIDUAL_PATH = import.meta.env.VITE_API_INDIVIDUAL_PAYMENT_PATH || '/api/v1/transfers/p2p/';
const BULK_PATH = import.meta.env.VITE_API_BULK_PAYMENT_PATH || '/api/v1/bulk/upload/';
const BULK_STATUS_PATH = import.meta.env.VITE_API_TRANSACTIONS_PATH || '/api/v1/bulk/status/';

// Sender MSISDN par défaut (à remplacer par l'utilisateur connecté)
const DEFAULT_SENDER_MSISDN = '22990001234';

/**
 * Transfert P2P individuel via Django backend
 */
export async function sendIndividualPayment(params: {
  phone_number: string;
  full_name: string;
  amount: number;
  sender_msisdn?: string;
  currency?: string;
}) {
  const payload = {
    sender_msisdn: params.sender_msisdn || DEFAULT_SENDER_MSISDN,
    receiver_msisdn: params.phone_number,
    amount: params.amount.toFixed(2),
    currency: params.currency || 'XOF',
    note: `Paiement à ${params.full_name}`,
  };
  
  return apiFetch(INDIVIDUAL_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Upload CSV pour transferts de masse
 * Le backend attend: file (CSV) + sender_msisdn
 */
export async function sendBulkPaymentCSV(file: File, senderMsisdn?: string) {
  const base = import.meta.env.VITE_API_BASE_URL as string;
  if (!base) {
    throw new Error('API base URL not configured');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('sender_msisdn', senderMsisdn || DEFAULT_SENDER_MSISDN);

  const res = await fetch(`${base}${BULK_PATH}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Bulk upload failed');
  }
  
  return { ok: true, status: res.status, data };
}

/**
 * Transferts de masse via JSON (convertit recipients en requêtes individuelles)
 */
export async function sendBulkPayment(recipients: Recipient[], senderMsisdn?: string) {
  const results = [];
  
  for (const r of recipients) {
    try {
      const result = await sendIndividualPayment({
        phone_number: r.phoneNumber,
        full_name: r.fullName,
        amount: r.amount,
        sender_msisdn: senderMsisdn,
      });
      results.push({ ...r, success: true, result });
    } catch (error) {
      results.push({ ...r, success: false, error });
    }
  }
  
  return { ok: true, data: { results } };
}

/**
 * Récupère le statut d'un job de transfert de masse
 */
export async function fetchBulkJobStatus(jobId: number) {
  return apiFetch(`${BULK_STATUS_PATH}${jobId}/`, { method: 'GET' });
}

/**
 * Récupère les transactions (depuis localStorage en mode démo)
 */
export async function fetchTransactions() {
  if (!isApiEnabled()) {
    // Mode démo: récupérer depuis localStorage
    const stored = localStorage.getItem('transactions');
    return { ok: true, data: stored ? JSON.parse(stored) : [] };
  }
  
  // En mode API, on n'a pas d'endpoint de liste pour l'instant
  // On retourne les transactions locales
  const stored = localStorage.getItem('transactions');
  return { ok: true, data: stored ? JSON.parse(stored) : [] };
}
