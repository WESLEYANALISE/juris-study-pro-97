import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Questao } from '@/types/simulados';

export default function SimuladoResultado() {
  const { sessaoId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<any>(null);
  const [respostas, setRespostas] = useState<any[]>([]);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [respostasIds, setRespostasIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadResultado() {
      try {
        if (!sessaoId) return;

        // Fetch simulado session
        const { data: sessao, error: sessaoError } = await supabase
          .from('simulado_sessoes')
          .select('*')
          .eq('id', sessaoId)
          .single();

        if (sessaoError) {
          console.error('Error fetching simulado session:', sessaoError);
          return;
        }

        // Fetch user responses
        const { data: respostasData, error: respostasError } = await supabase
          .from('simulado_respostas')
          .select('*')
          .eq('sessao_id', sessaoId);

        if (respostasError) {
          console.error('Error fetching respostas:', respostasError);
          return;
        }

        if (respostasData) {
          setRespostas(respostasData);
          // Extract question IDs from responses
          const ids = respostasData.map(r => r.questao_id);
          setRespostasIds(ids);
        }

        setResultado(sessao);
      } catch (err) {
        console.error('Error loading resultado:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResultado();
  }, [sessaoId, navigate]);

  // Load the questions details
  useEffect(() => {
    async function loadQuestoesDetails() {
      try {
        if (!respostasIds.length || !resultado) return;

        const categoria = resultado.categoria;
        if (!categoria) return;
        
        // Map category to the correct table name
        let tableName = '';
        switch(categoria) {
          case 'OAB': tableName = 'simulados_oab'; break;
          case 'PRF': tableName = 'simulados_prf'; break;
          case 'PF': tableName = 'simulados_pf'; break;
          case 'TJSP': tableName = 'simulados_tjsp'; break;
          case 'JUIZ': tableName = 'simulados_juiz'; break;
          case 'PROMOTOR': tableName = 'simulados_promotor'; break;
          case 'DELEGADO': tableName = 'simulados_delegado'; break;
          default: 
            console.error('Invalid category:', categoria);
            return;
        }

        // Fix for TypeScript error by using type assertion for dynamic table name
        const { data, error } = await supabase
          .from(tableName as any) // Type assertion for dynamic table name
          .select('*')
          .in('id', respostasIds);

        if (error) {
          console.error('Error fetching questoes details:', error);
          return;
        }

        if (data) {
          // Map the data to match the Questao interface with null checks
          const formattedQuestoes: Questao[] = data.map((q: any) => ({
            id: q?.id || '',
            questao: q?.questao || '',
            alternativa_a: q?.alternativa_a || '',
            alternativa_b: q?.alternativa_b || '',
            alternativa_c: q?.alternativa_c || '',
            alternativa_d: q?.alternativa_d || '',
            alternativa_e: q?.alternativa_e || '',
            resposta_correta: q?.alternativa_correta || '',
            ano: q?.ano?.toString() || '',
            banca: q?.banca || '',
            numero_questao: q?.numero_questao?.toString() || '',
            explicacao: q?.explicacao || '',
            area: q?.area || '',
          }));
          
          setQuestoes(formattedQuestoes);
        }
      } catch (err) {
        console.error('Error in loadQuestoesDetails:', err);
      }
    }

    if (respostasIds.length > 0 && resultado) {
      loadQuestoesDetails();
    }
  }, [respostasIds, resultado]);

  // Helper function to get questao by ID with null check
  const getQuestaoById = (id: string): Questao | null => {
    return questoes.find(q => q && q.id === id) || null;
  };

  // Render alternatives with null check
  const renderAlternativas = (questaoId: string) => {
    const questao = getQuestaoById(questaoId);
    if (!questao) return null; // Null check

    return (
      <div className="mt-4">
        {/* Alternative display code here */}
      </div>
    );
  };

  // rest of the component ...
  return (
    <div>
      {/* Render your simulado results here */}
      <h1>Resultado do Simulado</h1>
      {/* Rest of your JSX */}
    </div>
  );
}
