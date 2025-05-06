
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'questao' | 'livro' | 'artigo' | 'video' | 'podcast';
  area: string;
  url: string;
}

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const search = async (query: string) => {
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      // Search in questions
      const { data: questoes, error: questoesError } = await supabase
        .from('questoes')
        .select('id, QuestionText, Area, Tema')
        .ilike('QuestionText', `%${query}%`)
        .limit(5);

      if (questoesError) throw questoesError;

      // Search in biblioteca
      const { data: livros, error: livrosError } = await supabase
        .from('biblioteca_juridica10')
        .select('id, titulo, categoria, descricao')
        .ilike('titulo', `%${query}%`)
        .limit(5);

      if (livrosError) throw livrosError;

      // Fixed approach - search in specific vademecum tables
      const vademecumResults: any[] = [];
      
      // Search in Código Penal
      const { data: codigoPenal, error: codigoPenalError } = await supabase
        .from('Código_Penal')
        .select('id, artigo, numero')
        .ilike('artigo', `%${query}%`)
        .limit(3);
        
      if (!codigoPenalError && codigoPenal) {
        vademecumResults.push(...codigoPenal.map(item => ({
          ...item,
          lawName: 'Código_Penal'
        })));
      }
      
      // Search in Código Civil
      const { data: codigoCivil, error: codigoCivilError } = await supabase
        .from('Código_Civil')
        .select('id, artigo, numero')
        .ilike('artigo', `%${query}%`)
        .limit(3);
        
      if (!codigoCivilError && codigoCivil) {
        vademecumResults.push(...codigoCivil.map(item => ({
          ...item,
          lawName: 'Código_Civil'
        })));
      }
      
      // Search in Constituicao Federal
      const { data: constituicao, error: constituicaoError } = await supabase
        .from('Constituicao_Federal')
        .select('id, artigo, numero')
        .ilike('artigo', `%${query}%`)
        .limit(3);
        
      if (!constituicaoError && constituicao) {
        vademecumResults.push(...constituicao.map(item => ({
          ...item,
          lawName: 'Constituicao_Federal'
        })));
      }

      // Combine all results
      const combinedResults: SearchResult[] = [
        ...(questoes || []).map(q => ({
          id: String(q.id),
          title: q.QuestionText?.substring(0, 60) + '...' || 'Questão',
          description: `Área: ${q.Area || 'Geral'}, Tema: ${q.Tema || 'Geral'}`,
          type: 'questao' as const,
          area: q.Area || 'Geral',
          url: `/questoes?id=${q.id}`
        })),
        ...(livros || []).map(l => ({
          id: String(l.id),
          title: l.titulo || 'Livro',
          description: l.descricao?.substring(0, 100) + '...' || 'Sem descrição',
          type: 'livro' as const,
          area: l.categoria || 'Geral',
          url: `/biblioteca-juridica?id=${l.id}`
        })),
        ...vademecumResults.map(v => ({
          id: String(v.id),
          title: `${v.lawName.replace(/_/g, ' ')} - Art. ${v.numero || ''}`,
          description: v.artigo?.substring(0, 100) + '...' || 'Artigo de lei',
          type: 'artigo' as const,
          area: v.lawName.replace(/_/g, ' '),
          url: `/vademecum?law=${v.lawName}&article=${v.numero}`
        }))
      ];

      setResults(combinedResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return {
    search,
    results,
    isSearching,
    hasSearched,
    clearResults: () => {
      setResults([]);
      setHasSearched(false);
    }
  };
}
