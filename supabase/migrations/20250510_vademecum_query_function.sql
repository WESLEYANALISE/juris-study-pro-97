
-- Create a function to safely query vademecum tables with special characters
CREATE OR REPLACE FUNCTION public.query_vademecum_table(table_name text)
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  query_text TEXT;
  result jsonb;
BEGIN
  -- Validate the table name against allowed tables
  IF table_name NOT IN (
    'Código_Civil', 
    'Código_Penal', 
    'Código_de_Processo_Civil', 
    'Código_de_Processo_Penal', 
    'Código_de_Defesa_do_Consumidor', 
    'Código_Tributário_Nacional', 
    'Código_Comercial', 
    'Código_Eleitoral', 
    'Código_de_Trânsito_Brasileiro', 
    'Código_Brasileiro_de_Telecomunicações', 
    'Estatuto_da_Criança_e_do_Adolescente', 
    'Estatuto_do_Idoso', 
    'Estatuto_da_Terra', 
    'Estatuto_da_Cidade', 
    'Estatuto_da_Advocacia_e_da_OAB', 
    'Estatuto_do_Desarmamento', 
    'Estatuto_do_Torcedor', 
    'Estatuto_da_Igualdade_Racial', 
    'Estatuto_da_Pessoa_com_Deficiência', 
    'Estatuto_dos_Servidores_Públicos_Civis_da_União',
    'Constituicao_Federal',
    'Constituição_Federal'
  ) THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;

  -- Construct and execute dynamic query
  query_text := format('SELECT to_jsonb(t) FROM public.%I t', table_name);
  
  RETURN QUERY EXECUTE query_text;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION public.query_vademecum_table(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.query_vademecum_table(text) TO anon;
