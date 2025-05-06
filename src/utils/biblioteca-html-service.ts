
import { supabase } from "@/integrations/supabase/client";
import { DocumentoHTML } from "@/types/biblioteca-html";
import { toast } from "sonner";

// Buscar todos os documentos HTML
export async function getAllHTMLDocuments(): Promise<DocumentoHTML[]> {
  try {
    const { data, error } = await supabase
      .from('biblioteca_html')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos HTML:', error);
      throw new Error(error.message);
    }

    return data as DocumentoHTML[];
  } catch (erro) {
    console.error('Erro ao buscar documentos HTML:', erro);
    toast.error('Falha ao carregar documentos.');
    return [];
  }
}

// Buscar documentos HTML por categoria
export async function getHTMLDocumentsByCategory(categoria: string): Promise<DocumentoHTML[]> {
  try {
    const { data, error } = await supabase
      .from('biblioteca_html')
      .select('*')
      .eq('categoria', categoria)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar documentos por categoria:', error);
      throw new Error(error.message);
    }

    return data as DocumentoHTML[];
  } catch (erro) {
    console.error('Erro ao buscar documentos por categoria:', erro);
    toast.error('Falha ao carregar documentos da categoria.');
    return [];
  }
}

// Buscar categorias de documentos HTML
export async function getHTMLDocumentCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('biblioteca_html')
      .select('categoria')
      .order('categoria');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw new Error(error.message);
    }

    // Remover duplicatas
    const categorias = [...new Set(data.map(item => item.categoria))];
    return categorias;
  } catch (erro) {
    console.error('Erro ao buscar categorias:', erro);
    toast.error('Falha ao carregar categorias.');
    return [];
  }
}

// Buscar documentos HTML recentemente acessados pelo usuário
export async function getRecentlyViewedDocuments(userId: string, limit = 5): Promise<DocumentoHTML[]> {
  try {
    const { data, error } = await supabase
      .from('biblioteca_html_progresso')
      .select('documento_id, ultima_leitura, biblioteca_html(*)')
      .eq('user_id', userId)
      .order('ultima_leitura', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar documentos recentes:', error);
      throw new Error(error.message);
    }

    // Extrair os documentos da resposta
    return data.map(item => item.biblioteca_html as DocumentoHTML);
  } catch (erro) {
    console.error('Erro ao buscar documentos recentes:', erro);
    toast.error('Falha ao carregar documentos recentes.');
    return [];
  }
}

// Buscar documentos HTML favoritos do usuário
export async function getFavoriteDocuments(userId: string): Promise<DocumentoHTML[]> {
  try {
    const { data, error } = await supabase
      .from('biblioteca_html_progresso')
      .select('documento_id, biblioteca_html(*)')
      .eq('user_id', userId)
      .eq('favorito', true);

    if (error) {
      console.error('Erro ao buscar favoritos:', error);
      throw new Error(error.message);
    }

    // Extrair os documentos da resposta
    return data.map(item => item.biblioteca_html as DocumentoHTML);
  } catch (erro) {
    console.error('Erro ao buscar favoritos:', erro);
    toast.error('Falha ao carregar favoritos.');
    return [];
  }
}

// Buscar documento HTML por ID
export async function getHTMLDocumentById(id: string): Promise<DocumentoHTML | null> {
  try {
    const { data, error } = await supabase
      .from('biblioteca_html')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar documento por ID:', error);
      throw new Error(error.message);
    }

    return data as DocumentoHTML;
  } catch (erro) {
    console.error('Erro ao buscar documento por ID:', erro);
    toast.error('Falha ao carregar documento.');
    return null;
  }
}

// Buscar documentos HTML por pesquisa de texto
export async function searchHTMLDocuments(query: string): Promise<DocumentoHTML[]> {
  try {
    // Pesquisa em vários campos
    const { data, error } = await supabase
      .from('biblioteca_html')
      .select('*')
      .or(`titulo.ilike.%${query}%, conteudo_html.ilike.%${query}%, descricao.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao pesquisar documentos:', error);
      throw new Error(error.message);
    }

    return data as DocumentoHTML[];
  } catch (erro) {
    console.error('Erro ao pesquisar documentos:', erro);
    toast.error('Falha na pesquisa de documentos.');
    return [];
  }
}
