
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
          
          // Somente armazenar se tiver pelo menos 2 vídeos
          if (videoCount < 2) {
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
          }, {
            onConflict: 'area,playlist_id'
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
