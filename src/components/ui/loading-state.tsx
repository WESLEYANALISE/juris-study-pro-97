
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'spinner' | 'skeleton';
  count?: number;
  height?: string | number;
  width?: string | number;
  message?: string;
  inline?: boolean;
  centered?: boolean;
}

export function LoadingState({
  variant = 'spinner',
  count = 1,
  height = 'h-16',
  width = 'w-full',
  message = 'Carregando...',
  inline = false,
  centered = true,
  className,
  ...props
}: LoadingStateProps) {
  const renderContent = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center justify-center">
            <LoadingSpinner className="h-8 w-8 mb-2" />
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </div>
        );
      case 'skeleton':
        return (
          <>
            {Array(count)
              .fill(0)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(typeof height === 'string' ? height : `h-${height}`, typeof width === 'string' ? width : `w-${width}`, 'mb-2 last:mb-0')}
                />
              ))}
          </>
        );
    }
  };

  return (
    <div 
      className={cn(
        inline ? 'inline-block' : 'block', 
        centered ? 'flex items-center justify-center' : '',
        'animate-pulse min-h-[40px]',
        className
      )}
      {...props}
    >
      {renderContent()}
    </div>
  );
}
