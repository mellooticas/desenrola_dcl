'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Palette, Save, RotateCcw, Eye } from 'lucide-react'
import Link from 'next/link'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'

export default function PersonalizacaoPage() {
  const { currentTheme } = useIntelligentTheme()
  const [previewMode, setPreviewMode] = useState(false)
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  })

  // Temas predefinidos locais
  const availableThemes = [
    { id: 'ocean', name: 'Ocean Blue' },
    { id: 'forest', name: 'Forest Green' },
    { id: 'sunset', name: 'Sunset Orange' },
    { id: 'purple', name: 'Purple Dream' },
    { id: 'corporate', name: 'Corporate' }
  ]

  const handleColorChange = (colorType: string, value: string) => {
    setCustomColors(prev => ({ ...prev, [colorType]: value }))
  }

  const applyCustomTheme = () => {
    // Aqui você aplicaria o tema customizado
    console.log('Aplicando tema customizado:', customColors)
  }

  const resetTheme = () => {
    setCustomColors({
      primary: '#3b82f6',
      secondary: '#64748b', 
      accent: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/configuracoes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold theme-text">Personalização</h1>
            <p className="theme-text-muted">Configure a aparência e o tema do sistema</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            className={previewMode ? 'bg-blue-100 border-blue-300' : ''}
          >
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Preview Ativo' : 'Preview'}
          </Button>
          <Button onClick={resetTheme} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={applyCustomTheme} className="btn-primary">
            <Save className="h-4 w-4 mr-2" />
            Aplicar Tema
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Temas Predefinidos */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Temas Predefinidos
            </CardTitle>
            <CardDescription>Escolha um tema pronto para usar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableThemes.map((tema) => (
              <div
                key={tema.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  currentTheme.id === tema.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => console.log('Mudando para tema:', tema.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{tema.name}</h3>
                  <Badge variant="default">
                    {tema.name}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: '#3b82f6' }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: '#64748b' }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Personalização de Cores */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Cores Personalizadas</CardTitle>
            <CardDescription>Ajuste as cores do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primary">Cor Primária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primary"
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={customColors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="secondary">Cor Secundária</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondary"
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={customColors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1"
                    placeholder="#64748b"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent">Cor de Destaque</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accent"
                    type="color"
                    value={customColors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={customColors.accent}
                    onChange={(e) => handleColorChange('accent', e.target.value)}
                    className="flex-1"
                    placeholder="#8b5cf6"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="success">Cor de Sucesso</Label>
                <div className="flex space-x-2">
                  <Input
                    id="success"
                    type="color"
                    value={customColors.success}
                    onChange={(e) => handleColorChange('success', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={customColors.success}
                    onChange={(e) => handleColorChange('success', e.target.value)}
                    className="flex-1"
                    placeholder="#10b981"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="warning">Cor de Aviso</Label>
                <div className="flex space-x-2">
                  <Input
                    id="warning"
                    type="color"
                    value={customColors.warning}
                    onChange={(e) => handleColorChange('warning', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={customColors.warning}
                    onChange={(e) => handleColorChange('warning', e.target.value)}
                    className="flex-1"
                    placeholder="#f59e0b"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="error">Cor de Erro</Label>
                <div className="flex space-x-2">
                  <Input
                    id="error"
                    type="color"
                    value={customColors.error}
                    onChange={(e) => handleColorChange('error', e.target.value)}
                    className="w-12 h-10 p-1 border rounded"
                  />
                  <Input
                    value={customColors.error}
                    onChange={(e) => handleColorChange('error', e.target.value)}
                    className="flex-1"
                    placeholder="#ef4444"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview em Tempo Real */}
        <Card className="theme-card">
          <CardHeader>
            <CardTitle>Preview do Tema</CardTitle>
            <CardDescription>Visualização das mudanças</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botões de exemplo */}
            <div className="space-y-2">
              <h4 className="font-medium">Botões</h4>
              <div className="flex space-x-2">
                <Button style={{ backgroundColor: customColors.primary }}>Primário</Button>
                <Button variant="secondary" style={{ backgroundColor: customColors.secondary }}>Secundário</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            {/* Card de exemplo */}
            <div className="space-y-2">
              <h4 className="font-medium">Card de Exemplo</h4>
              <div className="p-4 border rounded-lg bg-white shadow-sm">
                <h5 className="font-medium">Título do Card</h5>
                <p className="text-sm text-gray-600">
                  Este é um exemplo de como os cards aparecerão com o tema atual.
                </p>
                <div className="flex space-x-2 mt-2">
                  <Badge style={{ backgroundColor: customColors.success, color: 'white' }}>Sucesso</Badge>
                  <Badge style={{ backgroundColor: customColors.warning, color: 'white' }}>Aviso</Badge>
                  <Badge style={{ backgroundColor: customColors.error, color: 'white' }}>Erro</Badge>
                </div>
              </div>
            </div>

            {/* Input de exemplo */}
            <div className="space-y-2">
              <h4 className="font-medium">Input de Exemplo</h4>
              <Input 
                type="text" 
                placeholder="Digite algo aqui..." 
                className="w-full"
              />
            </div>

            {/* Informações do tema atual */}
            <div className="space-y-2">
              <h4 className="font-medium">Tema Atual</h4>
              <div className="p-3 bg-gray-50 rounded border text-sm space-y-1">
                <p><strong>Nome:</strong> {currentTheme.name}</p>
                <p><strong>Primária:</strong> {customColors.primary}</p>
                <p><strong>Secundária:</strong> {customColors.secondary}</p>
                <p><strong>Sucesso:</strong> {customColors.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}