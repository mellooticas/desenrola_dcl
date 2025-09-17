/* ===================================================================
   🎨 PÁGINA DE PERSONALIZAÇÃO PROFISSIONAL
   Interface moderna e organizada para customização de temas
   ================================================================== */

'use client'

import { useState, useEffect } from 'react'
import { 
  SmartButton, 
  AdaptiveCard, 
  DashboardCard,
  NotificationCard 
} from '@/components/ui/intelligent-system'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Palette, 
  Save, 
  RotateCcw, 
  Eye, 
  Monitor,
  Sun,
  Moon,
  Sparkles,
  Settings,
  Download,
  Upload,
  Zap,
  Wand2
} from 'lucide-react'
import Link from 'next/link'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'

// === TIPOS ===
interface CustomTheme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    warning: string
    error: string
    info: string
    neutral: string
  }
  mode: 'light' | 'dark' | 'auto'
  borderRadius: number
  shadows: 'minimal' | 'soft' | 'elevated' | 'dramatic'
  animations: 'disabled' | 'reduced' | 'normal' | 'enhanced'
}

// === TEMAS PROFISSIONAIS PREDEFINIDOS ===
const PROFESSIONAL_THEMES: CustomTheme[] = [
  {
    name: 'Ocean Professional',
    mode: 'light',
    borderRadius: 8,
    shadows: 'soft',
    animations: 'normal',
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      neutral: '#6b7280'
    }
  },
  {
    name: 'Forest Corporate',
    mode: 'light', 
    borderRadius: 6,
    shadows: 'elevated',
    animations: 'normal',
    colors: {
      primary: '#059669',
      secondary: '#6b7280',
      accent: '#065f46',
      success: '#10b981',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
      neutral: '#64748b'
    }
  },
  {
    name: 'Sunset Enterprise',
    mode: 'light',
    borderRadius: 12,
    shadows: 'dramatic',
    animations: 'enhanced',
    colors: {
      primary: '#ea580c',
      secondary: '#78716c',
      accent: '#dc2626',
      success: '#16a34a',
      warning: '#ca8a04',
      error: '#dc2626',
      info: '#2563eb',
      neutral: '#57534e'
    }
  },
  {
    name: 'Purple Innovation',
    mode: 'light',
    borderRadius: 10,
    shadows: 'elevated',
    animations: 'enhanced',
    colors: {
      primary: '#7c3aed',
      secondary: '#64748b',
      accent: '#a855f7',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb',
      neutral: '#6b7280'
    }
  },
  {
    name: 'Dark Professional',
    mode: 'dark',
    borderRadius: 8,
    shadows: 'soft',
    animations: 'normal',
    colors: {
      primary: '#3b82f6',
      secondary: '#94a3b8',
      accent: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      neutral: '#64748b'
    }
  }
]

