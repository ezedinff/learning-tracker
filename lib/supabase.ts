import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          date: string
          focus_area: string
          title: string
          details: string
          time_estimate: string
          status: 'todo' | 'in-progress' | 'completed' | 'skipped'
          notes: string | null
          links: string[] | null
          code: string | null
          code_language: string | null
          is_dsa: boolean
          completed_at: string | null
          audio_path: string | null
          audio_duration: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          focus_area: string
          title: string
          details: string
          time_estimate: string
          status?: 'todo' | 'in-progress' | 'completed' | 'skipped'
          notes?: string | null
          links?: string[] | null
          code?: string | null
          code_language?: string | null
          is_dsa?: boolean
          completed_at?: string | null
          audio_path?: string | null
          audio_duration?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          focus_area?: string
          title?: string
          details?: string
          time_estimate?: string
          status?: 'todo' | 'in-progress' | 'completed' | 'skipped'
          notes?: string | null
          links?: string[] | null
          code?: string | null
          code_language?: string | null
          is_dsa?: boolean
          completed_at?: string | null
          audio_path?: string | null
          audio_duration?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
    }
  }
}