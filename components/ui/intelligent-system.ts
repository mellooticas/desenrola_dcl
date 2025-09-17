/* ===================================================================
   🎛️ SISTEMA DE DESIGN INTELIGENTE - EXPORTS
   Centralizador de todos os componentes do sistema inteligente
   ================================================================== */

// === COMPONENTES INTELIGENTES ===
export { SmartButton } from './SmartButton'
export { QuickForm } from './QuickForm'
export { 
  AdaptiveCard, 
  DashboardCard, 
  KanbanCard, 
  NotificationCard, 
  FormSectionCard 
} from './AdaptiveCard'

// === CONTEXTOS ===
export { IntelligentThemeProvider, useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'

// === TIPOS ===
export type { 
  IntelligentTheme
} from '@/lib/contexts/IntelligentThemeContext'

export type {
  AdaptiveCardVariant,
  AdaptiveCardSize,
  AdaptiveCardContext
} from './AdaptiveCard'

// === CSS CLASSES UTILITÁRIAS ===
export const intelligentClasses = {
  // Transições suaves
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out', 
    slow: 'transition-all duration-300 ease-out',
    spring: 'transition-all duration-500 ease-spring'
  },
  
  // Elevações/sombras
  elevation: {
    none: 'shadow-none',
    subtle: 'shadow-sm',
    medium: 'shadow-md',
    high: 'shadow-lg',
    extreme: 'shadow-2xl'
  },
  
  // Bordas inteligentes
  borders: {
    subtle: 'border border-[var(--border-subtle)]',
    muted: 'border border-[var(--border-muted)]',
    strong: 'border-2 border-[var(--border-strong)]',
    primary: 'border-2 border-[var(--color-primary-500)]'
  },
  
  // Fundos contextuais
  backgrounds: {
    canvas: 'bg-[var(--bg-canvas)]',
    subtle: 'bg-[var(--bg-subtle)]',
    muted: 'bg-[var(--bg-muted)]',
    primary: 'bg-[var(--color-primary-500)]',
    glass: 'bg-white/10 backdrop-blur-md'
  },
  
  // Textos semânticos
  text: {
    primary: 'text-[var(--text-primary)]',
    secondary: 'text-[var(--text-secondary)]',
    tertiary: 'text-[var(--text-tertiary)]',
    success: 'text-[var(--color-success-600)]',
    warning: 'text-[var(--color-warning-600)]',
    error: 'text-[var(--color-error-600)]'
  }
}

// === UTILIDADES ===
export const getContextualStyling = (context: string) => {
  const stylings = {
    dashboard: {
      card: 'bg-[var(--bg-canvas)] rounded-xl shadow-lg',
      spacing: 'p-6 space-y-4',
      text: 'text-[var(--text-primary)]'
    },
    kanban: {
      card: 'bg-[var(--bg-canvas)] rounded-lg border border-[var(--border-muted)]',
      spacing: 'p-4 space-y-3',
      text: 'text-[var(--text-primary)]'
    },
    form: {
      card: 'bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-subtle)]',
      spacing: 'p-5 space-y-4',
      text: 'text-[var(--text-primary)]'
    }
  }
  
  return stylings[context as keyof typeof stylings] || stylings.dashboard
}