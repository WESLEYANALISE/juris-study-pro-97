
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { FaculdadeSelector } from '@/components/curriculum/FaculdadeSelector';
import { PeriodoTabs } from '@/components/curriculum/PeriodoTabs';
import { DisciplinasList } from '@/components/curriculum/DisciplinasList';
import { SearchDisciplina } from '@/components/curriculum/SearchDisciplina';
import { LoadingState } from '@/components/ui/loading-state';
import { Container } from '@/components/ui/container';
import { useCurriculum } from '@/hooks/use-curriculum';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader } from '@/components/curriculum/PageHeader';
import { Button } from '@/components/ui/button';
import { InfoCircle } from 'lucide-react';

export function PlanosEnsino() {
  const { isSignedIn } = useAuth();
  const [selectedFaculdadeId, setSelectedFaculdadeId] = useState<string | undefined>();
  const [selectedGradeId, setSelectedGradeId] = useState<string | undefined>();
  
  const {
    faculdades,
    grades,
    disciplinas,
    periodos,
    userProgress,
    selectedPeriodo,
    setSelectedPeriodo,
    searchQuery,
    setSearchQuery,
    isLoading
  } = useCurriculum(selectedFaculdadeId, selectedGradeId);

  // Handle faculdade selection
  const handleFaculdadeChange = (faculdadeId: string) => {
    setSelectedFaculdadeId(faculdadeId);
    setSelectedGradeId(undefined); // Reset grade when faculdade changes
  };

  // Handle grade selection
  const handleGradeChange = (gradeId: string) => {
    setSelectedGradeId(gradeId);
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!disciplinas || disciplinas.length === 0 || !userProgress) return 0;
    
    const completedDisciplinas = userProgress.filter(p => p.status === 'concluido').length;
    const totalDisciplinas = disciplinas.length;
    return Math.round((completedDisciplinas / totalDisciplinas) * 100);
  };

  return (
    <Layout>
      <Container>
        <PageHeader 
          title="Planos de Ensino"
          description="Explore os currículos de direito, acompanhe seu progresso e organize seus estudos"
          progress={calculateOverallProgress()}
          showProgress={isSignedIn && !!selectedGradeId}
        />
        
        <div className="mb-6">
          <FaculdadeSelector 
            faculdades={faculdades || []}
            selectedFaculdadeId={selectedFaculdadeId}
            onFaculdadeChange={handleFaculdadeChange}
            grades={grades || []}
            selectedGradeId={selectedGradeId}
            onGradeChange={handleGradeChange}
            isLoading={isLoading}
          />
        </div>
        
        {selectedGradeId ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="w-full md:w-2/3">
                <SearchDisciplina 
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
              
              {!searchQuery && (
                <div className="w-full md:w-1/3">
                  <PeriodoTabs 
                    periodos={periodos || []}
                    selectedPeriodo={selectedPeriodo}
                    onChange={setSelectedPeriodo}
                  />
                </div>
              )}
            </div>
            
            {isLoading ? (
              <LoadingState count={3} variant="skeleton" height="h-32" />
            ) : disciplinas && disciplinas.length > 0 ? (
              <DisciplinasList 
                disciplinas={disciplinas}
                userProgress={userProgress || []}
                searchActive={!!searchQuery}
              />
            ) : (
              <div className="text-center py-16 border rounded-lg bg-muted/20">
                <InfoCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma disciplina encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? "Tente outro termo de pesquisa" 
                    : "Não existem disciplinas cadastradas para este período"}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedPeriodo(1);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <InfoCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Selecione uma faculdade e curso</h3>
            <p className="text-muted-foreground">
              Escolha uma faculdade e curso para visualizar as disciplinas
            </p>
          </div>
        )}
      </Container>
    </Layout>
  );
}

export default PlanosEnsino;
