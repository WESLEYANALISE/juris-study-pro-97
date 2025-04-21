
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Volume, ArrowLeft, X, Calendar, Share2, Bookmark } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

type Article = {
  id: number;
  title: string;
  category: string;
  author: string;
  date: string;
  summary: string;
  imageUrl: string;
  source: string;
  content?: string;
  tags?: string[];
};

const mockArticles: Article[] = [
  {
    id: 1,
    title: "As recentes mudanças no Código de Processo Civil",
    category: "Legislação",
    author: "Dr. Paulo Rodrigues",
    date: "20 de Abril, 2025",
    summary: "Análise das alterações mais significativas no CPC e seus impactos na prática jurídica.",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
    source: "Jus Brasil",
    tags: ["CPC", "Reforma", "Processo Civil"],
    content: `
# As recentes mudanças no Código de Processo Civil

O Código de Processo Civil brasileiro passou por significativas alterações nos últimos meses, modificando procedimentos importantes e impactando diretamente a prática jurídica em todo o país.

## Principais alterações

### 1. Novo sistema de precedentes

A reforma consolidou o sistema de precedentes, estabelecendo que decisões do STF e STJ têm força vinculante para todos os juízos inferiores. Isso representa uma aproximação do nosso sistema processual com elementos do Common Law, visando maior segurança jurídica e previsibilidade das decisões.

### 2. Ampliação da autocomposição

Houve um fortalecimento significativo dos mecanismos de autocomposição, com a obrigatoriedade de audiências de conciliação e mediação como etapa prévia ao processo contencioso em mais casos que anteriormente.

### 3. Informatização processual

As alterações consolidaram a tendência de informatização do processo, estabelecendo novas regras para peticionamento eletrônico, audiências virtuais e comunicação de atos processuais por meios digitais.

## Impactos na prática jurídica

As mudanças trazem desafios e oportunidades para advogados:

1. Necessidade de adaptação às novas tecnologias processuais
2. Maior ênfase em habilidades de negociação e conciliação
3. Importância crescente do domínio da jurisprudência consolidada
4. Possibilidade de resolução mais célere de demandas

## Como se preparar

Para os profissionais do Direito, é fundamental:

- Investir em formação continuada sobre as novas regras processuais
- Aprimorar conhecimentos em métodos alternativos de resolução de conflitos
- Familiarizar-se com as ferramentas tecnológicas do processo eletrônico
- Acompanhar de perto a formação dos precedentes vinculantes

## Considerações finais

As alterações no CPC representam uma evolução necessária do sistema processual brasileiro, buscando maior eficiência e celeridade. No entanto, sua efetividade dependerá da correta implementação pelos tribunais e da adaptação adequada dos operadores do Direito.
    `
  },
  {
    id: 2,
    title: "Concurso para Defensoria Pública: o que esperar em 2025",
    category: "Concursos",
    author: "Ana Clara Martins",
    date: "18 de Abril, 2025",
    summary: "Guia completo com novidades, disciplinas mais cobradas e estratégias de estudo.",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070",
    source: "Estratégia Concursos",
    tags: ["Defensoria", "Concurso Público", "Estudo"],
    content: `
# Concurso para Defensoria Pública: o que esperar em 2025

Os concursos para Defensoria Pública estão entre os mais disputados da carreira jurídica, oferecendo remunerações atrativas e estabilidade profissional. Para 2025, diversas unidades da federação já sinalizaram novos certames. Este guia traz informações essenciais para quem deseja iniciar ou intensificar a preparação.

## Concursos previstos para 2025

Conforme anúncios oficiais e previsões orçamentárias, os seguintes concursos devem ocorrer em 2025:

- DPE-SP: 100 vagas previstas
- DPE-RJ: 60 vagas previstas
- DPE-MG: 40 vagas previstas
- DPE-RS: 35 vagas previstas
- DPU: 120 vagas (nacional)

## Disciplinas mais cobradas

A análise dos últimos concursos revela que as disciplinas com maior peso costumam ser:

1. **Direito Constitucional** - com ênfase em direitos fundamentais e controle de constitucionalidade
2. **Direito Civil** - especialmente responsabilidade civil e direito de família
3. **Direito Processual Civil** - com foco em tutelas provisórias e recursos
4. **Direitos Humanos** - sistemas de proteção internacional e vulnerabilidades
5. **Direito Penal** - teoria do crime e crimes contra a pessoa

## Estratégias de estudo recomendadas

### Ciclo de estudos

Para uma preparação eficiente, recomenda-se:

- **Fase 1 (6 meses)**: Estudo amplo de todas as disciplinas para construção da base teórica
- **Fase 2 (3 meses)**: Aprofundamento nas disciplinas de maior peso
- **Fase 3 (3 meses)**: Revisão intensiva e resolução de questões de provas anteriores

### Material de estudo

- Doutrina atualizada com as recentes alterações legislativas
- Jurisprudência recente dos tribunais superiores
- Questões comentadas de concursos anteriores
- Resumos esquematizados para revisão

## Dicas práticas

1. Acompanhe os informativos semanais dos tribunais superiores
2. Participe de grupos de estudo com outros candidatos
3. Realize simulados periódicos em condições similares às da prova
4. Dedique tempo especial à elaboração de peças práticas
5. Não negligencie disciplinas complementares como Direito da Criança e do Adolescente

## Novidades para 2025

As bancas organizadoras têm sinalizado algumas mudanças:

- Maior ênfase em questões práticas e estudos de caso
- Valorização de conhecimentos sobre justiça restaurativa
- Inclusão de temas relacionados a direito digital e proteção de dados
- Avaliação de habilidades comportamentais nas provas orais

Prepare-se adequadamente e com antecedência. O planejamento e a constância nos estudos são fatores determinantes para o sucesso nestes concursos altamente competitivos.
    `
  },
  {
    id: 3,
    title: "Decisão do STF sobre tributação de heranças gera polêmica",
    category: "Jurisprudência",
    author: "Dr. Carlos Mendes",
    date: "15 de Abril, 2025",
    summary: "Análise do julgamento do recurso extraordinário que fixou nova tese sobre ITCMD.",
    imageUrl: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=2080",
    source: "Consultor Jurídico",
    tags: ["STF", "Tributação", "ITCMD"],
    content: `
# Decisão do STF sobre tributação de heranças gera polêmica

Em julgamento concluído na última semana, o Supremo Tribunal Federal (STF) fixou uma nova tese sobre a incidência do Imposto sobre Transmissão Causa Mortis e Doação (ITCMD), gerando significativa repercussão nos meios jurídicos e tributários.

## A decisão

Por maioria de votos (8x3), o STF estabeleceu que:

*"É constitucional a incidência do ITCMD sobre doações e heranças originadas no exterior, mesmo na ausência de lei complementar federal que regulamente o tema, sendo válidas as leis estaduais editadas até o presente momento para suprir a lacuna normativa."*

O entendimento modifica a interpretação que vinha sendo aplicada ao artigo 155, §1º, III, da Constituição Federal, que atribui a uma lei complementar federal a tarefa de regular a incidência do imposto quando o doador estiver no exterior ou o falecido possuía bens ou era residente fora do país.

## Argumentos majoritários

Na corrente vencedora, prevaleceram os seguintes fundamentos:

1. A ausência de lei complementar não pode significar imunidade tributária não prevista no texto constitucional
2. Os estados têm competência para instituir o ITCMD e não podem ficar indefinidamente impedidos de exercê-la
3. O federalismo fiscal exige soluções que não prejudiquem a autonomia financeira dos entes federados
4. A lacuna normativa já perdura por mais de três décadas, caracterizando omissão legislativa inconstitucional

## Votos divergentes

A divergência, liderada pelo ministro relator, sustentou que:

- A literalidade do texto constitucional exige lei complementar
- Não cabe ao Judiciário suprir omissão do Legislativo
- A segurança jurídica ficaria comprometida com a validação retroativa das leis estaduais

## Impactos práticos

A decisão terá efeitos significativos:

1. Validação das cobranças já realizadas pelos estados que legislaram sobre o tema
2. Possibilidade de novos estados criarem suas próprias regras
3. Potencial aumento da arrecadação estadual
4. Necessidade de planejamento sucessório internacional mais cuidadoso

## Modulação dos efeitos

O STF optou por modular os efeitos da decisão, estabelecendo que:

- As cobranças já realizadas com base em leis estaduais são válidas
- A tese não se aplica a casos com decisão judicial transitada em julgado
- Contribuintes que contestaram administrativamente ainda podem ser cobrados

## Reações e expectativas

Associações de contribuintes criticaram a decisão, argumentando que ela ignora a reserva legal expressa no texto constitucional. Já secretarias estaduais de fazenda celebraram o entendimento, que amplia sua capacidade arrecadatória.

Especialistas recomendam que pessoas com bens no exterior revisem seus planejamentos sucessórios, considerando agora a incidência do ITCMD conforme as legislações estaduais vigentes.
    `
  },
  {
    id: 4,
    title: "IA e Direito: como a inteligência artificial está transformando a advocacia",
    category: "Tecnologia",
    author: "Dra. Roberta Campos",
    date: "12 de Abril, 2025",
    summary: "Ferramentas, aplicações práticas e desafios éticos do uso de IA no mundo jurídico.",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad662?q=80&w=2070",
    source: "Migalhas",
    tags: ["Tecnologia", "IA", "Inovação"],
    content: `
# IA e Direito: como a inteligência artificial está transformando a advocacia

A inteligência artificial (IA) está revolucionando diversos setores da economia, e o mundo jurídico não é exceção. Escritórios de advocacia, departamentos jurídicos e tribunais têm adotado soluções baseadas em IA para otimizar processos, aumentar a eficiência e oferecer melhores serviços. Este artigo explora como essa tecnologia está transformando a prática jurídica no Brasil e no mundo.

## Principais aplicações da IA no Direito

### 1. Pesquisa jurídica avançada

Sistemas de IA conseguem analisar milhares de decisões judiciais, artigos doutrinários e legislação em segundos, identificando padrões decisórios e tendências jurisprudenciais que levariam dias ou semanas para serem encontrados manualmente.

**Exemplos de ferramentas:**
- Ross Intelligence
- Lexis+ AI
- Juris Mentor

### 2. Revisão de documentos e contratos

Algoritmos de processamento de linguagem natural podem revisar contratos extensos, identificando cláusulas específicas, inconsistências e potenciais riscos jurídicos com alta precisão.

**Exemplos de ferramentas:**
- Kira Systems
- Luminance
- ContractPodAi

### 3. Previsão de resultados judiciais

Sistemas preditivos utilizam dados históricos de decisões judiciais para estimar probabilidades de sucesso em litígios, auxiliando na tomada de decisões estratégicas.

**Exemplos de ferramentas:**
- Premonition
- Lex Machina
- Precedent Analytics

### 4. Automação de documentos

Plataformas que geram documentos jurídicos personalizados a partir de templates e informações fornecidas pelo usuário, reduzindo drasticamente o tempo de elaboração.

**Exemplos de ferramentas:**
- DocuSign
- Legito
- ContractExpress

## Benefícios da adoção de IA

1. **Eficiência operacional**: Automação de tarefas repetitivas permite que advogados dediquem mais tempo a atividades de alto valor agregado
2. **Redução de custos**: Diminuição de horas de trabalho em tarefas administrativas e de pesquisa
3. **Precisão aumentada**: Minimização de erros humanos em revisões de documentos e análises de dados
4. **Insights mais profundos**: Descoberta de padrões e correlações não evidentes em grandes volumes de dados jurídicos

## Desafios éticos e regulatórios

Apesar dos benefícios, a adoção de IA no Direito traz desafios importantes:

### Questões éticas

- Responsabilidade por decisões baseadas em recomendações de IA
- Vieses algorítmicos que podem perpetuar discriminações existentes
- Confidencialidade e segurança de dados sensíveis
- Substituição de profissionais e impacto no mercado de trabalho jurídico

### Aspectos regulatórios

- Necessidade de atualização de códigos de ética profissional
- Regulamentação do uso de sistemas automatizados em decisões judiciais
- Questões de propriedade intelectual em produções geradas por IA
- Responsabilidade civil por erros de sistemas de IA

## O futuro da advocacia com IA

A integração da inteligência artificial no Direito não pretende substituir advogados, mas transformar a forma como trabalham. O futuro aponta para um modelo de "advogado aumentado", onde profissionais utilizam IA como ferramenta para ampliar suas capacidades.

Para se preparar para esse cenário, recomenda-se:

1. Desenvolver familiaridade com ferramentas tecnológicas
2. Fortalecer habilidades exclusivamente humanas (empatia, criatividade, pensamento crítico)
3. Compreender os fundamentos da IA para avaliar criticamente suas limitações
4. Adotar uma mentalidade de aprendizado contínuo e adaptação

## Conclusão

A inteligência artificial já é uma realidade no mundo jurídico e continuará a evoluir nos próximos anos. Os profissionais que conseguirem integrar essas ferramentas à sua prática, mantendo o foco nos aspectos humanos da advocacia, estarão melhor posicionados para prosperar nesse novo cenário tecnológico.
    `
  },
  {
    id: 5,
    title: "Nova Lei de Licitações: guia prático para gestores públicos",
    category: "Administrativo",
    author: "Dr. Fernando Oliveira",
    date: "10 de Abril, 2025",
    summary: "Orientações práticas sobre as principais mudanças e como implementá-las corretamente.",
    imageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070",
    source: "CONJUR",
    tags: ["Licitações", "Administração Pública", "Contratos"],
    content: `
# Nova Lei de Licitações: guia prático para gestores públicos

A Lei nº 14.133/2021, conhecida como Nova Lei de Licitações e Contratos Administrativos, trouxe significativas mudanças ao regime de contratações públicas no Brasil. Este guia apresenta orientações práticas para gestores públicos implementarem corretamente as novas regras, evitando problemas e maximizando a eficiência nas contratações.

## Principais inovações da Nova Lei

### 1. Modalidades de licitação

A nova legislação manteve o pregão e a concorrência, extinguiu as modalidades tomada de preços e convite, e criou o diálogo competitivo. Cada modalidade possui características específicas:

**Concorrência**: Utilizada para contratações de maior valor e complexidade.
**Pregão**: Mantida para aquisição de bens e serviços comuns.
**Diálogo Competitivo**: Nova modalidade para contratações que envolvam inovação tecnológica ou técnica.

### 2. Procedimentos auxiliares

Foram institucionalizados importantes procedimentos auxiliares:

- Credenciamento
- Pré-qualificação
- Procedimento de Manifestação de Interesse (PMI)
- Sistema de Registro de Preços (SRP)
- Registro Cadastral

### 3. Fases da licitação

O procedimento foi reorganizado em fases mais lógicas:

1. Preparatória
2. Divulgação do edital
3. Apresentação de propostas e lances
4. Julgamento
5. Habilitação
6. Recursal
7. Homologação

## Implementação prática para gestores

### Planejamento das contratações

O planejamento tornou-se elemento central na nova lei. Gestores devem:

1. Elaborar o Plano Anual de Contratações
2. Realizar estudo técnico preliminar para cada contratação
3. Definir a matriz de riscos do contrato
4. Elaborar termo de referência detalhado

### Governança das contratações

A legislação estabelece a necessidade de estruturas de governança:

- Agentes de contratação capacitados
- Comissão de contratação para casos complexos
- Gestão por competências na designação de agentes públicos
- Segregação de funções

### Portal Nacional de Contratações Públicas (PNCP)

Todas as licitações devem ser divulgadas no PNCP. Gestores devem:

1. Cadastrar sua entidade no portal
2. Publicar editais, contratos e aditivos
3. Divulgar o Plano Anual de Contratações
4. Manter catálogo eletrônico de produtos e serviços

## Boas práticas recomendadas

### 1. Capacitação contínua

Invista na qualificação técnica dos servidores envolvidos nas contratações, especialmente:

- Agentes de contratação
- Membros das comissões
- Gestores e fiscais de contratos

### 2. Padronização de documentos

Adote modelos padronizados para:

- Editais de licitação
- Minutas de contratos
- Termos de referência
- Estudos técnicos preliminares

### 3. Gestão de riscos

Implemente um sistema efetivo de gestão de riscos nas contratações:

- Identifique riscos potenciais em cada contratação
- Defina medidas de mitigação
- Atribua responsabilidades
- Monitore continuamente

### 4. Compliance e integridade

Adote medidas para garantir a integridade nas contratações:

- Programas de compliance
- Canais de denúncia
- Prevenção de conflitos de interesse
- Transparência em todas as etapas

## Cronograma de transição

A nova lei prevê um período de transição de dois anos, durante o qual convivem os regimes antigo e novo. Gestores devem:

1. Definir estratégia de migração gradual
2. Atualizar normativos internos
3. Capacitar servidores conforme cronograma
4. Adaptar sistemas de informação

## Conclusão

A Nova Lei de Licitações representa uma oportunidade para modernizar as contratações públicas, com foco em eficiência, inovação e combate à corrupção. Gestores que se adaptarem adequadamente às novas regras poderão realizar contratações mais vantajosas e seguras para a administração pública.
    `
  },
  {
    id: 6,
    title: "Como usar a ferramenta de Notas no JurisStudy Pro",
    category: "Tutorial",
    author: "Equipe JurisStudy",
    date: "05 de Abril, 2025",
    summary: "Aprenda a utilizar o sistema de anotações da plataforma para organizar seus estudos jurídicos.",
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=2070",
    source: "JurisStudy Pro",
    tags: ["Tutorial", "Anotações", "Estudo"],
    content: `
# Como usar a ferramenta de Notas no JurisStudy Pro

A ferramenta de Notas do JurisStudy Pro foi projetada para ajudar estudantes e profissionais do Direito a organizarem seus estudos de forma eficiente. Com recursos intuitivos e integração com outras funcionalidades da plataforma, o sistema de anotações pode transformar sua experiência de aprendizado.

## Acessando a ferramenta de Notas

![Tela inicial de Anotações](https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=400)

Para acessar a ferramenta de Notas, siga estes passos:

1. Faça login em sua conta JurisStudy Pro
2. No menu principal, clique em "Anotações"
3. Você será direcionado para o dashboard de anotações, onde poderá visualizar todas as suas notas organizadas por categoria

## Criando uma nova anotação

![Criando uma nova anotação](https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=400)

Para criar uma nova anotação:

1. Clique no botão "+ Nova Anotação" no canto superior direito da tela
2. Escolha um título descritivo para sua anotação
3. Selecione a categoria jurídica relacionada (ex: Direito Civil, Penal, etc)
4. Utilize o editor de texto rico para formatar sua anotação:
   - Negrito, itálico e sublinhado para destacar informações
   - Listas numeradas e com marcadores para organizar tópicos
   - Títulos e subtítulos para estruturar o conteúdo
5. Clique em "Salvar" para armazenar sua anotação

## Organizando suas anotações

![Organizando anotações por categorias](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=400)

O sistema permite organizar suas anotações de diversas formas:

### Por categorias

Use as categorias predefinidas ou crie suas próprias para classificar suas anotações por área do Direito, tipo de conteúdo ou qualquer outra estrutura que preferir.

### Por tags

Adicione tags personalizadas às suas anotações para facilitar buscas futuras. Exemplo:
- #OAB
- #Concursos
- #Jurisprudência
- #Doutrina

### Por favoritos

Marque como favoritas as anotações mais importantes para acesso rápido. Basta clicar no ícone de estrela ao lado de cada anotação.

## Recursos avançados

### Integração com materiais de estudo

Enquanto estiver estudando qualquer conteúdo na plataforma JurisStudy Pro, você pode criar anotações diretamente relacionadas ao material:

1. Durante a leitura de um artigo ou visualização de uma videoaula, clique no ícone de nota
2. Uma janela lateral será aberta para sua anotação
3. A anotação será automaticamente vinculada ao material que você está estudando

### Compartilhamento de anotações

![Compartilhando anotações](https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400)

Você pode compartilhar suas anotações com outros usuários da plataforma:

1. Abra a anotação que deseja compartilhar
2. Clique no botão "Compartilhar" no menu superior
3. Escolha compartilhar por:
   - Link direto
   - E-mail
   - Grupos de estudo (se participar de algum)
4. Defina permissões de visualização ou edição

### Exportação de anotações

Para estudar offline ou imprimir suas anotações:

1. Selecione uma ou várias anotações
2. Clique no botão "Exportar"
3. Escolha o formato desejado (PDF, DOCX, ou TXT)
4. Salve o arquivo em seu dispositivo

## Dicas para uso eficiente

1. **Crie um sistema consistente**: Estabeleça um padrão para suas anotações que facilite a revisão posterior
2. **Utilize cores**: O editor permite destacar textos com cores diferentes para informações de importância variada
3. **Revise periodicamente**: Configure lembretes para revisar suas anotações em intervalos regulares
4. **Vincule conteúdos relacionados**: Use a funcionalidade de links internos para conectar anotações sobre temas relacionados
5. **Utilize a pesquisa avançada**: Aproveite os filtros de busca para encontrar rapidamente informações específicas

## Suporte técnico

Se encontrar dificuldades ao utilizar a ferramenta de Notas, nossa equipe de suporte está disponível:

- Chat ao vivo: clique no ícone de suporte no canto inferior direito da tela
- E-mail: suporte@jurisstudy.pro
- Central de ajuda: acesse a seção "Ajuda" no menu principal

## Próximas atualizações

Em breve, lançaremos novos recursos para a ferramenta de Notas:

- Reconhecimento de voz para criação de anotações por áudio
- Integração com IA para sugestões de conteúdo relacionado
- Sincronização com aplicativos externos de notas
- Templates personalizados para diferentes tipos de anotações

Aproveite ao máximo a ferramenta de Notas para potencializar seus estudos jurídicos!
    `
  },
  {
    id: 7,
    title: "Como otimizar seus estudos com flashcards no JurisStudy Pro",
    category: "Tutorial",
    author: "Equipe JurisStudy",
    date: "02 de Abril, 2025",
    summary: "Guia completo para usar o sistema de flashcards e técnicas de repetição espaçada.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070",
    source: "JurisStudy Pro",
    tags: ["Tutorial", "Flashcards", "Estudo"],
    content: `
# Como otimizar seus estudos com flashcards no JurisStudy Pro

Os flashcards são uma das técnicas de estudo mais eficientes para memorização de conteúdo jurídico. O JurisStudy Pro oferece um sistema avançado de flashcards com repetição espaçada que pode transformar sua forma de estudar. Este tutorial explica como aproveitar ao máximo essa funcionalidade.

## O que é repetição espaçada?

![Gráfico de repetição espaçada](https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400)

A repetição espaçada é uma técnica de aprendizado baseada em evidências científicas sobre como nosso cérebro retém informações. Em vez de revisar o mesmo conteúdo várias vezes em um curto período, você revisa em intervalos crescentes, otimizando a memorização de longo prazo.

O algoritmo do JurisStudy Pro ajusta automaticamente esses intervalos com base no seu desempenho, apresentando com mais frequência os flashcards que você tem dificuldade e espaçando aqueles que você já domina.

## Acessando os flashcards

![Tela de flashcards](https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400)

Para começar a usar os flashcards:

1. Acesse a seção "Flashcards" no menu principal
2. Você verá coleções pré-criadas organizadas por área do Direito
3. Escolha uma coleção ou crie sua própria

## Criando seus próprios flashcards

![Criação de flashcards](https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?q=80&w=400)

Para criar flashcards personalizados:

1. Clique em "Nova Coleção"
2. Dê um nome à sua coleção (ex: "Princípios Constitucionais")
3. Selecione a área do Direito relacionada
4. Adicione flashcards à coleção:
   - Frente: Pergunta ou conceito a ser memorizado
   - Verso: Resposta ou explicação
   - Dica (opcional): Um auxílio para lembrar a resposta

**Dicas para criar bons flashcards:**
- Use o princípio da atomicidade: uma informação por cartão
- Formule perguntas claras e específicas
- Mantenha as respostas concisas
- Inclua exemplos quando possível

## Estudando com flashcards

![Sessão de estudo](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400)

Para iniciar uma sessão de estudo:

1. Selecione a coleção que deseja estudar
2. Clique em "Iniciar Estudo"
3. Um cartão será exibido com a pergunta
4. Tente responder mentalmente
5. Clique para virar o cartão e verificar a resposta
6. Avalie seu conhecimento:
   - "Não sabia": O cartão aparecerá novamente em breve
   - "Difícil": O cartão aparecerá em um intervalo curto
   - "Bom": O cartão aparecerá em um intervalo médio
   - "Fácil": O cartão aparecerá em um intervalo longo

## Recursos avançados dos flashcards

### Multimídia nos cartões

Enriqueça seus flashcards com:
- Imagens (ex: fluxogramas processuais)
- Áudio (ex: pronunciamento correto de termos jurídicos em latim)
- Marcações coloridas para destacar informações essenciais

### Importação de conteúdo

Crie flashcards automaticamente a partir de:
- Anotações feitas na plataforma
- Resumos gerados pela IA
- Arquivos Excel ou CSV

### Modo competitivo

Estude em formato de desafio:
- Marque pontos por respostas corretas
- Compare seu desempenho com outros usuários
- Ganhe medalhas e conquistas por consistência

## Configurando sua rotina de estudos

![Planejamento de estudos](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=400)

Para maximizar a eficiência dos flashcards:

1. Configure a quantidade diária de cartões novos (recomendado: 20-30)
2. Estabeleça um horário fixo para revisar os cartões programados para o dia
3. Ajuste as configurações de repetição conforme sua facilidade de memorização
4. Utilize a função "Lembrete" para receber notificações sobre sua prática diária

## Estatísticas e progresso

Monitore seu desempenho através de:
- Gráficos de evolução diária/semanal/mensal
- Taxa de retenção por tema
- Previsão de domínio completo dos conteúdos
- Identificação de áreas que precisam de mais atenção

## Combinando com outras técnicas

Para resultados ainda melhores, combine flashcards com:
1. **Mapas mentais**: Para entender a relação entre conceitos
2. **Resumos ativos**: Para consolidar o conhecimento
3. **Questões práticas**: Para aplicar o conhecimento memorizado
4. **Explicação em voz alta**: Para verificar seu entendimento

## Exemplos de uso

### Preparação para OAB/concursos:
- Crie cartões com cada artigo-chave dos códigos
- Elabore cartões com jurisprudência relevante
- Faça cartões de revisão das questões que errou em simulados

### Graduação em Direito:
- Prepare cartões com definições de conceitos fundamentais
- Crie cartões de casos emblemáticos
- Faça cartões de citações importantes de doutrinadores

## Suporte e feedback

Estamos constantemente melhorando nossa ferramenta de flashcards:
- Envie sugestões pelo formulário disponível na plataforma
- Participe do programa de beta-testers para acessar novos recursos antes do lançamento
- Acompanhe nosso blog para dicas avançadas sobre técnicas de estudo

Comece hoje mesmo a transformar sua forma de estudar com os flashcards do JurisStudy Pro!
    `
  }
];

