
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
    const { table_name } = await req.json();

    // Validate table name to prevent SQL injection
    if (!table_name || typeof table_name !== 'string' || !ALLOWED_TABLES.includes(table_name)) {
      console.error(`Invalid or disallowed table name: ${table_name}`);
      return new Response(
        JSON.stringify({ error: 'Nome da tabela inválido ou não permitido' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Use the RPC function which is available server-side
    const { data, error } = await supabase.rpc('query_vademecum_table', { 
      table_name: table_name 
    });

    if (error) {
      console.error(`Error querying table ${table_name}:`, error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})
