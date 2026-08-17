// Bootstrap contract derived from the initial migration. Do not edit after
// Docker-backed Supabase is available; regenerate it with `npm run db:types`.
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
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
