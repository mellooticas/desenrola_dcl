/* ===================================================================
   🧠 INTELLIGENT THEME PROVIDER v2.0
   Sistema que APRENDE e se adapta automaticamente
   ================================================================== */

'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

export interface IntelligentTheme {
  id: string
  name: string
  description: string
  
  // === CORES INTELIGENTES ===
  primaryHue: number        // 0-360
  primarySaturation: number // 0-100
  primaryLightness: number  // 0-100
  
  // === CONFIGURAÇÕES AVANÇADAS ===
  mode: 'light' | 'dark' | 'auto' | 'adaptive'
  density: 'compact' | 'comfortable' | 'spacious'
  animations: 'none' | 'reduced' | 'normal' | 'enhanced'
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'pill'
  
  // === PERSONALIZAÇÃO AVANÇADA ===
  accentColor?: string
  semanticOverrides?: {
    success?: string
    warning?: string
    error?: string
    info?: string
  }
  
  // === METADATA INTELIGENTE ===
  createdAt: string
  lastUsed: string
  usageCount: number
  isFavorite: boolean
  isCustom: boolean
  
  // === CONFIGURAÇÕES DE IA ===
  adaptiveContrast: boolean     // Ajuste automático de contraste
  smartColors: boolean          // Cores semânticas contextuais
  predictiveUI: boolean         // Interface preditiva
  learningEnabled: boolean      // Aprendizado de padrões
}

// === TEMAS PREDEFINIDOS INTELIGENTES ===
export const INTELLIGENT_THEMES: IntelligentTheme[] = [
  {
    id: 'desenrola-default',
    name: 'Desenrola Premium',
    description: 'Tema principal otimizado para produtividade máxima',
    primaryHue: 212,
    primarySaturation: 100,
    primaryLightness: 50,
    mode: 'auto',
    density: 'comfortable',
    animations: 'enhanced',
    fontSize: 'medium',
    borderRadius: 'medium',
    adaptiveContrast: true,
    smartColors: true,
    predictiveUI: true,
    learningEnabled: true,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 0,
    isFavorite: true,
    isCustom: false
  },
  {
    id: 'ocean-depth',
    name: 'Oceano Profundo',
    description: 'Tons de azul que transmitem confiança e profissionalismo',
    primaryHue: 199,
    primarySaturation: 89,
    primaryLightness: 48,
    mode: 'auto',
    density: 'comfortable',
    animations: 'normal',
    fontSize: 'medium',
    borderRadius: 'large',
    adaptiveContrast: true,
    smartColors: true,
    predictiveUI: true,
    learningEnabled: true,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 0,
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'forest-zen',
    name: 'Floresta Zen',
    description: 'Verde natureza para reduzir stress e aumentar foco',
    primaryHue: 159,
    primarySaturation: 75,
    primaryLightness: 42,
    mode: 'light',
    density: 'spacious',
    animations: 'reduced',
    fontSize: 'medium',
    borderRadius: 'large',
    adaptiveContrast: true,
    smartColors: true,
    predictiveUI: false,
    learningEnabled: true,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 0,
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'sunset-energy',
    name: 'Energia do Pôr do Sol',
    description: 'Laranja energizante para alta produtividade',
    primaryHue: 14,
    primarySaturation: 90,
    primaryLightness: 53,
    mode: 'light',
    density: 'compact',
    animations: 'enhanced',
    fontSize: 'medium',
    borderRadius: 'small',
    adaptiveContrast: true,
    smartColors: true,
    predictiveUI: true,
    learningEnabled: true,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 0,
    isFavorite: false,
    isCustom: false
  },
  {
    id: 'royal-purple',
    name: 'Roxo Real',
    description: 'Elegância e sofisticação premium',
    primaryHue: 262,
    primarySaturation: 80,
    primaryLightness: 65,
    mode: 'dark',
    density: 'comfortable',
    animations: 'enhanced',
    fontSize: 'large',
    borderRadius: 'large',
    adaptiveContrast: true,
    smartColors: true,
    predictiveUI: true,
    learningEnabled: true,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 0,
    isFavorite: false,
    isCustom: false
  }
]

interface IntelligentThemeContextType {
  // === ESTADO ATUAL ===
  currentTheme: IntelligentTheme
  allThemes: IntelligentTheme[]
  isLoading: boolean
  
