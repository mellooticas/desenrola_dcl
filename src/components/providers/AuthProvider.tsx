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
  // Cliente Supabase centralizado
  supabase: typeof supabase
  // Login simplificado para desenvolvimento (usa /api/auth/login)
  login: (email: string, senha: string) => Promise<boolean>
  // Logout unificado (limpa devProfile e encerra sessão Supabase se existir)
  logout: () => Promise<void>
  // Mantido para compatibilidade
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper para definir cookie de role (para middleware acessar) com debounce
const setRoleCookie = (role: string) => {
  if (typeof document !== 'undefined') {
    // Garantir que o cookie seja definido de forma estável
    const cookieValue = `user-role=${role}; path=/; max-age=86400; samesite=strict`
    document.cookie = cookieValue
    
    // Double-check para garantir estabilidade
    setTimeout(() => {
      document.cookie = cookieValue
    }, 100)
  }
}

// Helper para remover cookie de role
const removeRoleCookie = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  }
}

// Helper para obter página padrão baseado no role
const getDefaultPageForRole = (role: string): string => {
  switch (role) {
    case 'gestor':
      return '/dashboard'
    case 'financeiro':
      return '/dashboard'
    case 'dcl':
      return '/kanban'
    case 'loja':
      return '/mission-control' // Página padrão para lojas agora é mission-control
    default:
      return '/kanban'
  }
}

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
      
      // Atualizar cookie de role quando perfil for carregado
      if (profile?.role) {
        setRoleCookie(profile.role)
      }
    }
  }

  const handleSignOut = async () => {
    try {
      // Chamar API de logout para limpar cookie
      await fetch('/api/auth/logout', { method: 'POST' })

      // Limpar sessão Supabase (se existir)
      await supabase.auth.signOut()

      // Limpar cookie de role
      removeRoleCookie()

      // Limpar estados
      setUser(null)
      setUserProfile(null)
      setDevProfile(null)

      // Limpar localStorage
      try { localStorage.removeItem('desenrola_user') } catch {}
      
      // Redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Login simplificado de desenvolvimento (compatível com LoginForm atual)
  const login = async (email: string, senha: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Usar API original que agora funciona com Service Role correto
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
        
        // Definir cookie de role para middleware
        if (data.user.role) {
          setRoleCookie(data.user.role)
        }
        
        const profile = {
          id: data.user.id,
          email: data.user.email,
          nome: data.user.nome,
          role: data.user.role,
          loja_id: data.user.loja_id ?? undefined,
          loja: undefined,
        }
        
        setDevProfile(profile)
        
        // Redirecionar para página padrão do role após login bem-sucedido
        if (typeof window !== 'undefined') {
          const defaultPage = getDefaultPageForRole(data.user.role)
          // Usar um pequeno delay para garantir que o estado seja atualizado
          setTimeout(() => {
            window.location.href = defaultPage
          }, 100)
        }
        
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
    // Estratégia: PRIORIZAR sistema de desenvolvimento para evitar conflitos
    const initAuth = async () => {
      try {
        setLoading(true)
        
        // 1. PRIMEIRO: Verificar se existe perfil de desenvolvimento salvo
        let hasDevProfile = false
        try {
          const saved = localStorage.getItem('desenrola_user')
          if (saved) {
            const u = JSON.parse(saved)
            const profile = {
              id: u.id,
              email: u.email,
              nome: u.nome,
              role: u.role,
              loja_id: u.loja_id ?? undefined,
            }
            
            setDevProfile(profile)
            hasDevProfile = true
            
            // Definir cookie de role para perfil de desenvolvimento
            if (u.role) {
              setRoleCookie(u.role)
            }
            
            console.log('🔧 Auth: Usando sistema de desenvolvimento')
          }
        } catch (error) {
          console.error('Erro ao recuperar perfil dev:', error)
        }

        // 2. SEGUNDO: Só tentar Supabase se NÃO houver perfil dev
        if (!hasDevProfile) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
              setUser(session.user)
              
              const profile = await getUserProfile(session.user.id)
              setUserProfile(profile)
              
              // Definir cookie de role para sessão Supabase
              if (profile?.role) {
                setRoleCookie(profile.role)
              }
              
              console.log('🔐 Auth: Usando sessão Supabase')
            }
          } catch (error) {
            console.error('Erro ao verificar sessão Supabase:', error)
          }
        }
        
      } catch (error) {
        console.error('Erro na inicialização do auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    
    // 3. LISTENER: Só escutar mudanças se não houver perfil dev
    let subscription: any = null
    
    const checkDevProfile = () => {
      try {
        const saved = localStorage.getItem('desenrola_user')
        return !!saved
      } catch {
        return false
      }
    }
    
    if (!checkDevProfile()) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔐 Supabase auth change:', event, !!session)
          
          setUser(session?.user ?? null)
          
          if (session?.user) {
            const profile = await getUserProfile(session.user.id)
            setUserProfile(profile)
            
            if (profile?.role) {
              setRoleCookie(profile.role)
            }
          } else {
            setUserProfile(null)
            
            if (event === 'SIGNED_OUT') {
              removeRoleCookie()
            }
          }
          
          setLoading(false)
        }
      )
      
      subscription = authSubscription
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, []) // Executar apenas uma vez

  // ESTRATÉGIA SIMPLES: Perfil dev tem prioridade absoluta para evitar conflitos
  const effectiveProfile = devProfile ?? userProfile
  const effectiveUser: User | null = devProfile 
    ? { id: devProfile.id, email: devProfile.email }
    : user

  // Atualizar cookie apenas quando realmente mudar (evitar loops)
  useEffect(() => {
    const currentRole = effectiveProfile?.role
    if (currentRole) {
      console.log('🍪 AuthProvider: Definindo cookie role =', currentRole)
      setRoleCookie(currentRole)
    } else {
      console.log('🍪 AuthProvider: Removendo cookie role')
      removeRoleCookie()
    }
  }, [effectiveProfile?.role]) // Só quando role realmente mudar

  const value: AuthContextType = {
    user: effectiveUser,
    userProfile: effectiveProfile,
    loading,
    supabase,
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

// Helper exports para uso em outros componentes
export { getDefaultPageForRole }