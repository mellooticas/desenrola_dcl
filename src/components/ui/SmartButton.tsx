/* ===================================================================
   🤖 SMART BUTTON SYSTEM v2.0
   Botão que PENSA e se adapta automaticamente ao contexto
   ================================================================== */

'use client'

import React, { forwardRef, useCallback, useEffect, useState, useRef } from 'react'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'

// === TIPOS INTELIGENTES ===
export type SmartButtonVariant = 
  | 'primary'        // Ação principal - CTA forte
  | 'secondary'      // Ação secundária - CTA média
  | 'ghost'          // Ação sutil - CTA fraca
  | 'destructive'    // Ação perigosa - Deletar, cancelar
  | 'success'        // Ação positiva - Confirmar, salvar
  | 'warning'        // Ação que requer atenção
  | 'smart'          // Detecta contexto automaticamente

export type SmartButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type SmartButtonContext = 
  | 'form-submit'    // Botão de envio de formulário
  | 'form-cancel'    // Botão de cancelamento
  | 'navigation'     // Navegação entre páginas
  | 'action-quick'   // Ação rápida (Kanban, etc.)
  | 'action-danger'  // Ação destrutiva
  | 'filter'         // Filtros e busca
  | 'status-change'  // Mudança de status
  | 'auto'           // Detecta automaticamente

interface SmartButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: SmartButtonVariant
  size?: SmartButtonSize
  context?: SmartButtonContext
  
  // === FUNCIONALIDADES AVANÇADAS ===
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  
  // === INTELIGÊNCIA ===
  adaptToContent?: boolean      // Adapta tamanho ao conteúdo
  predictiveHover?: boolean     // Hover preditivo baseado em movimento
  smartAnimations?: boolean     // Animações contextuais
  contextAware?: boolean        // Detecta contexto automaticamente
  
  // === ACESSIBILIDADE AVANÇADA ===
  shortcut?: string            // Atalho de teclado (ex: "Ctrl+S")
  tooltipText?: string         // Tooltip inteligente
  ariaDescription?: string     // Descrição para screen readers
  
  // === ANALYTICS ===
  trackClick?: boolean         // Rastrear cliques para analytics
  trackHover?: boolean         // Rastrear hovers para UX
  
  // === STYLING PERSONALIZADO ===
  className?: string
  gradient?: boolean           // Usar gradientes avançados
  glassmorphism?: boolean      // Efeito glass/blur
  neomorphism?: boolean        // Efeito neomórfico
}

