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
          area_direito: string
          conteudo: string
          created_at: string | null
          descricao: string | null
          downloads: number | null
          id: string
          tags: string[] | null
          tipo_peca: string
          titulo: string
        }
        Insert: {
          area_direito: string
          conteudo: string
          created_at?: string | null
          descricao?: string | null
          downloads?: number | null
          id?: string
          tags?: string[] | null
          tipo_peca: string
          titulo: string
        }
        Update: {
          area_direito?: string
          conteudo?: string
          created_at?: string | null
          descricao?: string | null
          downloads?: number | null
          id?: string
          tags?: string[] | null
          tipo_peca?: string
          titulo?: string
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
      resumos: {
        Row: {
          area_direito: string
          autor: string | null
          conteudo: string
          created_at: string | null
          id: string
          likes: number | null
          tags: string[] | null
          titulo: string
        }
        Insert: {
          area_direito: string
          autor?: string | null
          conteudo: string
          created_at?: string | null
          id?: string
          likes?: number | null
          tags?: string[] | null
          titulo: string
        }
        Update: {
          area_direito?: string
          autor?: string | null
          conteudo?: string
          created_at?: string | null
          id?: string
          likes?: number | null
          tags?: string[] | null
          titulo?: string
        }
        Relationships: []
      }
      user_biblioteca: {
        Row: {
          anotacoes: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
