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
      community_events: {
        Row: {
          admin_notes: string | null
          audience: Database["public"]["Enums"]["event_audience"]
          category: Database["public"]["Enums"]["event_category"] | null
          created_at: string
          custom_location: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["community_event_type"]
          id: string
          image_url: string | null
          is_at_mosque: boolean
          latitude: number | null
          longitude: number | null
          mosque_id: string | null
          organizer_email: string | null
          organizer_name: string
          organizer_phone: string | null
          postcode: string | null
          start_time: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          audience?: Database["public"]["Enums"]["event_audience"]
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string
          custom_location?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: Database["public"]["Enums"]["community_event_type"]
          id?: string
          image_url?: string | null
          is_at_mosque?: boolean
          latitude?: number | null
          longitude?: number | null
          mosque_id?: string | null
          organizer_email?: string | null
          organizer_name: string
          organizer_phone?: string | null
          postcode?: string | null
          start_time: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          audience?: Database["public"]["Enums"]["event_audience"]
          category?: Database["public"]["Enums"]["event_category"] | null
          created_at?: string
          custom_location?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["community_event_type"]
          id?: string
          image_url?: string | null
          is_at_mosque?: boolean
          latitude?: number | null
          longitude?: number | null
          mosque_id?: string | null
          organizer_email?: string | null
          organizer_name?: string
          organizer_phone?: string | null
          postcode?: string | null
          start_time?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_events_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
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
      event_organizer_profiles: {
        Row: {
          admin_notes: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          org_type: string
          social_instagram: string | null
          social_twitter: string | null
          social_website: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          org_type?: string
          social_instagram?: string | null
          social_twitter?: string | null
          social_website?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          org_type?: string
          social_instagram?: string | null
          social_twitter?: string | null
          social_website?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          capacity: number | null
          city: string
          contact_page: string | null
          county: string | null
          created_at: string | null
          denomination: string | null
          description: string | null
          email: string | null
          established: string | null
          facilities: string[] | null
          id: string
          iftar_facilities: string | null
          is_multi_faith: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          madhab: string | null
          management: string | null
          muslims_in_britain_data: boolean | null
          name: string
          parking_availability: string | null
          parking_type: string | null
          phone: string | null
          postcode: string
          qiyamul_layl: string | null
          services: string[] | null
          slug: string
          social_links: Json | null
          tarawih_rakah: string | null
          tarawih_type: string | null
          updated_at: string | null
          usage_type: string | null
          website: string | null
          wheelchair_parking: boolean | null
          wheelchair_prayer_hall: boolean | null
          wheelchair_wudu: boolean | null
          womens_wudu: string | null
          wudu_facilities: string | null
        }
        Insert: {
          address: string
          background_image_url?: string | null
          capacity?: number | null
          city: string
          contact_page?: string | null
          county?: string | null
          created_at?: string | null
          denomination?: string | null
          description?: string | null
          email?: string | null
          established?: string | null
          facilities?: string[] | null
          id?: string
          iftar_facilities?: string | null
          is_multi_faith?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          management?: string | null
          muslims_in_britain_data?: boolean | null
          name: string
          parking_availability?: string | null
          parking_type?: string | null
          phone?: string | null
          postcode: string
          qiyamul_layl?: string | null
          services?: string[] | null
          slug: string
          social_links?: Json | null
          tarawih_rakah?: string | null
          tarawih_type?: string | null
          updated_at?: string | null
          usage_type?: string | null
          website?: string | null
          wheelchair_parking?: boolean | null
          wheelchair_prayer_hall?: boolean | null
          wheelchair_wudu?: boolean | null
          womens_wudu?: string | null
          wudu_facilities?: string | null
        }
        Update: {
          address?: string
          background_image_url?: string | null
          capacity?: number | null
          city?: string
          contact_page?: string | null
          county?: string | null
          created_at?: string | null
          denomination?: string | null
          description?: string | null
          email?: string | null
          established?: string | null
          facilities?: string[] | null
          id?: string
          iftar_facilities?: string | null
          is_multi_faith?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          management?: string | null
          muslims_in_britain_data?: boolean | null
          name?: string
          parking_availability?: string | null
          parking_type?: string | null
          phone?: string | null
          postcode?: string
          qiyamul_layl?: string | null
          services?: string[] | null
          slug?: string
          social_links?: Json | null
          tarawih_rakah?: string | null
          tarawih_type?: string | null
          updated_at?: string | null
          usage_type?: string | null
          website?: string | null
          wheelchair_parking?: boolean | null
          wheelchair_prayer_hall?: boolean | null
          wheelchair_wudu?: boolean | null
          womens_wudu?: string | null
          wudu_facilities?: string | null
        }
        Relationships: []
      }
      mosques_backup_20260207: {
        Row: {
          address: string | null
          background_image_url: string | null
          city: string | null
          county: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facilities: string[] | null
          id: string | null
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          madhab: string | null
          name: string | null
          phone: string | null
          postcode: string | null
          slug: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          background_image_url?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          id?: string | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          name?: string | null
          phone?: string | null
          postcode?: string | null
          slug?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          background_image_url?: string | null
          city?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          id?: string | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          name?: string | null
          phone?: string | null
          postcode?: string | null
          slug?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      mosques_backup_20260212: {
        Row: {
          address: string | null
          background_image_url: string | null
          capacity: number | null
          city: string | null
          contact_page: string | null
          county: string | null
          created_at: string | null
          description: string | null
          email: string | null
          facilities: string[] | null
          has_womens_section: boolean | null
          id: string | null
          is_multi_faith: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          madhab: string | null
          management: string | null
          muslims_in_britain_data: boolean | null
          name: string | null
          phone: string | null
          postcode: string | null
          services: string[] | null
          slug: string | null
          social_links: Json | null
          updated_at: string | null
          usage_type: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          background_image_url?: string | null
          capacity?: number | null
          city?: string | null
          contact_page?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          has_womens_section?: boolean | null
          id?: string | null
          is_multi_faith?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          management?: string | null
          muslims_in_britain_data?: boolean | null
          name?: string | null
          phone?: string | null
          postcode?: string | null
          services?: string[] | null
          slug?: string | null
          social_links?: Json | null
          updated_at?: string | null
          usage_type?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          background_image_url?: string | null
          capacity?: number | null
          city?: string | null
          contact_page?: string | null
          county?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          facilities?: string[] | null
          has_womens_section?: boolean | null
          id?: string | null
          is_multi_faith?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          latitude?: number | null
          longitude?: number | null
          madhab?: string | null
          management?: string | null
          muslims_in_britain_data?: boolean | null
          name?: string | null
          phone?: string | null
          postcode?: string | null
          services?: string[] | null
          slug?: string | null
          social_links?: Json | null
          updated_at?: string | null
          usage_type?: string | null
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
      can_submit_community_event: {
        Args: { _user_id: string }
        Returns: boolean
      }
      can_submit_mosque_claim: {
        Args: { _email: string; _mosque_id: string; _user_id: string }
        Returns: boolean
      }
      generate_slug: { Args: { city: string; name: string }; Returns: string }
      get_event_interested_count: {
        Args: { _event_id: string }
        Returns: number
      }
      get_mosques_in_bounds: {
        Args: {
          filter_madhab?: string
          limit_count?: number
          max_lat: number
          max_lng: number
          min_lat: number
          min_lng: number
        }
        Returns: {
          address: string
          background_image_url: string | null
          capacity: number | null
          city: string
          contact_page: string | null
          county: string | null
          created_at: string | null
          denomination: string | null
          description: string | null
          email: string | null
          established: string | null
          facilities: string[] | null
          id: string
          iftar_facilities: string | null
          is_multi_faith: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          madhab: string | null
          management: string | null
          muslims_in_britain_data: boolean | null
          name: string
          parking_availability: string | null
          parking_type: string | null
          phone: string | null
          postcode: string
          qiyamul_layl: string | null
          services: string[] | null
          slug: string
          social_links: Json | null
          tarawih_rakah: string | null
          tarawih_type: string | null
          updated_at: string | null
          usage_type: string | null
          website: string | null
          wheelchair_parking: boolean | null
          wheelchair_prayer_hall: boolean | null
          wheelchair_wudu: boolean | null
          womens_wudu: string | null
          wudu_facilities: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "mosques"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_nearby_mosques: {
        Args: {
          limit_count?: number
          radius_miles?: number
          user_lat: number
          user_lng: number
        }
        Returns: {
          address: string
          capacity: number
          city: string
          contact_page: string
          distance_miles: number
          email: string
          facilities: string[]
          has_womens_section: boolean
          id: string
          is_multi_faith: boolean
          latitude: number
          longitude: number
          madhab: string
          management: string
          name: string
          phone: string
          postcode: string
          slug: string
          social_links: Json
          usage_type: string
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_event_organizer: { Args: { _user_id: string }; Returns: boolean }
      is_mosque_admin: {
        Args: { _mosque_id: string; _user_id: string }
        Returns: boolean
      }
      search_mosques: {
        Args: { limit_count?: number; search_term: string }
        Returns: {
          address: string
          background_image_url: string | null
          capacity: number | null
          city: string
          contact_page: string | null
          county: string | null
          created_at: string | null
          denomination: string | null
          description: string | null
          email: string | null
          established: string | null
          facilities: string[] | null
          id: string
          iftar_facilities: string | null
          is_multi_faith: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          latitude: number | null
          longitude: number | null
          madhab: string | null
          management: string | null
          muslims_in_britain_data: boolean | null
          name: string
          parking_availability: string | null
          parking_type: string | null
          phone: string | null
          postcode: string
          qiyamul_layl: string | null
          services: string[] | null
          slug: string
          social_links: Json | null
          tarawih_rakah: string | null
          tarawih_type: string | null
          updated_at: string | null
          usage_type: string | null
          website: string | null
          wheelchair_parking: boolean | null
          wheelchair_prayer_hall: boolean | null
          wheelchair_wudu: boolean | null
          womens_wudu: string | null
          wudu_facilities: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "mosques"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "admin" | "mosque_admin" | "user" | "event_organizer"
      claim_status: "pending" | "approved" | "rejected"
      claimant_role: "imam" | "committee_member" | "volunteer" | "other"
      community_event_type:
        | "quran"
        | "lecture"
        | "talk"
        | "workshop"
        | "fundraiser"
        | "iftar"
        | "community"
        | "youth"
        | "other"
      event_audience: "brothers_only" | "sisters_only" | "mixed"
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
      app_role: ["admin", "mosque_admin", "user", "event_organizer"],
      claim_status: ["pending", "approved", "rejected"],
      claimant_role: ["imam", "committee_member", "volunteer", "other"],
      community_event_type: [
        "quran",
        "lecture",
        "talk",
        "workshop",
        "fundraiser",
        "iftar",
        "community",
        "youth",
        "other",
      ],
      event_audience: ["brothers_only", "sisters_only", "mixed"],
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
