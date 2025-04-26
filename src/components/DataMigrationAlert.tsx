
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowUpRight, CheckCircle, Loader2 } from 'lucide-react';
import { useDataMigration } from '@/hooks/useDataMigration';

export function DataMigrationAlert() {
  const { 
    migrationRunning, 
    flashcardsMigrated, 
    bibliotecaMigrated,
    error,
    runMigration 
  } = useDataMigration();
  
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    // Check if the user has dismissed the alert in this session
    const isDismissed = sessionStorage.getItem('migration-alert-dismissed') === 'true';
    setDismissed(isDismissed);
  }, []);
  
  const handleDismiss = () => {
    sessionStorage.setItem('migration-alert-dismissed', 'true');
    setDismissed(true);
  };
  
  // If everything is migrated or the alert was dismissed, don't show anything
  if ((flashcardsMigrated && bibliotecaMigrated) || dismissed) {
    return null;
  }
  
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4 mt-1" />
      <div className="flex-1">
        <AlertTitle>Migração de Dados Necessária</AlertTitle>
        <AlertDescription className="text-sm">
          <p>
            É necessário migrar dados para as novas tabelas otimizadas.
            Este processo é rápido e não afetará seus dados existentes.
          </p>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              {flashcardsMigrated ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              <span>Migração de Flashcards: {flashcardsMigrated ? 'Concluída' : 'Pendente'}</span>
            </div>
            <div className="flex items-center gap-2">
              {bibliotecaMigrated ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              <span>Migração da Biblioteca: {bibliotecaMigrated ? 'Concluída' : 'Pendente'}</span>
            </div>
          </div>
          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              onClick={runMigration} 
              disabled={migrationRunning}
            >
              {migrationRunning && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {migrationRunning ? 'Migrando...' : 'Iniciar Migração'}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDismiss}
            >
              Dispensar
            </Button>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
