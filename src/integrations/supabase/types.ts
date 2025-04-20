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
          email: string | null
          id: string
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      recent_access: {
        Row: {
          accessed_at: string | null
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          accessed_at?: string | null
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          accessed_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
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
      [_ in never]: never
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
