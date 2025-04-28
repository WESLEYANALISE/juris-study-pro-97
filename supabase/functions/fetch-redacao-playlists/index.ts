
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

// IDs dos canais específicos de redação jurídica
const CHANNEL_IDS = {
  "Redação Jurídica": "UC3RRgAmE5tLWN3QBgM8BUfQ", // Canal Redação Jurídica
  "Tipografia Jurídica": "UCcRZD6NsGUQJQAM9LmEYjpw" // Canal Tipografia Jurídica
};

// Áreas de redação jurídica
const areas = [
  "Fundamentos",
  "Petição Inicial", 
  "Contestação", 
  "Recursos", 
  "Peças Criminais",
  "Peças Cíveis",
  "Dicas Gerais",
  "Formatação"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!YOUTUBE_API_KEY) {
      throw new Error("YOUTUBE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log(`Starting redacao playlist fetch for ${areas.length} areas...`);
    
    for (const channelName of Object.keys(CHANNEL_IDS)) {
      const channelId = CHANNEL_IDS[channelName as keyof typeof CHANNEL_IDS];
      
      console.log(`Fetching playlists for channel: ${channelName} (${channelId})`);
      
      // Primeiro, buscar as playlists do canal
      const playlistsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${channelId}&maxResults=50&key=${YOUTUBE_API_KEY}`
      );
      
      if (!playlistsResponse.ok) {
        const errorText = await playlistsResponse.text();
        console.error(`YouTube API error for ${channelName}: ${playlistsResponse.status} ${playlistsResponse.statusText}`, errorText);
        continue;
      }
      
      const playlistsData = await playlistsResponse.json();
      
      if (!playlistsData.items || playlistsData.items.length === 0) {
        console.log(`No playlists found for ${channelName}`);
        
        // Se não encontrar playlists, tenta buscar vídeos avulsos do canal
        try {
          console.log(`Fetching individual videos for channel: ${channelName}`);
          const videosResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&type=video&key=${YOUTUBE_API_KEY}`
          );
          
          if (!videosResponse.ok) {
            throw new Error(`Failed to fetch videos: ${videosResponse.statusText}`);
          }
          
          const videosData = await videosResponse.json();
          
          if (videosData.items && videosData.items.length > 0) {
            console.log(`Found ${videosData.items.length} videos for ${channelName}`);
            
            // Criar uma playlist virtual para estes vídeos
            const videoIds = videosData.items.map((item: any) => item.id.videoId);
            
            // Para cada vídeo, criar uma entrada como se fosse uma playlist de um único vídeo
            for (const item of videosData.items) {
              const videoTitle = item.snippet.title;
              const videoId = item.id.videoId;
              
              // Categorizar o vídeo em uma área
              let area = "Fundamentos"; // Categoria padrão
              
              for (const possibleArea of areas) {
                const keywords = possibleArea.toLowerCase().split(" ");
                // Se qualquer uma das palavras-chave da área estiver no título
                if (keywords.some(keyword => videoTitle.toLowerCase().includes(keyword))) {
                  area = possibleArea;
                  break;
                }
              }
              
              // Inserir na tabela como um vídeo individual mas identificável
              const { error } = await supabase.from('video_playlists_juridicas').upsert({
                area: `Redação Jurídica - ${area}`,
                playlist_id: `video-${videoId}`, // Prefixo para distinguir de playlists regulares
                playlist_title: videoTitle,
                thumbnail_url: item.snippet.thumbnails?.high?.url || 
                              item.snippet.thumbnails?.medium?.url || 
                              item.snippet.thumbnails?.default?.url,
                channel_title: channelName,
                video_count: 1, // É apenas um vídeo
                is_single_video: true, // Marcador de que é um único vídeo
                video_id: videoId // Salvar o ID do vídeo diretamente
              }, {
                onConflict: 'playlist_id'
              });
              
              if (error) {
                console.error(`Database error for video ${videoId}: ${error.message}`);
              } else {
                console.log(`Added single video ${videoId} for ${channelName} in area ${area}`);
              }
            }
          }
        } catch (videoError) {
          console.error(`Error processing videos for channel ${channelName}: ${videoError.message}`);
        }
        
        continue;
      }
      
      console.log(`Found ${playlistsData.items.length} playlists for ${channelName}`);
      
      // Processar cada playlist
      for (const playlist of playlistsData.items) {
        const playlistId = playlist.id;
        
        if (!playlistId) {
          console.log(`Invalid playlist ID for item in ${channelName}`);
          continue;
        }
        
        try {
          // Categorizar a playlist em uma das áreas de redação jurídica
          // Usando algoritmo simples de correspondência de palavras-chave no título
          const title = playlist.snippet.title.toLowerCase();
          let area = "Fundamentos"; // Categoria padrão
          
          for (const possibleArea of areas) {
            const keywords = possibleArea.toLowerCase().split(" ");
            // Se qualquer uma das palavras-chave da área estiver no título
            if (keywords.some(keyword => title.includes(keyword))) {
              area = possibleArea;
              break;
            }
          }
          
          // Verificar conteúdo da playlist
          const playlistItemsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${YOUTUBE_API_KEY}`
          );
          
          if (!playlistItemsResponse.ok) {
            console.error(`Error fetching playlist items for ${playlistId}: ${playlistItemsResponse.statusText}`);
            continue;
          }
          
          const playlistItemsData = await playlistItemsResponse.json();
          
          // Buscar detalhes da playlist
          const playlistDetailsResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
          );
          
          if (!playlistDetailsResponse.ok) {
            console.error(`Error fetching playlist details for ${playlistId}: ${playlistDetailsResponse.statusText}`);
            continue;
          }
          
          const playlistDetailsData = await playlistDetailsResponse.json();
          
          if (!playlistDetailsData.items || playlistDetailsData.items.length === 0) {
            console.log(`No details found for playlist ${playlistId}`);
            continue;
          }
          
          const playlistDetails = playlistDetailsData.items[0];
          const videoCount = playlistDetails.contentDetails.itemCount || 0;
          
          // Somente armazenar se tiver pelo menos 1 vídeo (alterado de 2 para 1)
          if (videoCount < 1) {
            console.log(`Skipping playlist ${playlistId} with only ${videoCount} videos`);
            continue;
          }
          
          // Inserir na tabela de playlists de redação jurídica
          const { error } = await supabase.from('video_playlists_juridicas').upsert({
            area: `Redação Jurídica - ${area}`,
            playlist_id: playlistId,
            playlist_title: playlistDetails.snippet.title,
            thumbnail_url: playlistDetails.snippet.thumbnails?.high?.url || 
                          playlistDetails.snippet.thumbnails?.medium?.url || 
                          playlistDetails.snippet.thumbnails?.default?.url,
            channel_title: channelName,
            video_count: videoCount,
            is_single_video: false
          }, {
            onConflict: 'playlist_id'
          });
          
          if (error) {
            console.error(`Database error for ${playlistId}: ${error.message}`);
          } else {
            console.log(`Added/updated playlist ${playlistId} for Redação Jurídica - ${area} with ${videoCount} videos`);
          }
          
        } catch (playlistError) {
          console.error(`Error processing playlist ${playlistId}: ${playlistError.message}`);
        }
      }
    }

    // Após processar playlists, buscar artigos relacionados
    // e associar com as playlists/vídeos correspondentes
    try {
      const { data: playlists, error: playlistsError } = await supabase
        .from('video_playlists_juridicas')
        .select('*')
        .ilike('area', 'Redação Jurídica%');
      
      if (playlistsError) {
        throw playlistsError;
      }
      
      // Agrupar playlists por área para facilitar a correspondência com artigos
      const playlistsByArea = playlists.reduce((acc: any, playlist: any) => {
        const area = playlist.area.replace('Redação Jurídica - ', '');
        if (!acc[area]) {
          acc[area] = [];
        }
        acc[area].push(playlist);
        return acc;
      }, {});
      
      // Buscar artigos existentes
      const { data: existingArticles, error: articlesError } = await supabase
        .from('redacao_artigos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (articlesError) {
        throw articlesError;
      }
      
      // Para cada área, garantir que haja pelo menos um artigo associado
      for (const area of areas) {
        const areaPlaylists = playlistsByArea[area] || [];
        
        // Verificar se já existe um artigo para esta área
        const areaArticle = existingArticles?.find(article => 
          article.categoria === area || article.tags?.includes(area)
        );
        
        if (!areaArticle && areaPlaylists.length > 0) {
          // Criar um artigo básico para esta área
          const playlistIds = areaPlaylists.map((p: any) => p.playlist_id);
          const artigo = {
            titulo: `Guia de Redação Jurídica: ${area}`,
            conteudo: generateArticleContent(area, areaPlaylists),
            categoria: "Redação Jurídica",
            tags: [area, "Redação Jurídica", "Guia Prático"],
            playlist_ids: playlistIds
          };
          
          const { error: insertError } = await supabase
            .from('redacao_artigos')
            .insert(artigo);
          
          if (insertError) {
            console.error(`Error creating article for ${area}: ${insertError.message}`);
          } else {
            console.log(`Created article for ${area} with ${playlistIds.length} associated playlists`);
          }
        } 
        else if (areaArticle && areaPlaylists.length > 0) {
          // Atualizar o artigo existente com as novas playlists
          const playlistIds = areaPlaylists.map((p: any) => p.playlist_id);
          
          const { error: updateError } = await supabase
            .from('redacao_artigos')
            .update({ 
              playlist_ids: playlistIds,
              updated_at: new Date().toISOString()
            })
            .eq('id', areaArticle.id);
          
          if (updateError) {
            console.error(`Error updating article for ${area}: ${updateError.message}`);
          } else {
            console.log(`Updated article for ${area} with ${playlistIds.length} associated playlists`);
          }
        }
      }
    } catch (articleError) {
      console.error(`Error processing articles: ${articleError.message}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Processed playlists for ${Object.keys(CHANNEL_IDS).length} legal writing channels`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Fatal error in fetch-redacao-playlists function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Função auxiliar para gerar conteúdo de artigo com base na área
function generateArticleContent(area: string, playlists: any[]): string {
  const playlistMentions = playlists.length > 0 
    ? `\n\n## Vídeos Recomendados\n\nEste guia é complementado por ${playlists.length} playlist${playlists.length > 1 ? 's' : ''} com vídeos selecionados sobre ${area}.` 
    : '';
  
  const templates: {[key: string]: string} = {
    "Fundamentos": `# Fundamentos da Redação Jurídica

A redação jurídica é uma habilidade essencial para qualquer profissional do Direito. Neste artigo, apresentamos os princípios básicos para uma escrita jurídica clara, precisa e persuasiva.

## Clareza e Precisão

A redação jurídica exige clareza e precisão. Utilize linguagem técnica adequada, mas evite excesso de jargões desnecessários. Prefira frases diretas e objetivas.

## Estrutura Lógica

Organize seu texto em uma estrutura lógica e coerente. Apresente argumentos em ordem de relevância e construa um raciocínio jurídico sólido.

## Formatação Adequada

Utilize os recursos de formatação para destacar pontos importantes. Parágrafos bem construídos, espaçamento adequado e uso correto de recuos contribuem para a legibilidade do documento.${playlistMentions}`,

    "Petição Inicial": `# Guia para Elaboração de Petições Iniciais

A petição inicial é a peça que inaugura o processo judicial. Sua qualidade impacta diretamente no sucesso da demanda.

## Elementos Essenciais

Toda petição inicial deve conter os seguintes elementos:
- Endereçamento correto
- Qualificação completa das partes
- Fatos e fundamentos jurídicos
- Pedido claro e específico
- Valor da causa
- Provas que pretende produzir

## Técnicas de Redação

- Utilize linguagem formal e técnica
- Organize cronologicamente os fatos
- Fundamentação jurídica consistente
- Pedidos claros e específicos
- Construção lógica dos argumentos${playlistMentions}`,

    "Contestação": `# Técnicas para Elaboração de Contestações

A contestação é a principal peça de defesa no processo civil. Neste guia, apresentamos as melhores práticas para sua elaboração.

## Estrutura Básica

- Endereçamento
- Identificação do processo
- Preliminares (se houver)
- Impugnação específica dos fatos
- Fundamentos jurídicos da defesa
- Pedidos
- Provas a serem produzidas

## Estratégias Eficientes

- Impugnação específica de cada fato alegado pelo autor
- Identificação de vícios processuais para preliminares
- Argumentação jurídica sólida
- Citação de jurisprudência favorável
- Organização clara e lógica dos argumentos${playlistMentions}`,

    "Recursos": `# Guia Prático para Redação de Recursos

A redação de recursos exige técnica específica e conhecimento aprofundado dos requisitos formais de cada espécie recursal.

## Aspectos Formais

- Tempestividade
- Preparo, quando exigido
- Regularidade formal
- Interesse recursal
- Legitimidade

## Estrutura do Recurso

- Endereçamento ao órgão julgador competente
- Identificação completa do processo
- Razões do recurso (fundamentos de fato e de direito)
- Pedido de reforma ou anulação da decisão
- Prequestionamento (em recursos para tribunais superiores)${playlistMentions}`,

    "Peças Criminais": `# Redação de Peças na Área Criminal

As peças processuais na área criminal possuem particularidades que exigem conhecimento técnico específico.

## Principais Peças Criminais

- Queixa-crime
- Denúncia
- Resposta à acusação
- Alegações finais
- Habeas corpus
- Recursos criminais

## Técnicas Específicas

- Descrição precisa da conduta típica
- Individualização das condutas (em caso de múltiplos réus)
- Demonstração do elemento subjetivo do tipo
- Argumentação sobre materialidade e autoria
- Fundamentação das teses defensivas${playlistMentions}`,

    "Peças Cíveis": `# Elaboração de Peças Cíveis

As peças cíveis abrangem uma variedade de documentos jurídicos voltados para a resolução de conflitos na esfera civil.

## Tipos de Peças Cíveis

- Petição inicial
- Contestação
- Réplica
- Reconvenção
- Embargos (à execução, de terceiros)
- Memoriais

## Técnicas de Redação

- Clareza na exposição dos fatos
- Fundamentação jurídica adequada
- Articulação lógica dos argumentos
- Pedidos precisos e exequíveis
- Formatação adequada${playlistMentions}`,

    "Dicas Gerais": `# Dicas Práticas para Redação Jurídica

A excelência na redação jurídica é construída com a aplicação de técnicas específicas e muita prática.

## Aprimorando sua Escrita Jurídica

- Leitura constante de peças bem redigidas
- Estudo da doutrina e jurisprudência
- Revisão cuidadosa dos textos
- Clareza e concisão
- Uso adequado da terminologia jurídica

## Erros Comuns a Evitar

- Prolixidade excessiva
- Argumentos circulares
- Citações doutrinárias descontextualizadas
- Erros gramaticais
- Pedidos genéricos ou imprecisos${playlistMentions}`,

    "Formatação": `# Formatação de Documentos Jurídicos

A formatação adequada contribui significativamente para a qualidade e profissionalismo das peças jurídicas.

## Padrões de Formatação

- Fonte: geralmente Times New Roman ou Arial, tamanho 12
- Espaçamento: 1,5 entre linhas
- Margens: superior e esquerda de 3cm; inferior e direita de 2cm
- Numeração de páginas
- Recuos para citações longas (4cm)

## Organização Visual

- Uso adequado de títulos e subtítulos
- Destaques (negrito, itálico, sublinhado) com moderação
- Estrutura em tópicos quando apropriado
- Alinhamento justificado
- Consistência em todo o documento${playlistMentions}`
  };
  
  return templates[area] || `# Guia de Redação Jurídica: ${area}

Este artigo apresenta técnicas e orientações para a redação jurídica na área de ${area}.

## Importância da Boa Redação

A redação jurídica clara e precisa é fundamental para o sucesso na advocacia. Documentos bem redigidos aumentam a persuasão e a eficácia da argumentação jurídica.

## Técnicas Específicas

- Utilize linguagem técnica apropriada
- Estruture o texto de forma lógica
- Fundamente adequadamente os argumentos
- Revise cuidadosamente o texto${playlistMentions}`;
}
