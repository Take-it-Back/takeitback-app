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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      agency_leads: {
        Row: {
          app_type: string | null
          budget: string | null
          company: string | null
          created_at: string
          details: string | null
          email: string
          estimate_high: number | null
          estimate_low: number | null
          features: string[]
          id: string
          lang: string
          lost_reason: string | null
          name: string
          notes: string | null
          platforms: string[]
          project: Json | null
          proposal: Json | null
          source: string
          stage: string
          timeline: string | null
          updated_at: string
          value: number | null
          weeks_high: number | null
          weeks_low: number | null
        }
        Insert: {
          app_type?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          details?: string | null
          email: string
          estimate_high?: number | null
          estimate_low?: number | null
          features?: string[]
          id?: string
          lang?: string
          lost_reason?: string | null
          name: string
          notes?: string | null
          platforms?: string[]
          project?: Json | null
          proposal?: Json | null
          source?: string
          stage?: string
          timeline?: string | null
          updated_at?: string
          value?: number | null
          weeks_high?: number | null
          weeks_low?: number | null
        }
        Update: {
          app_type?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          details?: string | null
          email?: string
          estimate_high?: number | null
          estimate_low?: number | null
          features?: string[]
          id?: string
          lang?: string
          lost_reason?: string | null
          name?: string
          notes?: string | null
          platforms?: string[]
          project?: Json | null
          proposal?: Json | null
          source?: string
          stage?: string
          timeline?: string | null
          updated_at?: string
          value?: number | null
          weeks_high?: number | null
          weeks_low?: number | null
        }
        Relationships: []
      }
      ai_calls: {
        Row: {
          created_at: string
          id: number
          input_tokens: number
          kind: string
          model: string | null
          output_tokens: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          input_tokens?: number
          kind: string
          model?: string | null
          output_tokens?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          input_tokens?: number
          kind?: string
          model?: string | null
          output_tokens?: number
          user_id?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          id: number
          kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          kind: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: never
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      app_errors: {
        Row: {
          area: string
          created_at: string
          id: number
          message: string
          path: string | null
          user_id: string | null
        }
        Insert: {
          area: string
          created_at?: string
          id?: never
          message: string
          path?: string | null
          user_id?: string | null
        }
        Update: {
          area?: string
          created_at?: string
          id?: never
          message?: string
          path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_waitlist: {
        Row: {
          created_at: string
          email: string
          id: number
          platform: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: never
          platform: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: never
          platform?: string
        }
        Relationships: []
      }
      case_passes: {
        Row: {
          amount_cents: number | null
          case_id: string
          created_at: string
          expires_at: string
          id: string
          ref: string
          revoked_at: string | null
          source: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          case_id: string
          created_at?: string
          expires_at: string
          id?: string
          ref: string
          revoked_at?: string | null
          source: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          case_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          ref?: string
          revoked_at?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_passes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_shares: {
        Row: {
          accepted_at: string | null
          case_id: string
          created_at: string
          helper_email: string
          helper_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          accepted_at?: string | null
          case_id: string
          created_at?: string
          helper_email: string
          helper_id?: string | null
          id?: string
          owner_id?: string
        }
        Update: {
          accepted_at?: string | null
          case_id?: string
          created_at?: string
          helper_email?: string
          helper_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_shares_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          amount_at_stake: number | null
          category: string
          closed_at: string | null
          counterparty: string | null
          created_at: string
          findings: Json
          id: string
          insured: string | null
          is_demo: boolean
          last_payment_on: string | null
          next_steps: Json
          outcome_amount: number | null
          paid: string | null
          pending_deadlines: Json | null
          potential_savings: number | null
          received_date: string | null
          red_flag: boolean
          red_flag_reason: string | null
          stage: number
          status: string
          summary: string | null
          title: string
          updated_at: string
          user_id: string
          user_state: string | null
        }
        Insert: {
          amount_at_stake?: number | null
          category?: string
          closed_at?: string | null
          counterparty?: string | null
          created_at?: string
          findings?: Json
          id?: string
          insured?: string | null
          is_demo?: boolean
          last_payment_on?: string | null
          next_steps?: Json
          outcome_amount?: number | null
          paid?: string | null
          pending_deadlines?: Json | null
          potential_savings?: number | null
          received_date?: string | null
          red_flag?: boolean
          red_flag_reason?: string | null
          stage?: number
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          user_id: string
          user_state?: string | null
        }
        Update: {
          amount_at_stake?: number | null
          category?: string
          closed_at?: string | null
          counterparty?: string | null
          created_at?: string
          findings?: Json
          id?: string
          insured?: string | null
          is_demo?: boolean
          last_payment_on?: string | null
          next_steps?: Json
          outcome_amount?: number | null
          paid?: string | null
          pending_deadlines?: Json | null
          potential_savings?: number | null
          received_date?: string | null
          red_flag?: boolean
          red_flag_reason?: string | null
          stage?: number
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          user_state?: string | null
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          case_id: string
          created_at: string
          done: boolean
          due_date: string
          id: string
          last_reminded_on: string | null
          owner: string
          rule_note: string | null
          title: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          done?: boolean
          due_date: string
          id?: string
          last_reminded_on?: string | null
          owner?: string
          rule_note?: string | null
          title: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          done?: boolean
          due_date?: string
          id?: string
          last_reminded_on?: string | null
          owner?: string
          rule_note?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deadlines_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string
          last_seen_at: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_seen_at?: string
          platform?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_seen_at?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          analysis: Json | null
          case_id: string
          created_at: string
          file_name: string | null
          id: string
          kind: string
          label: string | null
          mime_type: string | null
          storage_path: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          case_id: string
          created_at?: string
          file_name?: string | null
          id?: string
          kind?: string
          label?: string | null
          mime_type?: string | null
          storage_path: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          case_id?: string
          created_at?: string
          file_name?: string | null
          id?: string
          kind?: string
          label?: string | null
          mime_type?: string | null
          storage_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          case_id: string
          detail: string | null
          happened_at: string
          id: string
          kind: string
          title: string
          user_id: string
        }
        Insert: {
          case_id: string
          detail?: string | null
          happened_at?: string
          id?: string
          kind?: string
          title: string
          user_id: string
        }
        Update: {
          case_id?: string
          detail?: string | null
          happened_at?: string
          id?: string
          kind?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          body: string
          case_id: string
          created_at: string
          id: string
          kind: string
          recipient: string | null
          sent_at: string | null
          sent_method: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          case_id: string
          created_at?: string
          id?: string
          kind?: string
          recipient?: string | null
          sent_at?: string | null
          sent_method?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          case_id?: string
          created_at?: string
          id?: string
          kind?: string
          recipient?: string | null
          sent_at?: string | null
          sent_method?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "letters_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_goals: {
        Row: {
          metric: string
          target: number
          updated_at: string
        }
        Insert: {
          metric: string
          target: number
          updated_at?: string
        }
        Update: {
          metric?: string
          target?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_issues: {
        Row: {
          app: string
          category: string
          created_at: string
          details: string | null
          fix: string | null
          id: string
          resolved_at: string | null
          severity: string
          source: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          app?: string
          category?: string
          created_at?: string
          details?: string | null
          fix?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          app?: string
          category?: string
          created_at?: string
          details?: string | null
          fix?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_messages: {
        Row: {
          app: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          topic: string
        }
        Insert: {
          app?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          topic?: string
        }
        Update: {
          app?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          topic?: string
        }
        Relationships: []
      }
      portfolio_plan: {
        Row: {
          data: Json
          id: string
          updated_at: string
        }
        Insert: {
          data: Json
          id: string
          updated_at?: string
        }
        Update: {
          data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_city: string | null
          address_line1: string | null
          address_line2: string | null
          address_state: string | null
          address_zip: string | null
          apple_original_transaction_id: string | null
          apple_signed_at: string | null
          billing_source: string | null
          created_at: string
          current_period_end: string | null
          full_name: string | null
          google_purchase_token: string | null
          google_signed_at: string | null
          health_consent_at: string | null
          id: string
          inbox_token: string | null
          is_admin: boolean
          language: string
          morning_briefing: boolean
          phone: string | null
          plan: string
          plan_status: string | null
          referral_code: string | null
          referral_credit_months: number
          referral_rewarded_at: string | null
          referred_by: string | null
          remind_email: boolean
          renewal_consent_at: string | null
          renewal_consent_text: string | null
          sms_consent_at: string | null
          sms_opt_in: boolean
          state: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          welcome_sent_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_state?: string | null
          address_zip?: string | null
          apple_original_transaction_id?: string | null
          apple_signed_at?: string | null
          billing_source?: string | null
          created_at?: string
          current_period_end?: string | null
          full_name?: string | null
          google_purchase_token?: string | null
          google_signed_at?: string | null
          health_consent_at?: string | null
          id: string
          inbox_token?: string | null
          is_admin?: boolean
          language?: string
          morning_briefing?: boolean
          phone?: string | null
          plan?: string
          plan_status?: string | null
          referral_code?: string | null
          referral_credit_months?: number
          referral_rewarded_at?: string | null
          referred_by?: string | null
          remind_email?: boolean
          renewal_consent_at?: string | null
          renewal_consent_text?: string | null
          sms_consent_at?: string | null
          sms_opt_in?: boolean
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          welcome_sent_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_state?: string | null
          address_zip?: string | null
          apple_original_transaction_id?: string | null
          apple_signed_at?: string | null
          billing_source?: string | null
          created_at?: string
          current_period_end?: string | null
          full_name?: string | null
          google_purchase_token?: string | null
          google_signed_at?: string | null
          health_consent_at?: string | null
          id?: string
          inbox_token?: string | null
          is_admin?: boolean
          language?: string
          morning_briefing?: boolean
          phone?: string | null
          plan?: string
          plan_status?: string | null
          referral_code?: string | null
          referral_credit_months?: number
          referral_rewarded_at?: string | null
          referred_by?: string | null
          remind_email?: boolean
          renewal_consent_at?: string | null
          renewal_consent_text?: string | null
          sms_consent_at?: string | null
          sms_opt_in?: boolean
          state?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          welcome_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_agent?: string | null
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      roadmap_items: {
        Row: {
          area: string | null
          created_at: string
          detail: string | null
          done_at: string | null
          id: string
          lane: string
          priority: string
          sort: number
          title: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          created_at?: string
          detail?: string | null
          done_at?: string | null
          id?: string
          lane?: string
          priority?: string
          sort?: number
          title: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          created_at?: string
          detail?: string | null
          done_at?: string | null
          id?: string
          lane?: string
          priority?: string
          sort?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      sends: {
        Row: {
          case_id: string
          created_at: string
          error: string | null
          fax_number: string | null
          id: string
          letter_id: string
          method: string
          price_cents: number | null
          provider_id: string | null
          status: string
          stripe_session: string | null
          to_address: Json | null
          to_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          case_id: string
          created_at?: string
          error?: string | null
          fax_number?: string | null
          id?: string
          letter_id: string
          method: string
          price_cents?: number | null
          provider_id?: string | null
          status?: string
          stripe_session?: string | null
          to_address?: Json | null
          to_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          case_id?: string
          created_at?: string
          error?: string | null
          fax_number?: string | null
          id?: string
          letter_id?: string
          method?: string
          price_cents?: number | null
          provider_id?: string | null
          status?: string
          stripe_session?: string | null
          to_address?: Json | null
          to_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sends_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sends_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          external_id: string | null
          from_staff: boolean
          id: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          external_id?: string | null
          from_staff?: boolean
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          external_id?: string | null
          from_staff?: boolean
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          case_id: string | null
          created_at: string
          email: string
          guest_token: string | null
          id: string
          last_message_at: string
          name: string | null
          number: number
          page: string | null
          platform: string
          source: string
          status: string
          subject: string
          topic: string
          updated_at: string
          user_id: string | null
          user_unread: boolean
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          email: string
          guest_token?: string | null
          id?: string
          last_message_at?: string
          name?: string | null
          number?: never
          page?: string | null
          platform?: string
          source?: string
          status?: string
          subject: string
          topic?: string
          updated_at?: string
          user_id?: string | null
          user_unread?: boolean
        }
        Update: {
          case_id?: string | null
          created_at?: string
          email?: string
          guest_token?: string | null
          id?: string
          last_message_at?: string
          name?: string | null
          number?: never
          page?: string | null
          platform?: string
          source?: string
          status?: string
          subject?: string
          topic?: string
          updated_at?: string
          user_id?: string | null
          user_unread?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      wins: {
        Row: {
          amount: number | null
          case_id: string
          category: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          case_id: string
          category: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Update: {
          amount?: number | null
          case_id?: string
          category?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wins_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_activation: { Args: never; Returns: Json }
      admin_ai_costs: {
        Args: never
        Returns: {
          avg_in: number
          avg_out: number
          calls: number
          kind: string
          model: string
        }[]
      }
      admin_db_stats: { Args: never; Returns: Json }
      admin_overview: { Args: never; Returns: Json }
      billing_apply: {
        Args: {
          p_customer: string
          p_period_end: string
          p_secret: string
          p_status: string
          p_subscription: string
          p_user: string
        }
        Returns: boolean
      }
      billing_apply_apple:
        | {
            Args: {
              p_original_tx: string
              p_period_end: string
              p_secret: string
              p_status: string
              p_user: string
            }
            Returns: string
          }
        | {
            Args: {
              p_original_tx: string
              p_period_end: string
              p_secret: string
              p_signed_at: string
              p_status: string
              p_user: string
            }
            Returns: string
          }
      billing_apply_google: {
        Args: {
          p_period_end: string
          p_secret: string
          p_signed_at: string
          p_status: string
          p_token: string
          p_user: string
        }
        Returns: string
      }
      case_folder_ok: { Args: { p_name: string }; Returns: boolean }
      case_pass_active: { Args: { p_case: string }; Returns: boolean }
      case_premium: { Args: { p_case: string }; Returns: boolean }
      claim_case_shares: { Args: never; Returns: number }
      claim_device_token: {
        Args: { p_platform?: string; p_token: string }
        Returns: undefined
      }
      claim_referral: { Args: { p_code: string }; Returns: boolean }
      delete_my_account: { Args: never; Returns: undefined }
      grant_case_pass: {
        Args: {
          p_amount: number
          p_case: string
          p_days: number
          p_ref: string
          p_secret: string
          p_source: string
          p_user: string
        }
        Returns: string
      }
      is_case_helper: { Args: { p_case: string }; Returns: boolean }
      is_case_owner: { Args: { p_case: string }; Returns: boolean }
      owns_case: { Args: { p_case: string }; Returns: boolean }
      referral_bank_month: {
        Args: { p_delta: number; p_secret: string; p_user: string }
        Returns: undefined
      }
      referral_reward: {
        Args: { p_secret: string; p_user: string }
        Returns: {
          friend_customer: string
          referrer: string
          referrer_customer: string
        }[]
      }
      revoke_case_pass: {
        Args: { p_ref: string; p_secret: string }
        Returns: boolean
      }
      save_apple_refresh_token: {
        Args: { p_client_id: string; p_token: string }
        Returns: undefined
      }
      send_set_status: {
        Args: {
          p_error: string
          p_id: string
          p_provider: string
          p_secret: string
          p_status: string
        }
        Returns: boolean
      }
      set_health_consent: { Args: { p_on: boolean }; Returns: undefined }
      set_renewal_consent: { Args: { p_text: string }; Returns: undefined }
      set_sms_consent: {
        Args: { p_keep: boolean; p_on: boolean }
        Returns: undefined
      }
      stripe_event_done: {
        Args: { p_id: string; p_secret: string; p_type: string }
        Returns: undefined
      }
      stripe_event_seen: {
        Args: { p_id: string; p_secret: string }
        Returns: boolean
      }
      support_admin_list: { Args: { p_status?: string }; Returns: Json }
      support_admin_thread: { Args: { p_ticket: string }; Returns: Json }
      support_create: {
        Args: {
          p_case_id?: string
          p_email?: string
          p_message: string
          p_name?: string
          p_page?: string
          p_platform?: string
          p_subject: string
          p_topic?: string
        }
        Returns: Json
      }
      support_guest_thread: { Args: { p_token: string }; Returns: Json }
      support_inbound: {
        Args: {
          p_body: string
          p_email_id: string
          p_from_email: string
          p_from_name: string
          p_secret: string
          p_subject: string
          p_to?: string
        }
        Returns: Json
      }
      support_mark_read: { Args: { p_ticket: string }; Returns: undefined }
      support_reply: {
        Args: { p_body: string; p_ticket: string; p_token?: string }
        Returns: Json
      }
      support_set_status: {
        Args: { p_status: string; p_ticket: string; p_token?: string }
        Returns: undefined
      }
      take_apple_refresh_token: {
        Args: never
        Returns: {
          client_id: string
          refresh_token: string
        }[]
      }
      unlock_case_deadlines: { Args: { p_case: string }; Returns: number }
      uptime_status: { Args: never; Returns: Json }
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
