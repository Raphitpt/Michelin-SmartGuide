export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      article_terms: {
        Row: {
          article_id: string;
          term_id: string;
        };
        Insert: {
          article_id: string;
          term_id: string;
        };
        Update: {
          article_id?: string;
          term_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "article_terms_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "article_terms_term_id_fkey";
            columns: ["term_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_terms";
            referencedColumns: ["id"];
          },
        ];
      };
      articles: {
        Row: {
          chef_id: string;
          content_blocks: Json | null;
          created_at: string;
          id: string;
          index_search: boolean;
          meta_description: string | null;
          meta_title: string | null;
          og_image_url: string | null;
          published_at: string | null;
          slug: string;
          status: Database["public"]["Enums"]["article_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          chef_id: string;
          content_blocks?: Json | null;
          created_at?: string;
          id?: string;
          index_search?: boolean;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image_url?: string | null;
          published_at?: string | null;
          slug: string;
          status?: Database["public"]["Enums"]["article_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          chef_id?: string;
          content_blocks?: Json | null;
          created_at?: string;
          id?: string;
          index_search?: boolean;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image_url?: string | null;
          published_at?: string | null;
          slug?: string;
          status?: Database["public"]["Enums"]["article_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "articles_chef_id_fkey";
            columns: ["chef_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      claim_documents: {
        Row: {
          admin_comment: string | null;
          claim_id: string;
          created_at: string;
          document_type_id: string;
          file_size_kb: number | null;
          file_url: string;
          id: string;
          mime_type: string;
          status: Database["public"]["Enums"]["doc_status"];
          updated_at: string;
        };
        Insert: {
          admin_comment?: string | null;
          claim_id: string;
          created_at?: string;
          document_type_id: string;
          file_size_kb?: number | null;
          file_url: string;
          id?: string;
          mime_type: string;
          status?: Database["public"]["Enums"]["doc_status"];
          updated_at?: string;
        };
        Update: {
          admin_comment?: string | null;
          claim_id?: string;
          created_at?: string;
          document_type_id?: string;
          file_size_kb?: number | null;
          file_url?: string;
          id?: string;
          mime_type?: string;
          status?: Database["public"]["Enums"]["doc_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "claim_documents_claim_id_fkey";
            columns: ["claim_id"];
            isOneToOne: false;
            referencedRelation: "ownership_claims";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claim_documents_document_type_id_fkey";
            columns: ["document_type_id"];
            isOneToOne: false;
            referencedRelation: "country_document_types";
            referencedColumns: ["id"];
          },
        ];
      };
      countries: {
        Row: {
          code: string;
          currency: string;
          currency_symbol: string;
          id: string;
          name: string;
        };
        Insert: {
          code: string;
          currency: string;
          currency_symbol: string;
          id?: string;
          name: string;
        };
        Update: {
          code?: string;
          currency?: string;
          currency_symbol?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      country_document_types: {
        Row: {
          accepted_formats: string;
          country_id: string;
          created_at: string;
          description: string | null;
          id: string;
          label: string;
          required: boolean;
          slug: string;
          sort_order: number;
        };
        Insert: {
          accepted_formats?: string;
          country_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          label: string;
          required?: boolean;
          slug: string;
          sort_order?: number;
        };
        Update: {
          accepted_formats?: string;
          country_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          label?: string;
          required?: boolean;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "country_document_types_country_id_fkey";
            columns: ["country_id"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["id"];
          },
        ];
      };
      event_registrations: {
        Row: {
          cancelled_at: string | null;
          event_id: string;
          id: string;
          registered_at: string;
          status: Database["public"]["Enums"]["registration_status"];
          user_id: string;
        };
        Insert: {
          cancelled_at?: string | null;
          event_id: string;
          id?: string;
          registered_at?: string;
          status?: Database["public"]["Enums"]["registration_status"];
          user_id: string;
        };
        Update: {
          cancelled_at?: string | null;
          event_id?: string;
          id?: string;
          registered_at?: string;
          status?: Database["public"]["Enums"]["registration_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      event_terms: {
        Row: {
          event_id: string;
          term_id: string;
        };
        Insert: {
          event_id: string;
          term_id: string;
        };
        Update: {
          event_id?: string;
          term_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_terms_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_terms_term_id_fkey";
            columns: ["term_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_terms";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          audience: Database["public"]["Enums"]["event_audience"];
          chef_id: string;
          created_at: string;
          description: string | null;
          ends_at: string | null;
          id: string;
          invite_token: string | null;
          restaurant_id: string | null;
          starts_at: string | null;
          status: Database["public"]["Enums"]["event_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          audience?: Database["public"]["Enums"]["event_audience"];
          chef_id: string;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          invite_token?: string | null;
          restaurant_id?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["event_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          audience?: Database["public"]["Enums"]["event_audience"];
          chef_id?: string;
          created_at?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          invite_token?: string | null;
          restaurant_id?: string | null;
          starts_at?: string | null;
          status?: Database["public"]["Enums"]["event_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_chef_id_fkey";
            columns: ["chef_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "events_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
        ];
      };
      kit_orders: {
        Row: {
          id: string;
          ordered_at: string;
          shipping_address: Json | null;
          signature_url: string | null;
          status: Database["public"]["Enums"]["order_status"];
          updated_at: string;
          user_id: string;
          visual_slug: string;
        };
        Insert: {
          id?: string;
          ordered_at?: string;
          shipping_address?: Json | null;
          signature_url?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          updated_at?: string;
          user_id: string;
          visual_slug: string;
        };
        Update: {
          id?: string;
          ordered_at?: string;
          shipping_address?: Json | null;
          signature_url?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          updated_at?: string;
          user_id?: string;
          visual_slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kit_orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loyalty_profiles: {
        Row: {
          id: string;
          tier_level: number;
          total_km: number;
          total_points: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          tier_level?: number;
          total_km?: number;
          total_points?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          tier_level?: number;
          total_km?: number;
          total_points?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      loyalty_rewards: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          label: string;
          tier_required: number;
          type: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          label: string;
          tier_required: number;
          type: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          label?: string;
          tier_required?: number;
          type?: string;
        };
        Relationships: [];
      };
      loyalty_transactions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          km: number;
          points: number;
          restaurant_id: string | null;
          type: Database["public"]["Enums"]["loyalty_tx_type"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          km?: number;
          points?: number;
          restaurant_id?: string | null;
          type: Database["public"]["Enums"]["loyalty_tx_type"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          km?: number;
          points?: number;
          restaurant_id?: string | null;
          type?: Database["public"]["Enums"]["loyalty_tx_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_transactions_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loyalty_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      michelin_awards: {
        Row: {
          id: string;
          label: string;
          slug: Database["public"]["Enums"]["michelin_award_slug"];
          stars: number;
        };
        Insert: {
          id?: string;
          label: string;
          slug: Database["public"]["Enums"]["michelin_award_slug"];
          stars?: number;
        };
        Update: {
          id?: string;
          label?: string;
          slug?: Database["public"]["Enums"]["michelin_award_slug"];
          stars?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          payload: Json;
          read: boolean;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          payload?: Json;
          read?: boolean;
          title: string;
          type: Database["public"]["Enums"]["notification_type"];
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          payload?: Json;
          read?: boolean;
          title?: string;
          type?: Database["public"]["Enums"]["notification_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      ownership_claims: {
        Row: {
          admin_comment: string | null;
          created_at: string;
          id: string;
          restaurant_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: Database["public"]["Enums"]["claim_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          admin_comment?: string | null;
          created_at?: string;
          id?: string;
          restaurant_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["claim_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          admin_comment?: string | null;
          created_at?: string;
          id?: string;
          restaurant_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: Database["public"]["Enums"]["claim_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ownership_claims_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ownership_claims_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ownership_claims_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ownership_claims_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      page_views: {
        Row: {
          id: string;
          profile_id: string | null;
          source: string | null;
          target_id: string;
          target_type: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          source?: string | null;
          target_id: string;
          target_type: string;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          source?: string | null;
          target_id?: string;
          target_type?: string;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_views_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      partnerships: {
        Row: {
          admin_id: string;
          code: string;
          commission_rate: number;
          created_at: string;
          id: string;
          is_active: boolean;
          partner_name: string;
          type: Database["public"]["Enums"]["partnership_type"];
        };
        Insert: {
          admin_id: string;
          code: string;
          commission_rate?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          partner_name: string;
          type: Database["public"]["Enums"]["partnership_type"];
        };
        Update: {
          admin_id?: string;
          code?: string;
          commission_rate?: number;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          partner_name?: string;
          type?: Database["public"]["Enums"]["partnership_type"];
        };
        Relationships: [
          {
            foreignKeyName: "partnerships_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      podcasts: {
        Row: {
          article_id: string;
          audio_url: string;
          created_at: string;
          duration_sec: number | null;
          id: string;
        };
        Insert: {
          article_id: string;
          audio_url: string;
          created_at?: string;
          duration_sec?: number | null;
          id?: string;
        };
        Update: {
          article_id?: string;
          audio_url?: string;
          created_at?: string;
          duration_sec?: number | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "podcasts_article_id_fkey";
            columns: ["article_id"];
            isOneToOne: true;
            referencedRelation: "articles";
            referencedColumns: ["id"];
          },
        ];
      };
      price_categories: {
        Row: {
          id: string;
          label: string;
          price_avg_max_eur: number | null;
          price_avg_min_eur: number | null;
          rank: number;
        };
        Insert: {
          id?: string;
          label: string;
          price_avg_max_eur?: number | null;
          price_avg_min_eur?: number | null;
          rank: number;
        };
        Update: {
          id?: string;
          label?: string;
          price_avg_max_eur?: number | null;
          price_avg_min_eur?: number | null;
          rank?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          signature_url: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          signature_url?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          signature_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reco_archetype_weights: {
        Row: {
          archetype_id: string;
          trait_code: string;
          weight: number;
        };
        Insert: {
          archetype_id: string;
          trait_code: string;
          weight?: number;
        };
        Update: {
          archetype_id?: string;
          trait_code?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reco_archetype_weights_archetype_id_fkey";
            columns: ["archetype_id"];
            isOneToOne: false;
            referencedRelation: "reco_archetypes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reco_archetype_weights_trait_code_fkey";
            columns: ["trait_code"];
            isOneToOne: false;
            referencedRelation: "reco_traits";
            referencedColumns: ["code"];
          },
        ];
      };
      reco_archetypes: {
        Row: {
          description: string;
          id: string;
          nom: string;
          sort_order: number;
        };
        Insert: {
          description: string;
          id: string;
          nom: string;
          sort_order?: number;
        };
        Update: {
          description?: string;
          id?: string;
          nom?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      reco_dimensions: {
        Row: {
          auto_inferred: boolean;
          id: string;
          is_card_badge: boolean;
          max_tags: number;
          nom: string;
          question: string;
          sort_order: number;
        };
        Insert: {
          auto_inferred?: boolean;
          id: string;
          is_card_badge?: boolean;
          max_tags?: number;
          nom: string;
          question: string;
          sort_order?: number;
        };
        Update: {
          auto_inferred?: boolean;
          id?: string;
          is_card_badge?: boolean;
          max_tags?: number;
          nom?: string;
          question?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      reco_sub_dimensions: {
        Row: {
          dimension_id: string;
          id: string;
          label: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          dimension_id: string;
          id?: string;
          label: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          dimension_id?: string;
          id?: string;
          label?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reco_sub_dimensions_dimension_id_fkey";
            columns: ["dimension_id"];
            isOneToOne: false;
            referencedRelation: "reco_dimensions";
            referencedColumns: ["id"];
          },
        ];
      };
      reco_traits: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          dimension_id: string;
          extra: Json | null;
          id: string;
          label: string;
          sort_order: number;
          sub_dimension_id: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          dimension_id: string;
          extra?: Json | null;
          id?: string;
          label: string;
          sort_order?: number;
          sub_dimension_id?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          dimension_id?: string;
          extra?: Json | null;
          id?: string;
          label?: string;
          sort_order?: number;
          sub_dimension_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reco_traits_dimension_id_fkey";
            columns: ["dimension_id"];
            isOneToOne: false;
            referencedRelation: "reco_dimensions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reco_traits_sub_dimension_id_fkey";
            columns: ["sub_dimension_id"];
            isOneToOne: false;
            referencedRelation: "reco_sub_dimensions";
            referencedColumns: ["id"];
          },
        ];
      };
      referrals: {
        Row: {
          id: string;
          partnership_id: string;
          referred_at: string;
          referred_user_id: string;
          status: Database["public"]["Enums"]["referral_status"];
        };
        Insert: {
          id?: string;
          partnership_id: string;
          referred_at?: string;
          referred_user_id: string;
          status?: Database["public"]["Enums"]["referral_status"];
        };
        Update: {
          id?: string;
          partnership_id?: string;
          referred_at?: string;
          referred_user_id?: string;
          status?: Database["public"]["Enums"]["referral_status"];
        };
        Relationships: [
          {
            foreignKeyName: "referrals_partnership_id_fkey";
            columns: ["partnership_id"];
            isOneToOne: false;
            referencedRelation: "partnerships";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey";
            columns: ["referred_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reservations: {
        Row: {
          booked_at: string;
          guests: number;
          id: string;
          priority_access: boolean;
          reserved_for: string;
          restaurant_id: string;
          status: Database["public"]["Enums"]["reservation_status"];
          user_id: string;
        };
        Insert: {
          booked_at?: string;
          guests?: number;
          id?: string;
          priority_access?: boolean;
          reserved_for: string;
          restaurant_id: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          user_id: string;
        };
        Update: {
          booked_at?: string;
          guests?: number;
          id?: string;
          priority_access?: boolean;
          reserved_for?: string;
          restaurant_id?: string;
          status?: Database["public"]["Enums"]["reservation_status"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reservations_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reservations_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reservations_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_images: {
        Row: {
          created_at: string;
          id: string;
          position: number;
          restaurant_id: string;
          url: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          position?: number;
          restaurant_id: string;
          url: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          position?: number;
          restaurant_id?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_terms: {
        Row: {
          restaurant_id: string;
          term_id: string;
        };
        Insert: {
          restaurant_id: string;
          term_id: string;
        };
        Update: {
          restaurant_id?: string;
          term_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_terms_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_terms_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_terms_term_id_fkey";
            columns: ["term_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_terms";
            referencedColumns: ["id"];
          },
        ];
      };
      restaurant_traits: {
        Row: {
          restaurant_id: string;
          trait_code: string;
        };
        Insert: {
          restaurant_id: string;
          trait_code: string;
        };
        Update: {
          restaurant_id?: string;
          trait_code?: string;
        };
        Relationships: [
          {
            foreignKeyName: "restaurant_traits_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_traits_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurant_traits_trait_code_fkey";
            columns: ["trait_code"];
            isOneToOne: false;
            referencedRelation: "reco_traits";
            referencedColumns: ["code"];
          },
        ];
      };
      restaurants: {
        Row: {
          area: string | null;
          chef_id: string | null;
          city: string | null;
          country_id: string | null;
          created_at: string;
          delivery: boolean;
          good_menu: boolean;
          green_star: boolean;
          history: string | null;
          hotel: string | null;
          id: string;
          is_published: boolean;
          lat: number | null;
          lng: number | null;
          location: unknown;
          main_image: string | null;
          michelin_award_id: string | null;
          michelin_id: string | null;
          name: string;
          online_booking: boolean;
          opening_hours: Json | null;
          philosophy: string | null;
          phone: string | null;
          price_avg_eur: number | null;
          price_category_id: string | null;
          region: string | null;
          slug: string;
          take_away: boolean;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          area?: string | null;
          chef_id?: string | null;
          city?: string | null;
          country_id?: string | null;
          created_at?: string;
          delivery?: boolean;
          good_menu?: boolean;
          green_star?: boolean;
          history?: string | null;
          hotel?: string | null;
          id?: string;
          is_published?: boolean;
          lat?: number | null;
          lng?: number | null;
          location?: unknown;
          main_image?: string | null;
          michelin_award_id?: string | null;
          michelin_id?: string | null;
          name: string;
          online_booking?: boolean;
          opening_hours?: Json | null;
          philosophy?: string | null;
          phone?: string | null;
          price_avg_eur?: number | null;
          price_category_id?: string | null;
          region?: string | null;
          slug: string;
          take_away?: boolean;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          area?: string | null;
          chef_id?: string | null;
          city?: string | null;
          country_id?: string | null;
          created_at?: string;
          delivery?: boolean;
          good_menu?: boolean;
          green_star?: boolean;
          history?: string | null;
          hotel?: string | null;
          id?: string;
          is_published?: boolean;
          lat?: number | null;
          lng?: number | null;
          location?: unknown;
          main_image?: string | null;
          michelin_award_id?: string | null;
          michelin_id?: string | null;
          name?: string;
          online_booking?: boolean;
          opening_hours?: Json | null;
          philosophy?: string | null;
          phone?: string | null;
          price_avg_eur?: number | null;
          price_category_id?: string | null;
          region?: string | null;
          slug?: string;
          take_away?: boolean;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "restaurants_chef_id_fkey";
            columns: ["chef_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurants_country_id_fkey";
            columns: ["country_id"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurants_michelin_award_id_fkey";
            columns: ["michelin_award_id"];
            isOneToOne: false;
            referencedRelation: "michelin_awards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurants_price_category_id_fkey";
            columns: ["price_category_id"];
            isOneToOne: false;
            referencedRelation: "price_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      spatial_ref_sys: {
        Row: {
          auth_name: string | null;
          auth_srid: number | null;
          proj4text: string | null;
          srid: number;
          srtext: string | null;
        };
        Insert: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid: number;
          srtext?: string | null;
        };
        Update: {
          auth_name?: string | null;
          auth_srid?: number | null;
          proj4text?: string | null;
          srid?: number;
          srtext?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"];
          created_at: string;
          features: Json;
          id: string;
          is_active: boolean;
          name: string;
          price: number;
          slug: string;
          target: Database["public"]["Enums"]["sub_target"];
        };
        Insert: {
          billing_cycle: Database["public"]["Enums"]["billing_cycle"];
          created_at?: string;
          features?: Json;
          id?: string;
          is_active?: boolean;
          name: string;
          price: number;
          slug: string;
          target: Database["public"]["Enums"]["sub_target"];
        };
        Update: {
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"];
          created_at?: string;
          features?: Json;
          id?: string;
          is_active?: boolean;
          name?: string;
          price?: number;
          slug?: string;
          target?: Database["public"]["Enums"]["sub_target"];
        };
        Relationships: [];
      };
      swipe_sessions: {
        Row: {
          completed: boolean;
          completed_at: string | null;
          id: string;
          started_at: string;
          user_id: string;
        };
        Insert: {
          completed?: boolean;
          completed_at?: string | null;
          id?: string;
          started_at?: string;
          user_id: string;
        };
        Update: {
          completed?: boolean;
          completed_at?: string | null;
          id?: string;
          started_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "swipe_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      taxonomy_terms: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          parent_id: string | null;
          slug: string;
          sort_order: number;
          taxonomy: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          parent_id?: string | null;
          slug: string;
          sort_order?: number;
          taxonomy: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          parent_id?: string | null;
          slug?: string;
          sort_order?: number;
          taxonomy?: string;
        };
        Relationships: [
          {
            foreignKeyName: "taxonomy_terms_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "taxonomy_terms";
            referencedColumns: ["id"];
          },
        ];
      };
      user_subscriptions: {
        Row: {
          created_at: string;
          ends_at: string | null;
          id: string;
          starts_at: string;
          status: Database["public"]["Enums"]["sub_status"];
          stripe_sub_id: string | null;
          subscription_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["sub_status"];
          stripe_sub_id?: string | null;
          subscription_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          starts_at?: string;
          status?: Database["public"]["Enums"]["sub_status"];
          stripe_sub_id?: string | null;
          subscription_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_subscription_id_fkey";
            columns: ["subscription_id"];
            isOneToOne: false;
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_swipes: {
        Row: {
          id: string;
          liked: boolean;
          restaurant_id: string;
          session_id: string;
          swiped_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          liked: boolean;
          restaurant_id: string;
          session_id: string;
          swiped_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          liked?: boolean;
          restaurant_id?: string;
          session_id?: string;
          swiped_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_swipes_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "restaurants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_swipes_restaurant_id_fkey";
            columns: ["restaurant_id"];
            isOneToOne: false;
            referencedRelation: "v_restaurant_reco";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_swipes_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "swipe_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_swipes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_taste_profiles: {
        Row: {
          archetype_id: string | null;
          archetype_score: number | null;
          id: string;
          last_session_id: string | null;
          score_vector: Json;
          swipe_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          archetype_id?: string | null;
          archetype_score?: number | null;
          id?: string;
          last_session_id?: string | null;
          score_vector?: Json;
          swipe_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          archetype_id?: string | null;
          archetype_score?: number | null;
          id?: string;
          last_session_id?: string | null;
          score_vector?: Json;
          swipe_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_taste_profiles_archetype_id_fkey";
            columns: ["archetype_id"];
            isOneToOne: false;
            referencedRelation: "reco_archetypes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_taste_profiles_last_session_id_fkey";
            columns: ["last_session_id"];
            isOneToOne: false;
            referencedRelation: "swipe_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_taste_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null;
          f_geography_column: unknown;
          f_table_catalog: unknown;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Relationships: [];
      };
      geometry_columns: {
        Row: {
          coord_dimension: number | null;
          f_geometry_column: unknown;
          f_table_catalog: string | null;
          f_table_name: unknown;
          f_table_schema: unknown;
          srid: number | null;
          type: string | null;
        };
        Insert: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Update: {
          coord_dimension?: number | null;
          f_geometry_column?: unknown;
          f_table_catalog?: string | null;
          f_table_name?: unknown;
          f_table_schema?: unknown;
          srid?: number | null;
          type?: string | null;
        };
        Relationships: [];
      };
      v_restaurant_reco: {
        Row: {
          city: string | null;
          country_id: string | null;
          id: string | null;
          lat: number | null;
          lng: number | null;
          main_image: string | null;
          michelin_award_id: string | null;
          name: string | null;
          price_avg_eur: number | null;
          slug: string | null;
          trait_codes: string[] | null;
        };
        Relationships: [
          {
            foreignKeyName: "restaurants_country_id_fkey";
            columns: ["country_id"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "restaurants_michelin_award_id_fkey";
            columns: ["michelin_award_id"];
            isOneToOne: false;
            referencedRelation: "michelin_awards";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string };
        Returns: undefined;
      };
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown };
        Returns: unknown;
      };
      _postgis_pgsql_version: { Args: never; Returns: string };
      _postgis_scripts_pgsql_version: { Args: never; Returns: string };
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown };
        Returns: number;
      };
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown };
        Returns: string;
      };
      restaurants_nearby: {
        Args: {
          radius_meters?: number;
          user_lat: number;
          user_lng: number;
        };
        Returns: Database["public"]["Tables"]["restaurants"]["Row"][];
      };
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_sortablehash: { Args: { geom: unknown }; Returns: number };
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      _st_voronoi: {
        Args: {
          clip?: unknown;
          g1: unknown;
          return_polygons?: boolean;
          tolerance?: number;
        };
        Returns: unknown;
      };
      _st_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      addauth: { Args: { "": string }; Returns: boolean };
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              new_dim: number;
              new_srid_in: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              schema_name: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              column_name: string;
              new_dim: number;
              new_srid: number;
              new_type: string;
              table_name: string;
              use_typmod?: boolean;
            };
            Returns: string;
          };
      disablelongtransactions: { Args: never; Returns: string };
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string;
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          }
        | {
            Args: {
              column_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          }
        | {
            Args: { column_name: string; table_name: string };
            Returns: string;
          };
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string;
              schema_name: string;
              table_name: string;
            };
            Returns: string;
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string };
      enablelongtransactions: { Args: never; Returns: string };
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      geometry: { Args: { "": string }; Returns: unknown };
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      geomfromewkt: { Args: { "": string }; Returns: unknown };
      gettransactionid: { Args: never; Returns: unknown };
      is_admin: { Args: never; Returns: boolean };
      longtransactionsenabled: { Args: never; Returns: boolean };
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string };
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: number;
      };
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string };
        Returns: string;
      };
      postgis_extensions_upgrade: { Args: never; Returns: string };
      postgis_full_version: { Args: never; Returns: string };
      postgis_geos_version: { Args: never; Returns: string };
      postgis_lib_build_date: { Args: never; Returns: string };
      postgis_lib_revision: { Args: never; Returns: string };
      postgis_lib_version: { Args: never; Returns: string };
      postgis_libjson_version: { Args: never; Returns: string };
      postgis_liblwgeom_version: { Args: never; Returns: string };
      postgis_libprotobuf_version: { Args: never; Returns: string };
      postgis_libxml_version: { Args: never; Returns: string };
      postgis_proj_version: { Args: never; Returns: string };
      postgis_scripts_build_date: { Args: never; Returns: string };
      postgis_scripts_installed: { Args: never; Returns: string };
      postgis_scripts_released: { Args: never; Returns: string };
      postgis_svn_version: { Args: never; Returns: string };
      postgis_type_name: {
        Args: {
          coord_dimension: number;
          geomname: string;
          use_new_name?: boolean;
        };
        Returns: string;
      };
      postgis_version: { Args: never; Returns: string };
      postgis_wagyu_version: { Args: never; Returns: string };
      score_restaurant: {
        Args: { p_restaurant_id: string; p_score_vector: Json };
        Returns: number;
      };
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown };
            Returns: number;
          };
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number };
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number };
        Returns: string;
      };
      st_asewkt: { Args: { "": string }; Returns: string };
      st_asgeojson:
        | {
            Args: {
              geog: unknown;
              maxdecimaldigits?: number;
              options?: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              maxdecimaldigits?: number;
              options?: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geom_column?: string;
              maxdecimaldigits?: number;
              pretty_bool?: boolean;
              r: Record<string, unknown>;
            };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_asgml:
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              maxdecimaldigits?: number;
              options?: number;
            };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              id?: string;
              maxdecimaldigits?: number;
              nprefix?: string;
              options?: number;
              version: number;
            };
            Returns: string;
          };
      st_askml:
        | {
            Args: {
              geog: unknown;
              maxdecimaldigits?: number;
              nprefix?: string;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown;
              maxdecimaldigits?: number;
              nprefix?: string;
            };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string };
        Returns: string;
      };
      st_asmarc21: {
        Args: { format?: string; geom: unknown };
        Returns: string;
      };
      st_asmvtgeom: {
        Args: {
          bounds: unknown;
          buffer?: number;
          clip_geom?: boolean;
          extent?: number;
          geom: unknown;
        };
        Returns: unknown;
      };
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number };
            Returns: string;
          }
        | { Args: { "": string }; Returns: string };
      st_astext: { Args: { "": string }; Returns: string };
      st_astwkb:
        | {
            Args: {
              geom: unknown;
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          }
        | {
            Args: {
              geom: unknown[];
              ids: number[];
              prec?: number;
              prec_m?: number;
              prec_z?: number;
              with_boxes?: boolean;
              with_sizes?: boolean;
            };
            Returns: string;
          };
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number };
        Returns: string;
      };
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number };
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown };
        Returns: unknown;
      };
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number };
            Returns: unknown;
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number };
            Returns: unknown;
          };
      st_centroid: { Args: { "": string }; Returns: unknown };
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown };
        Returns: unknown;
      };
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_collect: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean;
          param_geom: unknown;
          param_pctconvex: number;
        };
        Returns: unknown;
      };
      st_contains: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_coorddim: { Args: { geometry: unknown }; Returns: number };
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number };
        Returns: unknown;
      };
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean };
            Returns: number;
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number };
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number };
            Returns: number;
          };
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_dwithin: {
        Args: {
          geog1: unknown;
          geog2: unknown;
          tolerance: number;
          use_spheroid?: boolean;
        };
        Returns: boolean;
      };
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number };
            Returns: unknown;
          }
        | {
            Args: {
              dm?: number;
              dx: number;
              dy: number;
              dz?: number;
              geom: unknown;
            };
            Returns: unknown;
          };
      st_force3d: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number };
        Returns: unknown;
      };
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number };
        Returns: unknown;
      };
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number };
        Returns: unknown;
      };
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number };
            Returns: unknown;
          };
      st_geogfromtext: { Args: { "": string }; Returns: unknown };
      st_geographyfromtext: { Args: { "": string }; Returns: unknown };
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string };
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown };
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean;
          g: unknown;
          max_iter?: number;
          tolerance?: number;
        };
        Returns: unknown;
      };
      st_geometryfromtext: { Args: { "": string }; Returns: unknown };
      st_geomfromewkt: { Args: { "": string }; Returns: unknown };
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown };
      st_geomfromgml: { Args: { "": string }; Returns: unknown };
      st_geomfromkml: { Args: { "": string }; Returns: unknown };
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown };
      st_geomfromtext: { Args: { "": string }; Returns: unknown };
      st_gmltosql: { Args: { "": string }; Returns: unknown };
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean };
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_hexagon: {
        Args: {
          cell_i: number;
          cell_j: number;
          origin?: unknown;
          size: number;
        };
        Returns: unknown;
      };
      st_hexagongrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown };
        Returns: number;
      };
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown };
        Returns: Database["public"]["CompositeTypes"]["valid_detail"];
        SetofOptions: {
          from: "*";
          to: "valid_detail";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number };
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown };
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown };
        Returns: number;
      };
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string };
        Returns: unknown;
      };
      st_linefromtext: { Args: { "": string }; Returns: unknown };
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown };
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number };
        Returns: unknown;
      };
      st_locatebetween: {
        Args: {
          frommeasure: number;
          geometry: unknown;
          leftrightoffset?: number;
          tomeasure: number;
        };
        Returns: unknown;
      };
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number };
        Returns: unknown;
      };
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_makevalid: {
        Args: { geom: unknown; params: string };
        Returns: unknown;
      };
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: number;
      };
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number };
        Returns: unknown;
      };
      st_mlinefromtext: { Args: { "": string }; Returns: unknown };
      st_mpointfromtext: { Args: { "": string }; Returns: unknown };
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown };
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown };
      st_multipointfromtext: { Args: { "": string }; Returns: unknown };
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown };
      st_node: { Args: { g: unknown }; Returns: unknown };
      st_normalize: { Args: { geom: unknown }; Returns: unknown };
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string };
        Returns: unknown;
      };
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean };
        Returns: number;
      };
      st_pointfromtext: { Args: { "": string }; Returns: unknown };
      st_pointm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
        };
        Returns: unknown;
      };
      st_pointz: {
        Args: {
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_pointzm: {
        Args: {
          mcoordinate: number;
          srid?: number;
          xcoordinate: number;
          ycoordinate: number;
          zcoordinate: number;
        };
        Returns: unknown;
      };
      st_polyfromtext: { Args: { "": string }; Returns: unknown };
      st_polygonfromtext: { Args: { "": string }; Returns: unknown };
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown };
        Returns: unknown;
      };
      st_quantizecoordinates: {
        Args: {
          g: unknown;
          prec_m?: number;
          prec_x: number;
          prec_y?: number;
          prec_z?: number;
        };
        Returns: unknown;
      };
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number };
        Returns: unknown;
      };
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string };
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number };
        Returns: unknown;
      };
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown };
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number };
        Returns: unknown;
      };
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown };
      st_square: {
        Args: {
          cell_i: number;
          cell_j: number;
          origin?: unknown;
          size: number;
        };
        Returns: unknown;
      };
      st_squaregrid: {
        Args: { bounds: unknown; size: number };
        Returns: Record<string, unknown>[];
      };
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number };
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number };
        Returns: unknown[];
      };
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown };
        Returns: unknown;
      };
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number };
        Returns: unknown;
      };
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: unknown;
      };
      st_tileenvelope: {
        Args: {
          bounds?: unknown;
          margin?: number;
          x: number;
          y: number;
          zoom: number;
        };
        Returns: unknown;
      };
      st_touches: {
        Args: { geom1: unknown; geom2: unknown };
        Returns: boolean;
      };
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string };
            Returns: unknown;
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number };
            Returns: unknown;
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown };
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown };
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number };
            Returns: unknown;
          };
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number };
        Returns: unknown;
      };
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean };
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown };
      st_wkttosql: { Args: { "": string }; Returns: unknown };
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number };
        Returns: unknown;
      };
      unlockrows: { Args: { "": string }; Returns: number };
      updategeometrysrid: {
        Args: {
          catalogn_name: string;
          column_name: string;
          new_srid_in: number;
          schema_name: string;
          table_name: string;
        };
        Returns: string;
      };
    };
    Enums: {
      article_status: "draft" | "published" | "archived";
      billing_cycle: "monthly" | "yearly";
      claim_status: "pending" | "accepted" | "refused" | "missing_infos";
      doc_status: "pending" | "accepted" | "refused";
      event_audience: "public" | "private";
      event_status: "draft" | "published" | "cancelled" | "past";
      loyalty_tx_type: "visit" | "km" | "reward" | "manual";
      michelin_award_slug:
        | "ONE_STAR"
        | "TWO_STARS"
        | "THREE_STARS"
        | "BIB_GOURMAND"
        | "MICHELIN_PLATE";
      notification_type: "event" | "loyalty" | "claim" | "system" | "article";
      order_status:
        | "pending"
        | "confirmed"
        | "shipped"
        | "delivered"
        | "cancelled";
      partnership_type: "influencer" | "sponsor" | "referral";
      referral_status: "pending" | "converted" | "expired";
      registration_status: "registered" | "cancelled" | "waitlist";
      reservation_status: "pending" | "confirmed" | "cancelled" | "no_show";
      sub_status: "active" | "cancelled" | "past_due" | "trialing";
      sub_target: "b2c" | "b2b";
      user_role: "user" | "chef" | "admin";
    };
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null;
        geom: unknown;
      };
      valid_detail: {
        valid: boolean | null;
        reason: string | null;
        location: unknown;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      article_status: ["draft", "published", "archived"],
      billing_cycle: ["monthly", "yearly"],
      claim_status: ["pending", "accepted", "refused", "missing_infos"],
      doc_status: ["pending", "accepted", "refused"],
      event_audience: ["public", "private"],
      event_status: ["draft", "published", "cancelled", "past"],
      loyalty_tx_type: ["visit", "km", "reward", "manual"],
      michelin_award_slug: [
        "ONE_STAR",
        "TWO_STARS",
        "THREE_STARS",
        "BIB_GOURMAND",
        "MICHELIN_PLATE",
      ],
      notification_type: ["event", "loyalty", "claim", "system", "article"],
      order_status: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      partnership_type: ["influencer", "sponsor", "referral"],
      referral_status: ["pending", "converted", "expired"],
      registration_status: ["registered", "cancelled", "waitlist"],
      reservation_status: ["pending", "confirmed", "cancelled", "no_show"],
      sub_status: ["active", "cancelled", "past_due", "trialing"],
      sub_target: ["b2c", "b2b"],
      user_role: ["visitor", "user", "chef", "admin"],
    },
  },
} as const;
