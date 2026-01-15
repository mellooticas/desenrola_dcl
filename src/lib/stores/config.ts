import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase/client'
import type { StatusPedido, PrioridadeLevel } from '@/lib/types/database'

// Tipos para configurações do sistema
export interface AlertasConfig {
  pagamento_dias: number
  sla_horas: number
  urgente_horas: number
  email_enabled: boolean
  whatsapp_enabled: boolean
}

export interface CoresConfig {
  status: Record<StatusPedido, string>
  prioridade: Record<PrioridadeLevel, string>
  sla: {
    verde: string    // No prazo
    amarelo: string  // Atenção
    vermelho: string // Atrasado
  }
}

export interface SLAConfig {
  monofocal: number
  multifocal: number
  transitions: number
  tratamento: number
  urgente_reducao: number // dias a reduzir para urgente
}

export interface HorarioConfig {
  inicio: string
  fim: string
  trabalha_sabado: boolean
  almoco_inicio?: string
  almoco_fim?: string
}

export interface ConfiguracaoSistema {
  alertas: AlertasConfig
  cores: CoresConfig
  sla_padrao: SLAConfig
  horario_funcionamento: HorarioConfig
  feriados_nacionais: string[]
  versao: string
  ultima_atualizacao: string
}

interface ConfigState {
  // Estado da configuração
  config: ConfiguracaoSistema | null
  isLoading: boolean
  lastSync: Date | null
  
  // Ações
  loadConfig: () => Promise<void>
  updateConfig: (key: keyof ConfiguracaoSistema, value: any) => Promise<{ success: boolean; error?: string }>
  resetToDefaults: () => Promise<void>
  
  // Getters de configuração específica
  getAlertConfig: () => AlertasConfig
  getColorConfig: () => CoresConfig
  getSLAConfig: () => SLAConfig
  getHorarioConfig: () => HorarioConfig
  
  // Utilitários
  isBusinessHour: (date?: Date) => boolean
  isWorkday: (date?: Date) => boolean
  getStatusColor: (status: StatusPedido) => string
  getSLAColor: (diasRestantes: number) => string
  
  // Estado interno
  setConfig: (config: ConfiguracaoSistema) => void
  setLoading: (loading: boolean) => void
}

