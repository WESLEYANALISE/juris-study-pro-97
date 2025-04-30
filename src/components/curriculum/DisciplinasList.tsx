
import React from 'react';
import { DisciplinaCard } from './DisciplinaCard';
import type { Disciplina, UserProgressoDisciplina } from '@/types/curriculum';

interface DisciplinasListProps {
  disciplinas: Disciplina[];
  userProgress: UserProgressoDisciplina[];
  searchActive: boolean;
}

export function DisciplinasList({ disciplinas, userProgress, searchActive }: DisciplinasListProps) {
  // Group disciplines by period if search is active
  const groupedDisciplinas = React.useMemo(() => {
    if (!searchActive) {
      return { [disciplinas[0]?.periodo || 1]: disciplinas };
    }

    const grouped: Record<number, Disciplina[]> = {};
    
    disciplinas.forEach(disciplina => {
      if (!grouped[disciplina.periodo]) {
        grouped[disciplina.periodo] = [];
      }
      grouped[disciplina.periodo].push(disciplina);
    });
    
    return grouped;
  }, [disciplinas, searchActive]);

  // Sort periods numerically
  const sortedPeriods = Object.keys(groupedDisciplinas)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="space-y-8">
      {sortedPeriods.map(periodo => (
        <div key={periodo}>
          {/* Show period header only if search is active and there are multiple periods */}
          {searchActive && sortedPeriods.length > 1 && (
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm">
                {periodo}º
              </span>
              <span>Período</span>
            </h2>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedDisciplinas[periodo].map(disciplina => {
              const progress = userProgress.find(p => p.disciplina_id === disciplina.id);
              
              return (
                <DisciplinaCard 
                  key={disciplina.id}
                  disciplina={disciplina}
                  userProgress={progress}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
