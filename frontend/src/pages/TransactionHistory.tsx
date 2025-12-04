import { useEffect, useState } from 'react';
import { History, Send, Users, CheckCircle, XCircle, AlertCircle, Calendar, Trash2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { cn } from '@/lib/utils';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const stored = localStorage.getItem('transactions');
    if (stored) {
      const raw = JSON.parse(stored) as Array<Omit<Transaction, 'createdAt'> & { createdAt: string }>;
      const parsed: Transaction[] = raw.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
      }));
      setTransactions(parsed);
    }
  };

  const clearHistory = () => {
    localStorage.removeItem('transactions');
    setTransactions([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <History className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'Réussi';
      case 'failed':
        return 'Échec';
      case 'partial':
        return 'Partiel';
      default:
        return 'En cours';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calculate stats
  const stats = {
    total: transactions.length,
    successful: transactions.filter(t => t.status === 'success').length,
    totalAmount: transactions
      .filter(t => t.status === 'success' || t.status === 'partial')
      .reduce((sum, t) => sum + t.totalAmount, 0),
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Historique
            </h1>
            <p className="text-muted-foreground">
              Consultez l'historique de vos transactions
            </p>
          </div>
          {transactions.length > 0 && (
            <Button variant="outline" onClick={clearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Effacer l'historique
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total transactions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Réussies</p>
                  <p className="text-2xl font-bold text-foreground">{stats.successful}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                  <Send className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalAmount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions récentes</CardTitle>
            <CardDescription>
              Liste de toutes vos transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <History className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  Aucune transaction
                </p>
                <p className="text-muted-foreground">
                  Vos transactions apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        transaction.type === 'individual'
                          ? 'gradient-primary'
                          : 'gradient-secondary'
                      )}
                    >
                      {transaction.type === 'individual' ? (
                        <Send className="w-6 h-6 text-primary-foreground" />
                      ) : (
                        <Users className="w-6 h-6 text-secondary-foreground" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">
                          {transaction.type === 'individual'
                            ? transaction.recipient?.fullName
                            : `${transaction.recipients?.length || 0} bénéficiaires`}
                        </p>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(transaction.createdAt)}</span>
                        {transaction.type === 'bulk' && transaction.successCount !== undefined && (
                          <span className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs">
                            {transaction.successCount} réussis, {transaction.failedCount} échecs
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(transaction.totalAmount)}
                      </p>
                      <p
                        className={cn(
                          'text-sm font-medium',
                          transaction.status === 'success' && 'text-primary',
                          transaction.status === 'failed' && 'text-destructive',
                          transaction.status === 'partial' && 'text-orange-500'
                        )}
                      >
                        {getStatusLabel(transaction.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TransactionHistory;
