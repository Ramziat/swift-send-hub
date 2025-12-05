import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Recipient } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

export interface PaymentReportTableProps {
  recipients: Recipient[];
}

export const PaymentReportTable = ({ recipients }: PaymentReportTableProps) => {
  const { t } = useI18n();
  if (!recipients || recipients.length === 0) return null;

  const sorted = [...recipients].sort((a, b) => {
    const order = { success: 0, pending: 1, failed: 2 } as const;
    const sa = a.status || 'pending';
    const sb = b.status || 'pending';
    return order[sa] - order[sb];
  });

  const StatusIcon = ({ status }: { status?: Recipient['status'] }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[46px]">{t('report.table.status')}</TableHead>
            <TableHead>{t('report.table.beneficiary')}</TableHead>
            <TableHead>{t('report.table.phone')}</TableHead>
            <TableHead className="text-right">{t('report.table.amount')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={r.id} className={cn(r.status === 'failed' && 'bg-destructive/5')}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StatusIcon status={r.status} />
                  <span className="text-xs text-muted-foreground capitalize">{r.status || 'pending'}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium text-foreground">{r.fullName}</TableCell>
              <TableCell className="text-muted-foreground">{r.phoneNumber}</TableCell>
              <TableCell className="text-right font-semibold">{formatCurrency(r.amount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
