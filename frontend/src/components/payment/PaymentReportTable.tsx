
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { exportRecipientsToCSV, exportRecipientsToPDF } from '@/utils/export';

// On accepte maintenant des objets rapport enrichis (issus du backend)

export interface PaymentReportTableProps {
  recipients: any[];
}


export const PaymentReportTable = ({ recipients }: PaymentReportTableProps) => {
  const { t } = useI18n();
  if (!recipients || recipients.length === 0) return null;

  // Statut visuel
  const StatusIcon = ({ statut }: { statut: string }) => {
    if (statut.toLowerCase().includes('réussi') || statut.toLowerCase().includes('success')) {
      return <CheckCircle className="w-4 h-4 text-primary" />;
    }
    if (statut.toLowerCase().includes('échoué') || statut.toLowerCase().includes('fail')) {
      return <XCircle className="w-4 h-4 text-destructive" />;
    }
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  // Colonnes pour l'export local (Nom, ID, Montant, Statut)
  const exportColumns = [
    { key: 'fullName', header: 'Nom' },
    { key: 'id', header: 'ID' },
    { key: 'amount', header: 'Montant', map: (r: any) => r.amount },
    { key: 'status', header: 'Statut', map: (r: any) => r.status || 'pending' },
  ];

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="flex justify-end gap-2 p-2">
        <button
          className="px-3 py-1 rounded bg-muted text-xs hover:bg-accent border"
          onClick={() => exportRecipientsToCSV(recipients, 'rapport_paiement.csv', exportColumns)}
        >
          Télécharger CSV
        </button>
        <button
          className="px-3 py-1 rounded bg-muted text-xs hover:bg-accent border"
          onClick={() => exportRecipientsToPDF(recipients, { filename: 'rapport_paiement.pdf', columns: exportColumns })}
        >
          Télécharger PDF
        </button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipients.map((r, idx) => (
            <TableRow key={r.id || idx} className={cn(r.status === 'failed' && 'bg-destructive/5')}>
              <TableCell className="font-medium text-foreground">{r.fullName}</TableCell>
              <TableCell className="text-muted-foreground">{r.id}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(Number(r.amount))}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon statut={r.status || ''} />
                  <span className="text-xs text-muted-foreground capitalize">{r.status}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