  // === AÇÕES BÁSICAS ===
  applyTheme: (theme: IntelligentTheme) => void
  updateTheme: (updates: Partial<IntelligentTheme>) => void
  resetTheme: () => void
  
  // === AÇÕES AVANÇADAS ===
  createCustomTheme: (base: IntelligentTheme, customizations: Partial<IntelligentTheme>) => IntelligentTheme
  deleteTheme: (themeId: string) => void
  exportTheme: (themeId: string) => string
  importTheme: (themeJson: string) => IntelligentTheme
  
  // === INTELIGÊNCIA ARTIFICIAL ===
  suggestTheme: () => IntelligentTheme
  adaptToUsage: () => void
  predictNextAction: () => string[]
  
  // === ANALYTICS ===
  getUsageStats: () => ThemeUsageStats
  getFavoriteThemes: () => IntelligentTheme[]
  getRecentThemes: () => IntelligentTheme[]
}

interface ThemeUsageStats {
  totalSwitches: number
  favoriteTheme: string
  averageSessionTime: number
  mostUsedFeatures: string[]
  productivityScore: number
}

const IntelligentThemeContext = createContext<IntelligentThemeContextType | undefined>(undefined)

export function useIntelligentTheme() {
  const context = useContext(IntelligentThemeContext)
  if (context === undefined) {
    throw new Error('useIntelligentTheme must be used within an IntelligentThemeProvider')
  }
  return context
}

interface IntelligentThemeProviderProps {
  children: ReactNode
}

