
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MigrationStatus {
  migrationRunning: boolean;
  flashcardsMigrated: boolean;
  bibliotecaMigrated: boolean;
  error: string | null;
}

export function useDataMigration() {
  const [status, setStatus] = useState<MigrationStatus>({
    migrationRunning: false,
    flashcardsMigrated: false,
    bibliotecaMigrated: false,
    error: null,
  });
  const { toast } = useToast();

  const checkMigrationStatus = async () => {
    try {
      // Check if there's any data in the improved tables
      const { count: flashcardsCount } = await supabase
        .from('flash_cards_improved')
        .select('*', { count: 'exact', head: true });
      
      const { count: bibliotecaCount } = await supabase
        .from('biblioteca_juridica_improved')
        .select('*', { count: 'exact', head: true });
      
      setStatus(prev => ({
        ...prev,
        flashcardsMigrated: !!flashcardsCount && flashcardsCount > 0,
        bibliotecaMigrated: !!bibliotecaCount && bibliotecaCount > 0,
      }));
      
      return {
        flashcardsMigrated: !!flashcardsCount && flashcardsCount > 0,
        bibliotecaMigrated: !!bibliotecaCount && bibliotecaCount > 0,
      };
    } catch (error) {
      console.error('Error checking migration status:', error);
      return {
        flashcardsMigrated: false,
        bibliotecaMigrated: false,
      };
    }
  };
  
  const runMigration = async () => {
    try {
      setStatus(prev => ({ ...prev, migrationRunning: true, error: null }));
      
      // Run the migration function for flashcards
      await supabase.rpc('migrate_flashcards_data');
      
      // Run the migration function for biblioteca
      await supabase.rpc('migrate_biblioteca_data');
      
      // Verify migration was successful
      const migrationStatus = await checkMigrationStatus();
      
      setStatus(prev => ({
        ...prev,
        migrationRunning: false,
        flashcardsMigrated: migrationStatus.flashcardsMigrated,
        bibliotecaMigrated: migrationStatus.bibliotecaMigrated,
      }));
      
      toast({
        title: "Migração concluída",
        description: "Os dados foram migrados com sucesso para as novas tabelas.",
      });
      
      return true;
    } catch (error) {
      console.error('Error running migration:', error);
      setStatus(prev => ({
        ...prev,
        migrationRunning: false,
        error: 'Ocorreu um erro durante a migração de dados.',
      }));
      
      toast({
        title: "Erro na migração",
        description: "Ocorreu um erro durante a migração de dados.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Check migration status on component mount
  useEffect(() => {
    checkMigrationStatus();
  }, []);
  
  return {
    ...status,
    runMigration,
    checkMigrationStatus,
  };
}
