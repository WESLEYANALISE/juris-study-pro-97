
-- Insert sample data for testing

-- Sample escritório virtual cases
INSERT INTO jogos_escritorio_casos (titulo, descricao, cliente, problema)
VALUES
  ('Revisão Contratual', 'Caso de revisão de contrato de financiamento com cláusulas abusivas', 'Maria Silva', 'Cliente pagou juros abusivos em financiamento de veículo'),
  ('Ação de Danos Morais', 'Cliente sofreu constrangimento em estabelecimento comercial', 'João Santos', 'Cliente foi acusado injustamente de furto em supermercado');

-- Sample card decks
INSERT INTO jogos_cartas_baralhos (nome, descricao, area_direito, nivel_dificuldade)
VALUES
  ('Código Civil - Parte Geral', 'Artigos fundamentais da parte geral do Código Civil', 'Direito Civil', 'iniciante'),
  ('Código de Defesa do Consumidor', 'Principais artigos do CDC', 'Direito do Consumidor', 'intermediário');

-- Sample articles for the decks
INSERT INTO jogos_cartas_artigos (baralho_id, lei, artigo, texto, pontos)
VALUES
  ((SELECT id FROM jogos_cartas_baralhos WHERE nome = 'Código Civil - Parte Geral' LIMIT 1), 
   'Código Civil', 'Art. 1º', 'Toda pessoa é capaz de direitos e deveres na ordem civil.', 1),
  ((SELECT id FROM jogos_cartas_baralhos WHERE nome = 'Código Civil - Parte Geral' LIMIT 1), 
   'Código Civil', 'Art. 2º', 'A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.', 2),
  ((SELECT id FROM jogos_cartas_baralhos WHERE nome = 'Código de Defesa do Consumidor' LIMIT 1), 
   'CDC', 'Art. 6º', 'São direitos básicos do consumidor: a proteção da vida, saúde e segurança contra os riscos provocados por práticas no fornecimento de produtos e serviços considerados perigosos ou nocivos.', 2);
