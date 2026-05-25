export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      itens_orcamento: {
        Row: {
          created_at: string
          descricao: string
          id: string
          orcamento_id: string
          quantidade: number
          valor_total: number | null
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          orcamento_id: string
          quantidade: number
          valor_total?: number | null
          valor_unitario: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          orcamento_id?: string
          quantidade?: number
          valor_total?: number | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_orcamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          mensagem: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          mensagem?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          numero: string
          observacoes: string | null
          prazo_estimado_dias: number | null
          prestador_id: string
          solicitacao_id: string
          status: Database["public"]["Enums"]["orcamento_status_enum"]
          updated_at: string
          validade_ate: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          prazo_estimado_dias?: number | null
          prestador_id: string
          solicitacao_id: string
          status?: Database["public"]["Enums"]["orcamento_status_enum"]
          updated_at?: string
          validade_ate?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          prazo_estimado_dias?: number | null
          prestador_id?: string
          solicitacao_id?: string
          status?: Database["public"]["Enums"]["orcamento_status_enum"]
          updated_at?: string
          validade_ate?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_orcamento"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cliente_id: string
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          numero: string
          observacoes: string | null
          orcamento_id: string
          prestador_id: string
          solicitacao_id: string
          status: Database["public"]["Enums"]["os_status_enum"]
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          orcamento_id: string
          prestador_id: string
          solicitacao_id: string
          status?: Database["public"]["Enums"]["os_status_enum"]
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          orcamento_id?: string
          prestador_id?: string
          solicitacao_id?: string
          status?: Database["public"]["Enums"]["os_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_prestador_id_fkey"
            columns: ["prestador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_solicitacao_id_fkey"
            columns: ["solicitacao_id"]
            isOneToOne: false
            referencedRelation: "solicitacoes_orcamento"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          documento: string | null
          email: string
          especialidade: string | null
          id: string
          nome: string
          role: Database["public"]["Enums"]["role_enum"]
          status_aprovacao: "pendente" | "aprovado" | "recusado"
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          documento?: string | null
          email: string
          especialidade?: string | null
          id: string
          nome: string
          role: Database["public"]["Enums"]["role_enum"]
          status_aprovacao?: "pendente" | "aprovado" | "recusado"
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          documento?: string | null
          email?: string
          especialidade?: string | null
          id?: string
          nome?: string
          role?: Database["public"]["Enums"]["role_enum"]
          status_aprovacao?: "pendente" | "aprovado" | "recusado"
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      solicitacoes_orcamento: {
        Row: {
          categoria: string | null
          cliente_id: string
          created_at: string
          deleted_at: string | null
          descricao: string
          equipamento: string | null
          id: string
          numero: string
          status: Database["public"]["Enums"]["solicitacao_status_enum"]
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          cliente_id: string
          created_at?: string
          deleted_at?: string | null
          descricao: string
          equipamento?: string | null
          id?: string
          numero?: string
          status?: Database["public"]["Enums"]["solicitacao_status_enum"]
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          cliente_id?: string
          created_at?: string
          deleted_at?: string | null
          descricao?: string
          equipamento?: string | null
          id?: string
          numero?: string
          status?: Database["public"]["Enums"]["solicitacao_status_enum"]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitacoes_orcamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      status_historico: {
        Row: {
          created_at: string
          id: string
          observacao: string | null
          registro_id: string
          status_anterior: string | null
          status_novo: string
          tabela_nome: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          observacao?: string | null
          registro_id: string
          status_anterior?: string | null
          status_novo: string
          tabela_nome: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          observacao?: string | null
          registro_id?: string
          status_anterior?: string | null
          status_novo?: string
          tabela_nome?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "status_historico_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_criar_usuario: {
        Args: {
          p_email: string
          p_senha: string
          p_nome: string
          p_role: string
          p_telefone: string | null
          p_especialidade: string | null
        }
        Returns: string
      }
      admin_deletar_usuario: { Args: { p_user_id: string }; Returns: unknown }
      aprovar_orcamento: { Args: { p_orcamento_id: string }; Returns: string }
      gerar_numero_orcamento: { Args: never; Returns: string }
      gerar_numero_os: { Args: never; Returns: string }
      gerar_numero_solicitacao: { Args: never; Returns: string }
    }
    Enums: {
      orcamento_status_enum: "rascunho" | "enviado" | "aceito" | "recusado"
      os_status_enum: "aberta" | "em_andamento" | "concluida" | "cancelada"
      role_enum: "cliente" | "prestador" | "admin"
      solicitacao_status_enum:
        | "aberta"
        | "aguardando_orcamento"
        | "orcamento_enviado"
        | "aprovado"
        | "cancelado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends { Row: infer R }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends { Row: infer R }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends { Update: infer U }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      orcamento_status_enum: ["rascunho", "enviado", "aceito", "recusado"],
      os_status_enum: ["aberta", "em_andamento", "concluida", "cancelada"],
      role_enum: ["cliente", "prestador", "admin"],
      solicitacao_status_enum: [
        "aberta",
        "aguardando_orcamento",
        "orcamento_enviado",
        "aprovado",
        "cancelado",
      ],
    },
  },
} as const
