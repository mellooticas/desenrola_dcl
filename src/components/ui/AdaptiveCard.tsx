/* ===================================================================
   🎛️ ADAPTIVE CARD SYSTEM v2.0
   Cards que se adaptam automaticamente ao conteúdo e contexto
   ================================================================== */

'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'
import { SmartButton } from './SmartButton'

// === TIPOS INTELIGENTES ===
export type AdaptiveCardVariant = 
  | 'default'        // Card padrão
  | 'elevated'       // Card com elevação
  | 'outlined'       // Card com borda
  | 'filled'         // Card preenchido
  | 'glass'          // Efeito glassmorphism
  | 'neomorphic'     // Efeito neomórfico
  | 'smart'          // Detecta automaticamente

export type AdaptiveCardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'

export type AdaptiveCardContext = 
  | 'dashboard'      // Cards de dashboard/métricas
  | 'kanban'         // Cards do Kanban
  | 'list-item'      // Items de lista
  | 'detail-view'    // Visualização de detalhes
  | 'form-section'   // Seção de formulário
  | 'notification'   // Notificações
  | 'auto'           // Detecta automaticamente

interface AdaptiveCardProps {
  children: React.ReactNode
  
  // === CONFIGURAÇÕES BÁSICAS ===
  variant?: AdaptiveCardVariant
  size?: AdaptiveCardSize
  context?: AdaptiveCardContext
  
  // === INTELIGÊNCIA ===
  autoResize?: boolean         // Ajusta tamanho automaticamente
  smartSpacing?: boolean       // Espaçamento inteligente
  contextualActions?: boolean  // Ações baseadas no contexto
  adaptiveLayout?: boolean     // Layout que se adapta ao conteúdo
  
  // === INTERAÇÕES ===
  hoverable?: boolean          // Efeito hover
  clickable?: boolean          // Card clicável
  draggable?: boolean          // Drag & drop
  selectable?: boolean         // Selecionável
  
  // === ESTADOS ===
  loading?: boolean            // Estado de carregamento
  error?: boolean              // Estado de erro
  success?: boolean            // Estado de sucesso
  selected?: boolean           // Selecionado
  disabled?: boolean           // Desabilitado
  
  // === CALLBACKS ===
  onClick?: () => void
  onDoubleClick?: () => void
  onSelect?: (selected: boolean) => void
  onDragStart?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  
  // === AÇÕES RÁPIDAS ===
  quickActions?: Array<{
    icon: React.ReactNode
    label: string
    action: () => void
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  }>
  
  // === METADADOS ===
  title?: string
  subtitle?: string
  badge?: {
    text: string
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  }
  timestamp?: Date
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  
  // === STYLING ===
  className?: string
  style?: React.CSSProperties
}

