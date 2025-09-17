import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Usuario } from '@/lib/types/database'

interface AuthState {
  // Estado da autenticação
  user: User | null
  userProfile: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  
  // Ações de autenticação
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  
  // Ações de perfil
  loadUserProfile: () => Promise<void>
  updateProfile: (updates: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>
  
  // Verificações de permissão
  hasPermission: (permission: string) => boolean
  canAccessLoja: (lojaId: string) => boolean
  canChangeStatus: (fromStatus: string, toStatus: string) => boolean
  
  // Estado interno
  setUser: (user: User | null) => void
  setUserProfile: (profile: Usuario | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
  (set, get) => ({
      // Estado inicial
      user: null,
      userProfile: null,
      isLoading: false,
      isAuthenticated: false,

      // Ações de autenticação
      signIn: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) {
            set({ isLoading: false })
            return { 
              success: false, 
              error: error.message === 'Invalid login credentials' 
                ? 'Email ou senha incorretos' 
                : error.message 
            }
          }

          if (data.user) {
            set({ 
              user: data.user, 
              isAuthenticated: true,
              isLoading: false 
            })
            
            // Carregar perfil do usuário
            await get().loadUserProfile()
            
            return { success: true }
          }

          set({ isLoading: false })
          return { success: false, error: 'Erro inesperado no login' }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro inesperado' 
          }
        }
      },

      signOut: async () => {
        set({ isLoading: true })
        
        try {
          await supabase.auth.signOut()
          get().reset()
        } catch (error) {
          console.error('Erro ao fazer logout:', error)
          get().reset() // Reset mesmo com erro
        }
      },

      // Carregar perfil completo do usuário
      loadUserProfile: async () => {
        const { user } = get()
        if (!user) return

        try {
          const { data, error } = await supabase
            .from('usuarios')
            .select(`
              *,
              loja:lojas(
                id,
                nome,
                codigo,
                endereco,
                telefone,
                gerente,
                ativo
              )
            `)
            .eq('id', user.id)
            .eq('ativo', true)
            .single()

          if (error) {
            console.error('Erro ao carregar perfil:', error)
            // Se usuário não existe na tabela usuarios, fazer logout
            if (error.code === 'PGRST116') {
              await get().signOut()
            }
            return
          }

          set({ userProfile: data })
        } catch (error) {
          console.error('Erro ao carregar perfil:', error)
        }
      },

      // Atualizar perfil do usuário
      updateProfile: async (updates: Partial<Usuario>) => {
        const { user } = get()
        if (!user) return { success: false, error: 'Usuário não autenticado' }

        try {
          const { data, error } = await supabase
            .from('usuarios')
            .update({
              ...updates,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single()

          if (error) {
            return { success: false, error: error.message }
          }

          set({ userProfile: data })
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro inesperado' 
          }
        }
      },

      // Verificações de permissão
      hasPermission: (permission: string) => {
        const { userProfile } = get()
        if (!userProfile) return false

        // Admin tem todas as permissões
        if (userProfile.role === 'admin') return true

        // Verificar array de permissões
        return userProfile.permissoes?.includes(permission) || false
      },

      canAccessLoja: (lojaId: string) => {
        const { userProfile } = get()
        if (!userProfile) return false

        // Admin e gestores podem acessar todas as lojas
        if (['admin', 'gestor'].includes(userProfile.role)) return true

        // Usuários específicos de loja só podem acessar sua loja
        return userProfile.loja_id === lojaId || userProfile.loja_id === null
      },

      canChangeStatus: (fromStatus: string, toStatus: string) => {
        const { userProfile } = get()
        if (!userProfile) return false

        // Admin pode tudo
        if (userProfile.role === 'admin') return true

        // Regras específicas por role
        switch (userProfile.role) {
          case 'gestor':
            return true // Gestores podem mudar qualquer status

          case 'dcl':
            // DCL pode registrar pedidos e marcar como pago
            const dclPermitted = ['REGISTRADO', 'AG_PAGAMENTO', 'PAGO', 'CHEGOU', 'ENTREGUE']
            return dclPermitted.includes(toStatus)

          case 'financeiro':
            // Financeiro só pode marcar pagamentos
            return fromStatus === 'AG_PAGAMENTO' && toStatus === 'PAGO'

          case 'operador':
            // Operadores têm permissões limitadas baseadas na loja
            const operadorPermitted = ['REGISTRADO', 'CHEGOU', 'ENTREGUE']
            return operadorPermitted.includes(toStatus)

          default:
            return false
        }
      },

      // Setters internos
      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          userProfile: user ? get().userProfile : null
        })
      },

      setUserProfile: (userProfile: Usuario | null) => {
        set({ userProfile })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      reset: () => {
        set({
          user: null,
          userProfile: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userProfile: state.userProfile
          ? {
              id: state.userProfile.id,
              email: state.userProfile.email,
              nome: state.userProfile.nome,
              role: state.userProfile.role,
              loja_id: state.userProfile.loja_id,
              permissoes: state.userProfile.permissoes,
            }
          : null,
      })
    }
  )
)

// Hook personalizado para facilitar o uso
export const useAuth = () => {
  const store = useAuthStore()
  
  return {
    // Estado
    user: store.user,
    userProfile: store.userProfile,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    
    // Informações derivadas
    userName: store.userProfile?.nome || store.user?.email || 'Usuário',
    userRole: store.userProfile?.role || 'guest',
    userLoja: store.userProfile?.loja_id,
    
    // Ações
    signIn: store.signIn,
    signOut: store.signOut,
    loadUserProfile: store.loadUserProfile,
    updateProfile: store.updateProfile,
    
    // Verificações
    hasPermission: store.hasPermission,
    canAccessLoja: store.canAccessLoja,
    canChangeStatus: store.canChangeStatus,
    
    // Controle interno
    setUser: store.setUser,
    setLoading: store.setLoading
  }
}

// Listener para mudanças de autenticação do Supabase
supabase.auth.onAuthStateChange(async (event, session) => {
  const { setUser, loadUserProfile, reset } = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session?.user) {
    setUser(session.user)
    await loadUserProfile()
  } else if (event === 'SIGNED_OUT') {
    reset()
  } else if (event === 'TOKEN_REFRESHED' && session?.user) {
    setUser(session.user)
  }
})