const categories = [
  "Todos", "Legislação", "Concursos", "Jurisprudência", "Tecnologia", "Administrativo", "Tutorial"
];

const sources = [
  "Todos", "Jus Brasil", "Consultor Jurídico", "Migalhas", "Conjur", "Estratégia Concursos", "JurisStudy Pro"
];

const Bloger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeSource, setActiveSource] = useState("Todos");
  const [filteredArticles, setFilteredArticles] = useState(mockArticles);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    let result = mockArticles;
    
    if (searchTerm) {
      result = result.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeCategory !== "Todos") {
      result = result.filter(article => article.category === activeCategory);
    }

    if (activeSource !== "Todos") {
      result = result.filter(article => article.source === activeSource);
    }
    
    setFilteredArticles(result);
  }, [searchTerm, activeCategory, activeSource]);

  const narrarTexto = (texto: string) => {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {selectedArticle ? (
          <motion.div 
            key="article-detail"
            className="fixed inset-0 bg-background z-50 overflow-hidden flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b p-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedArticle(null)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1 text-center truncate mx-2">
                <p className="text-sm font-medium">Blog Jurídico</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedArticle(null)}
                className="h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-4 max-w-3xl mx-auto">
                <div 
                  className="h-56 w-full bg-cover bg-center rounded-lg mb-6" 
                  style={{ backgroundImage: `url(${selectedArticle.imageUrl})` }}
                />
                
                <Badge variant="outline" className="mb-2">{selectedArticle.category}</Badge>
                <h1 className="text-2xl font-bold mb-2">{selectedArticle.title}</h1>
                
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
                  <span>{selectedArticle.author}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {selectedArticle.date}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.source}</span>
                  <div className="flex-1 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 rounded-full"
                      onClick={() => narrarTexto(`${selectedArticle.title}. ${selectedArticle.summary}`)}
                    >
                      <Volume className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="prose dark:prose-invert max-w-none">
                  {selectedArticle.content?.split('\n\n').map((paragraph, index) => {
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold my-4">{paragraph.substring(2)}</h1>;
                    } else if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-bold my-3">{paragraph.substring(3)}</h2>;
                    } else if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-bold my-2">{paragraph.substring(4)}</h3>;
                    } else if (paragraph.startsWith('![')) {
                      // Handle image syntax: ![Alt text](url)
                      const altEnd = paragraph.indexOf('](');
                      const urlEnd = paragraph.indexOf(')', altEnd);
                      if (altEnd > 0 && urlEnd > 0) {
                        const alt = paragraph.substring(2, altEnd);
                        const url = paragraph.substring(altEnd + 2, urlEnd);
                        return (
                          <div key={index} className="my-6">
                            <img src={url} alt={alt} className="rounded-lg w-full" />
                            <p className="text-center text-sm text-muted-foreground mt-2">{alt}</p>
                          </div>
                        );
                      }
                    } else if (paragraph.startsWith('**')) {
                      // Simple handling for lists with bold items
                      return <p key={index} className="font-bold my-2">{paragraph.replace(/\*\*/g, '')}</p>;
                    } else if (paragraph.startsWith('- ')) {
                      // Simple bullet list
                      return (
                        <ul key={index} className="list-disc pl-6 my-3">
                          {paragraph.split('\n').map((item, itemIndex) => (
                            <li key={itemIndex}>{item.substring(2)}</li>
                          ))}
                        </ul>
                      );
                    } else {
                      return <p key={index} className="my-3">{paragraph}</p>;
                    }
                  })}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-8 mb-4">
                  {selectedArticle.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between border-t pt-4 mt-6 mb-8">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Bookmark className="h-4 w-4" />
                    Salvar
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div 
            key="articles-list"
            className="container mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Blog Jurídico</h1>
              <p className="text-muted-foreground">
                Artigos, notícias e publicações sobre Direito, concursos e jurisprudência
              </p>
            </div>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  className="pl-10" 
                  placeholder="Buscar artigos, temas ou autores..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs defaultValue="categorias" className="mb-8">
              <TabsList className="mb-4">
                <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
                <TabsTrigger value="fontes">Por Fonte</TabsTrigger>
              </TabsList>
              
              <TabsContent value="categorias" className="space-y-4">
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <Button 
                        key={category}
                        variant={activeCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="fontes" className="space-y-4">
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex flex-wrap gap-2">
                    {sources.map(source => (
                      <Button 
                        key={source}
                        variant={activeSource === source ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveSource(source)}
                      >
                        {source}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredArticles.map(article => (
                <motion.div 
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden h-full flex flex-col">
                    <div 
                      className="h-48 w-full bg-cover bg-center" 
                      style={{ backgroundImage: `url(${article.imageUrl})` }}
                    />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{article.category}</Badge>
                            <span className="text-xs text-muted-foreground">{article.source}</span>
                          </div>
                          <CardTitle>{article.title}</CardTitle>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => narrarTexto(`${article.title}. ${article.summary}`)}
                        >
                          <Volume className="h-5 w-5" />
                        </Button>
                      </div>
                      <CardDescription>{article.date} • Por {article.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p>{article.summary}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedArticle(article)}
                      >
                        Ler artigo completo
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Salvar
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum artigo encontrado com os filtros atuais.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("Todos");
                    setActiveSource("Todos");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}

            <div className="flex justify-center mt-8">
              <Button variant="outline">Carregar mais artigos</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Bloger;
