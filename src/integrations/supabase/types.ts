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
          answer: boolean | null
          created_at: string | null
          evaluation_id: number | null
          id: number
          question_id: number | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
          created_at: string | null
          evaluation_date: string
          id: number
          pic: string
          status: string | null
          store_id: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_date: string
          id?: number
          pic: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_date?: string
          id?: number
          pic?: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "champs_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          id: number
          points: number
          question: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          points?: number
          question: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          points?: number
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cleanliness_evaluation_answers: {
        Row: {
          answer: boolean | null
          created_at: string | null
          evaluation_id: number | null
          id: number
          question_id: number | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
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
          created_at: string | null
          evaluation_date: string
          id: number
          pic: string
          status: string | null
          store_id: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_date: string
          id?: number
          pic: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_date?: string
          id?: number
          pic?: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleanliness_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          id: number
          points: number
          question: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          points?: number
          question: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          points?: number
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      complaint_records: {
        Row: {
          created_at: string | null
          gmaps_count: number | null
          id: number
          input_date: string
          late_handling_count: number | null
          online_order_count: number | null
          social_media_count: number | null
          store_id: number | null
          total_weighted_complaints: number | null
          updated_at: string | null
          whatsapp_count: number | null
        }
        Insert: {
          created_at?: string | null
          gmaps_count?: number | null
          id?: number
          input_date: string
          late_handling_count?: number | null
          online_order_count?: number | null
          social_media_count?: number | null
          store_id?: number | null
          total_weighted_complaints?: number | null
          updated_at?: string | null
          whatsapp_count?: number | null
        }
        Update: {
          created_at?: string | null
          gmaps_count?: number | null
          id?: number
          input_date?: string
          late_handling_count?: number | null
          online_order_count?: number | null
          social_media_count?: number | null
          store_id?: number | null
          total_weighted_complaints?: number | null
          updated_at?: string | null
          whatsapp_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "complaint_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          id: number
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: number
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      employee_sanctions: {
        Row: {
          created_at: string | null
          duration_months: number | null
          employee_name: string | null
          expiry_date: string | null
          id: number
          input_date: string
          is_active: boolean | null
          peringatan_count: number | null
          pic: string
          sanction_type: string | null
          sp1_count: number | null
          sp2_count: number | null
          status: string | null
          store_id: number | null
          submitted_by: string | null
          updated_at: string | null
          violation_details: string | null
        }
        Insert: {
          created_at?: string | null
          duration_months?: number | null
          employee_name?: string | null
          expiry_date?: string | null
          id?: number
          input_date: string
          is_active?: boolean | null
          peringatan_count?: number | null
          pic: string
          sanction_type?: string | null
          sp1_count?: number | null
          sp2_count?: number | null
          status?: string | null
          store_id?: number | null
          submitted_by?: string | null
          updated_at?: string | null
          violation_details?: string | null
        }
        Update: {
          created_at?: string | null
          duration_months?: number | null
          employee_name?: string | null
          expiry_date?: string | null
          id?: number
          input_date?: string
          is_active?: boolean | null
          peringatan_count?: number | null
          pic?: string
          sanction_type?: string | null
          sp1_count?: number | null
          sp2_count?: number | null
          status?: string | null
          store_id?: number | null
          submitted_by?: string | null
          updated_at?: string | null
          violation_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_sanctions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          evaluation_date: string
          final_score: number | null
          findings: string[] | null
          id: number
          pic: string
          status: string | null
          store_id: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_date: string
          final_score?: number | null
          findings?: string[] | null
          id?: number
          pic: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_date?: string
          final_score?: number | null
          findings?: string[] | null
          id?: number
          pic?: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "esp_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          deduction_points: number
          evaluation_id: number
          finding: string
          id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deduction_points?: number
          evaluation_id: number
          finding: string
          id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deduction_points?: number
          evaluation_id?: number
          finding?: string
          id?: number
          updated_at?: string | null
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
          cogs_achieved: number | null
          created_at: string | null
          deleted_at: string | null
          id: number
          input_date: string
          pic: string
          store_id: number | null
          total_opex: number | null
          total_sales: number | null
          updated_at: string | null
        }
        Insert: {
          cogs_achieved?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          input_date: string
          pic: string
          store_id?: number | null
          total_opex?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          cogs_achieved?: number | null
          created_at?: string | null
          deleted_at?: string | null
          id?: number
          input_date?: string
          pic?: string
          store_id?: number | null
          total_opex?: number | null
          total_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
      product_quality_evaluation_answers: {
        Row: {
          answer: boolean | null
          created_at: string | null
          evaluation_id: number | null
          id: number
          question_id: number | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
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
          created_at: string | null
          evaluation_date: string
          id: number
          pic: string
          status: string | null
          store_id: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_date: string
          id?: number
          pic: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_date?: string
          id?: number
          pic?: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_quality_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          id: number
          points: number
          question: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          points?: number
          question: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          points?: number
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          id: number
          resource: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: number
          resource: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: number
          resource?: string
          role_id?: string
          updated_at?: string | null
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
          created_at: string | null
          description: string | null
          id: string
          name: string
          role_level: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          role_level: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          role_level?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_evaluation_answers: {
        Row: {
          answer: boolean | null
          created_at: string | null
          evaluation_id: number | null
          id: number
          question_id: number | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          answer?: boolean | null
          created_at?: string | null
          evaluation_id?: number | null
          id?: number
          question_id?: number | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
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
          created_at: string | null
          evaluation_date: string
          id: number
          pic: string
          status: string | null
          store_id: number | null
          total_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          evaluation_date: string
          id?: number
          pic: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          evaluation_date?: string
          id?: number
          pic?: string
          status?: string | null
          store_id?: number | null
          total_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_evaluations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "employee_sanctions_kpi"
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
          created_at: string | null
          id: number
          points: number
          question: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          points?: number
          question: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          points?: number
          question?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          area: number | null
          avg_cu_per_day: number | null
          city: string | null
          cogs_target: number | null
          created_at: string | null
          id: number
          name: string
          opex_target: number | null
          regional: number | null
          target_sales: number | null
          total_crew: number | null
          updated_at: string | null
        }
        Insert: {
          area?: number | null
          avg_cu_per_day?: number | null
          city?: string | null
          cogs_target?: number | null
          created_at?: string | null
          id?: number
          name: string
          opex_target?: number | null
          regional?: number | null
          target_sales?: number | null
          total_crew?: number | null
          updated_at?: string | null
        }
        Update: {
          area?: number | null
          avg_cu_per_day?: number | null
          city?: string | null
          cogs_target?: number | null
          created_at?: string | null
          id?: number
          name?: string
          opex_target?: number | null
          regional?: number | null
          target_sales?: number | null
          total_crew?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      cleanliness_evaluation_report: {
        Row: {
          area: number | null
          created_at: string | null
          evaluation_date: string | null
          id: number | null
          pic: string | null
          regional: number | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_score: number | null
          updated_at: string | null
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
          late_handling_count: number | null
          online_order_count: number | null
          regional: number | null
          social_media_count: number | null
          store_city: string | null
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
        Relationships: []
      }
      employee_sanctions_report: {
        Row: {
          area: number | null
          created_at: string | null
          id: number | null
          input_date: string | null
          kpi_score: number | null
          peringatan_count: number | null
          pic: string | null
          regional: number | null
          sp1_count: number | null
          sp2_count: number | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_crew: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      esp_evaluation_report: {
        Row: {
          area: number | null
          created_at: string | null
          evaluation_date: string | null
          final_score: number | null
          id: number | null
          kpi_score: number | null
          pic: string | null
          regional: number | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_score: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      financial_records_report: {
        Row: {
          area: number | null
          cogs_achieved: number | null
          cogs_target: number | null
          created_at: string | null
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
          updated_at: string | null
        }
        Relationships: []
      }
      product_quality_evaluation_report: {
        Row: {
          area: number | null
          created_at: string | null
          evaluation_date: string | null
          id: number | null
          pic: string | null
          regional: number | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_score: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      service_evaluation_report: {
        Row: {
          area: number | null
          created_at: string | null
          evaluation_date: string | null
          id: number | null
          pic: string | null
          regional: number | null
          status: string | null
          store_city: string | null
          store_name: string | null
          total_score: number | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_user_password: {
        Args: {
          user_id: string
          new_password: string
        }
        Returns: undefined
      }
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
      get_employee_sanction_report: {
        Args: {
          sanction_id_param: number
        }
        Returns: {
          id: number
          store_id: number
          employee_name: string
          sanction_type: string
          sanction_date: string
          duration_months: number
          expiry_date: string
          violation_details: string
          submitted_by: string
          is_active: boolean
          pic: string
          store_name: string
          store_city: string
          created_at: string
          updated_at: string
          input_date: string
          area: number
          regional: number
          total_crew: number
        }[]
      }
      get_employee_sanctions_by_store: {
        Args: {
          store_id_param: number
        }
        Returns: {
          created_at: string | null
          duration_months: number | null
          employee_name: string | null
          expiry_date: string | null
          id: number
          input_date: string
          is_active: boolean | null
          peringatan_count: number | null
          pic: string
          sanction_type: string | null
          sp1_count: number | null
          sp2_count: number | null
          status: string | null
          store_id: number | null
          submitted_by: string | null
          updated_at: string | null
          violation_details: string | null
        }[]
      }
      get_employee_sanctions_kpi: {
        Args: {
          store_id_param: number
        }
        Returns: {
          store_id: number
          store_name: string
          store_city: string
          total_employees: number
          active_peringatan: number
          active_sp1: number
          active_sp2: number
          kpi_score: number
        }[]
      }
      get_esp_findings_by_evaluation_id: {
        Args: {
          evaluation_id_param: number
        }
        Returns: {
          created_at: string | null
          deduction_points: number
          evaluation_id: number
          finding: string
          id: number
          updated_at: string | null
        }[]
      }
      get_user_id_by_email: {
        Args: {
          email_param: string
        }
        Returns: string
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
