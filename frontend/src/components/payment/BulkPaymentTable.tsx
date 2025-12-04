import { useState } from 'react';
import { Trash2, Plus, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Recipient } from '@/types';
import { formatCurrency, generateId, validatePhoneNumber } from '@/utils/helpers';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface BulkPaymentTableProps {
  recipients: Recipient[];
  onUpdate: (recipients: Recipient[]) => void;
  isProcessing: boolean;
}

export const BulkPaymentTable = ({
  recipients,
  onUpdate,
  isProcessing,
}: BulkPaymentTableProps) => {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    phoneNumber: '',
    fullName: '',
    amount: '',
  });

  const handleAddRecipient = () => {
    if (
      !newRecipient.phoneNumber ||
      !newRecipient.fullName ||
      !newRecipient.amount
    ) {
      return;
    }

    const recipient: Recipient = {
      id: generateId(),
      phoneNumber: newRecipient.phoneNumber,
      fullName: newRecipient.fullName,
      amount: parseFloat(newRecipient.amount) || 0,
      status: 'pending',
    };

    onUpdate([...recipients, recipient]);
    setNewRecipient({ phoneNumber: '', fullName: '', amount: '' });
  };

  const handleRemoveRecipient = (id: string) => {
    onUpdate(recipients.filter((r) => r.id !== id));
  };

  const handleUpdateRecipient = (id: string, field: keyof Recipient, value: string | number) => {
    onUpdate(
      recipients.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);

  return (
    <Card className="animate-fade-up">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">
          {t('bulk.summary.recipients')} ({recipients.length})
        </CardTitle>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{t('bulk.summary.total')}</p>
          <p className="text-xl font-bold text-primary">{formatCurrency(totalAmount)}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add New Recipient Form */}
        {!isProcessing && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-xl bg-muted/50">
            <Input
              placeholder={t('report.table.phone')}
              value={newRecipient.phoneNumber}
              onChange={(e) =>
                setNewRecipient({ ...newRecipient, phoneNumber: e.target.value })
              }
              className="h-12"
            />
            <Input
              placeholder={t('send.form.name')}
              value={newRecipient.fullName}
              onChange={(e) =>
                setNewRecipient({ ...newRecipient, fullName: e.target.value })
              }
              className="h-12"
            />
            <Input
              type="number"
              placeholder={t('report.table.amount')}
              value={newRecipient.amount}
              onChange={(e) =>
                setNewRecipient({ ...newRecipient, amount: e.target.value })
              }
              className="h-12"
            />
            <Button
              onClick={handleAddRecipient}
              disabled={
                !newRecipient.phoneNumber ||
                !newRecipient.fullName ||
                !newRecipient.amount
              }
              className="h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('Ajouter') || 'Ajouter'}
            </Button>
          </div>
        )}

        {/* Recipients Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('report.table.status')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('report.table.phone')}
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('send.form.name')}
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                  {t('report.table.amount')}
                </th>
                {!isProcessing && (
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    {t('Actions') || 'Actions'}
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {recipients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t('Aucun bénéficiaire. Ajoutez des destinataires ou importez un fichier CSV.') || 'Aucun bénéficiaire. Ajoutez des destinataires ou importez un fichier CSV.'}
                  </td>
                </tr>
              ) : (
                recipients.map((recipient, index) => (
                  <tr
                    key={recipient.id}
                    className={cn(
                      'border-b border-border/50 transition-colors',
                      recipient.status === 'success' && 'bg-accent/30',
                      recipient.status === 'failed' && 'bg-destructive/10',
                      isProcessing && recipient.status === 'pending' && 'animate-pulse-soft'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="py-3 px-4">
                      {getStatusIcon(recipient.status)}
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">
                      {editingId === recipient.id ? (
                        <Input
                          value={recipient.phoneNumber}
                          onChange={(e) =>
                            handleUpdateRecipient(
                              recipient.id,
                              'phoneNumber',
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                        />
                      ) : (
                        recipient.phoneNumber
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {editingId === recipient.id ? (
                        <Input
                          value={recipient.fullName}
                          onChange={(e) =>
                            handleUpdateRecipient(
                              recipient.id,
                              'fullName',
                              e.target.value
                            )
                          }
                          className="h-8 text-sm"
                        />
                      ) : (
                        recipient.fullName
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      {editingId === recipient.id ? (
                        <Input
                          type="number"
                          value={recipient.amount}
                          onChange={(e) =>
                            handleUpdateRecipient(
                              recipient.id,
                              'amount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="h-8 text-sm text-right"
                        />
                      ) : (
                        formatCurrency(recipient.amount)
                      )}
                    </td>
                    {!isProcessing && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditingId(
                                editingId === recipient.id ? null : recipient.id
                              )
                            }
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveRecipient(recipient.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