// === SMART BUTTON COMPONENT ===
export const SmartButton = forwardRef<HTMLButtonElement, SmartButtonProps>(({
  variant = 'smart',
  size = 'md',
  context = 'auto',
  loading = false,
  loadingText = 'Carregando...',
  icon,
  iconPosition = 'left',
  adaptToContent = true,
  predictiveHover = true,
  smartAnimations = true,
  contextAware = true,
  shortcut,
  tooltipText,
  ariaDescription,
  trackClick = true,
  trackHover = false,
  className = '',
  gradient = false,
  glassmorphism = false,
  neomorphism = false,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  disabled,
  type = 'button',
  ...props
}, ref) => {
  
  const { currentTheme } = useIntelligentTheme()
  const [isHovered, setIsHovered] = useState(false)
  const [isPredictiveHovered, setIsPredictiveHovered] = useState(false)
  const [detectedContext, setDetectedContext] = useState<SmartButtonContext>('auto')
  const [smartVariant, setSmartVariant] = useState<SmartButtonVariant>(variant)
  
  // Ref interno como fallback
  const internalRef = useRef<HTMLButtonElement>(null)
  const buttonRef = (ref || internalRef) as React.RefObject<HTMLButtonElement>

  // === DETECÇÃO DE CONTEXTO INTELIGENTE ===
  const detectContext = useCallback(() => {
    if (!contextAware || context !== 'auto') return context

    const buttonText = typeof children === 'string' ? children.toLowerCase() : ''
    const parentForm = document.querySelector('form')
    
    // Detectar por texto
    if (buttonText.includes('salvar') || buttonText.includes('confirmar') || buttonText.includes('enviar')) {
      return 'form-submit'
    }
    if (buttonText.includes('cancelar') || buttonText.includes('voltar')) {
      return 'form-cancel'
    }
    if (buttonText.includes('deletar') || buttonText.includes('excluir') || buttonText.includes('remover')) {
      return 'action-danger'
    }
    if (buttonText.includes('filtrar') || buttonText.includes('buscar')) {
      return 'filter'
    }
    
    // Detectar por contexto do DOM
    if (parentForm && type === 'submit') {
      return 'form-submit'
    }
    
    return 'action-quick'
  }, [children, context, contextAware, type])

  // === DETECÇÃO DE VARIANTE INTELIGENTE ===
  const detectVariant = useCallback(() => {
    if (variant !== 'smart') return variant

    const detectedCtx = detectContext()
    
    switch (detectedCtx) {
      case 'form-submit':
        return 'primary'
      case 'form-cancel':
        return 'secondary'
      case 'action-danger':
        return 'destructive'
      case 'status-change':
        return 'success'
      case 'filter':
        return 'ghost'
      default:
        return 'secondary'
    }
  }, [variant, detectContext])

  // === EFEITO DE DETECÇÃO ===
  useEffect(() => {
    const ctx = detectContext()
    const var_ = detectVariant()
    setDetectedContext(ctx)
    setSmartVariant(var_)
  }, [detectContext, detectVariant])

  // === HOVER PREDITIVO ===
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!predictiveHover) return
    
    if (!buttonRef || !buttonRef.current) return
    
    const rect = buttonRef.current.getBoundingClientRect()
    const distance = Math.sqrt(
      Math.pow(e.clientX - (rect.left + rect.width / 2), 2) +
      Math.pow(e.clientY - (rect.top + rect.height / 2), 2)
    )
    
    // Hover preditivo quando mouse está próximo
    setIsPredictiveHovered(distance < 50)
  }, [predictiveHover, buttonRef])

  useEffect(() => {
    if (predictiveHover && buttonRef) {
      document.addEventListener('mousemove', handleMouseMove)
      return () => document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [predictiveHover, handleMouseMove, buttonRef])

  // === CLASSES CSS INTELIGENTES ===
  const getVariantClasses = () => {
    const baseClasses = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-20'
    
    const variantClasses: Record<Exclude<SmartButtonVariant, 'smart'>, string> = {
      primary: `
        bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)]
        hover:from-[var(--color-primary-600)] hover:to-[var(--color-primary-700)]
        text-white shadow-lg hover:shadow-xl
        focus:ring-[var(--color-primary-500)]
        ${smartAnimations ? 'hover:scale-105 active:scale-95' : ''}
      `,
      secondary: `
        bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)]
        text-[var(--text-primary)] border border-[var(--border-muted)]
        shadow-sm hover:shadow-md
        focus:ring-[var(--color-primary-500)]
        ${smartAnimations ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      `,
      ghost: `
        hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]
        hover:text-[var(--text-primary)]
        focus:ring-[var(--color-primary-500)]
        ${smartAnimations ? 'hover:scale-[1.02]' : ''}
      `,
      destructive: `
        bg-gradient-to-r from-[var(--semantic-urgent)] to-red-600
        hover:from-red-600 hover:to-red-700
        text-white shadow-lg hover:shadow-xl
        focus:ring-red-500
        ${smartAnimations ? 'hover:scale-105 active:scale-95' : ''}
      `,
      success: `
        bg-gradient-to-r from-[var(--semantic-success)] to-green-600
        hover:from-green-600 hover:to-green-700
        text-white shadow-lg hover:shadow-xl
        focus:ring-green-500
        ${smartAnimations ? 'hover:scale-105 active:scale-95' : ''}
      `,
      warning: `
        bg-gradient-to-r from-[var(--semantic-warning)] to-orange-500
        hover:from-orange-500 hover:to-orange-600
        text-white shadow-lg hover:shadow-xl
        focus:ring-orange-500
        ${smartAnimations ? 'hover:scale-105 active:scale-95' : ''}
      `
    }

    return `${baseClasses} ${variantClasses[smartVariant as Exclude<SmartButtonVariant, 'smart'>] || variantClasses.secondary}`
  }

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs rounded-md',
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl'
    }
    return sizes[size]
  }

  // === EFEITOS VISUAIS AVANÇADOS ===
  const getEffectClasses = () => {
    let effects = ''
    
    if (gradient && smartVariant === 'primary') {
      effects += ' bg-gradient-to-r '
    }
    
    if (glassmorphism) {
      effects += ' backdrop-blur-md bg-opacity-20 border border-white/20 '
    }
    
    if (neomorphism) {
      effects += ' shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_8px_16px_rgba(0,0,0,0.1)] '
    }
    
    if (isPredictiveHovered && smartAnimations) {
      effects += ' scale-[1.01] shadow-lg '
    }
    
    return effects
  }

  // === HANDLERS ===
  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (trackClick) {
      // TODO: Implementar analytics
      console.log(`SmartButton clicked: ${smartVariant} - ${detectedContext}`)
    }
    
    onClick?.(e)
  }, [onClick, trackClick, smartVariant, detectedContext])

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true)
    if (trackHover) {
      // TODO: Implementar analytics de hover
    }
    onMouseEnter?.(e)
  }, [onMouseEnter, trackHover])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false)
    onMouseLeave?.(e)
  }, [onMouseLeave])

  // === ATALHOS DE TECLADO ===
  useEffect(() => {
    if (!shortcut) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === shortcut.toLowerCase().replace('ctrl+', '')) {
        e.preventDefault()
        const button = ref as React.RefObject<HTMLButtonElement>
        button.current?.click()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcut, ref])

  // === CLASSES FINAIS ===
  const finalClasses = [
    getVariantClasses(),
    getSizeClasses(),
    getEffectClasses(),
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    loading ? 'cursor-wait' : '',
    className
  ].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled || loading}
      className={finalClasses}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaDescription || (typeof children === 'string' ? children : undefined)}
      title={tooltipText || (shortcut ? `${children} (${shortcut})` : undefined)}
      {...props}
    >
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {loadingText && size !== 'xs' && (
            <span className="ml-2">{loadingText}</span>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className={loading ? 'opacity-0' : 'flex items-center gap-2'}>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {children}
        
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {shortcut && size !== 'xs' && (
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-black/10 rounded">
            {shortcut}
          </kbd>
        )}
      </div>
    </button>
  )
})

SmartButton.displayName = 'SmartButton'

// === COMPONENTES PRÉ-CONFIGURADOS ===
export const QuickSaveButton = (props: Omit<SmartButtonProps, 'variant' | 'context'>) => (
  <SmartButton variant="primary" context="form-submit" shortcut="Ctrl+S" {...props}>
    {props.children || 'Salvar'}
  </SmartButton>
)

export const QuickCancelButton = (props: Omit<SmartButtonProps, 'variant' | 'context'>) => (
  <SmartButton variant="secondary" context="form-cancel" shortcut="Esc" {...props}>
    {props.children || 'Cancelar'}
  </SmartButton>
)

export const QuickDeleteButton = (props: Omit<SmartButtonProps, 'variant' | 'context'>) => (
  <SmartButton variant="destructive" context="action-danger" {...props}>
    {props.children || 'Deletar'}
  </SmartButton>
)