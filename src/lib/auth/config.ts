import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/tenant.schema'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const supabase = createAdminClient()

        const { data: user, error } = await supabase
          .from('users')
          .select('id, email, password_hash, tenant_id, role')
          .eq('email', email)
          .single()

        // Mismo mensaje para email inexistente y contraseña incorrecta
        if (error || !user) {
          // Ejecutar bcrypt de todas formas para evitar timing attacks
          await bcrypt.compare(password, '$2b$12$invalidhashfortimingattackprevention')
          return null
        }

        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          tenantId: user.tenant_id,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as { tenantId?: string }).tenantId
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub ?? ''
        session.user.tenantId = token.tenantId as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 días
  },
  jwt: {
    maxAge: 60 * 60, // 1 hora para el JWT de acceso
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})

// Extensión de tipos de NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      tenantId: string
      role: string
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    tenantId?: string
    role?: string
  }
}
