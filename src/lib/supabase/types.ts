export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          nombre: string
          logo_url: string | null
          portada_url: string | null
          colores: Json
          plan: 'free' | 'basico' | 'pro'
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          nombre: string
          logo_url?: string | null
          portada_url?: string | null
          colores?: Json
          plan?: 'free' | 'basico' | 'pro'
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          nombre?: string
          logo_url?: string | null
          portada_url?: string | null
          colores?: Json
          plan?: 'free' | 'basico' | 'pro'
          activo?: boolean
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          email: string
          password_hash: string
          role: 'owner' | 'staff'
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          password_hash: string
          role?: 'owner' | 'staff'
          created_at?: string
        }
        Update: {
          tenant_id?: string
          email?: string
          password_hash?: string
          role?: 'owner' | 'staff'
        }
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
          nombre: string
          orden: number
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nombre: string
          orden?: number
          activo?: boolean
          created_at?: string
        }
        Update: {
          nombre?: string
          orden?: number
          activo?: boolean
        }
      }
      items: {
        Row: {
          id: string
          tenant_id: string
          category_id: string
          nombre: string
          descripcion: string | null
          precio: number
          imagen_url: string | null
          activo: boolean
          orden: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          category_id: string
          nombre: string
          descripcion?: string | null
          precio: number
          imagen_url?: string | null
          activo?: boolean
          orden?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          nombre?: string
          descripcion?: string | null
          precio?: number
          imagen_url?: string | null
          activo?: boolean
          orden?: number
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          mp_subscription_id: string
          mp_payer_id: string | null
          status: 'authorized' | 'paused' | 'cancelled' | 'pending'
          plan: 'basico' | 'pro'
          next_billing_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          mp_subscription_id: string
          mp_payer_id?: string | null
          status: 'authorized' | 'paused' | 'cancelled' | 'pending'
          plan: 'basico' | 'pro'
          next_billing_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          mp_payer_id?: string | null
          status?: 'authorized' | 'paused' | 'cancelled' | 'pending'
          plan?: 'basico' | 'pro'
          next_billing_date?: string | null
          updated_at?: string
        }
      }
      qr_scans: {
        Row: {
          id: string
          tenant_id: string
          scanned_at: string
          user_agent: string | null
          ip_hash: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          scanned_at?: string
          user_agent?: string | null
          ip_hash?: string | null
        }
        Update: {
          user_agent?: string | null
          ip_hash?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      plan_type: 'free' | 'basico' | 'pro'
      user_role: 'owner' | 'staff'
      subscription_status: 'authorized' | 'paused' | 'cancelled' | 'pending'
    }
  }
}

// Tipos de conveniencia extraídos del schema
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']

export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']

export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type QrScan = Database['public']['Tables']['qr_scans']['Row']
