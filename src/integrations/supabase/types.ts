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
      champs_evaluation_answers: {
        Row: {
          answer: boolean
          created_at: string
          evaluation_id: number | null
          id: number
          question_id: number | null
          score: number
          status: string
          updated_at: string
        }
        Insert: {
          answer: boolean
          created_at?: string
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: boolean
          created_at?: string
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "champs_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "champs_evaluation_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champs_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "champs_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "champs_evaluation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "champs_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      champs_evaluations: {
        Row: {
          created_at: string
          evaluation_date: string
          id: number
          pic: string
          status: string
          store_id: number | null
          total_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          evaluation_date: string
          id?: number
          pic: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_date?: string
          id?: number
          pic?: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "champs_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      champs_questions: {
        Row: {
          created_at: string
          id: number
          points: number
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          points?: number
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          points?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          area: number | null
          city: string
          cogs_target: number | null
          created_at: string
          id: number
          name: string
          regional: number | null
          total_crew: number | null
          updated_at: string
        }
        Insert: {
          area?: number | null
          city: string
          cogs_target?: number | null
          created_at?: string
          id?: number
          name: string
          regional?: number | null
          total_crew?: number | null
          updated_at?: string
        }
        Update: {
          area?: number | null
          city?: string
          cogs_target?: number | null
          created_at?: string
          id?: number
          name?: string
          regional?: number | null
          total_crew?: number | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      champs_evaluation_report: {
        Row: {
          evaluation_date: string | null
          id: number | null
          pic: string | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_score: number | null
        }
        Relationships: []
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
