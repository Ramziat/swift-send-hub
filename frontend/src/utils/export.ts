import type { Recipient } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ExportValue = string | number;
type ExportColKey = keyof Recipient | 'status';
type ExportCols = Array<{ key: ExportColKey; header: string; map?: (r: Recipient) => ExportValue }>

const defaultColumns: ExportCols = [
  { key: 'fullName', header: 'Bénéficiaire' },
  { key: 'phoneNumber', header: 'Téléphone' },
  { key: 'amount', header: 'Montant', map: (r) => r.amount },
  { key: 'status', header: 'Statut', map: (r) => r.status || 'pending' },
];

export function exportRecipientsToCSV(recipients: Recipient[], filename = 'rapport_paiement.csv', columns: ExportCols = defaultColumns) {
  const headers = columns.map((c) => c.header);
  const rows = recipients.map((r) =>
    columns.map((c) => (c.map ? c.map(r) : (c.key === 'status' ? (r.status || 'pending') : (r[c.key] as ExportValue)) ?? ''))
  );
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRecipientsToPDF(
  recipients: Recipient[],
  options?: { title?: string; filename?: string; columns?: ExportCols; subtitle?: string }
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const title = options?.title ?? 'Rapport d\'exécution de paiements';
  const subtitle = options?.subtitle ?? '';
  const columns = options?.columns ?? defaultColumns;

  doc.setFontSize(16);
  doc.text(title, 40, 40);
  if (subtitle) {
    doc.setFontSize(11);
    doc.text(subtitle, 40, 60);
  }

  const head = [columns.map((c) => c.header)];
  const body = recipients.map((r) =>
    columns.map((c) => (c.map ? c.map(r) : (c.key === 'status' ? (r.status || 'pending') : (r[c.key] as ExportValue)) ?? ''))
  );

  autoTable(doc, {
    head,
    body,
    startY: subtitle ? 80 : 60,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [23, 146, 98] },
    theme: 'grid',
  });

  doc.save(options?.filename ?? 'rapport_paiement.pdf');
}
