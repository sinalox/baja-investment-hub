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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: [
        ]
      }
      interactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          lead_id: string
          scheduled_at: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          scheduled_at?: string | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          scheduled_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string
          property_type: string
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone: string
          property_type: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          property_type?: string
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          access_status: string | null
          area: string
          area_m2: number | null
          arrival_reference: string | null
          baths: number | null
          built_area_m2: number | null
          beds: number | null
          category: string
          code: string
          created_at: string
          cta: string | null
          currency: string
          depth_m: number | null
          description: string | null
          differentiators: string[]
          distances: string | null
          featured: boolean
          frontage_m: number | null
          id: string
          image_url: string | null
          images: string[]
          location: string
          lot_type: string[]
          measures_note: string | null
          price: number
          status: string
          title: string
          topography: string | null
          type: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          access_status?: string | null
          area: string
          area_m2?: number | null
          arrival_reference?: string | null
          baths?: number | null
          built_area_m2?: number | null
          beds?: number | null
          category: string
          code?: string
          created_at?: string
          cta?: string | null
          currency?: string
          depth_m?: number | null
          description?: string | null
          differentiators?: string[]
          distances?: string | null
          featured?: boolean
          frontage_m?: number | null
          id?: string
          image_url?: string | null
          images?: string[]
          location: string
          lot_type?: string[]
          measures_note?: string | null
          price: number
          status?: string
          title: string
          topography?: string | null
          type: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          access_status?: string | null
          area?: string
          area_m2?: number | null
          arrival_reference?: string | null
          baths?: number | null
          built_area_m2?: number | null
          beds?: number | null
          category?: string
          code?: string
          created_at?: string
          cta?: string | null
          currency?: string
          depth_m?: number | null
          description?: string | null
          differentiators?: string[]
          distances?: string | null
          featured?: boolean
          frontage_m?: number | null
          id?: string
          image_url?: string | null
          images?: string[]
          location?: string
          lot_type?: string[]
          measures_note?: string | null
          price?: number
          status?: string
          title?: string
          topography?: string | null
          type?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
        ]
      }
      property_documents: {
        Row: {
          doc_type: string
          note: string | null
          property_id: string
          received: boolean
          reviewed: boolean
          reviewed_at: string | null
        }
        Insert: {
          doc_type: string
          note?: string | null
          property_id: string
          received?: boolean
          reviewed?: boolean
          reviewed_at?: string | null
        }
        Update: {
          doc_type?: string
          note?: string | null
          property_id?: string
          received?: boolean
          reviewed?: boolean
          reviewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          buyer_costs: string | null
          buyer_costs_status: string
          buyer_profile: string | null
          contract_type: string | null
          contract_valid_until: string | null
          created_at: string
          deed_area_m2: number | null
          docs_reviewed_at: string | null
          docs_reviewed_by: string | null
          down_payment: number | null
          drive_url: string | null
          ficha_version: number
          financing_confirmed: boolean
          interest_and_fees: string | null
          land_use: string | null
          land_use_confirmed: boolean
          last_verified_at: string | null
          last_verified_via: string | null
          maps_url: string | null
          measures_diff_note: string | null
          measures_differ: boolean | null
          monthly_payment: number | null
          open_alerts: string | null
          owner_contact: string | null
          owner_name: string | null
          payment_requirements: string | null
          photos_taken_at: string | null
          price_valid_until: string | null
          price_verified_at: string | null
          property_id: string
          publish_buyer_costs: boolean
          publish_exact_location: boolean
          publish_payment_requirements: boolean
          publish_tenure: boolean
          real_area_m2: number | null
          tenure_type: string | null
          term_months: number | null
          unpublished_notes: string | null
          updated_at: string
          verified_by: string | null
          workflow_status: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          buyer_costs?: string | null
          buyer_costs_status?: string
          buyer_profile?: string | null
          contract_type?: string | null
          contract_valid_until?: string | null
          created_at?: string
          deed_area_m2?: number | null
          docs_reviewed_at?: string | null
          docs_reviewed_by?: string | null
          down_payment?: number | null
          drive_url?: string | null
          ficha_version?: number
          financing_confirmed?: boolean
          interest_and_fees?: string | null
          land_use?: string | null
          land_use_confirmed?: boolean
          last_verified_at?: string | null
          last_verified_via?: string | null
          maps_url?: string | null
          measures_diff_note?: string | null
          measures_differ?: boolean | null
          monthly_payment?: number | null
          open_alerts?: string | null
          owner_contact?: string | null
          owner_name?: string | null
          payment_requirements?: string | null
          photos_taken_at?: string | null
          price_valid_until?: string | null
          price_verified_at?: string | null
          property_id: string
          publish_buyer_costs?: boolean
          publish_exact_location?: boolean
          publish_payment_requirements?: boolean
          publish_tenure?: boolean
          real_area_m2?: number | null
          tenure_type?: string | null
          term_months?: number | null
          unpublished_notes?: string | null
          updated_at?: string
          verified_by?: string | null
          workflow_status?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          buyer_costs?: string | null
          buyer_costs_status?: string
          buyer_profile?: string | null
          contract_type?: string | null
          contract_valid_until?: string | null
          created_at?: string
          deed_area_m2?: number | null
          docs_reviewed_at?: string | null
          docs_reviewed_by?: string | null
          down_payment?: number | null
          drive_url?: string | null
          ficha_version?: number
          financing_confirmed?: boolean
          interest_and_fees?: string | null
          land_use?: string | null
          land_use_confirmed?: boolean
          last_verified_at?: string | null
          last_verified_via?: string | null
          maps_url?: string | null
          measures_diff_note?: string | null
          measures_differ?: boolean | null
          monthly_payment?: number | null
          open_alerts?: string | null
          owner_contact?: string | null
          owner_name?: string | null
          payment_requirements?: string | null
          photos_taken_at?: string | null
          price_valid_until?: string | null
          price_verified_at?: string | null
          property_id?: string
          publish_buyer_costs?: boolean
          publish_exact_location?: boolean
          publish_payment_requirements?: boolean
          publish_tenure?: boolean
          real_area_m2?: number | null
          tenure_type?: string | null
          term_months?: number | null
          unpublished_notes?: string | null
          updated_at?: string
          verified_by?: string | null
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_records_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_services: {
        Row: {
          evidence_note: string | null
          property_id: string
          service: string
          status: string
        }
        Insert: {
          evidence_note?: string | null
          property_id: string
          service: string
          status?: string
        }
        Update: {
          evidence_note?: string | null
          property_id?: string
          service?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_services_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
          role: Database["public"]["Enums"]["app_role"]
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
      public_properties: {
        Row: {
          access_status: string | null
          area: string | null
          area_m2: number | null
          arrival_reference: string | null
          baths: number | null
          beds: number | null
          built_area_m2: number | null
          buyer_costs: string | null
          buyer_costs_status: string | null
          code: string | null
          cta: string | null
          currency: string | null
          depth_m: number | null
          description: string | null
          differentiators: string[] | null
          distances: string | null
          down_payment: number | null
          featured: boolean | null
          frontage_m: number | null
          id: string | null
          image_url: string | null
          images: string[] | null
          interest_and_fees: string | null
          land_use: string | null
          location: string | null
          lot_type: string[] | null
          maps_url: string | null
          measures_note: string | null
          monthly_payment: number | null
          payment_requirements: string | null
          price: number | null
          price_updated_at: string | null
          services: Json | null
          status: string | null
          tenure_type: string | null
          term_months: number | null
          title: string | null
          topography: string | null
          type: string | null
          video_url: string | null
        }
        Relationships: [
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      publish_blockers: {
        Args: { p_property_id: string }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
