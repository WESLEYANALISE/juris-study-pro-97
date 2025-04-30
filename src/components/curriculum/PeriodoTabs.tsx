
import React from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface PeriodoTabsProps {
  periodos: number[];
  selectedPeriodo: number;
  onChange: (periodo: number) => void;
}

export function PeriodoTabs({ periodos, selectedPeriodo, onChange }: PeriodoTabsProps) {
  // Convert periods to strings for the Tabs component
  const periodosStrings = periodos.map(p => p.toString());
  
  return (
    <Tabs 
      value={selectedPeriodo.toString()} 
      onValueChange={(value) => onChange(parseInt(value))}
      className="w-full"
    >
      <TabsList className="w-full grid grid-cols-5">
        {periodos.slice(0, 5).map((periodo) => (
          <TabsTrigger key={periodo} value={periodo.toString()}>
            {periodo}º
          </TabsTrigger>
        ))}
      </TabsList>
      
      {/* Show more periods if available */}
      {periodos.length > 5 && (
        <TabsList className="w-full grid grid-cols-5 mt-1">
          {periodos.slice(5, 10).map((periodo) => (
            <TabsTrigger key={periodo} value={periodo.toString()}>
              {periodo}º
            </TabsTrigger>
          ))}
        </TabsList>
      )}
    </Tabs>
  );
}
