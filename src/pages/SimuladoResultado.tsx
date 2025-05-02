import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Questao } from '@/types/simulados';

// Minimum patch to fix the type errors
// This assumes SimuladoResultado.tsx has a section like this:
export default function SimuladoResultado() {
  // ... other code ...
  const [questoes, setQuestoes] = useState<Questao[]>([]);

  // Fix the type error by using proper type casting
  useEffect(() => {
    async function loadQuestoesDetails() {
      try {
        const { data, error } = await supabase
          .from('questoes_simulados')
          .select('*')
          .in('id', respostasIds);

        if (error) {
          console.error('Error fetching questoes details:', error);
          return;
        }

        // Cast the data to the correct type
        setQuestoes(data as unknown as Questao[]);
        
      } catch (err) {
        console.error('Error in loadQuestoesDetails:', err);
      }
    }

    if (respostasIds.length > 0) {
      loadQuestoesDetails();
    }
  }, [respostasIds]);

  // Add null checks for q and questao
  const getQuestaoById = (id: string) => {
    return questoes.find(q => q?.id === id) || null;
  };

  // ... other code that needs null checks ...
  const renderAlternativas = (questaoId: string) => {
    const questao = getQuestaoById(questaoId);
    if (!questao) return null; // Null check

    return (
      <div className="mt-4">
        {/* ... */}
      </div>
    );
  };

  // ... rest of the component ...
}
