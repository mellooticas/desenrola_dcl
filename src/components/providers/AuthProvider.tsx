'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
 
// Tipos simplificados para evitar dependências
export interface User {
  id: string
  email?: string
}

export interface Usuario {
  id: string
  email: string
  nome?: string
  role?: string 
  loja_id?: string
  loja?: {
    nome: string
    codigo: string
  }
}

interface AuthContextType {
  // Sessão Supabase (quando autenticado de verdade)
  user: User | null
  // Perfil vindo da tabela `usuarios` OU perfil de desenvolvimento (mock)
  userProfile: Usuario | null
  // Estado de carregamento (session inicial, login dev, refresh)
  loading: boolean
  // Login simplificado para desenvolvimento (usa /api/auth/login)
  login: (email: string, senha: string) => Promise<boolean>
  // Logout unificado (limpa devProfile e encerra sessão Supabase se existir)
  logout: () => Promise<void>
  // Mantido para compatibilidade
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to get user profile from our usuarios table
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        loja:lojas(nome, codigo)
      `)
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  // Perfil de desenvolvimento (quando não há sessão Supabase)
  const [devProfile, setDevProfile] = useState<Usuario | null>(null)

  const refreshProfile = async () => {
    if (user?.id) {
      const profile = await getUserProfile(user.id)
      setUserProfile(profile)
    }
  }

  const handleSignOut = async () => {
    try {
      // Chamar API de logout para limpar cookie
      await fetch('/api/auth/logout', { method: 'POST' })
      
      // Limpar sessão Supabase (se existir)
      await supabase.auth.signOut()
      
      // Limpar estados
      setUser(null)
      setUserProfile(null)
      setDevProfile(null)
      
      // Limpar localStorage
      try { localStorage.removeItem('desenrola_user') } catch {}
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Login simplificado de desenvolvimento (compatível com LoginForm atual)
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}: ${text}`)
      }
      const data = await res.json()
      if (data?.success && data?.user) {
        // Persistência para compatibilidade (alguns pontos ainda leem esta chave)
        try { localStorage.setItem('desenrola_user', JSON.stringify(data.user)) } catch {}
        setDevProfile({
          id: data.user.id,
          email: data.user.email,
          nome: data.user.nome,
          role: data.user.role,
          loja_id: data.user.loja_id ?? undefined,
          loja: undefined,
        })
        return true
      }
      return false
    } catch (err) {
      console.error('Erro no login de desenvolvimento:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
        
        if (session?.user) {
          const profile = await getUserProfile(session.user.id)
          setUserProfile(profile)
        }
        // Caso não tenha sessão Supabase, tentar recuperar "devProfile" legado
        if (!session?.user) {
          try {
            const saved = localStorage.getItem('desenrola_user')
            if (saved) {
              const u = JSON.parse(saved)
              setDevProfile({
                id: u.id,
                email: u.email,
                nome: u.nome,
                role: u.role,
                loja_id: u.loja_id ?? undefined,
              })
            }
          } catch {}
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const profile = await getUserProfile(session.user.id)
          setUserProfile(profile)
          // Sessão real invalida qualquer perfil de dev
          setDevProfile(null)
        } else {
          setUserProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Preferir perfil real; cair para perfil de desenvolvimento quando não houver sessão
  const effectiveProfile = userProfile ?? devProfile
  const effectiveUser: User | null = user ?? (effectiveProfile ? { id: effectiveProfile.id, email: effectiveProfile.email } : null)

  const value: AuthContextType = {
    user: effectiveUser,
    userProfile: effectiveProfile,
    loading,
    login,
    logout: handleSignOut,
    signOut: handleSignOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}