// Configuração padrão do sistema
const DEFAULT_CONFIG: ConfiguracaoSistema = {
  alertas: {
    pagamento_dias: 3,
    sla_horas: 24,
    urgente_horas: 4,
    email_enabled: true,
    whatsapp_enabled: false
  },
  cores: {
    status: {
      'PENDENTE': '#94A3B8',        // Cinza (alias para REGISTRADO)
      'REGISTRADO': '#94A3B8',      // Cinza
      'AG_PAGAMENTO': '#F59E0B',    // Amarelo
      'PAGO': '#10B981',            // Verde claro
      'PRODUCAO': '#3B82F6',        // Azul
      'PRONTO': '#8B5CF6',          // Roxo
      'ENVIADO': '#EF4444',         // Vermelho
      'CHEGOU': '#06B6D4',          // Cyan
      'ENTREGUE': '#10B981',        // Verde
      'CANCELADO': '#6B7280'        // Cinza escuro
    },
    prioridade: {
      'BAIXA': '#64748B',     // Cinza
      'NORMAL': '#3B82F6',    // Azul
      'ALTA': '#F59E0B',      // Amarelo
      'URGENTE': '#EF4444'    // Vermelho
    },
    sla: {
      verde: '#10B981',    // Verde - no prazo
      amarelo: '#F59E0B',  // Amarelo - atenção
      vermelho: '#EF4444'  // Vermelho - atrasado
    }
  },
  sla_padrao: {
    monofocal: 3,
    multifocal: 5,
    transitions: 7,
    tratamento: 2,
    urgente_reducao: 2
  },
  horario_funcionamento: {
    inicio: '08:00',
    fim: '18:00',
    trabalha_sabado: false,
    almoco_inicio: '12:00',
    almoco_fim: '13:00'
  },
  feriados_nacionais: [
    '2024-12-25', // Natal
    '2025-01-01', // Ano Novo
    '2025-04-21', // Tiradentes
    '2025-09-07', // Independência
    '2025-10-12', // Nossa Senhora Aparecida
    '2025-11-02', // Finados
    '2025-11-15'  // Proclamação da República
  ],
  versao: '1.0.0',
  ultima_atualizacao: new Date().toISOString()
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      config: null,
      isLoading: false,
      lastSync: null,

      // Carregar configuração do Supabase
      loadConfig: async () => {
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase
            .from('sistema_config')
            .select('chave, valor')

          if (error) {
            console.error('Erro ao carregar configuração:', error)
            // Usar configuração padrão se houver erro
            set({ 
              config: DEFAULT_CONFIG, 
              isLoading: false,
              lastSync: new Date()
            })
            return
          }

          // Transformar array de chave-valor em objeto
          const configData: Partial<ConfiguracaoSistema> = {}
          
          data.forEach(item => {
            if (item.chave && item.valor) {
              configData[item.chave as keyof ConfiguracaoSistema] = item.valor
            }
          })

          // Mesclar com configuração padrão para garantir que todos os campos existam
          const finalConfig: ConfiguracaoSistema = {
            ...DEFAULT_CONFIG,
            ...configData,
            ultima_atualizacao: new Date().toISOString()
          }

          set({ 
            config: finalConfig, 
            isLoading: false,
            lastSync: new Date()
          })
        } catch (error) {
          console.error('Erro ao carregar configuração:', error)
          set({ 
            config: DEFAULT_CONFIG, 
            isLoading: false,
            lastSync: new Date()
          })
        }
      },

      // Atualizar configuração específica
      updateConfig: async (key: keyof ConfiguracaoSistema, value: any) => {
        try {
          const { error } = await supabase
            .from('sistema_config')
            .upsert({
              chave: key,
              valor: value,
              descricao: `Configuração de ${key}`,
              updated_at: new Date().toISOString()
            })

          if (error) {
            return { success: false, error: error.message }
          }

          // Atualizar estado local
          const currentConfig = get().config || DEFAULT_CONFIG
          const newConfig = {
            ...currentConfig,
            [key]: value,
            ultima_atualizacao: new Date().toISOString()
          }

          set({ config: newConfig })
          return { success: true }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Erro inesperado' 
          }
        }
      },

      // Resetar para configurações padrão
      resetToDefaults: async () => {
        set({ isLoading: true })
        
        try {
          // Deletar todas as configurações existentes
          await supabase
            .from('sistema_config')
            .delete()
            .neq('chave', '')

          // Inserir configurações padrão
          const configEntries = Object.entries(DEFAULT_CONFIG).map(([chave, valor]) => ({
            chave,
            valor,
            descricao: `Configuração padrão de ${chave}`,
            updated_at: new Date().toISOString()
          }))

          const { error } = await supabase
            .from('sistema_config')
            .insert(configEntries)

          if (error) {
            throw error
          }

          set({ 
            config: DEFAULT_CONFIG, 
            isLoading: false,
            lastSync: new Date()
          })
        } catch (error) {
          console.error('Erro ao resetar configurações:', error)
          set({ isLoading: false })
        }
      },

      // Getters específicos
      getAlertConfig: () => {
        return get().config?.alertas || DEFAULT_CONFIG.alertas
      },

      getColorConfig: () => {
        return get().config?.cores || DEFAULT_CONFIG.cores
      },

      getSLAConfig: () => {
        return get().config?.sla_padrao || DEFAULT_CONFIG.sla_padrao
      },

      getHorarioConfig: () => {
        return get().config?.horario_funcionamento || DEFAULT_CONFIG.horario_funcionamento
      },

      // Utilitários
      isBusinessHour: (date = new Date()) => {
        const horario = get().getHorarioConfig()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const currentTime = hour * 60 + minute

        const [inicioHour, inicioMin] = horario.inicio.split(':').map(Number)
        const [fimHour, fimMin] = horario.fim.split(':').map(Number)
        
        const inicioTime = inicioHour * 60 + inicioMin
        const fimTime = fimHour * 60 + fimMin

        // Verificar se está no horário de almoço
        if (horario.almoco_inicio && horario.almoco_fim) {
          const [almocoInicioHour, almocoInicioMin] = horario.almoco_inicio.split(':').map(Number)
          const [almocoFimHour, almocoFimMin] = horario.almoco_fim.split(':').map(Number)
          
          const almocoInicioTime = almocoInicioHour * 60 + almocoInicioMin
          const almocoFimTime = almocoFimHour * 60 + almocoFimMin

          if (currentTime >= almocoInicioTime && currentTime <= almocoFimTime) {
            return false
          }
        }

        return currentTime >= inicioTime && currentTime <= fimTime
      },

      isWorkday: (date = new Date()) => {
        const horario = get().getHorarioConfig()
        const dayOfWeek = date.getDay() // 0 = domingo, 6 = sábado
        
        // Domingo sempre é não útil
        if (dayOfWeek === 0) return false
        
        // Sábado depende da configuração
        if (dayOfWeek === 6) return horario.trabalha_sabado
        
        // Verificar feriados
        const dateString = date.toISOString().split('T')[0]
        const feriados = get().config?.feriados_nacionais || []
        
        return !feriados.includes(dateString)
      },

      getStatusColor: (status: StatusPedido) => {
        const cores = get().getColorConfig()
        return cores.status[status] || '#6B7280'
      },

      getSLAColor: (diasRestantes: number) => {
        const cores = get().getColorConfig()
        
        if (diasRestantes < 0) return cores.sla.vermelho      // Atrasado
        if (diasRestantes <= 1) return cores.sla.amarelo     // Atenção
        return cores.sla.verde                               // No prazo
      },

      // Setters internos
      setConfig: (config: ConfiguracaoSistema) => {
        set({ config, lastSync: new Date() })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      }
    }),
    {
      name: 'config-store',
      partialize: (state) => ({
        config: state.config,
        lastSync: state.lastSync
      }),
      // Revalidar configurações a cada 1 hora
      version: 1
    }
  )
)

// Hook personalizado para facilitar o uso
export const useConfig = () => {
  const store = useConfigStore()
  
  return {
    // Estado
    config: store.config,
    isLoading: store.isLoading,
    lastSync: store.lastSync,
    
    // Ações
    loadConfig: store.loadConfig,
    updateConfig: store.updateConfig,
    resetToDefaults: store.resetToDefaults,
    
    // Getters específicos
    alertas: store.getAlertConfig(),
    cores: store.getColorConfig(),
    sla: store.getSLAConfig(),
    horario: store.getHorarioConfig(),
    
    // Utilitários
    isBusinessHour: store.isBusinessHour,
    isWorkday: store.isWorkday,
    getStatusColor: store.getStatusColor,
    getSLAColor: store.getSLAColor,
    
    // Dados derivados úteis
    businessHours: `${store.getHorarioConfig().inicio} às ${store.getHorarioConfig().fim}`,
    workDays: store.getHorarioConfig().trabalha_sabado ? 'Segunda a Sábado' : 'Segunda a Sexta',
    alertDays: store.getAlertConfig().pagamento_dias,
    slaWarningHours: store.getAlertConfig().sla_horas
  }
}

// Carregar configurações na inicialização
if (typeof window !== 'undefined') {
  useConfigStore.getState().loadConfig()
}