// === ADAPTIVE CARD COMPONENT ===
export const AdaptiveCard: React.FC<AdaptiveCardProps> = ({
  children,
  variant = 'smart',
  size = 'auto',
  context = 'auto',
  autoResize = true,
  smartSpacing = true,
  contextualActions = true,
  adaptiveLayout = true,
  hoverable = true,
  clickable = false,
  draggable = false,
  selectable = false,
  loading = false,
  error = false,
  success = false,
  selected = false,
  disabled = false,
  onClick,
  onDoubleClick,
  onSelect,
  onDragStart,
  onDrop,
  quickActions = [],
  title,
  subtitle,
  badge,
  timestamp,
  priority,
  className = '',
  style = {},
  ...props
}) => {
  
  const { currentTheme } = useIntelligentTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [detectedVariant, setDetectedVariant] = useState<AdaptiveCardVariant>(variant)
  const [detectedContext, setDetectedContext] = useState<AdaptiveCardContext>(context)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // === DETECÇÃO DE CONTEXTO ===
  const detectContext = useMemo(() => {
    if (context !== 'auto') return context

    // Detectar por props
    if (badge || priority) return 'kanban'
    if (title && subtitle) return 'list-item'
    if (quickActions.length > 0) return 'dashboard'
    if (timestamp) return 'notification'
    
    return 'default'
  }, [context, badge, priority, title, subtitle, quickActions, timestamp])

  // === DETECÇÃO DE VARIANTE ===
  const detectVariant = useMemo(() => {
    if (variant !== 'smart') return variant

    const ctx = detectContext
    
    switch (ctx) {
      case 'dashboard':
        return 'elevated'
      case 'kanban':
        return 'outlined'
      case 'notification':
        return 'filled'
      case 'form-section':
        return 'outlined'
      default:
        return 'default'
    }
  }, [variant, detectContext])

  // === OBSERVER PARA AUTO-RESIZE ===
  useEffect(() => {
    if (!autoResize || !cardRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [autoResize])

  // === CLASSES CSS INTELIGENTES ===
  const getVariantClasses = () => {
    const baseClasses = 'relative transition-all duration-200 smart-transition'
    
    const variantClasses: Record<Exclude<AdaptiveCardVariant, 'smart'>, string> = {
      default: `
        bg-[var(--bg-canvas)] border border-[var(--border-subtle)]
        rounded-lg shadow-sm
      `,
      elevated: `
        bg-[var(--bg-canvas)] border-0
        rounded-xl shadow-lg hover:shadow-xl
      `,
      outlined: `
        bg-[var(--bg-canvas)] border-2 border-[var(--border-muted)]
        rounded-lg shadow-none hover:border-[var(--color-primary-300)]
      `,
      filled: `
        bg-[var(--bg-subtle)] border-0
        rounded-lg shadow-sm
      `,
      glass: `
        bg-white/10 backdrop-blur-md border border-white/20
        rounded-xl shadow-lg
      `,
      neomorphic: `
        bg-[var(--bg-canvas)] border-0 rounded-2xl
        shadow-[8px_8px_16px_var(--shadow-color),-8px_-8px_16px_white]
      `
    }

    return `${baseClasses} ${variantClasses[detectedVariant as Exclude<AdaptiveCardVariant, 'smart'>] || variantClasses.default}`
  }

  const getSizeClasses = () => {
    if (size === 'auto') {
      // Auto-size baseado no contexto
      switch (detectedContext) {
        case 'kanban':
          return 'min-h-[120px] max-w-[300px]'
        case 'dashboard':
          return 'min-h-[200px]'
        case 'notification':
          return 'max-w-[400px]'
        default:
          return ''
      }
    }

    const sizes = {
      xs: 'p-3 min-h-[80px]',
      sm: 'p-4 min-h-[100px]',
      md: 'p-6 min-h-[120px]',
      lg: 'p-8 min-h-[160px]',
      xl: 'p-10 min-h-[200px]'
    }
    
    return sizes[size] || sizes.md
  }

  const getStateClasses = () => {
    let stateClasses = ''
    
    if (loading) {
      stateClasses += ' opacity-70 pointer-events-none '
    }
    
    if (error) {
      stateClasses += ' border-red-200 bg-red-50 '
    }
    
    if (success) {
      stateClasses += ' border-green-200 bg-green-50 '
    }
    
    if (selected) {
      stateClasses += ' ring-2 ring-[var(--color-primary-500)] ring-opacity-50 border-[var(--color-primary-300)] '
    }
    
    if (disabled) {
      stateClasses += ' opacity-50 cursor-not-allowed '
    }
    
    if (hoverable && !disabled) {
      stateClasses += ' hover:scale-[1.02] hover:shadow-lg '
    }
    
    if (clickable && !disabled) {
      stateClasses += ' cursor-pointer active:scale-[0.98] '
    }
    
    if (draggable && !disabled) {
      stateClasses += ' cursor-move '
    }
    
    return stateClasses
  }

  const getPriorityClasses = () => {
    if (!priority) return ''
    
    const priorityClasses = {
      low: 'border-l-4 border-l-gray-300',
      medium: 'border-l-4 border-l-yellow-400',
      high: 'border-l-4 border-l-orange-500',
      urgent: 'border-l-4 border-l-red-500'
    }
    
    return priorityClasses[priority]
  }

  // === HANDLERS ===
  const handleClick = () => {
    if (disabled) return
    
    if (selectable) {
      onSelect?.(!selected)
    }
    
    onClick?.()
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable || disabled) return
    onDragStart?.(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return
    onDrop?.(e)
  }

  // === CLASSES FINAIS ===
  const finalClasses = [
    getVariantClasses(),
    getSizeClasses(),
    getStateClasses(),
    getPriorityClasses(),
    smartSpacing ? 'space-y-4' : '',
    className
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

  return (
    <div
      ref={cardRef}
      className={finalClasses}
      style={style}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      draggable={draggable && !disabled}
      {...props}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--text-secondary)]">Carregando...</span>
          </div>
        </div>
      )}

      {/* Header */}
      {(title || subtitle || badge || quickActions.length > 0) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {badge && (
              <span
                className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${badge.variant === 'success' ? 'bg-green-100 text-green-800' : ''}
                  ${badge.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${badge.variant === 'error' ? 'bg-red-100 text-red-800' : ''}
                  ${badge.variant === 'info' ? 'bg-blue-100 text-blue-800' : ''}
                  ${!badge.variant || badge.variant === 'neutral' ? 'bg-gray-100 text-gray-800' : ''}
                `}
              >
                {badge.text}
              </span>
            )}
            
            {/* Quick Actions */}
            {quickActions.length > 0 && isHovered && (
              <div className="flex space-x-1">
                {quickActions.map((action, index) => (
                  <SmartButton
                    key={index}
                    variant={action.variant || 'ghost'}
                    size="xs"
                    onClick={action.action}
                    tooltipText={action.label}
                    className="opacity-80 hover:opacity-100"
                  >
                    {action.icon}
                  </SmartButton>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={adaptiveLayout ? 'space-y-4' : ''}>
        {children}
      </div>

      {/* Footer */}
      {timestamp && (
        <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            {timestamp.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}

      {/* Selection Indicator */}
      {selectable && selected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 bg-[var(--color-primary-500)] text-white rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

// === COMPONENTES PRÉ-CONFIGURADOS ===
export const DashboardCard: React.FC<Omit<AdaptiveCardProps, 'context' | 'variant'>> = (props) => (
  <AdaptiveCard context="dashboard" variant="elevated" {...props} />
)

export const KanbanCard: React.FC<Omit<AdaptiveCardProps, 'context' | 'variant'>> = (props) => (
  <AdaptiveCard context="kanban" variant="outlined" draggable hoverable {...props} />
)

export const NotificationCard: React.FC<Omit<AdaptiveCardProps, 'context' | 'variant'>> = (props) => (
  <AdaptiveCard context="notification" variant="filled" {...props} />
)

export const FormSectionCard: React.FC<Omit<AdaptiveCardProps, 'context' | 'variant'>> = (props) => (
  <AdaptiveCard context="form-section" variant="outlined" {...props} />
)