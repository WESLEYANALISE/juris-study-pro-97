
-- Create tables for jogos_rpg_cenarios if they don't exist
CREATE TABLE IF NOT EXISTS jogos_rpg_cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  situacao_inicial TEXT NOT NULL,
  opcoes JSONB NOT NULL,
  consequencias JSONB NOT NULL,
  area_direito TEXT NOT NULL,
  nivel_dificuldade TEXT DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tables for jogos_rpg_progresso if they don't exist
CREATE TABLE IF NOT EXISTS jogos_rpg_progresso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cenario_id UUID NOT NULL REFERENCES jogos_rpg_cenarios(id),
  jogo_id TEXT NOT NULL,
  caminho_escolhido JSONB,
  pontuacao INTEGER NOT NULL DEFAULT 0,
  completado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert a sample scenario for testing
INSERT INTO jogos_rpg_cenarios (titulo, descricao, situacao_inicial, opcoes, consequencias, area_direito, nivel_dificuldade)
VALUES (
  'O Caso do Contrato Controverso',
  'Um cliente procura sua ajuda com um contrato que pode ter cláusulas abusivas.',
  'Seu cliente, João Silva, assinou um contrato de financiamento imobiliário sem ler todas as cláusulas. Agora ele descobriu que existe uma multa de 50% em caso de quitação antecipada.',
  '{
    "A": "Propor uma ação revisional de contrato alegando abusividade",
    "B": "Tentar uma negociação extrajudicial com o banco",
    "C": "Orientar o cliente a continuar pagando normalmente"
  }',
  '{
    "A": "Você ingressou com a ação revisional. O juiz concedeu liminar suspendendo a cobrança da multa enquanto o processo tramita. O banco contestou alegando que a cláusula está de acordo com as normas do Banco Central.",
    "B": "Você agendou uma reunião com o banco. O gerente ouviu atentamente e propôs reduzir a multa para 20%, mas não eliminar completamente.",
    "C": "O cliente seguiu pagando normalmente, mas ficou insatisfeito com a orientação. Meses depois, ele o procurou novamente informando que precisou vender o imóvel e foi obrigado a pagar a multa integral."
  }',
  'Direito Civil',
  'iniciante'
);
