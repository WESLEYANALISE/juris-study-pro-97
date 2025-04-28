import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const YOUTUBE_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const areas = [
  "Direito Constitucional", "Direito Administrativo", "Direito Civil",
  "Direito Penal", "Direito Processual Civil", "Direito Processual Penal",
  "Direito Trabalhista", "Direito Previdenciário", "Direito Tributário",
  // ... other areas as specified in the requirements
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
    
    for (const area of areas) {
      const searchQuery = encodeURIComponent(`${area} aulas`);
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=playlist&q=${searchQuery}&maxResults=5&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      for (const item of data.items) {
        const playlistId = item.id.playlistId;
        const playlistResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
        );
        
        if (!playlistResponse.ok) continue;
        
        const playlistData = await playlistResponse.json();
        const playlist = playlistData.items[0];
        
        if (!playlist) continue;
        
        await supabase.from('video_playlists_juridicas').upsert({
          area,
          playlist_id: playlistId,
          playlist_title: playlist.snippet.title,
          thumbnail_url: playlist.snippet.thumbnails?.high?.url || playlist.snippet.thumbnails?.default?.url,
          channel_title: playlist.snippet.channelTitle,
          video_count: playlist.contentDetails.itemCount || 0,
        }, {
          onConflict: 'area,playlist_id'
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
