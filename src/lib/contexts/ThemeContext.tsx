import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface ThemeConfig {
  nome: string
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  corTexto: string
  corMuted: string
  corBorder: string
  corCard: string
  corSuccess: string
  corWarning: string
  corError: string
  modo: 'light' | 'dark' | 'auto'
  fonteHeader: string
  fonteBody: string
  borderRadius: string
}

const TEMA_PADRAO: ThemeConfig = {
  nome: 'Padrão DCL',
  corPrimaria: '#1C3B5A',
  corSecundaria: '#3182f6',
  corFundo: '#ffffff',
  corTexto: '#111827',
  corMuted: '#6b7280',
  corBorder: '#e5e7eb',
  corCard: '#ffffff',
  corSuccess: '#059669',
  corWarning: '#d97706',
  corError: '#dc2626',
  modo: 'light',
  fonteHeader: 'Inter',
  fonteBody: 'Inter',
  borderRadius: '0.5rem'
}

const TEMA_ESCURO: ThemeConfig = {
  nome: 'Modo Escuro',
  corPrimaria: '#60A5FA',
  corSecundaria: '#94A3B8',
  corFundo: '#0F172A',
  corTexto: '#F1F5F9',
  corMuted: '#94A3B8',
  corBorder: '#334155',
  corCard: '#1E293B',
  corSuccess: '#10B981',
  corWarning: '#f59e0b',
  corError: '#ef4444',
  modo: 'dark',
  fonteHeader: 'Inter',
  fonteBody: 'Inter',
  borderRadius: '0.5rem'
}

export const TEMAS_PREDEFINIDOS = [
  TEMA_PADRAO,
  TEMA_ESCURO,
  {
    nome: 'Verde Profissional',
    corPrimaria: '#059669',
    corSecundaria: '#0891b2',
    corFundo: '#f0fdf4',
    corTexto: '#14532d',
    corMuted: '#4b5563',
    corBorder: '#d1fae5',
    corCard: '#ffffff',
    corSuccess: '#059669',
    corWarning: '#d97706',
    corError: '#dc2626',
    modo: 'light' as const,
    fonteHeader: 'Inter',
    fonteBody: 'Inter',
    borderRadius: '0.5rem'
  }
]

interface ThemeContextType {
  theme: ThemeConfig
  setTheme: (theme: ThemeConfig) => void
  applyTheme: (theme: ThemeConfig) => void
  resetTheme: () => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(TEMA_PADRAO)
  const [isLoading, setIsLoading] = useState(true)

  // Função para aplicar o tema no DOM
  const applyTheme = (newTheme: ThemeConfig) => {
    const root = document.documentElement
    
    // Aplicar variáveis CSS
    root.style.setProperty('--color-primary', newTheme.corPrimaria)
    root.style.setProperty('--color-secondary', newTheme.corSecundaria)
    root.style.setProperty('--color-background', newTheme.corFundo)
    root.style.setProperty('--color-text', newTheme.corTexto)
    root.style.setProperty('--color-muted', newTheme.corMuted)
    root.style.setProperty('--color-border', newTheme.corBorder)
    root.style.setProperty('--color-card', newTheme.corCard)
    root.style.setProperty('--color-success', newTheme.corSuccess)
    root.style.setProperty('--color-warning', newTheme.corWarning)
    root.style.setProperty('--color-error', newTheme.corError)
    root.style.setProperty('--font-header', newTheme.fonteHeader)
    root.style.setProperty('--font-body', newTheme.fonteBody)
    root.style.setProperty('--border-radius', newTheme.borderRadius)

    // Calcular cores de contraste automaticamente
    const primaryRgb = hexToRgb(newTheme.corPrimaria)
    const secondaryRgb = hexToRgb(newTheme.corSecundaria)
    
    if (primaryRgb) {
      const primaryContrast = getContrastColor(primaryRgb)
      root.style.setProperty('--color-primary-foreground', primaryContrast)
    }
    
    if (secondaryRgb) {
      const secondaryContrast = getContrastColor(secondaryRgb)
      root.style.setProperty('--color-secondary-foreground', secondaryContrast)
    }

    // Aplicar modo escuro/claro
    root.classList.remove('light', 'dark')
    if (newTheme.modo === 'dark') {
      root.classList.add('dark')
    } else if (newTheme.modo === 'light') {
      root.classList.add('light')
    } else {
      // Auto mode - detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark' : 'light')
    }

    // Salvar no localStorage
    localStorage.setItem('desenrola-theme', JSON.stringify(newTheme))
    setTheme(newTheme)
  }

  const resetTheme = () => {
    applyTheme(TEMA_PADRAO)
  }

  // Carregar tema salvo ao inicializar
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('desenrola-theme')
      if (savedTheme) {
        const parsedTheme = JSON.parse(savedTheme) as ThemeConfig
        applyTheme(parsedTheme)
      } else {
        applyTheme(TEMA_PADRAO)
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
      applyTheme(TEMA_PADRAO)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Monitorar mudanças na preferência do sistema para modo auto
  useEffect(() => {
    if (theme.modo === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme(theme)
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      applyTheme, 
      resetTheme, 
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Funções utilitárias para contraste
function hexToRgb(hex: string): {r: number, g: number, b: number} | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function getContrastColor(rgb: {r: number, g: number, b: number}): string {
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

export { TEMA_PADRAO, TEMA_ESCURO }