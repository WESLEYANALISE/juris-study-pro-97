
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, CheckCircle } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  progress?: number;
  showProgress?: boolean;
}

export function PageHeader({ title, description, progress = 0, showProgress = false }: PageHeaderProps) {
  return (
    <div className="py-6 space-y-4">
      <div className="flex items-center gap-2">
        <GraduationCap className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      
      <p className="text-muted-foreground max-w-3xl">
        {description}
      </p>
      
      {showProgress && (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="text-sm flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Seu progresso</span>
            </div>
            <span className="text-sm font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
}
