export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      annotations: {
        Row: {
          ai_generated: boolean | null
          annotation_text: string | null
          article_number: string
          created_at: string | null
          highlight_color: string | null
          id: string
          law_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          annotation_text?: string | null
          article_number: string
          created_at?: string | null
          highlight_color?: string | null
          id?: string
          law_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          annotation_text?: string | null
          article_number?: string
          created_at?: string | null
          highlight_color?: string | null
          id?: string
          law_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      biblioteca_juridica: {
        Row: {
          area: string | null
          created_at: string
          download: string | null
          id: number
          imagem: string | null
          link: string | null
          livro: string | null
          sobre: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          download?: string | null
          id?: number
          imagem?: string | null
          link?: string | null
          livro?: string | null
          sobre?: string | null
        }
        Relationships: []
      }
      biblioteca_juridica_improved: {
        Row: {
          ano_publicacao: number | null
          area: string
          autor: string | null
          capa_url: string | null
          categoria: string | null
          created_at: string | null
          edicao: string | null
          editora: string | null
          id: string
          link_download: string | null
          link_leitura: string | null
          popularidade: number | null
          sinopse: string | null
          tags: string[] | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ano_publicacao?: number | null
          area: string
          autor?: string | null
          capa_url?: string | null
          categoria?: string | null
          created_at?: string | null
          edicao?: string | null
          editora?: string | null
          id?: string
          link_download?: string | null
          link_leitura?: string | null
          popularidade?: number | null
          sinopse?: string | null
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ano_publicacao?: number | null
          area?: string
          autor?: string | null
          capa_url?: string | null
          categoria?: string | null
          created_at?: string | null
          edicao?: string | null
          editora?: string | null
          id?: string
          link_download?: string | null
          link_leitura?: string | null
          popularidade?: number | null
          sinopse?: string | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      Código_Brasileiro_de_Telecomunicações: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_Civil: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_Comercial: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_de_Defesa_do_Consumidor: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_de_Processo_Civil: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_de_Processo_Penal: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_de_Trânsito_Brasileiro: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_Eleitoral: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_Penal: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Código_Tributário_Nacional: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      cronograma: {
        Row: {
          concluido: boolean | null
          cor: string | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          titulo: string
          user_id: string | null
        }
        Insert: {
          concluido?: boolean | null
          cor?: string | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          titulo: string
          user_id?: string | null
        }
        Update: {
          concluido?: boolean | null
          cor?: string | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          titulo?: string
          user_id?: string | null
        }
        Relationships: []
      }
      curso_feedback: {
        Row: {
          avaliacao: number
          comentario: string | null
          created_at: string | null
          curso_id: number
          id: string
          user_id: string
        }
        Insert: {
          avaliacao: number
          comentario?: string | null
          created_at?: string | null
          curso_id: number
          id?: string
          user_id: string
        }
        Update: {
          avaliacao?: number
          comentario?: string | null
          created_at?: string | null
          curso_id?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      curso_progress: {
        Row: {
          concluido: boolean
          created_at: string | null
          curso_id: number
          id: string
          progresso: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string | null
          curso_id: number
          id?: string
          progresso?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          concluido?: boolean
          created_at?: string | null
          curso_id?: number
          id?: string
          progresso?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cursos_narrados: {
        Row: {
          area: string | null
          capa: string | null
          dificuldade: string | null
          download: string | null
          id: number
          link: string | null
          materia: string | null
          sequencia: number | null
          sobre: string | null
          tipo_acesso: string | null
        }
        Insert: {
          area?: string | null
          capa?: string | null
          dificuldade?: string | null
          download?: string | null
          id?: number
          link?: string | null
          materia?: string | null
          sequencia?: number | null
          sobre?: string | null
          tipo_acesso?: string | null
        }
        Update: {
          area?: string | null
          capa?: string | null
          dificuldade?: string | null
          download?: string | null
          id?: number
          link?: string | null
          materia?: string | null
          sequencia?: number | null
          sobre?: string | null
          tipo_acesso?: string | null
        }
        Relationships: []
      }
      dicionario_juridico: {
        Row: {
          area_direito: string | null
          created_at: string | null
          definicao: string
          exemplo_uso: string | null
          id: string
          termo: string
        }
        Insert: {
          area_direito?: string | null
          created_at?: string | null
          definicao: string
          exemplo_uso?: string | null
          id?: string
          termo: string
        }
        Update: {
          area_direito?: string | null
          created_at?: string | null
          definicao?: string
          exemplo_uso?: string | null
          id?: string
          termo?: string
        }
        Relationships: []
      }
      dicionario_termo_views: {
        Row: {
          id: string
          termo_id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          termo_id: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          termo_id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dicionario_termo_views_termo_id_fkey"
            columns: ["termo_id"]
            isOneToOne: false
            referencedRelation: "dicionario_juridico"
            referencedColumns: ["id"]
          },
        ]
      }
      estatisticas: {
        Row: {
          artigos_lidos: number | null
          aulas_assistidas: number | null
          created_at: string | null
          flashcards_feitos: number | null
          id: string
          resumos_criados: number | null
          user_id: string
        }
        Insert: {
          artigos_lidos?: number | null
          aulas_assistidas?: number | null
          created_at?: string | null
          flashcards_feitos?: number | null
          id?: string
          resumos_criados?: number | null
          user_id: string
        }
        Update: {
          artigos_lidos?: number | null
          aulas_assistidas?: number | null
          created_at?: string | null
          flashcards_feitos?: number | null
          id?: string
          resumos_criados?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estatisticas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Estatuto_da_Advocacia_e_da_OAB: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_da_Cidade: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_da_Criança_e_do_Adolescente: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_da_Igualdade_Racial: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_da_Pessoa_com_Deficiência: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_da_Terra: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_do_Desarmamento: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_do_Idoso: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_do_Torcedor: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      Estatuto_dos_Servidores_Públicos_Civis_da_União: {
        Row: {
          artigo: string | null
          exemplo: string | null
          formal: string | null
          id: number
          numero: string | null
          tecnica: string | null
        }
        Insert: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id: number
          numero?: string | null
          tecnica?: string | null
        }
        Update: {
          artigo?: string | null
          exemplo?: string | null
          formal?: string | null
          id?: number
          numero?: string | null
          tecnica?: string | null
        }
        Relationships: []
      }
      flash_cards: {
        Row: {
          area: string | null
          created_at: string
          explicacao: string | null
          id: number
          pergunta: string | null
          resposta: string | null
          tema: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          explicacao?: string | null
          id?: number
          pergunta?: string | null
          resposta?: string | null
          tema?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          explicacao?: string | null
          id?: number
          pergunta?: string | null
          resposta?: string | null
          tema?: string | null
        }
        Relationships: []
      }
      flash_cards_improved: {
        Row: {
          area: string
          created_at: string | null
          dificuldade: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          pergunta: string
          resposta: string
          status: string | null
          tags: string[] | null
          tema: string
          updated_at: string | null
        }
        Insert: {
          area: string
          created_at?: string | null
          dificuldade?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          pergunta: string
          resposta: string
          status?: string | null
          tags?: string[] | null
          tema: string
          updated_at?: string | null
        }
        Update: {
          area?: string
          created_at?: string | null
          dificuldade?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          pergunta?: string
          resposta?: string
          status?: string | null
          tags?: string[] | null
          tema?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      folder_links: {
        Row: {
          created_at: string | null
          document_links: string[] | null
          id: number
          image_links: string[] | null
          video_links: string[] | null
        }
        Insert: {
          created_at?: string | null
          document_links?: string[] | null
          id?: never
          image_links?: string[] | null
          video_links?: string[] | null
        }
        Update: {
          created_at?: string | null
          document_links?: string[] | null
          id?: never
          image_links?: string[] | null
          video_links?: string[] | null
        }
        Relationships: []
      }
      gamificacao: {
        Row: {
          conquistas: string[] | null
          created_at: string | null
          id: string
          nivel: number | null
          pontos: number | null
          streak_dias: number | null
          ultima_atividade: string | null
          user_id: string | null
        }
        Insert: {
          conquistas?: string[] | null
          created_at?: string | null
          id?: string
          nivel?: number | null
          pontos?: number | null
          streak_dias?: number | null
          ultima_atividade?: string | null
          user_id?: string | null
        }
        Update: {
          conquistas?: string[] | null
          created_at?: string | null
          id?: string
          nivel?: number | null
          pontos?: number | null
          streak_dias?: number | null
          ultima_atividade?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      Jurisflix: {
        Row: {
          ano: string | null
          beneficios: string | null
          capa: string | null
          id: number
          link: string | null
          nome: string | null
          nota: string | null
          plataforma: string | null
          sinopse: string | null
          tipo: string | null
          trailer: string | null
        }
        Insert: {
          ano?: string | null
          beneficios?: string | null
          capa?: string | null
          id?: number
          link?: string | null
          nome?: string | null
          nota?: string | null
          plataforma?: string | null
          sinopse?: string | null
          tipo?: string | null
          trailer?: string | null
        }
        Update: {
          ano?: string | null
          beneficios?: string | null
          capa?: string | null
          id?: number
          link?: string | null
          nome?: string | null
          nota?: string | null
          plataforma?: string | null
          sinopse?: string | null
          tipo?: string | null
          trailer?: string | null
        }
        Relationships: []
      }
      jurisprudencia: {
        Row: {
          area_direito: string | null
          created_at: string | null
          data_julgamento: string | null
          ementa: string
          id: string
          numero_processo: string | null
          relator: string | null
          titulo: string
          tribunal: string
        }
        Insert: {
          area_direito?: string | null
          created_at?: string | null
          data_julgamento?: string | null
          ementa: string
          id?: string
          numero_processo?: string | null
          relator?: string | null
          titulo: string
          tribunal: string
        }
        Update: {
          area_direito?: string | null
          created_at?: string | null
          data_julgamento?: string | null
          ementa?: string
          id?: string
          numero_processo?: string | null
          relator?: string | null
          titulo?: string
          tribunal?: string
        }
        Relationships: []
      }
      livros: {
        Row: {
          autor: string | null
          capa_url: string | null
          created_at: string | null
          descricao: string | null
          id: string
          link_pdf: string
          materia: string
          titulo: string
          updated_at: string | null
        }
        Insert: {
          autor?: string | null
          capa_url?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          link_pdf: string
          materia: string
          titulo: string
          updated_at?: string | null
        }
        Update: {
          autor?: string | null
          capa_url?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          link_pdf?: string
          materia?: string
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      livrospro: {
        Row: {
          capa_url: string | null
          categoria: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          pdf: string
          total_paginas: number | null
          updated_at: string
        }
        Insert: {
          capa_url?: string | null
          categoria: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          pdf: string
          total_paginas?: number | null
          updated_at?: string
        }
        Update: {
          capa_url?: string | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          pdf?: string
          total_paginas?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      livrospro_anotacoes: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          livro_id: string
          pagina: number
          posicao: Json | null
          texto: string
          user_id: string
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          livro_id: string
          pagina: number
          posicao?: Json | null
          texto: string
          user_id: string
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          livro_id?: string
          pagina?: number
          posicao?: Json | null
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livrospro_anotacoes_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "livrospro"
            referencedColumns: ["id"]
          },
        ]
      }
      livrospro_marcadores: {
        Row: {
          created_at: string
          id: string
          livro_id: string
          pagina: number
          titulo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          livro_id: string
          pagina: number
          titulo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          livro_id?: string
          pagina?: number
          titulo?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livrospro_marcadores_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "livrospro"
            referencedColumns: ["id"]
          },
        ]
      }
      livrospro_progresso: {
        Row: {
          id: string
          livro_id: string
          pagina_atual: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          livro_id: string
          pagina_atual?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          livro_id?: string
          pagina_atual?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "livrospro_progresso_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "livrospro"
            referencedColumns: ["id"]
          },
        ]
      }
      mapas_mentais: {
        Row: {
          area: string | null
          created_at: string
          id: number
          link: string | null
          mapa: string | null
        }
        Insert: {
          area?: string | null
          created_at?: string
          id?: number
          link?: string | null
          mapa?: string | null
        }
        Update: {
          area?: string | null
          created_at?: string
          id?: number
          link?: string | null
          mapa?: string | null
        }
        Relationships: []
      }
      noticias: {
        Row: {
          area_direito: string | null
          conteudo: string
          created_at: string | null
          data_publicacao: string | null
          fonte: string | null
          id: string
          thumbnail_url: string | null
          titulo: string
        }
        Insert: {
          area_direito?: string | null
          conteudo: string
          created_at?: string | null
          data_publicacao?: string | null
          fonte?: string | null
          id?: string
          thumbnail_url?: string | null
          titulo: string
        }
        Update: {
          area_direito?: string | null
          conteudo?: string
          created_at?: string | null
          data_publicacao?: string | null
          fonte?: string | null
          id?: string
          thumbnail_url?: string | null
          titulo?: string
        }
        Relationships: []
      }
      peticoes: {
        Row: {
          area: string
          descricao: string
          id: string
          link: string
          sub_area: string | null
          tags: string[] | null
          tipo: string
        }
        Insert: {
          area: string
          descricao: string
          id?: string
          link: string
          sub_area?: string | null
          tags?: string[] | null
          tipo: string
        }
        Update: {
          area?: string
          descricao?: string
          id?: string
          link?: string
          sub_area?: string | null
          tags?: string[] | null
          tipo?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      questao_estatisticas: {
        Row: {
          created_at: string | null
          id: string
          questao_id: number
          total_acertos: number | null
          total_tentativas: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          questao_id: number
          total_acertos?: number | null
          total_tentativas?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          questao_id?: number
          total_acertos?: number | null
          total_tentativas?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questao_estatisticas_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      questoes: {
        Row: {
          AnswerA: string | null
          AnswerB: string | null
          AnswerC: string | null
          AnswerD: string | null
          Area: string | null
          CorrectAnswerInfo: string | null
          CorrectAnswers: string | null
          id: number
          QuestionText: string | null
          Tema: string | null
        }
        Insert: {
          AnswerA?: string | null
          AnswerB?: string | null
          AnswerC?: string | null
          AnswerD?: string | null
          Area?: string | null
          CorrectAnswerInfo?: string | null
          CorrectAnswers?: string | null
          id?: number
          QuestionText?: string | null
          Tema?: string | null
        }
        Update: {
          AnswerA?: string | null
          AnswerB?: string | null
          AnswerC?: string | null
          AnswerD?: string | null
          Area?: string | null
          CorrectAnswerInfo?: string | null
          CorrectAnswers?: string | null
          id?: number
          QuestionText?: string | null
          Tema?: string | null
        }
        Relationships: []
      }
      resumos: {
        Row: {
          area: string
          id: string
          resumo: string | null
          tema: string
          topico: string
        }
        Insert: {
          area: string
          id?: string
          resumo?: string | null
          tema: string
          topico: string
        }
        Update: {
          area?: string
          id?: string
          resumo?: string | null
          tema?: string
          topico?: string
        }
        Relationships: []
      }
      simulado_estatisticas: {
        Row: {
          area: string | null
          categoria: string
          id: string
          percentual: number | null
          total_acertos: number | null
          total_respondidas: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area?: string | null
          categoria: string
          id?: string
          percentual?: number | null
          total_acertos?: number | null
          total_respondidas?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area?: string | null
          categoria?: string
          id?: string
          percentual?: number | null
          total_acertos?: number | null
          total_respondidas?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      simulado_respostas: {
        Row: {
          acertou: boolean | null
          created_at: string | null
          id: string
          questao_id: string
          resposta_selecionada: string | null
          sessao_id: string
          tempo_resposta: number | null
        }
        Insert: {
          acertou?: boolean | null
          created_at?: string | null
          id?: string
          questao_id: string
          resposta_selecionada?: string | null
          sessao_id: string
          tempo_resposta?: number | null
        }
        Update: {
          acertou?: boolean | null
          created_at?: string | null
          id?: string
          questao_id?: string
          resposta_selecionada?: string | null
          sessao_id?: string
          tempo_resposta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "simulado_respostas_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "simulado_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      simulado_sessoes: {
        Row: {
          acertos: number | null
          categoria: string
          completo: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          pontuacao: number | null
          tempo_total: number | null
          total_questoes: number
          user_id: string
        }
        Insert: {
          acertos?: number | null
          categoria: string
          completo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pontuacao?: number | null
          tempo_total?: number | null
          total_questoes: number
          user_id: string
        }
        Update: {
          acertos?: number | null
          categoria?: string
          completo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          pontuacao?: number | null
          tempo_total?: number | null
          total_questoes?: number
          user_id?: string
        }
        Relationships: []
      }
      simulados_delegado: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: number
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: number
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: number
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulados_juiz: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: number
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: number
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: number
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulados_oab: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string | null
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: string
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta?: string | null
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: string
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string | null
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: string
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulados_pf: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: number
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: number
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: number
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulados_prf: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: number
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: number
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: number
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulados_promotor: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: number
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: number
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: number
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      simulados_tjsp: {
        Row: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area: string | null
          banca: string
          created_at: string | null
          explicacao: string | null
          id: string
          imagem_url: string | null
          numero_questao: number
          questao: string
          updated_at: string | null
        }
        Insert: {
          alternativa_a: string
          alternativa_b: string
          alternativa_c: string
          alternativa_correta: string
          alternativa_d: string
          ano: number
          area?: string | null
          banca: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao: number
          questao: string
          updated_at?: string | null
        }
        Update: {
          alternativa_a?: string
          alternativa_b?: string
          alternativa_c?: string
          alternativa_correta?: string
          alternativa_d?: string
          ano?: number
          area?: string | null
          banca?: string
          created_at?: string | null
          explicacao?: string | null
          id?: string
          imagem_url?: string | null
          numero_questao?: number
          questao?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          achieved: boolean
          achieved_at: string | null
          badge_name: string
          created_at: string | null
          id: string
          progress: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          achieved?: boolean
          achieved_at?: string | null
          badge_name: string
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          achieved?: boolean
          achieved_at?: string | null
          badge_name?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_biblioteca: {
        Row: {
          anotacoes: string | null
          comentarios: string | null
          created_at: string | null
          favorito: boolean | null
          id: string
          lido: boolean | null
          livro_id: string | null
          progresso_leitura: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          anotacoes?: string | null
          comentarios?: string | null
          created_at?: string | null
          favorito?: boolean | null
          id?: string
          lido?: boolean | null
          livro_id?: string | null
          progresso_leitura?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          anotacoes?: string | null
          comentarios?: string | null
          created_at?: string | null
          favorito?: boolean | null
          id?: string
          lido?: boolean | null
          livro_id?: string | null
          progresso_leitura?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_biblioteca_livro_id_fkey"
            columns: ["livro_id"]
            isOneToOne: false
            referencedRelation: "biblioteca_juridica_improved"
            referencedColumns: ["id"]
          },
        ]
      }
      user_flashcards: {
        Row: {
          conhecimento: number | null
          created_at: string | null
          flashcard_id: string | null
          id: string
          proxima_revisao: string | null
          revisoes: number | null
          ultima_revisao: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          conhecimento?: number | null
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          proxima_revisao?: string | null
          revisoes?: number | null
          ultima_revisao?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          conhecimento?: number | null
          created_at?: string | null
          flashcard_id?: string | null
          id?: string
          proxima_revisao?: string | null
          revisoes?: number | null
          ultima_revisao?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_flashcards_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flash_cards_improved"
            referencedColumns: ["id"]
          },
        ]
      }
      user_question_responses: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_correct: boolean
          question_id: string
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_question_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "video_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_questoes: {
        Row: {
          acertou: boolean
          created_at: string | null
          id: string
          questao_id: number | null
          resposta_selecionada: string
          user_id: string | null
        }
        Insert: {
          acertou: boolean
          created_at?: string | null
          id?: string
          questao_id?: number | null
          resposta_selecionada: string
          user_id?: string | null
        }
        Update: {
          acertou?: boolean
          created_at?: string | null
          id?: string
          questao_id?: number | null
          resposta_selecionada?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_questoes_questao_id_fkey"
            columns: ["questao_id"]
            isOneToOne: false
            referencedRelation: "questoes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_statistics: {
        Row: {
          created_at: string | null
          flashcards_estudados: number | null
          id: string
          livros_lidos: number | null
          tempo_total_estudo: number | null
          updated_at: string | null
          user_id: string
          videos_assistidos: number | null
        }
        Insert: {
          created_at?: string | null
          flashcards_estudados?: number | null
          id?: string
          livros_lidos?: number | null
          tempo_total_estudo?: number | null
          updated_at?: string | null
          user_id: string
          videos_assistidos?: number | null
        }
        Update: {
          created_at?: string | null
          flashcards_estudados?: number | null
          id?: string
          livros_lidos?: number | null
          tempo_total_estudo?: number | null
          updated_at?: string | null
          user_id?: string
          videos_assistidos?: number | null
        }
        Relationships: []
      }
      user_vademecum_preferences: {
        Row: {
          created_at: string | null
          font_size: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          font_size?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          font_size?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_video_progress: {
        Row: {
          completed: boolean | null
          id: string
          last_watched_at: string | null
          user_id: string
          video_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          id?: string
          last_watched_at?: string | null
          user_id: string
          video_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          id?: string
          last_watched_at?: string | null
          user_id?: string
          video_id?: string
          watched_seconds?: number | null
        }
        Relationships: []
      }
      vademecum_favorites: {
        Row: {
          article_id: string
          article_number: string | null
          article_text: string
          created_at: string | null
          id: string
          law_name: string
          user_id: string
        }
        Insert: {
          article_id: string
          article_number?: string | null
          article_text: string
          created_at?: string | null
          id?: string
          law_name: string
          user_id: string
        }
        Update: {
          article_id?: string
          article_number?: string | null
          article_text?: string
          created_at?: string | null
          id?: string
          law_name?: string
          user_id?: string
        }
        Relationships: []
      }
      vademecum_history: {
        Row: {
          article_id: string
          article_number: string | null
          article_text: string
          id: string
          law_name: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          article_id: string
          article_number?: string | null
          article_text: string
          id?: string
          law_name: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          article_id?: string
          article_number?: string | null
          article_text?: string
          id?: string
          law_name?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      video_aulas: {
        Row: {
          area: string
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          professor: string | null
          thumbnail_url: string | null
          title: string
          url: string
          views: number | null
        }
        Insert: {
          area: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          professor?: string | null
          thumbnail_url?: string | null
          title: string
          url: string
          views?: number | null
        }
        Update: {
          area?: string
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          professor?: string | null
          thumbnail_url?: string | null
          title?: string
          url?: string
          views?: number | null
        }
        Relationships: []
      }
      video_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          id: string
          options: Json | null
          question: string
          timestamp: number
          video_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question: string
          timestamp: number
          video_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question?: string
          timestamp?: number
          video_id?: string
        }
        Relationships: []
      }
      video_transcripts: {
        Row: {
          created_at: string | null
          id: string
          transcript: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          transcript: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          transcript?: string
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      simulado_areas_dificeis: {
        Row: {
          area: string | null
          categoria: string | null
          media_percentual: number | null
          total_questoes: number | null
          total_usuarios: number | null
        }
        Relationships: []
      }
      temas_trending: {
        Row: {
          Area: string | null
          percentual_acertos: number | null
          Tema: string | null
          total_tentativas: number | null
          total_usuarios: number | null
        }
        Relationships: []
      }
      user_questoes_stats: {
        Row: {
          acertos_area: number | null
          area: string | null
          percentual_acertos: number | null
          percentual_area: number | null
          questoes_area: number | null
          total_acertos: number | null
          total_respondidas: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_simulado_leaderboard: {
        Args: { _categoria: string; _limit?: number }
        Returns: {
          user_id: string
          total_respondidas: number
          total_acertos: number
          percentual: number
          rank: number
        }[]
      }
      increment_user_statistic: {
        Args: { p_user_id: string; p_field: string; p_amount?: number }
        Returns: undefined
      }
      list_tables: {
        Args: { prefix: string }
        Returns: {
          table_name: string
        }[]
      }
      migrate_biblioteca_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_flashcards_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
