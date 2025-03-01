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
          id?: never
          question_id?: number | null
          score: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: boolean
          created_at?: string
          evaluation_id?: number | null
          id?: never
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
          id?: never
          pic: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_date?: string
          id?: never
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
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
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
          id?: never
          points?: number
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          points?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      cleanliness_evaluation_answers: {
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
          id?: never
          question_id?: number | null
          score: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: boolean
          created_at?: string
          evaluation_id?: number | null
          id?: never
          question_id?: number | null
          score?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleanliness_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "cleanliness_evaluation_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleanliness_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "cleanliness_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cleanliness_evaluation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "cleanliness_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      cleanliness_evaluations: {
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
          id?: never
          pic: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_date?: string
          id?: never
          pic?: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cleanliness_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "cleanliness_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      cleanliness_questions: {
        Row: {
          created_at: string
          id: number
          points: number
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          points?: number
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          points?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaint_records: {
        Row: {
          created_at: string
          gmaps_count: number
          id: number
          input_date: string
          late_handling_count: number
          online_order_count: number
          social_media_count: number
          store_id: number | null
          total_weighted_complaints: number
          updated_at: string
          whatsapp_count: number
        }
        Insert: {
          created_at?: string
          gmaps_count?: number
          id?: never
          input_date: string
          late_handling_count?: number
          online_order_count?: number
          social_media_count?: number
          store_id?: number | null
          total_weighted_complaints?: number
          updated_at?: string
          whatsapp_count?: number
        }
        Update: {
          created_at?: string
          gmaps_count?: number
          id?: never
          input_date?: string
          late_handling_count?: number
          online_order_count?: number
          social_media_count?: number
          store_id?: number | null
          total_weighted_complaints?: number
          updated_at?: string
          whatsapp_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "complaint_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "complaint_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_weights: {
        Row: {
          channel: string
          created_at: string
          id: number
          updated_at: string
          weight: number
        }
        Insert: {
          channel: string
          created_at?: string
          id?: never
          updated_at?: string
          weight?: number
        }
        Update: {
          channel?: string
          created_at?: string
          id?: never
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      employee_sanctions: {
        Row: {
          created_at: string
          duration_months: number
          employee_name: string
          id: number
          pic: string
          sanction_date: string
          sanction_type: string
          store_id: number | null
          submitted_by: string
          updated_at: string
          violation_details: string
        }
        Insert: {
          created_at?: string
          duration_months: number
          employee_name: string
          id?: never
          pic: string
          sanction_date: string
          sanction_type: string
          store_id?: number | null
          submitted_by: string
          updated_at?: string
          violation_details: string
        }
        Update: {
          created_at?: string
          duration_months?: number
          employee_name?: string
          id?: never
          pic?: string
          sanction_date?: string
          sanction_type?: string
          store_id?: number | null
          submitted_by?: string
          updated_at?: string
          violation_details?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_evaluations: {
        Row: {
          created_at: string
          evaluation_date: string
          final_score: number
          id: number
          kpi_score: number
          pic: string
          status: string
          store_id: number | null
          total_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          evaluation_date: string
          final_score?: number
          id?: never
          kpi_score?: number
          pic: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_date?: string
          final_score?: number
          id?: never
          kpi_score?: number
          pic?: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esp_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "esp_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_findings: {
        Row: {
          created_at: string
          deduction_points: number
          evaluation_id: number | null
          finding: string
          id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deduction_points?: number
          evaluation_id?: number | null
          finding: string
          id?: never
          updated_at?: string
        }
        Update: {
          created_at?: string
          deduction_points?: number
          evaluation_id?: number | null
          finding?: string
          id?: never
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "esp_findings_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "esp_evaluation_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "esp_findings_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "esp_evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          cogs_achieved: number
          created_at: string
          deleted_at: string | null
          id: number
          input_date: string
          pic: string
          store_id: number | null
          total_opex: number
          total_sales: number
          updated_at: string
        }
        Insert: {
          cogs_achieved: number
          created_at?: string
          deleted_at?: string | null
          id?: never
          input_date: string
          pic: string
          store_id?: number | null
          total_opex: number
          total_sales: number
          updated_at?: string
        }
        Update: {
          cogs_achieved?: number
          created_at?: string
          deleted_at?: string | null
          id?: never
          input_date?: string
          pic?: string
          store_id?: number | null
          total_opex?: number
          total_sales?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "financial_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_kpis: {
        Row: {
          champs_score: number | null
          cleanliness_score: number | null
          created_at: string
          date: string
          id: number
          product_quality_score: number | null
          productivity_score: number | null
          service_score: number | null
          store_id: number | null
          updated_at: string
        }
        Insert: {
          champs_score?: number | null
          cleanliness_score?: number | null
          created_at?: string
          date: string
          id?: never
          product_quality_score?: number | null
          productivity_score?: number | null
          service_score?: number | null
          store_id?: number | null
          updated_at?: string
        }
        Update: {
          champs_score?: number | null
          cleanliness_score?: number | null
          created_at?: string
          date?: string
          id?: never
          product_quality_score?: number | null
          productivity_score?: number | null
          service_score?: number | null
          store_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_kpis_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "performance_kpis_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_quality_evaluation_answers: {
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
          id?: never
          question_id?: number | null
          score: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: boolean
          created_at?: string
          evaluation_id?: number | null
          id?: never
          question_id?: number | null
          score?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_quality_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "product_quality_evaluation_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_quality_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "product_quality_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_quality_evaluation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "product_quality_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_quality_evaluations: {
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
          id?: never
          pic: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_date?: string
          id?: never
          pic?: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_quality_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "product_quality_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_quality_questions: {
        Row: {
          created_at: string
          id: number
          points: number
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          points?: number
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          points?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          last_montaz_login: string | null
          montaz_data: Json | null
          montaz_id: string | null
          montaz_password: string | null
          role_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          is_active?: boolean | null
          last_montaz_login?: string | null
          montaz_data?: Json | null
          montaz_id?: string | null
          montaz_password?: string | null
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_montaz_login?: string | null
          montaz_data?: Json | null
          montaz_id?: string | null
          montaz_password?: string | null
          role_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string
          id: string
          resource: string
          role_id: string | null
          updated_at: string
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          id?: string
          resource: string
          role_id?: string | null
          updated_at?: string
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string
          id?: string
          resource?: string
          role_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          role_level: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          role_level?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          role_level?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      service_evaluation_answers: {
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
          id?: never
          question_id?: number | null
          score: number
          status?: string
          updated_at?: string
        }
        Update: {
          answer?: boolean
          created_at?: string
          evaluation_id?: number | null
          id?: never
          question_id?: number | null
          score?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "service_evaluation_report"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_evaluation_answers_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "service_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_evaluation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "service_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_evaluations: {
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
          id?: never
          pic: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          evaluation_date?: string
          id?: never
          pic?: string
          status?: string
          store_id?: number | null
          total_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "service_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      service_questions: {
        Row: {
          created_at: string
          id: number
          points: number
          question: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          points?: number
          question: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          points?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          area: number | null
          avg_cu_per_day: number | null
          city: string
          cogs_target: number | null
          created_at: string
          id: number
          name: string
          opex_target: number | null
          regional: number | null
          target_sales: number | null
          total_crew: number | null
          total_employees: number | null
          updated_at: string
        }
        Insert: {
          area?: number | null
          avg_cu_per_day?: number | null
          city: string
          cogs_target?: number | null
          created_at?: string
          id?: never
          name: string
          opex_target?: number | null
          regional?: number | null
          target_sales?: number | null
          total_crew?: number | null
          total_employees?: number | null
          updated_at?: string
        }
        Update: {
          area?: number | null
          avg_cu_per_day?: number | null
          city?: string
          cogs_target?: number | null
          created_at?: string
          id?: never
          name?: string
          opex_target?: number | null
          regional?: number | null
          target_sales?: number | null
          total_crew?: number | null
          total_employees?: number | null
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
      cleanliness_evaluation_report: {
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
      complaint_records_report: {
        Row: {
          area: number | null
          avg_cu_per_day: number | null
          gmaps_count: number | null
          id: number | null
          input_date: string | null
          kpi_score: number | null
          late_handling_count: number | null
          online_order_count: number | null
          regional: number | null
          social_media_count: number | null
          store_name: string | null
          total_weighted_complaints: number | null
          whatsapp_count: number | null
        }
        Relationships: []
      }
      employee_sanctions_kpi: {
        Row: {
          active_peringatan: number | null
          active_sp1: number | null
          active_sp2: number | null
          kpi_score: number | null
          store_city: string | null
          store_id: number | null
          store_name: string | null
          total_employees: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_sanctions_report: {
        Row: {
          duration_months: number | null
          employee_name: string | null
          expiry_date: string | null
          id: number | null
          is_active: boolean | null
          pic: string | null
          sanction_date: string | null
          sanction_type: string | null
          sanction_weight: number | null
          store_city: string | null
          store_id: number | null
          store_name: string | null
          submitted_by: string | null
          violation_details: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "store_performance_metrics"
            referencedColumns: ["store_id"]
          },
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      esp_evaluation_report: {
        Row: {
          evaluation_date: string | null
          final_score: number | null
          id: number | null
          kpi_score: number | null
          pic: string | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_score: number | null
        }
        Relationships: []
      }
      financial_records_report: {
        Row: {
          area: number | null
          cogs_achieved: number | null
          cogs_target: number | null
          id: number | null
          input_date: string | null
          opex_target: number | null
          pic: string | null
          regional: number | null
          store_city: string | null
          store_name: string | null
          target_sales: number | null
          total_crew: number | null
          total_opex: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      product_quality_evaluation_report: {
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
      service_evaluation_report: {
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
      store_performance_metrics: {
        Row: {
          champs_score: number | null
          cleanliness_score: number | null
          cogs_achieved: number | null
          date: string | null
          product_quality_score: number | null
          productivity_score: number | null
          service_score: number | null
          store_id: number | null
          store_name: string | null
          total_opex: number | null
          total_sales: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      filter_evaluation_by_month_year: {
        Args: {
          target_month: number
          target_year: number
        }
        Returns: {
          evaluation_date: string
          month: number
          year: number
        }[]
      }
    }
    Enums: {
      permission_type: "create" | "read" | "update" | "delete"
      user_role: "admin" | "manager" | "supervisor" | "staff"
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
