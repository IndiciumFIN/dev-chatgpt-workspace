// Generated from Supabase project pgsybzggewhinaniybiy; public/exposed schema type surface only.
// Candidate read-only evidence, not full DB schema or approved contract.
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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      access_attempts: {
        Row: {
          anti_bot_detected: boolean
          auth_used: boolean
          captcha_detected: boolean
          classification: string
          content_length: number | null
          content_type: string | null
          created_at: string
          details: Json
          final_url: string | null
          http_status: number | null
          id: string
          job_id: string | null
          owner_id: string
          requested_url: string
          response_prefix_sha256: string | null
          retry_after: string | null
          strategy: string
          target_id: string | null
        }
        Insert: {
          anti_bot_detected?: boolean
          auth_used?: boolean
          captcha_detected?: boolean
          classification: string
          content_length?: number | null
          content_type?: string | null
          created_at?: string
          details?: Json
          final_url?: string | null
          http_status?: number | null
          id?: string
          job_id?: string | null
          owner_id: string
          requested_url: string
          response_prefix_sha256?: string | null
          retry_after?: string | null
          strategy: string
          target_id?: string | null
        }
        Update: {
          anti_bot_detected?: boolean
          auth_used?: boolean
          captcha_detected?: boolean
          classification?: string
          content_length?: number | null
          content_type?: string | null
          created_at?: string
          details?: Json
          final_url?: string | null
          http_status?: number | null
          id?: string
          job_id?: string | null
          owner_id?: string
          requested_url?: string
          response_prefix_sha256?: string | null
          retry_after?: string | null
          strategy?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_attempts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "discovery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_attempts_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "discovery_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      access_findings: {
        Row: {
          code: string
          created_at: string
          evidence: Json
          id: string
          job_id: string | null
          message: string
          owner_id: string
          requires_human: boolean
          resolved_at: string | null
          severity: string
          target_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          evidence?: Json
          id?: string
          job_id?: string | null
          message: string
          owner_id: string
          requires_human?: boolean
          resolved_at?: string | null
          severity: string
          target_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          evidence?: Json
          id?: string
          job_id?: string | null
          message?: string
          owner_id?: string
          requires_human?: boolean
          resolved_at?: string | null
          severity?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_findings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "discovery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "access_findings_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "discovery_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      access_profiles: {
        Row: {
          auth_type: string
          created_at: string
          enabled: boolean
          id: string
          name: string
          non_secret_config: Json
          owner_id: string
          secret_mode: string
          updated_at: string
          vault_ref: string | null
        }
        Insert: {
          auth_type: string
          created_at?: string
          enabled?: boolean
          id?: string
          name: string
          non_secret_config?: Json
          owner_id: string
          secret_mode?: string
          updated_at?: string
          vault_ref?: string | null
        }
        Update: {
          auth_type?: string
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          non_secret_config?: Json
          owner_id?: string
          secret_mode?: string
          updated_at?: string
          vault_ref?: string | null
        }
        Relationships: []
      }
      admin_entity_registry: {
        Row: {
          allow_delete: boolean
          allow_insert: boolean
          allow_update: boolean
          created_at: string
          description: string | null
          display_order: number
          domain: string
          enabled: boolean
          entity_key: string
          label: string
          pk_columns: string[]
          realtime_enabled: boolean
          schema_name: string
          table_name: string
          updated_at: string
          versioned: boolean
        }
        Insert: {
          allow_delete?: boolean
          allow_insert?: boolean
          allow_update?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          domain?: string
          enabled?: boolean
          entity_key: string
          label: string
          pk_columns: string[]
          realtime_enabled?: boolean
          schema_name?: string
          table_name: string
          updated_at?: string
          versioned?: boolean
        }
        Update: {
          allow_delete?: boolean
          allow_insert?: boolean
          allow_update?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          domain?: string
          enabled?: boolean
          entity_key?: string
          label?: string
          pk_columns?: string[]
          realtime_enabled?: boolean
          schema_name?: string
          table_name?: string
          updated_at?: string
          versioned?: boolean
        }
        Relationships: []
      }
      admin_record_versions: {
        Row: {
          changed_at: string
          changed_by: string | null
          entity_key: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          operation: string
          record_pk: Json
          record_version: number
          schema_name: string
          table_name: string
          txid: number
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          entity_key?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          operation: string
          record_pk: Json
          record_version: number
          schema_name: string
          table_name: string
          txid?: number
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          entity_key?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          operation?: string
          record_pk?: Json
          record_version?: number
          schema_name?: string
          table_name?: string
          txid?: number
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          enabled: boolean
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_assets: {
        Row: {
          asset_key: string
          asset_role: string
          created_at: string
          delivery_url: string | null
          file_name: string
          height_px: number
          id: string
          is_transparent: boolean
          mime_type: string
          notes: string | null
          project_key: string
          quality_status: string
          source_drive_file_id: string | null
          source_url: string | null
          updated_at: string
          width_px: number
        }
        Insert: {
          asset_key: string
          asset_role: string
          created_at?: string
          delivery_url?: string | null
          file_name: string
          height_px: number
          id?: string
          is_transparent?: boolean
          mime_type: string
          notes?: string | null
          project_key: string
          quality_status: string
          source_drive_file_id?: string | null
          source_url?: string | null
          updated_at?: string
          width_px: number
        }
        Update: {
          asset_key?: string
          asset_role?: string
          created_at?: string
          delivery_url?: string | null
          file_name?: string
          height_px?: number
          id?: string
          is_transparent?: boolean
          mime_type?: string
          notes?: string | null
          project_key?: string
          quality_status?: string
          source_drive_file_id?: string | null
          source_url?: string | null
          updated_at?: string
          width_px?: number
        }
        Relationships: []
      }
      cfc_internal_normative_chunks: {
        Row: {
          canonical_promotion: boolean
          chunk_no: number
          created_at: string
          end_page: number
          extractor_version: string
          instrument_id: string
          publication_mode: string
          raw_evidence_id: string
          raw_sha256: string
          start_page: number
          text_char_count: number
          text_content: string
          text_sha256: string
          total_pages: number
          updated_at: string
        }
        Insert: {
          canonical_promotion?: boolean
          chunk_no: number
          created_at?: string
          end_page: number
          extractor_version: string
          instrument_id: string
          publication_mode?: string
          raw_evidence_id: string
          raw_sha256: string
          start_page: number
          text_char_count: number
          text_content: string
          text_sha256: string
          total_pages: number
          updated_at?: string
        }
        Update: {
          canonical_promotion?: boolean
          chunk_no?: number
          created_at?: string
          end_page?: number
          extractor_version?: string
          instrument_id?: string
          publication_mode?: string
          raw_evidence_id?: string
          raw_sha256?: string
          start_page?: number
          text_char_count?: number
          text_content?: string
          text_sha256?: string
          total_pages?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cfc_internal_normative_chunks_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "regulatory_instruments"
            referencedColumns: ["instrument_id"]
          },
        ]
      }
      cfc_internal_normative_extractions: {
        Row: {
          application_unit_count: number
          canonical_promotion: boolean
          created_at: string
          extraction_status: string
          extractor_version: string
          heading_count: number
          identity_hint_match: boolean
          instrument_id: string
          mask_sha256: string
          mask_storage_bucket: string
          mask_storage_path: string
          numbered_unit_count: number
          page_count: number
          policy_id: string
          publication_mode: string
          quality: Json
          raw_byte_count: number
          raw_evidence_id: string
          raw_sha256: string
          relation_count: number
          source_url: string
          text_char_count: number
          text_sha256: string
          text_storage_bucket: string
          text_storage_path: string
          updated_at: string
          warnings: Json
        }
        Insert: {
          application_unit_count?: number
          canonical_promotion?: boolean
          created_at?: string
          extraction_status: string
          extractor_version: string
          heading_count?: number
          identity_hint_match?: boolean
          instrument_id: string
          mask_sha256: string
          mask_storage_bucket?: string
          mask_storage_path: string
          numbered_unit_count?: number
          page_count: number
          policy_id: string
          publication_mode?: string
          quality?: Json
          raw_byte_count: number
          raw_evidence_id: string
          raw_sha256: string
          relation_count?: number
          source_url: string
          text_char_count: number
          text_sha256: string
          text_storage_bucket?: string
          text_storage_path: string
          updated_at?: string
          warnings?: Json
        }
        Update: {
          application_unit_count?: number
          canonical_promotion?: boolean
          created_at?: string
          extraction_status?: string
          extractor_version?: string
          heading_count?: number
          identity_hint_match?: boolean
          instrument_id?: string
          mask_sha256?: string
          mask_storage_bucket?: string
          mask_storage_path?: string
          numbered_unit_count?: number
          page_count?: number
          policy_id?: string
          publication_mode?: string
          quality?: Json
          raw_byte_count?: number
          raw_evidence_id?: string
          raw_sha256?: string
          relation_count?: number
          source_url?: string
          text_char_count?: number
          text_sha256?: string
          text_storage_bucket?: string
          text_storage_path?: string
          updated_at?: string
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cfc_internal_normative_extractions_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: true
            referencedRelation: "regulatory_instruments"
            referencedColumns: ["instrument_id"]
          },
        ]
      }
      discovered_url_occurrences: {
        Row: {
          created_at: string
          discovery_source: string
          id: number
          job_id: string
          media_hint: string | null
          owner_id: string
          sitemap_source_id: string | null
          target_id: string | null
          url: string
        }
        Insert: {
          created_at?: string
          discovery_source?: string
          id?: number
          job_id: string
          media_hint?: string | null
          owner_id: string
          sitemap_source_id?: string | null
          target_id?: string | null
          url: string
        }
        Update: {
          created_at?: string
          discovery_source?: string
          id?: number
          job_id?: string
          media_hint?: string | null
          owner_id?: string
          sitemap_source_id?: string | null
          target_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovered_url_occurrences_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "discovery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_url_occurrences_sitemap_source_id_fkey"
            columns: ["sitemap_source_id"]
            isOneToOne: false
            referencedRelation: "sitemap_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      discovered_urls: {
        Row: {
          acquisition_state: string
          created_at: string
          discovery_source: string
          id: string
          job_id: string | null
          media_hint: string | null
          owner_id: string
          sitemap_source_id: string | null
          target_id: string | null
          url: string
        }
        Insert: {
          acquisition_state?: string
          created_at?: string
          discovery_source: string
          id?: string
          job_id?: string | null
          media_hint?: string | null
          owner_id: string
          sitemap_source_id?: string | null
          target_id?: string | null
          url: string
        }
        Update: {
          acquisition_state?: string
          created_at?: string
          discovery_source?: string
          id?: string
          job_id?: string | null
          media_hint?: string | null
          owner_id?: string
          sitemap_source_id?: string | null
          target_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovered_urls_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "discovery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_urls_sitemap_source_id_fkey"
            columns: ["sitemap_source_id"]
            isOneToOne: false
            referencedRelation: "sitemap_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovered_urls_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "discovery_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_jobs: {
        Row: {
          created_at: string
          current_stage: string | null
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          job_type: string
          owner_id: string
          payload: Json
          progress: number
          result_summary: Json
          started_at: string | null
          status: string
          target_id: string | null
        }
        Insert: {
          created_at?: string
          current_stage?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_type: string
          owner_id: string
          payload?: Json
          progress?: number
          result_summary?: Json
          started_at?: string | null
          status?: string
          target_id?: string | null
        }
        Update: {
          created_at?: string
          current_stage?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          owner_id?: string
          payload?: Json
          progress?: number
          result_summary?: Json
          started_at?: string | null
          status?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_jobs_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "discovery_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_targets: {
        Row: {
          created_at: string
          domain: string
          id: string
          label: string | null
          owner_id: string
          status: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          label?: string | null
          owner_id: string
          status?: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          label?: string | null
          owner_id?: string
          status?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      exam_answer_keys: {
        Row: {
          answer_key_type: string
          correct_option_key: string | null
          id: string
          provenance: Json
          question_id: string
          source_item_id: string | null
          status: string
        }
        Insert: {
          answer_key_type?: string
          correct_option_key?: string | null
          id?: string
          provenance?: Json
          question_id: string
          source_item_id?: string | null
          status?: string
        }
        Update: {
          answer_key_type?: string
          correct_option_key?: string | null
          id?: string
          provenance?: Json
          question_id?: string
          source_item_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_answer_keys_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answer_keys_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "exam_source_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_documents: {
        Row: {
          created_at: string
          document_type: string
          exam_id: string | null
          id: string
          is_primary: boolean
          source_item_id: string
          status: string
        }
        Insert: {
          created_at?: string
          document_type: string
          exam_id?: string | null
          id?: string
          is_primary?: boolean
          source_item_id: string
          status?: string
        }
        Update: {
          created_at?: string
          document_type?: string
          exam_id?: string | null
          id?: string
          is_primary?: boolean
          source_item_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_documents_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_documents_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "exam_source_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_ingest_binary_chunks: {
        Row: {
          chunk: string
          created_at: string
          seq: number
          source_item_id: string
        }
        Insert: {
          chunk: string
          created_at?: string
          seq: number
          source_item_id: string
        }
        Update: {
          chunk?: string
          created_at?: string
          seq?: number
          source_item_id?: string
        }
        Relationships: []
      }
      exam_ingest_runs: {
        Row: {
          completed_at: string | null
          id: string
          items_documented: number
          items_pending: number
          items_seen: number
          notes: string | null
          source_root_id: string
          source_root_name: string
          source_system: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          items_documented?: number
          items_pending?: number
          items_seen?: number
          notes?: string | null
          source_root_id: string
          source_root_name: string
          source_system?: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          items_documented?: number
          items_pending?: number
          items_seen?: number
          notes?: string | null
          source_root_id?: string
          source_root_name?: string
          source_system?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      exam_processing_checkpoints: {
        Row: {
          checkpoint_key: string
          checkpoint_value: Json
          created_at: string
          id: string
          ingest_run_id: string
          updated_at: string
        }
        Insert: {
          checkpoint_key: string
          checkpoint_value: Json
          created_at?: string
          id?: string
          ingest_run_id: string
          updated_at?: string
        }
        Update: {
          checkpoint_key?: string
          checkpoint_value?: Json
          created_at?: string
          id?: string
          ingest_run_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_processing_checkpoints_ingest_run_id_fkey"
            columns: ["ingest_run_id"]
            isOneToOne: false
            referencedRelation: "exam_ingest_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_question_options: {
        Row: {
          id: string
          option_key: string
          option_text: string
          ordinal: number
          question_id: string
        }
        Insert: {
          id?: string
          option_key: string
          option_text: string
          ordinal: number
          question_id: string
        }
        Update: {
          id?: string
          option_key?: string
          option_text?: string
          ordinal?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          exam_id: string
          id: string
          provenance: Json
          question_number: number
          source_page: number | null
          statement: string
          status: string
          subject: string | null
          subtopic: string | null
          topic: string | null
        }
        Insert: {
          exam_id: string
          id?: string
          provenance?: Json
          question_number: number
          source_page?: number | null
          statement: string
          status?: string
          subject?: string | null
          subtopic?: string | null
          topic?: string | null
        }
        Update: {
          exam_id?: string
          id?: string
          provenance?: Json
          question_number?: number
          source_page?: number | null
          statement?: string
          status?: string
          subject?: string | null
          subtopic?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_remediation_tasks: {
        Row: {
          created_at: string
          evidence: Json
          finding_id: string | null
          id: string
          ingest_run_id: string | null
          priority: number
          remediation_hint: string | null
          resolved_at: string | null
          source_item_id: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          finding_id?: string | null
          id?: string
          ingest_run_id?: string | null
          priority: number
          remediation_hint?: string | null
          resolved_at?: string | null
          source_item_id?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          finding_id?: string | null
          id?: string
          ingest_run_id?: string | null
          priority?: number
          remediation_hint?: string | null
          resolved_at?: string | null
          source_item_id?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_remediation_tasks_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: true
            referencedRelation: "exam_validation_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_remediation_tasks_ingest_run_id_fkey"
            columns: ["ingest_run_id"]
            isOneToOne: false
            referencedRelation: "exam_ingest_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_remediation_tasks_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "exam_source_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_source_classifications: {
        Row: {
          classification_version: string
          classified_at: string
          confidence: number | null
          document_type: string | null
          evidence: Json
          exam_board: string | null
          id: string
          municipality: string | null
          nursing_level: string | null
          organization: string | null
          role_title: string | null
          source_item_id: string
          specialty: string | null
          state_code: string | null
          year: number | null
        }
        Insert: {
          classification_version?: string
          classified_at?: string
          confidence?: number | null
          document_type?: string | null
          evidence?: Json
          exam_board?: string | null
          id?: string
          municipality?: string | null
          nursing_level?: string | null
          organization?: string | null
          role_title?: string | null
          source_item_id: string
          specialty?: string | null
          state_code?: string | null
          year?: number | null
        }
        Update: {
          classification_version?: string
          classified_at?: string
          confidence?: number | null
          document_type?: string | null
          evidence?: Json
          exam_board?: string | null
          id?: string
          municipality?: string | null
          nursing_level?: string | null
          organization?: string | null
          role_title?: string | null
          source_item_id?: string
          specialty?: string | null
          state_code?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_source_classifications_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "exam_source_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_source_content: {
        Row: {
          capture_method: string
          captured_at: string
          char_count: number | null
          content_hash_sha256: string | null
          content_text: string | null
          id: string
          is_canonical: boolean
          page_count: number | null
          source_item_id: string
          structured_payload: Json | null
        }
        Insert: {
          capture_method: string
          captured_at?: string
          char_count?: number | null
          content_hash_sha256?: string | null
          content_text?: string | null
          id?: string
          is_canonical?: boolean
          page_count?: number | null
          source_item_id: string
          structured_payload?: Json | null
        }
        Update: {
          capture_method?: string
          captured_at?: string
          char_count?: number | null
          content_hash_sha256?: string | null
          content_text?: string | null
          id?: string
          is_canonical?: boolean
          page_count?: number | null
          source_item_id?: string
          structured_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_source_content_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "exam_source_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_source_items: {
        Row: {
          byte_size: number | null
          content_capture_status: string
          content_hash_sha256: string | null
          created_at_source: string | null
          documented_at: string
          first_seen_at: string
          id: string
          ingest_run_id: string | null
          item_kind: string
          last_seen_at: string
          metadata: Json
          metadata_hash: string | null
          mime_type: string | null
          modified_at_source: string | null
          name: string
          parent_source_item_id: string | null
          read_status: string
          source_item_id: string
          source_path: string | null
          source_system: string
          source_url: string | null
        }
        Insert: {
          byte_size?: number | null
          content_capture_status?: string
          content_hash_sha256?: string | null
          created_at_source?: string | null
          documented_at?: string
          first_seen_at?: string
          id?: string
          ingest_run_id?: string | null
          item_kind: string
          last_seen_at?: string
          metadata?: Json
          metadata_hash?: string | null
          mime_type?: string | null
          modified_at_source?: string | null
          name: string
          parent_source_item_id?: string | null
          read_status?: string
          source_item_id: string
          source_path?: string | null
          source_system?: string
          source_url?: string | null
        }
        Update: {
          byte_size?: number | null
          content_capture_status?: string
          content_hash_sha256?: string | null
          created_at_source?: string | null
          documented_at?: string
          first_seen_at?: string
          id?: string
          ingest_run_id?: string | null
          item_kind?: string
          last_seen_at?: string
          metadata?: Json
          metadata_hash?: string | null
          mime_type?: string | null
          modified_at_source?: string | null
          name?: string
          parent_source_item_id?: string | null
          read_status?: string
          source_item_id?: string
          source_path?: string | null
          source_system?: string
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_source_items_ingest_run_id_fkey"
            columns: ["ingest_run_id"]
            isOneToOne: false
            referencedRelation: "exam_ingest_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_validation_findings: {
        Row: {
          created_at: string
          evidence: Json
          id: string
          ingest_run_id: string | null
          message: string
          resolved_at: string | null
          severity: string
          source_item_id: string | null
          status: string
          validator_code: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          id?: string
          ingest_run_id?: string | null
          message: string
          resolved_at?: string | null
          severity: string
          source_item_id?: string | null
          status?: string
          validator_code: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          id?: string
          ingest_run_id?: string | null
          message?: string
          resolved_at?: string | null
          severity?: string
          source_item_id?: string | null
          status?: string
          validator_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_validation_findings_ingest_run_id_fkey"
            columns: ["ingest_run_id"]
            isOneToOne: false
            referencedRelation: "exam_ingest_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_validation_findings_source_item_id_fkey"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "exam_source_items"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          canonical_key: string
          created_at: string
          exam_board: string | null
          exam_date: string | null
          id: string
          municipality: string | null
          nursing_level: string | null
          organization: string | null
          provenance: Json
          role_title: string | null
          specialty: string | null
          state_code: string | null
          status: string
          updated_at: string
          year: number | null
        }
        Insert: {
          canonical_key: string
          created_at?: string
          exam_board?: string | null
          exam_date?: string | null
          id?: string
          municipality?: string | null
          nursing_level?: string | null
          organization?: string | null
          provenance?: Json
          role_title?: string | null
          specialty?: string | null
          state_code?: string | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          canonical_key?: string
          created_at?: string
          exam_board?: string | null
          exam_date?: string | null
          id?: string
          municipality?: string | null
          nursing_level?: string | null
          organization?: string | null
          provenance?: Json
          role_title?: string | null
          specialty?: string | null
          state_code?: string | null
          status?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      ingest_archive_entries: {
        Row: {
          archive_artifact_id: string
          child_artifact_id: string | null
          compressed_size: number | null
          crc32: string | null
          created_at: string
          entry_index: number
          entry_path: string
          extraction_status: string
          id: string
          intake_id: string
          is_directory: boolean
          metadata: Json
          mime_hint: string | null
          owner_id: string
          uncompressed_size: number | null
        }
        Insert: {
          archive_artifact_id: string
          child_artifact_id?: string | null
          compressed_size?: number | null
          crc32?: string | null
          created_at?: string
          entry_index: number
          entry_path: string
          extraction_status?: string
          id?: string
          intake_id: string
          is_directory?: boolean
          metadata?: Json
          mime_hint?: string | null
          owner_id: string
          uncompressed_size?: number | null
        }
        Update: {
          archive_artifact_id?: string
          child_artifact_id?: string | null
          compressed_size?: number | null
          crc32?: string | null
          created_at?: string
          entry_index?: number
          entry_path?: string
          extraction_status?: string
          id?: string
          intake_id?: string
          is_directory?: boolean
          metadata?: Json
          mime_hint?: string | null
          owner_id?: string
          uncompressed_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingest_archive_entries_archive_artifact_id_fkey"
            columns: ["archive_artifact_id"]
            isOneToOne: false
            referencedRelation: "ingest_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_archive_entries_child_artifact_id_fkey"
            columns: ["child_artifact_id"]
            isOneToOne: false
            referencedRelation: "ingest_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_archive_entries_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_artifacts: {
        Row: {
          archive_depth: number
          artifact_role: string
          created_at: string
          extension: string | null
          id: string
          intake_id: string
          metadata: Json
          mime_type: string | null
          original_name: string | null
          owner_id: string
          parent_artifact_id: string | null
          sha256: string | null
          size_bytes: number | null
          source_url: string | null
          status: string
          storage_bucket: string | null
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          archive_depth?: number
          artifact_role?: string
          created_at?: string
          extension?: string | null
          id?: string
          intake_id: string
          metadata?: Json
          mime_type?: string | null
          original_name?: string | null
          owner_id: string
          parent_artifact_id?: string | null
          sha256?: string | null
          size_bytes?: number | null
          source_url?: string | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          archive_depth?: number
          artifact_role?: string
          created_at?: string
          extension?: string | null
          id?: string
          intake_id?: string
          metadata?: Json
          mime_type?: string | null
          original_name?: string | null
          owner_id?: string
          parent_artifact_id?: string | null
          sha256?: string | null
          size_bytes?: number | null
          source_url?: string | null
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_artifacts_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_artifacts_parent_artifact_id_fkey"
            columns: ["parent_artifact_id"]
            isOneToOne: false
            referencedRelation: "ingest_artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_conversations: {
        Row: {
          artifact_id: string | null
          created_at: string
          external_id: string | null
          id: string
          intake_id: string
          message_count: number
          metadata: Json
          owner_id: string
          source_created_at: string | null
          source_system: string
          source_updated_at: string | null
          title: string | null
        }
        Insert: {
          artifact_id?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          intake_id: string
          message_count?: number
          metadata?: Json
          owner_id: string
          source_created_at?: string | null
          source_system: string
          source_updated_at?: string | null
          title?: string | null
        }
        Update: {
          artifact_id?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          intake_id?: string
          message_count?: number
          metadata?: Json
          owner_id?: string
          source_created_at?: string | null
          source_system?: string
          source_updated_at?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingest_conversations_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "ingest_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_conversations_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_extractions: {
        Row: {
          artifact_id: string
          char_count: number | null
          created_at: string
          extraction_kind: string
          extractor_key: string
          extractor_version: string
          id: string
          intake_id: string
          owner_id: string
          provenance: Json
          quality: Json
          structured_content: Json | null
          text_content: string | null
          text_sha256: string | null
          token_estimate: number | null
        }
        Insert: {
          artifact_id: string
          char_count?: number | null
          created_at?: string
          extraction_kind: string
          extractor_key: string
          extractor_version: string
          id?: string
          intake_id: string
          owner_id: string
          provenance?: Json
          quality?: Json
          structured_content?: Json | null
          text_content?: string | null
          text_sha256?: string | null
          token_estimate?: number | null
        }
        Update: {
          artifact_id?: string
          char_count?: number | null
          created_at?: string
          extraction_kind?: string
          extractor_key?: string
          extractor_version?: string
          id?: string
          intake_id?: string
          owner_id?: string
          provenance?: Json
          quality?: Json
          structured_content?: Json | null
          text_content?: string | null
          text_sha256?: string | null
          token_estimate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ingest_extractions_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "ingest_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_extractions_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_extractor_registry: {
        Row: {
          config: Json
          extensions: string[]
          extractor_key: string
          implementation_status: string
          label: string
          mime_patterns: string[]
          produces: string[]
          updated_at: string
          worker_class: string
        }
        Insert: {
          config?: Json
          extensions?: string[]
          extractor_key: string
          implementation_status: string
          label: string
          mime_patterns?: string[]
          produces?: string[]
          updated_at?: string
          worker_class: string
        }
        Update: {
          config?: Json
          extensions?: string[]
          extractor_key?: string
          implementation_status?: string
          label?: string
          mime_patterns?: string[]
          produces?: string[]
          updated_at?: string
          worker_class?: string
        }
        Relationships: []
      }
      ingest_intakes: {
        Row: {
          adapter_key: string
          created_at: string
          finished_at: string | null
          id: string
          label: string | null
          limit_profile_key: string | null
          options: Json
          owner_id: string
          result_summary: Json
          source_ref: string | null
          source_url: string | null
          started_at: string | null
          status: string
        }
        Insert: {
          adapter_key: string
          created_at?: string
          finished_at?: string | null
          id?: string
          label?: string | null
          limit_profile_key?: string | null
          options?: Json
          owner_id: string
          result_summary?: Json
          source_ref?: string | null
          source_url?: string | null
          started_at?: string | null
          status?: string
        }
        Update: {
          adapter_key?: string
          created_at?: string
          finished_at?: string | null
          id?: string
          label?: string | null
          limit_profile_key?: string | null
          options?: Json
          owner_id?: string
          result_summary?: Json
          source_ref?: string | null
          source_url?: string | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_intakes_adapter_key_fkey"
            columns: ["adapter_key"]
            isOneToOne: false
            referencedRelation: "ingest_source_adapters"
            referencedColumns: ["adapter_key"]
          },
          {
            foreignKeyName: "ingest_intakes_limit_profile_key_fkey"
            columns: ["limit_profile_key"]
            isOneToOne: false
            referencedRelation: "ingest_limit_profiles"
            referencedColumns: ["profile_key"]
          },
        ]
      }
      ingest_limit_profiles: {
        Row: {
          config: Json
          created_at: string
          label: string
          max_archive_depth: number | null
          max_attempts: number
          max_input_bytes: number | null
          max_items_per_task: number | null
          max_output_bytes_per_task: number | null
          max_task_seconds: number | null
          profile_key: string
          routing: string
        }
        Insert: {
          config?: Json
          created_at?: string
          label: string
          max_archive_depth?: number | null
          max_attempts?: number
          max_input_bytes?: number | null
          max_items_per_task?: number | null
          max_output_bytes_per_task?: number | null
          max_task_seconds?: number | null
          profile_key: string
          routing?: string
        }
        Update: {
          config?: Json
          created_at?: string
          label?: string
          max_archive_depth?: number | null
          max_attempts?: number
          max_input_bytes?: number | null
          max_items_per_task?: number | null
          max_output_bytes_per_task?: number | null
          max_task_seconds?: number | null
          profile_key?: string
          routing?: string
        }
        Relationships: []
      }
      ingest_messages: {
        Row: {
          content_text: string | null
          conversation_id: string
          created_at: string
          external_id: string | null
          id: string
          intake_id: string
          metadata: Json
          owner_id: string
          parent_external_id: string | null
          role: string | null
          source_created_at: string | null
        }
        Insert: {
          content_text?: string | null
          conversation_id: string
          created_at?: string
          external_id?: string | null
          id?: string
          intake_id: string
          metadata?: Json
          owner_id: string
          parent_external_id?: string | null
          role?: string | null
          source_created_at?: string | null
        }
        Update: {
          content_text?: string | null
          conversation_id?: string
          created_at?: string
          external_id?: string | null
          id?: string
          intake_id?: string
          metadata?: Json
          owner_id?: string
          parent_external_id?: string | null
          role?: string | null
          source_created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingest_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ingest_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_messages_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_source_adapters: {
        Row: {
          adapter_key: string
          config: Json
          created_at: string
          enabled: boolean
          input_kind: string
          label: string
          requires_auth: boolean
          source_family: string
          supports_direct_fetch: boolean
          supports_recursive: boolean
          supports_upload: boolean
          updated_at: string
        }
        Insert: {
          adapter_key: string
          config?: Json
          created_at?: string
          enabled?: boolean
          input_kind: string
          label: string
          requires_auth?: boolean
          source_family: string
          supports_direct_fetch?: boolean
          supports_recursive?: boolean
          supports_upload?: boolean
          updated_at?: string
        }
        Update: {
          adapter_key?: string
          config?: Json
          created_at?: string
          enabled?: boolean
          input_kind?: string
          label?: string
          requires_auth?: boolean
          source_family?: string
          supports_direct_fetch?: boolean
          supports_recursive?: boolean
          supports_upload?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ingest_task_events: {
        Row: {
          created_at: string
          event_type: string
          id: number
          intake_id: string
          message: string | null
          metrics: Json
          owner_id: string
          progress: number | null
          stage: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          intake_id: string
          message?: string | null
          metrics?: Json
          owner_id: string
          progress?: number | null
          stage?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          intake_id?: string
          message?: string | null
          metrics?: Json
          owner_id?: string
          progress?: number | null
          stage?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingest_task_events_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_task_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ingest_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_tasks: {
        Row: {
          artifact_id: string | null
          attempt: number
          checkpoint: Json
          created_at: string
          current_stage: string | null
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          intake_id: string
          lease_expires_at: string | null
          limits: Json
          max_attempts: number
          owner_id: string
          parent_task_id: string | null
          payload: Json
          priority: number
          progress: number
          result: Json
          run_after: string
          started_at: string | null
          status: string
          task_type: string
          updated_at: string
          worker_class: string
        }
        Insert: {
          artifact_id?: string | null
          attempt?: number
          checkpoint?: Json
          created_at?: string
          current_stage?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          intake_id: string
          lease_expires_at?: string | null
          limits?: Json
          max_attempts?: number
          owner_id: string
          parent_task_id?: string | null
          payload?: Json
          priority?: number
          progress?: number
          result?: Json
          run_after?: string
          started_at?: string | null
          status?: string
          task_type: string
          updated_at?: string
          worker_class?: string
        }
        Update: {
          artifact_id?: string | null
          attempt?: number
          checkpoint?: Json
          created_at?: string
          current_stage?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          intake_id?: string
          lease_expires_at?: string | null
          limits?: Json
          max_attempts?: number
          owner_id?: string
          parent_task_id?: string | null
          payload?: Json
          priority?: number
          progress?: number
          result?: Json
          run_after?: string
          started_at?: string | null
          status?: string
          task_type?: string
          updated_at?: string
          worker_class?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_tasks_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "ingest_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_tasks_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "ingest_intakes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingest_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "ingest_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_data_bindings: {
        Row: {
          binding_role: string
          created_at: string
          enabled: boolean
          project_key: string
          schema_name: string
          table_name: string
        }
        Insert: {
          binding_role?: string
          created_at?: string
          enabled?: boolean
          project_key: string
          schema_name: string
          table_name: string
        }
        Update: {
          binding_role?: string
          created_at?: string
          enabled?: boolean
          project_key?: string
          schema_name?: string
          table_name?: string
        }
        Relationships: []
      }
      regulatory_acquisition_evidence: {
        Row: {
          byte_count: number | null
          content_type: string | null
          created_at: string
          endpoint: string
          evidence_id: string
          findings: Json
          gate_status: string
          http_status: number | null
          identity_gate: boolean
          instrument_id: string
          normative_text_gate: boolean
          promotion_eligible: boolean
          provenance_gate: boolean
          raw_payload: Json | null
          retrieved_at: string | null
          run_id: string
          sha256: string | null
          source_entity_class: string
          source_role: string
        }
        Insert: {
          byte_count?: number | null
          content_type?: string | null
          created_at?: string
          endpoint: string
          evidence_id?: string
          findings?: Json
          gate_status: string
          http_status?: number | null
          identity_gate?: boolean
          instrument_id: string
          normative_text_gate?: boolean
          promotion_eligible?: boolean
          provenance_gate?: boolean
          raw_payload?: Json | null
          retrieved_at?: string | null
          run_id?: string
          sha256?: string | null
          source_entity_class: string
          source_role: string
        }
        Update: {
          byte_count?: number | null
          content_type?: string | null
          created_at?: string
          endpoint?: string
          evidence_id?: string
          findings?: Json
          gate_status?: string
          http_status?: number | null
          identity_gate?: boolean
          instrument_id?: string
          normative_text_gate?: boolean
          promotion_eligible?: boolean
          provenance_gate?: boolean
          raw_payload?: Json | null
          retrieved_at?: string | null
          run_id?: string
          sha256?: string | null
          source_entity_class?: string
          source_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_acquisition_evidence_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "regulatory_instruments"
            referencedColumns: ["instrument_id"]
          },
        ]
      }
      regulatory_instruments: {
        Row: {
          canonical_status: string
          created_at: string
          entity_class: string
          instrument_id: string
          instrument_number: string
          instrument_year: number
          issuer: string
          jurisdiction: string
          legal_type: string
          lexml_urn: string | null
          title: string
          updated_at: string
        }
        Insert: {
          canonical_status?: string
          created_at?: string
          entity_class: string
          instrument_id: string
          instrument_number: string
          instrument_year: number
          issuer: string
          jurisdiction?: string
          legal_type: string
          lexml_urn?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          canonical_status?: string
          created_at?: string
          entity_class?: string
          instrument_id?: string
          instrument_number?: string
          instrument_year?: number
          issuer?: string
          jurisdiction?: string
          legal_type?: string
          lexml_urn?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      regulatory_source_bindings: {
        Row: {
          active: boolean
          authority: string
          can_satisfy_normative_text: boolean
          created_at: string
          endpoint: string
          expected_identity: Json
          id: string
          instrument_id: string
          priority: number
          source_entity_class: string
          source_role: string
        }
        Insert: {
          active?: boolean
          authority: string
          can_satisfy_normative_text?: boolean
          created_at?: string
          endpoint: string
          expected_identity?: Json
          id?: string
          instrument_id: string
          priority?: number
          source_entity_class: string
          source_role: string
        }
        Update: {
          active?: boolean
          authority?: string
          can_satisfy_normative_text?: boolean
          created_at?: string
          endpoint?: string
          expected_identity?: Json
          id?: string
          instrument_id?: string
          priority?: number
          source_entity_class?: string
          source_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_source_bindings_instrument_id_fkey"
            columns: ["instrument_id"]
            isOneToOne: false
            referencedRelation: "regulatory_instruments"
            referencedColumns: ["instrument_id"]
          },
        ]
      }
      sitemap_discovery_queue: {
        Row: {
          attempts: number
          classification: string | null
          created_at: string
          depth: number
          discovered_via: string
          error_message: string | null
          final_url: string | null
          finished_at: string | null
          http_status: number | null
          id: number
          job_id: string
          owner_id: string
          started_at: string | null
          status: string
          target_id: string | null
          url: string
        }
        Insert: {
          attempts?: number
          classification?: string | null
          created_at?: string
          depth?: number
          discovered_via?: string
          error_message?: string | null
          final_url?: string | null
          finished_at?: string | null
          http_status?: number | null
          id?: number
          job_id: string
          owner_id: string
          started_at?: string | null
          status?: string
          target_id?: string | null
          url: string
        }
        Update: {
          attempts?: number
          classification?: string | null
          created_at?: string
          depth?: number
          discovered_via?: string
          error_message?: string | null
          final_url?: string | null
          finished_at?: string | null
          http_status?: number | null
          id?: number
          job_id?: string
          owner_id?: string
          started_at?: string | null
          status?: string
          target_id?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "sitemap_discovery_queue_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "discovery_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      sitemap_sources: {
        Row: {
          classification: string
          content_type: string | null
          created_at: string
          discovered_via: string
          http_status: number | null
          id: string
          job_id: string | null
          metadata: Json
          owner_id: string
          target_id: string | null
          url: string
          url_count: number
        }
        Insert: {
          classification: string
          content_type?: string | null
          created_at?: string
          discovered_via: string
          http_status?: number | null
          id?: string
          job_id?: string | null
          metadata?: Json
          owner_id: string
          target_id?: string | null
          url: string
          url_count?: number
        }
        Update: {
          classification?: string
          content_type?: string | null
          created_at?: string
          discovered_via?: string
          http_status?: number | null
          id?: string
          job_id?: string | null
          metadata?: Json
          owner_id?: string
          target_id?: string | null
          url?: string
          url_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "sitemap_sources_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "discovery_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sitemap_sources_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "discovery_targets"
            referencedColumns: ["id"]
          },
        ]
      }
      technical_claims: {
        Row: {
          authority_rank: string
          checker_status: string
          claim_id: string
          claim_status: string
          claim_value: Json
          created_at: string
          field_path: string
          jurisdiction: string | null
          object_id: string
          provenance_scope: string
          render_permission: boolean
          snapshot_id: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          authority_rank?: string
          checker_status?: string
          claim_id?: string
          claim_status?: string
          claim_value: Json
          created_at?: string
          field_path: string
          jurisdiction?: string | null
          object_id: string
          provenance_scope?: string
          render_permission?: boolean
          snapshot_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          authority_rank?: string
          checker_status?: string
          claim_id?: string
          claim_status?: string
          claim_value?: Json
          created_at?: string
          field_path?: string
          jurisdiction?: string | null
          object_id?: string
          provenance_scope?: string
          render_permission?: boolean
          snapshot_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_claims_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "technical_object_registry"
            referencedColumns: ["object_id"]
          },
          {
            foreignKeyName: "technical_claims_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "technical_source_snapshots"
            referencedColumns: ["snapshot_id"]
          },
        ]
      }
      technical_findings: {
        Row: {
          created_at: string
          evidence: Json
          finding_code: string
          finding_id: string
          message: string
          object_id: string
          requires_human: boolean
          resolved_at: string | null
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          finding_code: string
          finding_id?: string
          message: string
          object_id: string
          requires_human?: boolean
          resolved_at?: string | null
          severity: string
          status?: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          finding_code?: string
          finding_id?: string
          message?: string
          object_id?: string
          requires_human?: boolean
          resolved_at?: string | null
          severity?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_findings_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "technical_object_registry"
            referencedColumns: ["object_id"]
          },
        ]
      }
      technical_object_registry: {
        Row: {
          assurance_status: string
          canonical_status: string
          contract_version: string
          created_at: string
          evidence_status: string
          geometry_status: string
          identity_status: string
          object_class: string
          object_family: string
          object_id: string
          object_name: string
          publication_status: string
          regulatory_status: string
          render_permission: boolean
          renderer_status: string
          topology_status: string
          updated_at: string
        }
        Insert: {
          assurance_status?: string
          canonical_status?: string
          contract_version?: string
          created_at?: string
          evidence_status?: string
          geometry_status?: string
          identity_status?: string
          object_class: string
          object_family: string
          object_id: string
          object_name: string
          publication_status?: string
          regulatory_status?: string
          render_permission?: boolean
          renderer_status?: string
          topology_status?: string
          updated_at?: string
        }
        Update: {
          assurance_status?: string
          canonical_status?: string
          contract_version?: string
          created_at?: string
          evidence_status?: string
          geometry_status?: string
          identity_status?: string
          object_class?: string
          object_family?: string
          object_id?: string
          object_name?: string
          publication_status?: string
          regulatory_status?: string
          render_permission?: boolean
          renderer_status?: string
          topology_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      technical_source_snapshots: {
        Row: {
          api_last_updated: string | null
          created_at: string
          endpoint: string
          http_status: number | null
          identity_binding_status: string
          jurisdiction: string
          object_id: string
          parser_version: string
          query_text: string | null
          raw_payload: Json | null
          render_permission: boolean
          result_count: number | null
          retrieved_at: string
          sha256: string | null
          snapshot_id: string
          source_authority: string
          source_scope: string
          source_type: string
        }
        Insert: {
          api_last_updated?: string | null
          created_at?: string
          endpoint: string
          http_status?: number | null
          identity_binding_status?: string
          jurisdiction: string
          object_id: string
          parser_version?: string
          query_text?: string | null
          raw_payload?: Json | null
          render_permission?: boolean
          result_count?: number | null
          retrieved_at?: string
          sha256?: string | null
          snapshot_id?: string
          source_authority: string
          source_scope?: string
          source_type: string
        }
        Update: {
          api_last_updated?: string | null
          created_at?: string
          endpoint?: string
          http_status?: number | null
          identity_binding_status?: string
          jurisdiction?: string
          object_id?: string
          parser_version?: string
          query_text?: string | null
          raw_payload?: Json | null
          render_permission?: boolean
          result_count?: number | null
          retrieved_at?: string
          sha256?: string | null
          snapshot_id?: string
          source_authority?: string
          source_scope?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_source_snapshots_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "technical_object_registry"
            referencedColumns: ["object_id"]
          },
        ]
      }
      technical_workflows: {
        Row: {
          assurance_gate: boolean
          checker_status: string
          current_state: string
          evidence_gate: boolean
          geometry_gate: boolean
          identity_gate: boolean
          last_reperformed_at: string | null
          maker_status: string
          object_id: string
          publication_gate: boolean
          regulatory_gate: boolean
          renderer_gate: boolean
          stale: boolean
          topology_gate: boolean
          updated_at: string
          workflow_id: string
          workflow_status: string
        }
        Insert: {
          assurance_gate?: boolean
          checker_status?: string
          current_state?: string
          evidence_gate?: boolean
          geometry_gate?: boolean
          identity_gate?: boolean
          last_reperformed_at?: string | null
          maker_status?: string
          object_id: string
          publication_gate?: boolean
          regulatory_gate?: boolean
          renderer_gate?: boolean
          stale?: boolean
          topology_gate?: boolean
          updated_at?: string
          workflow_id?: string
          workflow_status?: string
        }
        Update: {
          assurance_gate?: boolean
          checker_status?: string
          current_state?: string
          evidence_gate?: boolean
          geometry_gate?: boolean
          identity_gate?: boolean
          last_reperformed_at?: string | null
          maker_status?: string
          object_id?: string
          publication_gate?: boolean
          regulatory_gate?: boolean
          renderer_gate?: boolean
          stale?: boolean
          topology_gate?: boolean
          updated_at?: string
          workflow_id?: string
          workflow_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "technical_workflows_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: true
            referencedRelation: "technical_object_registry"
            referencedColumns: ["object_id"]
          },
        ]
      }
    }
    Views: {
      cfc_internal_library_catalog_v: {
        Row: {
          applicability: string | null
          attributes: Json | null
          authority: string | null
          authority_class: string | null
          binding_status: string | null
          full_text_storage_policy: string | null
          normative_ref: string | null
          official_uri: string | null
          title: string | null
          verified_at: string | null
        }
        Insert: {
          applicability?: string | null
          attributes?: Json | null
          authority?: string | null
          authority_class?: string | null
          binding_status?: string | null
          full_text_storage_policy?: string | null
          normative_ref?: string | null
          official_uri?: string | null
          title?: string | null
          verified_at?: string | null
        }
        Update: {
          applicability?: string | null
          attributes?: Json | null
          authority?: string | null
          authority_class?: string | null
          binding_status?: string | null
          full_text_storage_policy?: string | null
          normative_ref?: string | null
          official_uri?: string | null
          title?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_catalog: { Args: never; Returns: Json }
      admin_create_record: {
        Args: { p_entity_key: string; p_payload: Json }
        Returns: Json
      }
      admin_delete_record: {
        Args: { p_entity_key: string; p_expected_version?: number; p_pk: Json }
        Returns: Json
      }
      admin_list_records: {
        Args: { p_entity_key: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
      admin_record_history: {
        Args: { p_entity_key: string; p_limit?: number; p_pk: Json }
        Returns: Json
      }
      admin_restore_version: { Args: { p_version_id: number }; Returns: Json }
      admin_role: { Args: never; Returns: string }
      admin_update_record: {
        Args: {
          p_entity_key: string
          p_expected_version?: number
          p_patch: Json
          p_pk: Json
        }
        Returns: Json
      }
      check_exam_ingest_token: { Args: { p_token: string }; Returns: boolean }
      cko_get_active_ai_context_v1: {
        Args: { p_prompt_id?: string }
        Returns: Json
      }
      cko_get_regulatory_context_slice_v1: {
        Args: { p_prompt_id?: string; p_source_id?: string; p_url?: string }
        Returns: Json
      }
      cko_monitor_claim: {
        Args: { p_limit?: number }
        Returns: {
          acquisition_id: string
          baseline_content_text: string
          baseline_mime_type: string
          baseline_sha256: string
          baseline_snapshot_id: string
          canonical_id: string
          instrument_id: string
          official_source_id: string
          priority: string
          requested_url: string
          routing_ref: string
          subject_ref: string
        }[]
      }
      cko_monitor_commit: {
        Args: {
          p_acquisition_id: string
          p_byte_count?: number
          p_content_text?: string
          p_error?: string
          p_final_url?: string
          p_http_status?: number
          p_mime_type?: string
          p_normalized_sha256?: string
          p_outcome: string
          p_retrieved_at?: string
          p_sha256?: string
        }
        Returns: Json
      }
      cko_monitor_commit_v2: {
        Args: {
          p_acquisition_id: string
          p_byte_count?: number
          p_content_text?: string
          p_diff_json?: Json
          p_error?: string
          p_final_url?: string
          p_http_status?: number
          p_mask_json?: Json
          p_mask_sha256?: string
          p_mime_type?: string
          p_outcome: string
          p_retrieved_at?: string
          p_sha256?: string
        }
        Returns: Json
      }
      cko_orch_create_lock_v1: {
        Args: {
          p_actor_agent_id: string
          p_lock_payload: Json
          p_lock_type: string
          p_workflow_id: string
        }
        Returns: Json
      }
      cko_orch_create_workflow_v1: {
        Args: {
          p_canonical_ref?: string
          p_initial_state?: string
          p_metadata?: Json
          p_orchestrator_agent_id?: string
          p_risk_tier?: string
          p_subject_ref: string
          p_workflow_id: string
        }
        Returns: Json
      }
      cko_orch_request_transition_v1: {
        Args: {
          p_actor_agent_id: string
          p_requested_state: string
          p_workflow_id: string
        }
        Returns: Json
      }
      cko_orch_resolve_divergence_v1: {
        Args: {
          p_actor_agent_id: string
          p_divergence_id: string
          p_evidence_refs?: Json
          p_resolution: string
          p_waive?: boolean
        }
        Returns: Json
      }
      cko_orch_status_v1: { Args: { p_workflow_id: string }; Returns: Json }
      cko_orch_submit_proposal_v1: {
        Args: {
          p_agent_id: string
          p_evidence_refs?: Json
          p_expected_hashes?: Json
          p_payload: Json
          p_proposal_id?: string
          p_proposal_type: string
          p_workflow_id: string
        }
        Returns: Json
      }
      cko_register_ai_job_v1: {
        Args: {
          p_ai_job_id: string
          p_candidate_output: Json
          p_context_hash: string
          p_engine_id: string
          p_engine_version: string
          p_input_refs: Json
          p_job_type: string
          p_knowledge_pack_id: string
          p_model: string
          p_prompt_hash: string
          p_prompt_id: string
          p_prompt_version: string
          p_provider: string
          p_response_raw: Json
          p_status?: string
        }
        Returns: Json
      }
      cko_validate_ai_job_refs_v1: { Args: { p_job_id: string }; Returns: Json }
      cko_verify_internal_token: {
        Args: { p_name: string; p_token: string }
        Returns: boolean
      }
      enqueue_exam_ingest_base64: {
        Args: {
          p_content_base64: string
          p_expected_bytes: number
          p_expected_sha256: string
          p_file_name: string
          p_metadata?: Json
          p_mime_type: string
          p_source_item_id: string
        }
        Returns: number
      }
      enqueue_exam_ingest_staged: {
        Args: {
          p_expected_bytes: number
          p_expected_sha256: string
          p_file_name: string
          p_metadata?: Json
          p_mime_type: string
          p_source_item_id: string
        }
        Returns: number
      }
      enqueue_exam_ingest_url_b64: {
        Args: {
          p_download_url_b64: string
          p_expected_bytes: number
          p_file_name: string
          p_metadata?: Json
          p_mime_type: string
          p_source_item_id: string
        }
        Returns: number
      }
      export_account_palm_backup_section_v1: {
        Args: { p_limit?: number; p_offset?: number; p_section: string }
        Returns: Json
      }
      export_account_palm_master_register_v1: { Args: never; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      promote_validated_exam_questions: {
        Args: { p_exam_id: string }
        Returns: number
      }
      refresh_exam_remediation_queue: {
        Args: { p_ingest_run_id: string }
        Returns: {
          open_tasks: number
          priority: number
        }[]
      }
      register_exam_source_item: {
        Args: {
          p_byte_size?: number
          p_created_at_source?: string
          p_ingest_run_id: string
          p_item_kind: string
          p_metadata?: Json
          p_mime_type?: string
          p_modified_at_source?: string
          p_name: string
          p_parent_source_item_id: string
          p_source_item_id: string
          p_source_path: string
          p_source_url?: string
        }
        Returns: string
      }
      run_exam_json_validators: {
        Args: { p_source_drive_id: string }
        Returns: {
          message: string
          severity: string
          validator_code: string
        }[]
      }
      sync_exam_validation_statuses: {
        Args: never
        Returns: {
          out_canonical_key: string
          out_new_status: string
          out_old_status: string
          out_open_major_folder_findings: number
          out_viable_answer_key_docs: number
          out_viable_exam_docs: number
        }[]
      }
      validate_cfc_internal_token_v1: {
        Args: { p_token: string }
        Returns: boolean
      }
      validate_exam_batch_v2: {
        Args: { p_ingest_run_id: string; p_source_prefix: string }
        Returns: {
          out_message: string
          out_severity: string
          out_source_path: string
          out_validator_code: string
        }[]
      }
      validate_exam_batch_v3: {
        Args: { p_ingest_run_id: string; p_source_root: string }
        Returns: Json
      }
      validate_exam_document_sets: {
        Args: { p_ingest_run_id: string }
        Returns: {
          exam_status: string
          exams_count: number
        }[]
      }
      validate_exam_ingest_run: {
        Args: { p_ingest_run_id: string }
        Returns: {
          open_findings: number
          severity: string
        }[]
      }
      vdc_ai_compile_job: { Args: { payload: Json }; Returns: Json }
      vdc_ai_generate_spec: { Args: { payload: Json }; Returns: Json }
      vdc_ai_render_spec: {
        Args: { p_breakpoint?: string; p_instance_id: string }
        Returns: Json
      }
      vdc_ai_snapshot_instance: {
        Args: {
          p_actor_id?: string
          p_change_summary?: string
          p_instance_id: string
        }
        Returns: Json
      }
      vdc_ai_validate_instance: {
        Args: { p_instance_id: string }
        Returns: Json
      }
      vdc_vrf_select_strategy: { Args: { payload: Json }; Returns: Json }
      vdc_vrf_status: { Args: never; Returns: Json }
      vdc_vrf_validate_bits32_signature: {
        Args: { p_signature_id: string }
        Returns: Json
      }
      vdc3_bits32_observation_status: {
        Args: { p_world_object_id: string }
        Returns: Json
      }
      vdc3_compile_segment_edit: { Args: { payload: Json }; Returns: Json }
      vdc3_derive_segment_seed: {
        Args: {
          p_master_seed: number
          p_reference_hash: string
          p_scene_id: string
          p_segment_key: string
        }
        Returns: number
      }
      vdc3_promote_world_object: {
        Args: {
          p_actor_id: string
          p_target_state: string
          p_world_object_id: string
        }
        Returns: Json
      }
      vdc3_validate_character_decomposition: {
        Args: { p_asset_id: string }
        Returns: Json
      }
      vdc3_validate_scene: { Args: { p_scene_id: string }; Returns: Json }
      vdc3_validate_segment_edit: { Args: { p_run_id: string }; Returns: Json }
      vdc3_validate_semantic_masks: {
        Args: { p_asset_id: string }
        Returns: Json
      }
      vdc3_validate_world_object: {
        Args: { p_world_object_id: string }
        Returns: Json
      }
      xlf_admin_catalog_v1: { Args: never; Returns: Json }
      xlf_admin_dashboard_v1: { Args: never; Returns: Json }
      xlf_admin_list_records_v1: {
        Args: { p_entity_key: string; p_limit?: number; p_offset?: number }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