export default function PersonalizacaoPage() {
  const { currentTheme } = useIntelligentTheme()
  const [selectedTheme, setSelectedTheme] = useState<CustomTheme>(PROFESSIONAL_THEMES[0])
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([])

  // === HANDLERS ===
  const handleThemeSelect = (theme: CustomTheme) => {
    setSelectedTheme(theme)
    if (previewMode) {
      applyThemePreview(theme)
    }
  }

  const handleColorChange = (colorType: keyof CustomTheme['colors'], value: string) => {
    setSelectedTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      }
    }))
    
    if (previewMode) {
      applyThemePreview({
        ...selectedTheme,
        colors: {
          ...selectedTheme.colors,
          [colorType]: value
        }
      })
    }
  }

  const handlePropertyChange = (property: keyof Omit<CustomTheme, 'colors'>, value: any) => {
    setSelectedTheme(prev => ({
      ...prev,
      [property]: value
    }))
  }

  const applyThemePreview = (theme: CustomTheme) => {
    // Aplicar variáveis CSS dinamicamente
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
  }

  const applyTheme = () => {
    applyThemePreview(selectedTheme)
    // Salvar no localStorage ou backend
    localStorage.setItem('custom-theme', JSON.stringify(selectedTheme))
  }

  const resetTheme = () => {
    setSelectedTheme(PROFESSIONAL_THEMES[0])
    setIsCustomizing(false)
  }

  const saveCustomTheme = () => {
    const newTheme = {
      ...selectedTheme,
      name: `Custom ${Date.now()}`
    }
    setSavedThemes(prev => [...prev, newTheme])
  }

  const exportTheme = () => {
    const themeData = JSON.stringify(selectedTheme, null, 2)
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTheme.name.toLowerCase().replace(/\s/g, '-')}-theme.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* === HEADER MODERNO === */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/configuracoes">
              <SmartButton variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </SmartButton>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center">
                <Palette className="h-8 w-8 mr-3 text-[var(--color-primary-500)]" />
                Personalização Avançada
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Configure a aparência e experiência do sistema com inteligência artificial
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <SmartButton 
              variant={previewMode ? "primary" : "secondary"}
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Preview Ativo' : 'Ativar Preview'}
            </SmartButton>
            
            <SmartButton variant="secondary" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </SmartButton>
            
            <SmartButton variant="secondary" onClick={resetTheme}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </SmartButton>
            
            <SmartButton variant="primary" onClick={applyTheme}>
              <Save className="h-4 w-4 mr-2" />
              Aplicar Tema
            </SmartButton>
          </div>
        </div>

        {/* === STATUS DO SISTEMA === */}
        <NotificationCard
          title="🎨 Sistema de Temas Inteligente Ativo"
          subtitle="IA integrada para sugestões automáticas de cores e layouts"
          badge={{ text: "AI-Powered", variant: "info" }}
          timestamp={new Date()}
        >
          <div className="flex items-center space-x-4 mt-3">
            <Badge variant="outline">Tema Atual: {currentTheme.name}</Badge>
            <Badge variant="outline">Modo: {selectedTheme.mode}</Badge>
            <Badge variant="outline">Cores: {Object.keys(selectedTheme.colors).length}</Badge>
          </div>
        </NotificationCard>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* === COLUNA 1: TEMAS PREDEFINIDOS === */}
          <div className="xl:col-span-1">
            <AdaptiveCard 
              title="🎨 Temas Profissionais"
              subtitle="Selecione um tema base"
              context="form-section"
            >
              <div className="space-y-3">
                {PROFESSIONAL_THEMES.map((theme) => (
                  <div
                    key={theme.name}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedTheme.name === theme.name 
                        ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)]' 
                        : 'border-[var(--border-muted)] hover:border-[var(--border-strong)]'
                    }`}
                    onClick={() => handleThemeSelect(theme)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-[var(--text-primary)]">{theme.name}</h3>
                      <div className="flex items-center space-x-1">
                        {theme.mode === 'dark' && <Moon className="h-3 w-3" />}
                        {theme.mode === 'light' && <Sun className="h-3 w-3" />}
                        {theme.mode === 'auto' && <Monitor className="h-3 w-3" />}
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 mb-2">
                      {Object.entries(theme.colors).slice(0, 6).map(([key, color]) => (
                        <div
                          key={key}
                          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>
                    
                    <div className="text-xs text-[var(--text-secondary)] space-y-1">
                      <div>Sombras: {theme.shadows}</div>
                      <div>Animações: {theme.animations}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AdaptiveCard>
          </div>

          {/* === COLUNA 2: PERSONALIZAÇÃO DE CORES === */}
          <div className="xl:col-span-1">
            <AdaptiveCard 
              title="🎯 Cores Principais"
              subtitle="Ajuste as cores do sistema"
              context="form-section"
            >
              <div className="space-y-4">
                {Object.entries(selectedTheme.colors).map(([colorType, colorValue]) => (
                  <div key={colorType}>
                    <Label htmlFor={colorType} className="text-sm font-medium capitalize">
                      {colorType}
                    </Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        id={colorType}
                        type="color"
                        value={colorValue}
                        onChange={(e) => handleColorChange(colorType as keyof CustomTheme['colors'], e.target.value)}
                        className="w-12 h-10 p-1 border rounded cursor-pointer"
                      />
                      <Input
                        value={colorValue}
                        onChange={(e) => handleColorChange(colorType as keyof CustomTheme['colors'], e.target.value)}
                        className="flex-1 font-mono text-sm"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AdaptiveCard>
            
            {/* === CONFIGURAÇÕES AVANÇADAS === */}
            <AdaptiveCard 
              title="⚙️ Configurações Avançadas"
              subtitle="Ajustes finos de aparência"
              context="form-section"
              className="mt-6"
            >
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Modo do Tema</Label>
                  <div className="flex space-x-2 mt-2">
                    {(['light', 'dark', 'auto'] as const).map((mode) => (
                      <SmartButton
                        key={mode}
                        variant={selectedTheme.mode === mode ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePropertyChange('mode', mode)}
                      >
                        {mode === 'light' && <Sun className="h-3 w-3 mr-1" />}
                        {mode === 'dark' && <Moon className="h-3 w-3 mr-1" />}
                        {mode === 'auto' && <Monitor className="h-3 w-3 mr-1" />}
                        {mode}
                      </SmartButton>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Raio das Bordas: {selectedTheme.borderRadius}px</Label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={selectedTheme.borderRadius}
                    onChange={(e) => handlePropertyChange('borderRadius', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Sombras</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['minimal', 'soft', 'elevated', 'dramatic'] as const).map((shadow) => (
                      <SmartButton
                        key={shadow}
                        variant={selectedTheme.shadows === shadow ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePropertyChange('shadows', shadow)}
                      >
                        {shadow}
                      </SmartButton>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Animações</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['disabled', 'reduced', 'normal', 'enhanced'] as const).map((animation) => (
                      <SmartButton
                        key={animation}
                        variant={selectedTheme.animations === animation ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePropertyChange('animations', animation)}
                      >
                        {animation === 'enhanced' && <Sparkles className="h-3 w-3 mr-1" />}
                        {animation === 'disabled' && <Zap className="h-3 w-3 mr-1" />}
                        {animation}
                      </SmartButton>
                    ))}
                  </div>
                </div>
              </div>
            </AdaptiveCard>
          </div>

          {/* === COLUNA 3: PREVIEW EM TEMPO REAL === */}
          <div className="xl:col-span-2">
            <AdaptiveCard 
              title="👁️ Preview em Tempo Real"
              subtitle="Visualize as mudanças instantaneamente"
              context="dashboard"
            >
              <div className="space-y-6">
                
                {/* Demonstração de Botões */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">Botões</h4>
                  <div className="flex flex-wrap gap-3">
                    <SmartButton variant="primary">Primário</SmartButton>
                    <SmartButton variant="secondary">Secundário</SmartButton>
                    <SmartButton variant="secondary">Contorno</SmartButton>
                    <SmartButton variant="ghost">Fantasma</SmartButton>
                    <SmartButton variant="destructive">Destrutivo</SmartButton>
                  </div>
                </div>

                {/* Demonstração de Cards */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">Cards de Dashboard</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DashboardCard 
                      title="Vendas"
                      badge={{ text: "Hoje", variant: "success" }}
                    >
                      <div className="text-2xl font-bold" style={{ color: selectedTheme.colors.success }}>
                        R$ 12.450
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">+15% vs ontem</p>
                    </DashboardCard>

                    <DashboardCard 
                      title="Pedidos"
                      badge={{ text: "Ativo", variant: "info" }}
                    >
                      <div className="text-2xl font-bold" style={{ color: selectedTheme.colors.primary }}>
                        24
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Em produção</p>
                    </DashboardCard>

                    <DashboardCard 
                      title="Alertas"
                      badge={{ text: "Urgente", variant: "warning" }}
                    >
                      <div className="text-2xl font-bold" style={{ color: selectedTheme.colors.warning }}>
                        3
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Requer atenção</p>
                    </DashboardCard>
                  </div>
                </div>

                {/* Demonstração de Badges */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">Status e Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge style={{ backgroundColor: selectedTheme.colors.success, color: 'white' }}>
                      Sucesso
                    </Badge>
                    <Badge style={{ backgroundColor: selectedTheme.colors.warning, color: 'white' }}>
                      Aviso
                    </Badge>
                    <Badge style={{ backgroundColor: selectedTheme.colors.error, color: 'white' }}>
                      Erro
                    </Badge>
                    <Badge style={{ backgroundColor: selectedTheme.colors.info, color: 'white' }}>
                      Informação
                    </Badge>
                    <Badge style={{ backgroundColor: selectedTheme.colors.neutral, color: 'white' }}>
                      Neutro
                    </Badge>
                  </div>
                </div>

                {/* Informações do Tema */}
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] mb-3">Detalhes do Tema</h4>
                  <div className="bg-[var(--bg-subtle)] p-4 rounded-lg border text-sm space-y-2">
                    <div><strong>Nome:</strong> {selectedTheme.name}</div>
                    <div><strong>Modo:</strong> {selectedTheme.mode}</div>
                    <div><strong>Bordas:</strong> {selectedTheme.borderRadius}px</div>
                    <div><strong>Sombras:</strong> {selectedTheme.shadows}</div>
                    <div><strong>Animações:</strong> {selectedTheme.animations}</div>
                    <div className="pt-2 border-t">
                      <strong>Cores:</strong>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {Object.entries(selectedTheme.colors).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <div 
                              className="w-full h-4 rounded border mb-1"
                              style={{ backgroundColor: value }}
                            />
                            <div className="truncate">{key}</div>
                            <div className="font-mono opacity-70">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </AdaptiveCard>
          </div>
        </div>

        {/* === AÇÕES RÁPIDAS === */}
        <div className="flex justify-center space-x-4">
          <SmartButton variant="secondary" onClick={saveCustomTheme}>
            <Wand2 className="h-4 w-4 mr-2" />
            Salvar como Personalizado
          </SmartButton>
          
          <SmartButton variant="secondary">
            <Upload className="h-4 w-4 mr-2" />
            Importar Tema
          </SmartButton>
          
          <SmartButton variant="primary" size="lg" onClick={applyTheme}>
            <Settings className="h-4 w-4 mr-2" />
            Aplicar Configurações
          </SmartButton>
        </div>
      </div>
    </div>
  )
}