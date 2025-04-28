
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const YOUTUBE_API_KEY = "AIzaSyDlM4OBBfKmZDMSitzbSX8OCBOgqkGCQVc";
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const areas = [
  // Áreas principais
  "Direito Constitucional", "Direito Administrativo", "Direito Civil",
  "Direito Penal", "Direito Processual Civil", "Direito Processual Penal",
  "Direito Trabalhista", "Direito Previdenciário", "Direito Tributário",
  
  // Áreas especializadas
  "Direito Empresarial", "Direito Ambiental", "Direito do Consumidor",
  "Direito Internacional", "Direito Internacional Público", "Direito Internacional Privado",
  "Direito Financeiro", "Direito Digital", "Direito Eleitoral",
  "Direito Agrário", "Direito Imobiliário", "Direito de Família",
  "Direito Sucessório", "Direito Marítimo", "Direito Aéreo",
  "Direito Bancário", "Direito Securitário", "Direito Sanitário",
  "Direito Urbanístico", "Direito da Concorrência", "Direito da Propriedade Intelectual"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    console.log(`Starting playlist fetch for ${areas.length} legal areas...`);
    
    for (const area of areas) {
      console.log(`Fetching playlists for area: ${area}`);
      const searchQuery = encodeURIComponent(`${area} aulas`);
      
      try {
        // Fetch playlists with more results and relevance parameters
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${searchQuery}&maxResults=10&relevanceLanguage=pt&regionCode=BR&key=${YOUTUBE_API_KEY}`
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`YouTube API error for ${area}: ${response.status} ${response.statusText}`, errorText);
          continue; // Skip to next area on error
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
          console.log(`No playlists found for ${area}`);
          continue;
        }
        
        console.log(`Found ${data.items.length} playlists for ${area}`);
        
        for (const item of data.items) {
          const playlistId = item.id.playlistId;
          if (!playlistId) {
            console.log(`Invalid playlist ID for item in ${area}`);
            continue;
          }
          
          try {
            // Get detailed playlist information
            const playlistResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
            );
            
            if (!playlistResponse.ok) {
              console.error(`Error fetching playlist details for ${playlistId}: ${playlistResponse.statusText}`);
              continue;
            }
            
            const playlistData = await playlistResponse.json();
            const playlist = playlistData.items[0];
            
            if (!playlist) {
              console.log(`No playlist details found for ${playlistId}`);
              continue;
            }
            
            // Only store playlists with a reasonable number of videos
            if (playlist.contentDetails.itemCount < 3) {
              console.log(`Skipping playlist ${playlistId} with only ${playlist.contentDetails.itemCount} videos`);
              continue;
            }
            
            // Insert or update playlist in database
            const { error } = await supabase.from('video_playlists_juridicas').upsert({
              area,
              playlist_id: playlistId,
              playlist_title: playlist.snippet.title,
              thumbnail_url: playlist.snippet.thumbnails?.high?.url || 
                             playlist.snippet.thumbnails?.medium?.url || 
                             playlist.snippet.thumbnails?.default?.url,
              channel_title: playlist.snippet.channelTitle,
              video_count: playlist.contentDetails.itemCount || 0,
            }, {
              onConflict: 'area,playlist_id'
            });
            
            if (error) {
              console.error(`Database error for ${playlistId}: ${error.message}`);
            } else {
              console.log(`Added/updated playlist ${playlistId} for ${area} with ${playlist.contentDetails.itemCount} videos`);
            }
          } catch (playlistError) {
            console.error(`Error processing playlist ${playlistId} for ${area}: ${playlistError.message}`);
          }
        }
      } catch (areaError) {
        console.error(`Error processing area ${area}: ${areaError.message}`);
      }
      
      // Add a small delay between areas to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Processed ${areas.length} legal areas`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Fatal error in fetch-playlists function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
