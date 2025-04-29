
import React from 'react';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';

interface VadeMecumErrorProps {
  error: string;
  onRetry: () => void;
}

export const VadeMecumError = ({ error, onRetry }: VadeMecumErrorProps) => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-destructive">Erro ao carregar conteúdo</h3>
            <div className="mt-2 text-sm">
              <p>{error}</p>
              <Button onClick={onRetry} className="mt-4 gap-2" variant="outline">
                <ReloadIcon className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VadeMecumError;
