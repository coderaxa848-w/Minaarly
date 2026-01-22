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
      event_interests: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          category: Database["public"]["Enums"]["event_category"] | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_date: string
          guest_speaker: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          is_recurring: boolean | null
          mosque_id: string
          start_time: string
          title: string
          topic: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          guest_speaker?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_recurring?: boolean | null
          mosque_id: string
          start_time: string
          title: string
          topic?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          guest_speaker?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          is_recurring?: boolean | null
          mosque_id?: string
          start_time?: string
          title?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      iqamah_times: {
        Row: {
          asr: string | null
          dhuhr: string | null
          fajr: string | null
          id: string
          isha: string | null
          jummah: string | null
          last_updated: string | null
          maghrib: string | null
          mosque_id: string
          use_api_times: boolean | null
        }
        Insert: {
          asr?: string | null
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jummah?: string | null
          last_updated?: string | null
          maghrib?: string | null
          mosque_id: string
          use_api_times?: boolean | null
        }
        Update: {
          asr?: string | null
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jummah?: string | null
          last_updated?: string | null
          maghrib?: string | null
          mosque_id?: string
          use_api_times?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "iqamah_times_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: true
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      mosque_admins: {
        Row: {
          claimant_email: string | null
          claimant_name: string | null
          claimant_phone: string | null
          claimant_role: Database["public"]["Enums"]["claimant_role"] | null
          created_at: string | null
          id: string
          mosque_id: string
          notes: string | null
          status: Database["public"]["Enums"]["claim_status"] | null
          user_id: string | null
        }
        Insert: {
          claimant_email?: string | null
          claimant_name?: string | null
          claimant_phone?: string | null
          claimant_role?: Database["public"]["Enums"]["claimant_role"] | null
          created_at?: string | null
          id?: string
          mosque_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["claim_status"] | null
          user_id?: string | null
        }
        Update: {
          claimant_email?: string | null
          claimant_name?: string | null
          claimant_phone?: string | null
          claimant_role?: Database["public"]["Enums"]["claimant_role"] | null
          created_at?: string | null
          id?: string
          mosque_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["claim_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mosque_admins_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      mosques: {
        Row: {
          address: string
          background_image_url: string | null
          city: string
          county: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facilities: string[] | null
          id: string
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          madhab: string | null
          name: string
          phone: string | null
          postcode: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address: string
          background_image_url?: string | null
          city: string
          county?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          name: string
          phone?: string | null
          postcode: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          background_image_url?: string | null
          city?: string
          county?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          name?: string
          phone?: string | null
          postcode?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      saved_mosques: {
        Row: {
          created_at: string | null
          id: string
          mosque_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mosque_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mosque_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_mosques_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      generate_slug: { Args: { city: string; name: string }; Returns: string }
      get_event_interested_count: {
        Args: { _event_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_mosque_admin: {
        Args: { _mosque_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mosque_admin" | "user"
      claim_status: "pending" | "approved" | "rejected"
      claimant_role: "imam" | "committee_member" | "volunteer" | "other"
      event_category:
        | "halaqa"
        | "quran_class"
        | "youth"
        | "sisters"
        | "community"
        | "lecture"
        | "jummah"
        | "fundraiser"
        | "iftar"
        | "other"
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
      app_role: ["admin", "mosque_admin", "user"],
      claim_status: ["pending", "approved", "rejected"],
      claimant_role: ["imam", "committee_member", "volunteer", "other"],
      event_category: [
        "halaqa",
        "quran_class",
        "youth",
        "sisters",
        "community",
        "lecture",
        "jummah",
        "fundraiser",
        "iftar",
        "other",
      ],
    },
  },
} as const