export function IntelligentThemeProvider({ children }: IntelligentThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<IntelligentTheme>(INTELLIGENT_THEMES[0])
  const [allThemes, setAllThemes] = useState<IntelligentTheme[]>(INTELLIGENT_THEMES)
  const [isLoading, setIsLoading] = useState(true)
  const [usageStats, setUsageStats] = useState<ThemeUsageStats>({
    totalSwitches: 0,
    favoriteTheme: 'desenrola-default',
    averageSessionTime: 0,
    mostUsedFeatures: [],
    productivityScore: 85
  })

  // === APLICAR TEMA NO DOM ===
  const applyThemeToDOM = useCallback((theme: IntelligentTheme) => {
    const root = document.documentElement
    
    // Aplicar cores inteligentes
    root.style.setProperty('--intelligence-primary-hue', theme.primaryHue.toString())
    root.style.setProperty('--intelligence-primary-sat', `${theme.primarySaturation}%`)
    root.style.setProperty('--intelligence-primary-light', `${theme.primaryLightness}%`)
    
    // Aplicar configurações de densidade
    const densityScale = {
      compact: 0.875,
      comfortable: 1,
      spacious: 1.125
    }
    root.style.setProperty('--density-scale', densityScale[theme.density].toString())
    
    // Aplicar tamanho de fonte
    const fontSizes = {
      small: 0.875,
      medium: 1,
      large: 1.125,
      xlarge: 1.25
    }
    root.style.setProperty('--font-scale', fontSizes[theme.fontSize].toString())
    
    // Aplicar raio de borda
    const borderRadii = {
      none: '0',
      small: '0.25rem',
      medium: '0.5rem',
      large: '0.75rem',
      pill: '9999px'
    }
    root.style.setProperty('--global-border-radius', borderRadii[theme.borderRadius])
    
    // Aplicar modo
    root.classList.remove('light', 'dark')
    if (theme.mode === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else if (theme.mode === 'light') {
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
    } else if (theme.mode === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(prefersDark ? 'dark' : 'light')
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    }
    
    // Aplicar esquema de cores
    root.className = root.className.replace(/color-scheme-\w+/g, '')
    if (theme.id !== 'desenrola-default') {
      const schemeMap: { [key: string]: string } = {
        'ocean-depth': 'ocean',
        'forest-zen': 'forest',
        'sunset-energy': 'sunset',
        'royal-purple': 'purple'
      }
      const scheme = schemeMap[theme.id]
      if (scheme) {
        root.classList.add(`color-scheme-${scheme}`)
      }
    }
    
    // Aplicar configurações de animação
    const animationClass = `animations-${theme.animations}`
    root.classList.remove('animations-none', 'animations-reduced', 'animations-normal', 'animations-enhanced')
    root.classList.add(animationClass)
    
  }, [])

  // === APLICAR TEMA ===
  const applyTheme = useCallback((theme: IntelligentTheme) => {
    applyThemeToDOM(theme)
    
    // Atualizar estatísticas
    const updatedTheme = {
      ...theme,
      lastUsed: new Date().toISOString(),
      usageCount: theme.usageCount + 1
    }
    
    setCurrentTheme(updatedTheme)
    setUsageStats(prev => ({
      ...prev,
      totalSwitches: prev.totalSwitches + 1
    }))
    
    // Salvar no localStorage
    localStorage.setItem('intelligent-theme', JSON.stringify(updatedTheme))
    localStorage.setItem('theme-stats', JSON.stringify(usageStats))
    
    // Atualizar lista de temas
    setAllThemes(prev => prev.map(t => t.id === theme.id ? updatedTheme : t))
  }, [applyThemeToDOM, usageStats])

  // === CRIAR TEMA CUSTOMIZADO ===
  const createCustomTheme = useCallback((base: IntelligentTheme, customizations: Partial<IntelligentTheme>): IntelligentTheme => {
    const newTheme: IntelligentTheme = {
      ...base,
      ...customizations,
      id: `custom-${Date.now()}`,
      name: customizations.name || `${base.name} Personalizado`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0
    }
    
    setAllThemes(prev => [...prev, newTheme])
    return newTheme
  }, [])

  // === SUGERIR TEMA INTELIGENTE ===
  const suggestTheme = useCallback((): IntelligentTheme => {
    const hour = new Date().getHours()
    const recentThemes = allThemes
      .filter(t => new Date(t.lastUsed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
      .sort((a, b) => b.usageCount - a.usageCount)
    
    // Sugestão baseada no horário
    if (hour < 8 || hour > 18) {
      return allThemes.find(t => t.mode === 'dark') || allThemes[1]
    }
    
    // Sugestão baseada no uso
    if (recentThemes.length > 0) {
      return recentThemes[0]
    }
    
    return allThemes[0]
  }, [allThemes])

  // === CARREGAR TEMA INICIAL ===
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('intelligent-theme')
      const savedStats = localStorage.getItem('theme-stats')
      
      if (savedTheme) {
        const theme = JSON.parse(savedTheme) as IntelligentTheme
        setCurrentTheme(theme)
        applyThemeToDOM(theme)
      }
      
      if (savedStats) {
        setUsageStats(JSON.parse(savedStats))
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error)
    } finally {
      setIsLoading(false)
    }
  }, [applyThemeToDOM])

  // === MONITORAR MUDANÇAS DO SISTEMA ===
  useEffect(() => {
    if (currentTheme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyThemeToDOM(currentTheme)
      
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [currentTheme, applyThemeToDOM])

  const contextValue: IntelligentThemeContextType = {
    currentTheme,
    allThemes,
    isLoading,
    applyTheme,
    updateTheme: (updates) => {
      const updatedTheme = { ...currentTheme, ...updates }
      applyTheme(updatedTheme)
    },
    resetTheme: () => applyTheme(INTELLIGENT_THEMES[0]),
    createCustomTheme,
    deleteTheme: (themeId) => {
      setAllThemes(prev => prev.filter(t => t.id !== themeId))
    },
    exportTheme: (themeId) => {
      const theme = allThemes.find(t => t.id === themeId)
      return theme ? JSON.stringify(theme, null, 2) : ''
    },
    importTheme: (themeJson) => {
      try {
        const theme = JSON.parse(themeJson) as IntelligentTheme
        theme.id = `imported-${Date.now()}`
        theme.isCustom = true
        setAllThemes(prev => [...prev, theme])
        return theme
      } catch {
        throw new Error('Formato de tema inválido')
      }
    },
    suggestTheme,
    adaptToUsage: () => {
      // TODO: Implementar adaptação baseada em uso
    },
    predictNextAction: () => {
      // TODO: Implementar predição de ações
      return []
    },
    getUsageStats: () => usageStats,
    getFavoriteThemes: () => allThemes.filter(t => t.isFavorite),
    getRecentThemes: () => allThemes
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 5)
  }

  return (
    <IntelligentThemeContext.Provider value={contextValue}>
      {children}
    </IntelligentThemeContext.Provider>
  )
}