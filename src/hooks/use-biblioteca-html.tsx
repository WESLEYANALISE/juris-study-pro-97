
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DocumentoHTML, ProgressoLeitura, MarcadorHTML, AnotacaoHTML } from '@/types/biblioteca-html';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

export function useBibliotecaHTML(documentoId?: string) {
  const [documento, setDocumento] = useState<DocumentoHTML | null>(null);
  const [progresso, setProgresso] = useState<ProgressoLeitura | null>(null);
  const [marcadores, setMarcadores] = useState<MarcadorHTML[]>([]);
  const [anotacoes, setAnotacoes] = useState<AnotacaoHTML[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [secaoAtual, setSecaoAtual] = useState<string>('intro');
  const [ultimaSecao, setUltimaSecao] = useState<string | null>(null);
  const { user } = useAuth();

  // Buscar documento por ID
  useEffect(() => {
    async function carregarDocumento() {
      if (!documentoId) {
        setCarregando(false);
        return;
      }

      setCarregando(true);
      
      try {
        const { data, error } = await supabase
          .from('biblioteca_html')
          .select('*')
          .eq('id', documentoId)
          .single();

        if (error) {
          console.error('Erro ao carregar documento:', error);
          toast.error('Erro ao carregar documento.');
          return;
        }

        if (data) {
          setDocumento(data as DocumentoHTML);
          
          // Se o usuário estiver autenticado, verificar o progresso
          if (user) {
            carregarProgresso(documentoId);
            carregarMarcadores(documentoId);
            carregarAnotacoes(documentoId);
          }
        }
      } catch (erro) {
        console.error('Erro ao buscar documento:', erro);
        toast.error('Falha ao carregar documento.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDocumento();
  }, [documentoId, user]);

  // Carregar progresso do usuário
  async function carregarProgresso(docId: string) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('biblioteca_html_progresso')
        .select('*')
        .eq('user_id', user.id)
        .eq('documento_id', docId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 é o código para "nenhum registro encontrado"
        console.error('Erro ao carregar progresso:', error);
        return;
      }

      if (data) {
        setProgresso(data as ProgressoLeitura);
        setSecaoAtual(data.secao_atual);
        setUltimaSecao(data.secao_atual);
      } else {
        // Se não houver progresso, criar um novo registro
        const novoProgresso: ProgressoLeitura = {
          user_id: user.id,
          documento_id: docId,
          secao_atual: 'intro',
          progresso_percentual: 0,
          favorito: false
        };

        const { data: insertData, error: insertError } = await supabase
          .from('biblioteca_html_progresso')
          .insert([novoProgresso])
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar progresso:', insertError);
          return;
        }

        if (insertData) {
          setProgresso(insertData as ProgressoLeitura);
        }
      }
    } catch (erro) {
      console.error('Erro ao carregar progresso:', erro);
    }
  }

  // Carregar marcadores do usuário
  async function carregarMarcadores(docId: string) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('biblioteca_html_marcadores')
        .select('*')
        .eq('user_id', user.id)
        .eq('documento_id', docId);

      if (error) {
        console.error('Erro ao carregar marcadores:', error);
        return;
      }

      setMarcadores(data as MarcadorHTML[]);
    } catch (erro) {
      console.error('Erro ao carregar marcadores:', erro);
    }
  }

  // Carregar anotações do usuário
  async function carregarAnotacoes(docId: string) {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('biblioteca_html_anotacoes')
        .select('*')
        .eq('user_id', user.id)
        .eq('documento_id', docId);

      if (error) {
        console.error('Erro ao carregar anotações:', error);
        return;
      }

      setAnotacoes(data as AnotacaoHTML[]);
    } catch (erro) {
      console.error('Erro ao carregar anotações:', erro);
    }
  }

  // Atualizar progresso de leitura
  async function atualizarProgresso(secao: string, porcentagem: number) {
    if (!user || !documentoId || !progresso) return;

    try {
      // Atualizar na memória primeiro para UI responsiva
      setSecaoAtual(secao);
      
      const { error } = await supabase
        .from('biblioteca_html_progresso')
        .update({
          secao_atual: secao,
          progresso_percentual: porcentagem,
          ultima_leitura: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('documento_id', documentoId);

      if (error) {
        console.error('Erro ao atualizar progresso:', error);
        toast.error('Erro ao salvar progresso.');
        return false;
      }

      setUltimaSecao(secao);
      return true;
    } catch (erro) {
      console.error('Erro ao atualizar progresso:', erro);
      toast.error('Erro ao salvar progresso.');
      return false;
    }
  }

  // Alternar favorito
  async function alternarFavorito() {
    if (!user || !documentoId || !progresso) return;

    try {
      const novoFavorito = !progresso.favorito;
      
      // Atualizar na memória primeiro para UI responsiva
      setProgresso({
        ...progresso,
        favorito: novoFavorito
      });
      
      const { error } = await supabase
        .from('biblioteca_html_progresso')
        .update({ favorito: novoFavorito })
        .eq('user_id', user.id)
        .eq('documento_id', documentoId);

      if (error) {
        console.error('Erro ao atualizar favorito:', error);
        toast.error('Erro ao atualizar favorito.');
        
        // Reverter em caso de erro
        setProgresso({
          ...progresso,
          favorito: !novoFavorito
        });
        
        return false;
      }

      toast.success(novoFavorito ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
      return true;
    } catch (erro) {
      console.error('Erro ao atualizar favorito:', erro);
      toast.error('Erro ao atualizar favorito.');
      return false;
    }
  }

  // Adicionar marcador
  async function adicionarMarcador(titulo: string, secaoId: string, posicao?: string) {
    if (!user || !documentoId) return null;

    try {
      const novoMarcador: MarcadorHTML = {
        user_id: user.id,
        documento_id: documentoId,
        titulo,
        secao_id: secaoId,
        posicao,
        cor: '#4C7BF4'
      };

      const { data, error } = await supabase
        .from('biblioteca_html_marcadores')
        .insert([novoMarcador])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar marcador:', error);
        toast.error('Erro ao adicionar marcador.');
        return null;
      }

      // Atualizar lista de marcadores
      setMarcadores(prev => [...prev, data as MarcadorHTML]);
      toast.success('Marcador adicionado com sucesso');
      return data as MarcadorHTML;
    } catch (erro) {
      console.error('Erro ao adicionar marcador:', erro);
      toast.error('Erro ao adicionar marcador.');
      return null;
    }
  }

  // Remover marcador
  async function removerMarcador(marcadorId: string) {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_html_marcadores')
        .delete()
        .eq('id', marcadorId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover marcador:', error);
        toast.error('Erro ao remover marcador.');
        return false;
      }

      // Atualizar lista de marcadores
      setMarcadores(prev => prev.filter(m => m.id !== marcadorId));
      toast.success('Marcador removido com sucesso');
      return true;
    } catch (erro) {
      console.error('Erro ao remover marcador:', erro);
      toast.error('Erro ao remover marcador.');
      return false;
    }
  }

  // Adicionar anotação
  async function adicionarAnotacao(
    secaoId: string, 
    texto: string, 
    seletorCss?: string, 
    textoSelecionado?: string
  ) {
    if (!user || !documentoId) return null;

    try {
      const novaAnotacao: AnotacaoHTML = {
        user_id: user.id,
        documento_id: documentoId,
        secao_id: secaoId,
        texto,
        seletor_css: seletorCss || null,
        texto_selecionado: textoSelecionado || null,
        cor: '#FFFF00'
      };

      const { data, error } = await supabase
        .from('biblioteca_html_anotacoes')
        .insert([novaAnotacao])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar anotação:', error);
        toast.error('Erro ao adicionar anotação.');
        return null;
      }

      // Atualizar lista de anotações
      setAnotacoes(prev => [...prev, data as AnotacaoHTML]);
      toast.success('Anotação adicionada com sucesso');
      return data as AnotacaoHTML;
    } catch (erro) {
      console.error('Erro ao adicionar anotação:', erro);
      toast.error('Erro ao adicionar anotação.');
      return null;
    }
  }

  // Atualizar anotação
  async function atualizarAnotacao(anotacaoId: string, novoTexto: string) {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_html_anotacoes')
        .update({ texto: novoTexto })
        .eq('id', anotacaoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao atualizar anotação:', error);
        toast.error('Erro ao atualizar anotação.');
        return false;
      }

      // Atualizar lista de anotações
      setAnotacoes(prev => prev.map(a => 
        a.id === anotacaoId ? { ...a, texto: novoTexto } : a
      ));
      
      toast.success('Anotação atualizada com sucesso');
      return true;
    } catch (erro) {
      console.error('Erro ao atualizar anotação:', erro);
      toast.error('Erro ao atualizar anotação.');
      return false;
    }
  }

  // Remover anotação
  async function removerAnotacao(anotacaoId: string) {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('biblioteca_html_anotacoes')
        .delete()
        .eq('id', anotacaoId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover anotação:', error);
        toast.error('Erro ao remover anotação.');
        return false;
      }

      // Atualizar lista de anotações
      setAnotacoes(prev => prev.filter(a => a.id !== anotacaoId));
      toast.success('Anotação removida com sucesso');
      return true;
    } catch (erro) {
      console.error('Erro ao remover anotação:', erro);
      toast.error('Erro ao remover anotação.');
      return false;
    }
  }

  // Buscar anotações por seção
  function getAnotacoesPorSecao(secaoId: string) {
    return anotacoes.filter(a => a.secao_id === secaoId);
  }

  // Verificar se uma seção tem marcador
  function temMarcador(secaoId: string) {
    return marcadores.some(m => m.secao_id === secaoId);
  }

  // Obter marcador de uma seção
  function getMarcadorPorSecao(secaoId: string) {
    return marcadores.find(m => m.secao_id === secaoId);
  }

  return {
    documento,
    progresso,
    marcadores,
    anotacoes,
    carregando,
    secaoAtual,
    ultimaSecao,
    atualizarProgresso,
    alternarFavorito,
    adicionarMarcador,
    removerMarcador,
    adicionarAnotacao,
    atualizarAnotacao,
    removerAnotacao,
    getAnotacoesPorSecao,
    temMarcador,
    getMarcadorPorSecao,
    setSecaoAtual
  };
}
