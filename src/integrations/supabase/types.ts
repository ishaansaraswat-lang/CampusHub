export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      event_coordinators: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_coordinators_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_gallery: {
        Row: {
          caption: string | null
          created_at: string
          event_id: string
          id: string
          image_url: string
          sub_event_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          event_id: string
          id?: string
          image_url: string
          sub_event_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          event_id?: string
          id?: string
          image_url?: string
          sub_event_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_gallery_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_gallery_sub_event_id_fkey"
            columns: ["sub_event_id"]
            isOneToOne: false
            referencedRelation: "sub_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["registration_status"]
          sub_event_id: string
          team_members: Json | null
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          sub_event_id: string
          team_members?: Json | null
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["registration_status"]
          sub_event_id?: string
          team_members?: Json | null
          team_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_sub_event_id_fkey"
            columns: ["sub_event_id"]
            isOneToOne: false
            referencedRelation: "sub_events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_results: {
        Row: {
          created_at: string
          id: string
          position: number
          remarks: string | null
          sub_event_id: string
          team_name: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          position: number
          remarks?: string | null
          sub_event_id: string
          team_name?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          remarks?: string | null
          sub_event_id?: string
          team_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_results_sub_event_id_fkey"
            columns: ["sub_event_id"]
            isOneToOne: false
            referencedRelation: "sub_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          slug: string
          start_date: string | null
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          slug: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          slug?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
        }
        Relationships: []
      }
      job_postings: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          eligibility_criteria: Json | null
          eligible_departments: string[] | null
          eligible_years: number[] | null
          id: string
          jd_file_url: string | null
          min_cgpa: number | null
          package_lpa: number | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          eligible_departments?: string[] | null
          eligible_years?: number[] | null
          id?: string
          jd_file_url?: string | null
          min_cgpa?: number | null
          package_lpa?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          eligibility_criteria?: Json | null
          eligible_departments?: string[] | null
          eligible_years?: number[] | null
          id?: string
          jd_file_url?: string | null
          min_cgpa?: number | null
          package_lpa?: number | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      placement_results: {
        Row: {
          created_at: string
          id: string
          job_id: string
          joined: boolean | null
          offer_letter_url: string | null
          package_offered: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          joined?: boolean | null
          offer_letter_url?: string | null
          package_offered?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          joined?: boolean | null
          offer_letter_url?: string | null
          package_offered?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "placement_results_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cgpa: number | null
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          phone: string | null
          student_id: string | null
          updated_at: string
          user_id: string
          year: number | null
        }
        Insert: {
          avatar_url?: string | null
          cgpa?: number | null
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          student_id?: string | null
          updated_at?: string
          user_id: string
          year?: number | null
        }
        Update: {
          avatar_url?: string | null
          cgpa?: number | null
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          student_id?: string | null
          updated_at?: string
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      sub_events: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          is_team_event: boolean
          max_participants: number | null
          name: string
          registration_deadline: string | null
          rules: string | null
          schedule: string | null
          team_size_max: number | null
          team_size_min: number | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          is_team_event?: boolean
          max_participants?: number | null
          name: string
          registration_deadline?: string | null
          rules?: string | null
          schedule?: string | null
          team_size_max?: number | null
          team_size_min?: number | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          is_team_event?: boolean
          max_participants?: number | null
          name?: string
          registration_deadline?: string | null
          rules?: string | null
          schedule?: string | null
          team_size_max?: number | null
          team_size_min?: number | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_events_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_event_coordinator: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "event_admin" | "placement_cell" | "super_admin"
      application_status:
        | "pending"
        | "shortlisted"
        | "rejected"
        | "selected"
        | "withdrawn"
      event_status: "draft" | "upcoming" | "active" | "completed" | "cancelled"
      job_status: "draft" | "open" | "closed" | "filled"
      registration_status: "pending" | "confirmed" | "cancelled" | "waitlisted"
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "event_admin", "placement_cell", "super_admin"],
      application_status: [
        "pending",
        "shortlisted",
        "rejected",
        "selected",
        "withdrawn",
      ],
      event_status: ["draft", "upcoming", "active", "completed", "cancelled"],
      job_status: ["draft", "open", "closed", "filled"],
      registration_status: ["pending", "confirmed", "cancelled", "waitlisted"],
    },
  },
} as const
