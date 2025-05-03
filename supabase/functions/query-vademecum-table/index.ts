
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

// Define allowed tables to prevent SQL injection
const ALLOWED_TABLES = [
  "Código_Civil", 
  "Código_Penal", 
  "Código_de_Processo_Civil", 
  "Código_de_Processo_Penal", 
  "Código_de_Defesa_do_Consumidor", 
  "Código_Tributário_Nacional", 
  "Código_Comercial", 
  "Código_Eleitoral", 
  "Código_de_Trânsito_Brasileiro", 
  "Código_Brasileiro_de_Telecomunicações", 
  "Estatuto_da_Criança_e_do_Adolescente", 
  "Estatuto_do_Idoso", 
  "Estatuto_da_Terra", 
  "Estatuto_da_Cidade", 
  "Estatuto_da_Advocacia_e_da_OAB", 
  "Estatuto_do_Desarmamento", 
  "Estatuto_do_Torcedor", 
  "Estatuto_da_Igualdade_Racial", 
  "Estatuto_da_Pessoa_com_Deficiência", 
  "Estatuto_dos_Servidores_Públicos_Civis_da_União",
  "Constituicao_Federal",
  "Constituição_Federal"
]; 

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client with service role key for internal edge function
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Payload inválido: JSON esperado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { table_name } = body || {};

    // Validate table name to prevent SQL injection
    if (!table_name || typeof table_name !== 'string' || !ALLOWED_TABLES.includes(table_name)) {
      console.error(`Invalid or disallowed table name: ${table_name}`);
      return new Response(
        JSON.stringify({ error: 'Nome da tabela inválido ou não permitido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Querying table: ${table_name}`);
    
    // Fallback to direct query
    console.log(`Executing direct query for ${table_name}`);
    
    // Use a parameterized query to prevent SQL injection
    // Note: This is safe because we've already validated table_name against ALLOWED_TABLES
    let data;
    let error;
    
    try {
      const result = await supabase
        .from(table_name)
        .select('*')
        .order('id');
      
      data = result.data;
      error = result.error;
      
      // Log results for debugging
      if (data) {
        console.log(`Query result: ${data.length} rows retrieved`);
        
        // Log sample data
        if (data.length > 0) {
          const sample = data[0];
          console.log("Sample data structure:", Object.keys(sample));
          
          // Check if articles have content
          const hasArticleContent = data.filter(d => d.artigo && d.artigo.trim().length > 0).length;
          const hasNumberContent = data.filter(d => d.numero && d.numero.trim().length > 0).length;
          
          console.log(`Articles with text content: ${hasArticleContent}/${data.length}`);
          console.log(`Articles with number content: ${hasNumberContent}/${data.length}`);
        }
      }
    } catch (queryErr) {
      console.error("Direct query error:", queryErr);
      return new Response(
        JSON.stringify({ error: 'Erro na consulta SQL', details: String(queryErr) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (error) {
      console.error(`Error querying table ${table_name}:`, error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Validate the structure before returning
    if (!Array.isArray(data)) {
      console.error("Expected array response, got:", typeof data);
      return new Response(
        JSON.stringify({ error: 'Formato de resposta inesperado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log(`Successfully retrieved ${data.length} records from ${table_name}`);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', details: String(error) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
