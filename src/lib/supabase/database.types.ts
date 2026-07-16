export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string;
          slug: string;
          names: string;
          bride_name: string | null;
          groom_name: string | null;
          display_title: string | null;
          wedding_date: string | null;
          hero_subtitle: string | null;
          hero_video_url: string | null;
          quiz_enabled: boolean | null;
          quiz_winner_name: string | null;
          admin_pin: string | null;
          playlist_title: string | null;
          playlist_artist: string | null;
          playlist_url: string | null;
          status: string | null;
          bride_email: string | null;
          groom_email: string | null;
          drive_folder_id: string | null;
          drive_folder_url: string | null;
          media_upload_enabled: boolean | null;
          memories_gallery_enabled: boolean | null;
          package_type: string | null;
          couple_photo_url: string | null;
          created_by_order_id: string | null;
          archived_at: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string | null;
          invitation_enabled: boolean | null;
          invitation_title: string | null;
          invitation_message: string | null;
          venue_name: string | null;
          venue_address: string | null;
          venue_maps_url: string | null;
          wedding_time: string | null;
          rsvp_enabled: boolean | null;
          rsvp_deadline: string | null;
          max_guest_count: number | null;
        };
        Insert: {
          id?: string;
          slug: string;
          names: string;
          bride_name?: string | null;
          groom_name?: string | null;
          display_title?: string | null;
          wedding_date?: string | null;
          hero_subtitle?: string | null;
          hero_video_url?: string | null;
          quiz_enabled?: boolean | null;
          quiz_winner_name?: string | null;
          admin_pin?: string | null;
          playlist_title?: string | null;
          playlist_artist?: string | null;
          playlist_url?: string | null;
          status?: string | null;
          bride_email?: string | null;
          groom_email?: string | null;
          drive_folder_id?: string | null;
          drive_folder_url?: string | null;
          media_upload_enabled?: boolean | null;
          memories_gallery_enabled?: boolean | null;
          package_type?: string | null;
          couple_photo_url?: string | null;
          created_by_order_id?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          invitation_enabled?: boolean | null;
          invitation_title?: string | null;
          invitation_message?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_maps_url?: string | null;
          wedding_time?: string | null;
          rsvp_enabled?: boolean | null;
          rsvp_deadline?: string | null;
          max_guest_count?: number | null;
        };
        Update: {
          id?: string;
          slug?: string;
          names?: string;
          bride_name?: string | null;
          groom_name?: string | null;
          display_title?: string | null;
          wedding_date?: string | null;
          hero_subtitle?: string | null;
          hero_video_url?: string | null;
          quiz_enabled?: boolean | null;
          quiz_winner_name?: string | null;
          admin_pin?: string | null;
          playlist_title?: string | null;
          playlist_artist?: string | null;
          playlist_url?: string | null;
          status?: string | null;
          bride_email?: string | null;
          groom_email?: string | null;
          drive_folder_id?: string | null;
          drive_folder_url?: string | null;
          media_upload_enabled?: boolean | null;
          memories_gallery_enabled?: boolean | null;
          package_type?: string | null;
          couple_photo_url?: string | null;
          created_by_order_id?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string | null;
          invitation_enabled?: boolean | null;
          invitation_title?: string | null;
          invitation_message?: string | null;
          venue_name?: string | null;
          venue_address?: string | null;
          venue_maps_url?: string | null;
          wedding_time?: string | null;
          rsvp_enabled?: boolean | null;
          rsvp_deadline?: string | null;
          max_guest_count?: number | null;
        };
        Relationships: [];
      };
      rsvp_responses: {
        Row: {
          id: string;
          couple_id: string;
          guest_name: string;
          phone: string | null;
          status: string;
          guest_count: number | null;
          note: string | null;
          source: string | null;
          created_at: string;
          updated_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          couple_id: string;
          guest_name: string;
          phone?: string | null;
          status: string;
          guest_count?: number | null;
          note?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          couple_id?: string;
          guest_name?: string;
          phone?: string | null;
          status?: string;
          guest_count?: number | null;
          note?: string | null;
          source?: string | null;
          created_at?: string;
          updated_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      couple_photos: {
        Row: {
          id: string;
          couple_id: string;
          caption: string | null;
          sort_order: number;
          provider: string | null;
          drive_file_id: string | null;
          drive_folder_id: string | null;
          drive_web_view_link: string | null;
          image_url: string;
          filename: string | null;
          file_size: number | null;
          mime_type: string | null;
          is_visible: boolean;
          frame_zoom: number;
          frame_pan_x: number;
          frame_pan_y: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          caption?: string | null;
          sort_order?: number;
          provider?: string | null;
          drive_file_id?: string | null;
          drive_folder_id?: string | null;
          drive_web_view_link?: string | null;
          image_url: string;
          filename?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          is_visible?: boolean;
          frame_zoom?: number;
          frame_pan_x?: number;
          frame_pan_y?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          caption?: string | null;
          sort_order?: number;
          provider?: string | null;
          drive_file_id?: string | null;
          drive_folder_id?: string | null;
          drive_web_view_link?: string | null;
          image_url?: string;
          filename?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          is_visible?: boolean;
          frame_zoom?: number;
          frame_pan_x?: number;
          frame_pan_y?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "couple_photos_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      contributions: {
        Row: {
          id: string;
          couple_id: string;
          guest_name: string;
          message: string;
          is_visible: boolean;
          hidden: boolean | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          guest_name: string;
          message: string;
          is_visible?: boolean;
          hidden?: boolean | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          guest_name?: string;
          message?: string;
          is_visible?: boolean;
          hidden?: boolean | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contributions_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      contribution_media: {
        Row: {
          id: string;
          contribution_id: string;
          file_url: string;
          file_type: string | null;
          file_name: string | null;
          provider: string | null;
          drive_file_id: string | null;
          drive_folder_id: string | null;
          drive_web_view_link: string | null;
          filename: string | null;
          file_size: number | null;
          mime_type: string | null;
          hidden: boolean | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          contribution_id: string;
          file_url: string;
          file_type?: string | null;
          file_name?: string | null;
          provider?: string | null;
          drive_file_id?: string | null;
          drive_folder_id?: string | null;
          drive_web_view_link?: string | null;
          filename?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          hidden?: boolean | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          contribution_id?: string;
          file_url?: string;
          file_type?: string | null;
          file_name?: string | null;
          provider?: string | null;
          drive_file_id?: string | null;
          drive_folder_id?: string | null;
          drive_web_view_link?: string | null;
          filename?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          hidden?: boolean | null;
          deleted_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contribution_media_contribution_id_fkey";
            columns: ["contribution_id"];
            isOneToOne: false;
            referencedRelation: "contributions";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_questions: {
        Row: {
          id: string;
          couple_id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c: string | null;
          option_d: string | null;
          correct_option: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          couple_id: string;
          question_text: string;
          option_a: string;
          option_b: string;
          option_c?: string | null;
          option_d?: string | null;
          correct_option: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          couple_id?: string;
          question_text?: string;
          option_a?: string;
          option_b?: string;
          option_c?: string | null;
          option_d?: string | null;
          correct_option?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_questions_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      quiz_attempts: {
        Row: {
          id: string;
          couple_id: string;
          participant_name: string;
          score: number;
          total_questions: number;
          answers: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          participant_name: string;
          score: number;
          total_questions: number;
          answers?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          participant_name?: string;
          score?: number;
          total_questions?: number;
          answers?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          package_type: string | null;
          price: number | null;
          payment_status: string | null;
          payment_provider: string | null;
          payment_reference: string | null;
          couple_id: string | null;
          status: string | null;
          created_at: string;
          updated_at: string | null;
          archived_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          package_type?: string | null;
          price?: number | null;
          payment_status?: string | null;
          payment_provider?: string | null;
          payment_reference?: string | null;
          couple_id?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          package_type?: string | null;
          price?: number | null;
          payment_status?: string | null;
          payment_provider?: string | null;
          payment_reference?: string | null;
          couple_id?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_couple_id_fkey";
            columns: ["couple_id"];
            isOneToOne: false;
            referencedRelation: "couples";
            referencedColumns: ["id"];
          },
        ];
      };
      aftermovie_music: {
        Row: {
          id: string;
          title: string;
          artist: string | null;
          file_url: string;
          storage_key: string | null;
          duration_seconds: number | null;
          license_source: string | null;
          is_active: boolean;
          is_global_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          artist?: string | null;
          file_url: string;
          storage_key?: string | null;
          duration_seconds?: number | null;
          license_source?: string | null;
          is_active?: boolean;
          is_global_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string | null;
          file_url?: string;
          storage_key?: string | null;
          duration_seconds?: number | null;
          license_source?: string | null;
          is_active?: boolean;
          is_global_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      couple_aftermovies: {
        Row: {
          id: string;
          couple_id: string;
          status: string;
          template_key: string;
          title: string | null;
          opening_text: string | null;
          closing_text: string | null;
          poster_media_id: string | null;
          music_id: string | null;
          duration_preset: string;
          recommended_publish_at: string | null;
          publish_at: string | null;
          approved_at: string | null;
          published_at: string | null;
          submitted_at: string | null;
          revision_requested_at: string | null;
          revision_note: string | null;
          revision_resolved_at: string | null;
          production_notes: string | null;
          final_video_duration_seconds: number | null;
          final_poster_url: string | null;
          final_poster_storage_key: string | null;
          render_started_at: string | null;
          render_completed_at: string | null;
          final_video_url: string | null;
          final_video_storage_key: string | null;
          render_provider: string | null;
          render_job_id: string | null;
          render_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          couple_id: string;
          status?: string;
          template_key?: string;
          title?: string | null;
          opening_text?: string | null;
          closing_text?: string | null;
          poster_media_id?: string | null;
          music_id?: string | null;
          duration_preset?: string;
          recommended_publish_at?: string | null;
          publish_at?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          submitted_at?: string | null;
          revision_requested_at?: string | null;
          revision_note?: string | null;
          revision_resolved_at?: string | null;
          production_notes?: string | null;
          final_video_duration_seconds?: number | null;
          final_poster_url?: string | null;
          final_poster_storage_key?: string | null;
          render_started_at?: string | null;
          render_completed_at?: string | null;
          final_video_url?: string | null;
          final_video_storage_key?: string | null;
          render_provider?: string | null;
          render_job_id?: string | null;
          render_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          couple_id?: string;
          status?: string;
          template_key?: string;
          title?: string | null;
          opening_text?: string | null;
          closing_text?: string | null;
          poster_media_id?: string | null;
          music_id?: string | null;
          duration_preset?: string;
          recommended_publish_at?: string | null;
          publish_at?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          submitted_at?: string | null;
          revision_requested_at?: string | null;
          revision_note?: string | null;
          revision_resolved_at?: string | null;
          production_notes?: string | null;
          final_video_duration_seconds?: number | null;
          final_poster_url?: string | null;
          final_poster_storage_key?: string | null;
          render_started_at?: string | null;
          render_completed_at?: string | null;
          final_video_url?: string | null;
          final_video_storage_key?: string | null;
          render_provider?: string | null;
          render_job_id?: string | null;
          render_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      couple_aftermovie_media: {
        Row: {
          id: string;
          aftermovie_id: string;
          media_id: string;
          media_type: string;
          sort_order: number;
          trim_start_seconds: number | null;
          trim_end_seconds: number | null;
          category: string | null;
          is_poster: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          aftermovie_id: string;
          media_id: string;
          media_type: string;
          sort_order?: number;
          trim_start_seconds?: number | null;
          trim_end_seconds?: number | null;
          category?: string | null;
          is_poster?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          aftermovie_id?: string;
          media_id?: string;
          media_type?: string;
          sort_order?: number;
          trim_start_seconds?: number | null;
          trim_end_seconds?: number | null;
          category?: string | null;
          is_poster?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type DbCouple = Database["public"]["Tables"]["couples"]["Row"];
export type DbCouplePhoto = Database["public"]["Tables"]["couple_photos"]["Row"];
export type DbContribution = Database["public"]["Tables"]["contributions"]["Row"];
export type DbContributionMedia =
  Database["public"]["Tables"]["contribution_media"]["Row"];
export type DbRsvpResponse = Database["public"]["Tables"]["rsvp_responses"]["Row"];

export interface ContributionWithMedia extends DbContribution {
  contribution_media: DbContributionMedia[];
}
