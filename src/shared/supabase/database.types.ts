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
    PostgrestVersion: '14.15'
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
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
  public: {
    Tables: {
      activity_events: {
        Row: {
          actor_user_id: string
          created_at: string
          event_id: string
          event_type: string
          garage_id: string
          metadata: Json
          subject_id: string
          subject_type: string
          updated_at: string
        }
        Insert: {
          actor_user_id: string
          created_at?: string
          event_id?: string
          event_type: string
          garage_id: string
          metadata?: Json
          subject_id: string
          subject_type: string
          updated_at?: string
        }
        Update: {
          actor_user_id?: string
          created_at?: string
          event_id?: string
          event_type?: string
          garage_id?: string
          metadata?: Json
          subject_id?: string
          subject_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'activity_events_garage_id_fkey'
            columns: ['garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['garage_id']
          },
        ]
      }
      customer_claims: {
        Row: {
          claim_id: string
          created_at: string
          customer_id: string
          expires_at: string
          garage_id: string
          intended_email: string
          issued_by: string
          redeemed_at: string | null
          redeemed_by: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          claim_id?: string
          created_at?: string
          customer_id: string
          expires_at: string
          garage_id: string
          intended_email: string
          issued_by: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          customer_id?: string
          expires_at?: string
          garage_id?: string
          intended_email?: string
          issued_by?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customer_claims_garage_id_customer_id_fkey'
            columns: ['garage_id', 'customer_id']
            isOneToOne: false
            referencedRelation: 'garage_customers'
            referencedColumns: ['garage_id', 'customer_id']
          },
        ]
      }
      garage_customers: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          creation_key: string
          customer_id: string
          email: string | null
          full_name: string
          garage_id: string
          linked_profile_id: string | null
          phone_e164: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          creation_key: string
          customer_id?: string
          email?: string | null
          full_name: string
          garage_id: string
          linked_profile_id?: string | null
          phone_e164: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          creation_key?: string
          customer_id?: string
          email?: string | null
          full_name?: string
          garage_id?: string
          linked_profile_id?: string | null
          phone_e164?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'garage_customers_garage_id_fkey'
            columns: ['garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['garage_id']
          },
          {
            foreignKeyName: 'garage_customers_linked_profile_id_fkey'
            columns: ['linked_profile_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['user_id']
          },
        ]
      }
      garage_memberships: {
        Row: {
          accepted_at: string | null
          created_at: string
          garage_id: string
          invited_by: string | null
          membership_id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          garage_id: string
          invited_by?: string | null
          membership_id?: string
          role: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          garage_id?: string
          invited_by?: string | null
          membership_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'garage_memberships_garage_id_fkey'
            columns: ['garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['garage_id']
          },
        ]
      }
      garages: {
        Row: {
          created_at: string
          created_by: string
          creation_key: string
          garage_id: string
          name: string
          phone_e164: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          creation_key: string
          garage_id?: string
          name: string
          phone_e164: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          creation_key?: string
          garage_id?: string
          name?: string
          phone_e164?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      membership_capability_grants: {
        Row: {
          capability: string
          created_at: string
          garage_id: string
          grant_id: string
          grant_reason: string
          granted_at: string
          granted_by: string
          membership_id: string
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          updated_at: string
        }
        Insert: {
          capability: string
          created_at?: string
          garage_id: string
          grant_id?: string
          grant_reason: string
          granted_at?: string
          granted_by: string
          membership_id: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
        }
        Update: {
          capability?: string
          created_at?: string
          garage_id?: string
          grant_id?: string
          grant_reason?: string
          granted_at?: string
          granted_by?: string
          membership_id?: string
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'membership_capability_grants_garage_id_membership_id_fkey'
            columns: ['garage_id', 'membership_id']
            isOneToOne: false
            referencedRelation: 'garage_memberships'
            referencedColumns: ['garage_id', 'membership_id']
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          phone_e164: string
          phone_verified_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          phone_e164: string
          phone_verified_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          phone_e164?: string
          phone_verified_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_invitations: {
        Row: {
          created_at: string
          expires_at: string
          garage_id: string
          intended_email: string
          intended_role: string
          invitation_id: string
          issued_by: string
          redeemed_at: string | null
          redeemed_by: string | null
          revocation_reason: string | null
          revoked_at: string | null
          revoked_by: string | null
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          garage_id: string
          intended_email: string
          intended_role: string
          invitation_id?: string
          issued_by: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          garage_id?: string
          intended_email?: string
          intended_role?: string
          invitation_id?: string
          issued_by?: string
          redeemed_at?: string | null
          redeemed_by?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          revoked_by?: string | null
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'staff_invitations_garage_id_fkey'
            columns: ['garage_id']
            isOneToOne: false
            referencedRelation: 'garages'
            referencedColumns: ['garage_id']
          },
        ]
      }
      system_status: {
        Row: {
          created_at: string
          id: number
          message: string
          service: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          service: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          service?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_staff_invitation: { Args: { p_token: string }; Returns: Json }
      create_garage: {
        Args: {
          p_creation_key: string
          p_name: string
          p_phone_e164: string
          p_timezone?: string
        }
        Returns: string
      }
      fail_customer_claim_delivery: {
        Args: { p_claim_id: string }
        Returns: undefined
      }
      fail_staff_invitation_delivery: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      grant_finance_admin: {
        Args: { p_garage_id: string; p_membership_id: string; p_reason: string }
        Returns: string
      }
      issue_customer_claim: {
        Args: {
          p_creation_key: string
          p_email: string
          p_expiry_hours?: number
          p_full_name: string
          p_garage_id: string
          p_phone_e164: string
        }
        Returns: Json
      }
      issue_staff_invitation: {
        Args: {
          p_email: string
          p_expiry_hours?: number
          p_garage_id: string
          p_role: string
        }
        Returns: Json
      }
      list_finance_admin_candidates: {
        Args: { p_garage_id: string }
        Returns: {
          full_name: string
          grant_id: string
          has_finance_admin: boolean
          membership_id: string
          role: string
        }[]
      }
      list_my_garages: {
        Args: never
        Returns: {
          garage_id: string
          name: string
          role: string
        }[]
      }
      redeem_customer_claim: { Args: { p_token: string }; Returns: Json }
      revoke_finance_admin: {
        Args: { p_garage_id: string; p_grant_id: string; p_reason: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
