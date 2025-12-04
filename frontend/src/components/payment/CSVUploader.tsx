import { useCallback, useState } from 'react';
import { Upload, FileText, Download, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { parseCSV, downloadSampleCSV } from '@/utils/helpers';
import { Recipient } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/lib/i18n';

interface CSVUploaderProps {
  onUpload: (recipients: Recipient[]) => void;
}

export const CSVUploader = ({ onUpload }: CSVUploaderProps) => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    count: number;
  } | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv') || file.type !== 'text/csv') {
        toast({
          title: t('Format invalide') || 'Format invalide',
          description: t('Veuillez télécharger  un fichier CSV.') || 'Veuillez télécharger  un fichier CSV.',
          variant: 'destructive',
        });
        return;
      }

      try {
        const content = await file.text();
        const recipients = parseCSV(content);

        if (recipients.length === 0) {
          toast({
            title: t('Fichier vide') || 'Fichier vide',
            description:
              t('Aucun bénéficiaire valide trouvé dans le fichier.') || 'Aucun bénéficiaire valide trouvé dans le fichier.',
            variant: 'destructive',
          });
          return;
        }

        setUploadedFile({ name: file.name, count: recipients.length });
        onUpload(recipients);

        toast({
          title: t('Fichier importé') || 'Fichier importé',
          description: `${recipients.length} ${t('bulk.summary.recipients')} ${t('success').toLowerCase()}.`,
        });
      } catch (error) {
        toast({
          title: t('Erreur de lecture') || 'Erreur de lecture',
          description: t('Impossible de lire le fichier. Vérifiez le format.') || 'Impossible de lire le fichier. Vérifiez le format.',
          variant: 'destructive',
        });
      }
    },
    [onUpload, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const clearFile = () => {
    setUploadedFile(null);
    onUpload([]);
  };

  return (
    <Card className="animate-fade-up">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{t('Étape 1') || 'Étape 1'}</h3>
              <p className="text-sm text-muted-foreground">
                {t('Téléversement CSV') || 'Téléversement CSV'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              className="text-xs"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('Exemple CSV') || 'Exemple CSV'}
            </Button>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 text-center',
              isDragging
                ? 'border-primary bg-accent scale-[1.02]'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-accent">
                  <FileText className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {uploadedFile.count} {t('bulk.summary.recipients')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <>
                <Upload
                  className={cn(
                    'w-12 h-12 mx-auto mb-4 transition-colors',
                    isDragging ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <p className="text-foreground font-medium mb-2">
                  {t('Glissez-déposez votre fichier CSV ici') || 'Glissez-déposez votre fichier CSV ici'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('ou cliquez pour sélectionner depuis votre appareil') || 'ou cliquez pour sélectionner depuis votre appareil'}
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>

          {/* Format Info */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              {t('Format attendu: CSV avec colonnes') || 'Format attendu: CSV avec colonnes'}{' '}
              <code className="px-1 py-0.5 rounded bg-muted text-foreground">
                {t('téléphone, nom, montant') || 'téléphone, nom, montant'}
              </code>
              . {t('Maximum 10 000 lignes.') || 'Maximum 10 000 lignes.'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
