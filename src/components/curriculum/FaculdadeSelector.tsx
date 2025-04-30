
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import type { Faculdade, GradeCurricular } from '@/types/curriculum';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface FaculdadeSelectorProps {
  faculdades: Faculdade[];
  selectedFaculdadeId?: string;
  onFaculdadeChange: (faculdadeId: string) => void;
  grades: GradeCurricular[];
  selectedGradeId?: string;
  onGradeChange: (gradeId: string) => void;
  isLoading: boolean;
}

export function FaculdadeSelector({
  faculdades,
  selectedFaculdadeId,
  onFaculdadeChange,
  grades,
  selectedGradeId,
  onGradeChange,
  isLoading
}: FaculdadeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label htmlFor="faculdade-select" className="text-sm font-medium">
          Faculdade
        </label>
        <Select 
          value={selectedFaculdadeId} 
          onValueChange={onFaculdadeChange}
          disabled={isLoading || faculdades.length === 0}
        >
          <SelectTrigger id="faculdade-select" className="w-full">
            <SelectValue placeholder="Selecione uma faculdade">
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" /> 
                  Carregando...
                </div>
              ) : (
                selectedFaculdadeId 
                  ? faculdades.find(f => f.id === selectedFaculdadeId)?.nome || "Selecione uma faculdade"
                  : "Selecione uma faculdade"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {faculdades.map(faculdade => (
              <SelectItem key={faculdade.id} value={faculdade.id}>
                {faculdade.nome} ({faculdade.sigla})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="curso-select" className="text-sm font-medium">
          Curso
        </label>
        <Select 
          value={selectedGradeId} 
          onValueChange={onGradeChange}
          disabled={isLoading || !selectedFaculdadeId || grades.length === 0}
        >
          <SelectTrigger id="curso-select" className="w-full">
            <SelectValue placeholder="Selecione um curso">
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" /> 
                  Carregando...
                </div>
              ) : (
                selectedGradeId 
                  ? grades.find(g => g.id === selectedGradeId)?.nome || "Selecione um curso"
                  : "Selecione um curso"
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {grades.map(grade => (
              <SelectItem key={grade.id} value={grade.id}>
                {grade.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
