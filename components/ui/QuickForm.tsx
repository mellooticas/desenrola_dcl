/* ===================================================================
   ⚡ QUICKFORM SYSTEM v2.0
   Formulário que completa nova ordem em 6 segundos
   ================================================================== */

'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { SmartButton, QuickSaveButton, QuickCancelButton } from './SmartButton'
import { useIntelligentTheme } from '@/lib/contexts/IntelligentThemeContext'

// === TIPOS INTELIGENTES ===
interface QuickFormData {
  loja_id?: string
  laboratorio_id?: string
  classe_lente_id?: string
  cliente_nome?: string
  cliente_cpf?: string
  observacoes?: string
  prioridade?: 'NORMAL' | 'URGENTE' | 'RUSH'
  sla_calculado?: number
}

interface SmartSelectOption {
  id: string
  label: string
  searchTerms?: string[]
  recent?: boolean
  favorite?: boolean
  frequency?: number
  metadata?: any
}

interface QuickFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuickFormData) => Promise<void>
  initialData?: Partial<QuickFormData>
  
  // === DADOS PARA PREDICTIVE LOADING ===
  lojas: SmartSelectOption[]
  laboratorios: SmartSelectOption[]
  classesLente: SmartSelectOption[]
  
  // === CONFIGURAÇÕES ===
  autoFocus?: boolean
  predictiveDefaults?: boolean
  keyboardNavigation?: boolean
  targetTime?: number // em segundos (default: 6)
}

// === SMART SELECT COMPONENT ===
const SmartSelect: React.FC<{
  options: SmartSelectOption[]
  value?: string
  onChange: (value: string, option: SmartSelectOption) => void
  placeholder?: string
  autoFocus?: boolean
  onNext?: () => void
  searchTerm?: string
  onSearchChange?: (term: string) => void
}> = ({
  options,
  value,
  onChange,
  placeholder,
  autoFocus,
  onNext,
  searchTerm = '',
  onSearchChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const inputRef = useRef<HTMLInputElement>(null)
  const optionsRef = useRef<HTMLDivElement>(null)

  // === FILTRAR E ORDENAR OPÇÕES ===
  const filteredOptions = useMemo(() => {
    let filtered = options.filter(option =>
      option.label.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      option.searchTerms?.some(term => 
        term.toLowerCase().includes(localSearchTerm.toLowerCase())
      )
    )

    // Ordenar por relevância: favoritos > recentes > frequência > alfabético
    return filtered.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      if (a.recent && !b.recent) return -1
      if (!a.recent && b.recent) return 1
      if ((a.frequency || 0) > (b.frequency || 0)) return -1
      if ((a.frequency || 0) < (b.frequency || 0)) return 1
      return a.label.localeCompare(b.label)
    })
  }, [options, localSearchTerm])

  // === KEYBOARD NAVIGATION ===
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Tab':
        if (filteredOptions[highlightedIndex]) {
          e.preventDefault()
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }, [filteredOptions, highlightedIndex])

  const handleSelect = useCallback((option: SmartSelectOption) => {
    onChange(option.id, option)
    setIsOpen(false)
    setLocalSearchTerm(option.label)
    onNext?.()
  }, [onChange, onNext])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchTerm(value)
    onSearchChange?.(value)
    setIsOpen(true)
    setHighlightedIndex(0)
  }, [onSearchChange])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={localSearchTerm}
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-[var(--border-muted)] rounded-lg bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all smart-transition"
      />
      
      {isOpen && filteredOptions.length > 0 && (
        <div
          ref={optionsRef}
          className="absolute z-50 w-full mt-1 bg-[var(--bg-canvas)] border border-[var(--border-muted)] rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.id}
              className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors smart-transition ${
                index === highlightedIndex
                  ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                  : 'hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
              }`}
              onClick={() => handleSelect(option)}
            >
              <div className="flex items-center">
                <span>{option.label}</span>
                {option.favorite && <span className="ml-2 text-yellow-500">⭐</span>}
                {option.recent && <span className="ml-2 text-blue-500">🕐</span>}
              </div>
              {option.frequency && option.frequency > 0 && (
                <span className="text-xs text-[var(--text-tertiary)]">
                  {option.frequency}x
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// === QUICK FORM COMPONENT ===
export const QuickForm: React.FC<QuickFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = {},
  lojas,
  laboratorios,
  classesLente,
  autoFocus = true,
  predictiveDefaults = true,
  keyboardNavigation = true,
  targetTime = 6
}) => {
  
  const { currentTheme } = useIntelligentTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<QuickFormData>(initialData)
  const [startTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // === TIMER ===
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setInterval(() => {
      setElapsedTime((Date.now() - startTime) / 1000)
    }, 100)
    
    return () => clearInterval(timer)
  }, [isOpen, startTime])

  // === PREDICTIVE DEFAULTS ===
  const smartDefaults = useMemo(() => {
    if (!predictiveDefaults) return {}
    
    // TODO: Implementar ML baseado em histórico
    // Por agora, usar valores mais frequentes
    const mostUsedLoja = lojas.find(l => l.favorite) || lojas[0]
    const mostUsedLab = laboratorios.find(l => l.favorite) || laboratorios[0]
    
    return {
      loja_id: mostUsedLoja?.id,
      laboratorio_id: mostUsedLab?.id,
      prioridade: 'NORMAL' as const
    }
  }, [predictiveDefaults, lojas, laboratorios])

  // === CÁLCULO DE SLA INTELIGENTE ===
  const calculatedSLA = useMemo(() => {
    if (!formData.laboratorio_id || !formData.classe_lente_id) return null
    
    // TODO: Implementar cálculo real baseado no banco
    const baseSLA = 7 // dias
    const priorityMultiplier = {
      'NORMAL': 1,
      'URGENTE': 0.7,
      'RUSH': 0.5
    }
    
    return Math.ceil(baseSLA * priorityMultiplier[formData.prioridade || 'NORMAL'])
  }, [formData.laboratorio_id, formData.classe_lente_id, formData.prioridade])

  // === NAVIGATION ===
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  // === VALIDATION ===
  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.loja_id) newErrors.loja = 'Loja é obrigatória'
        break
      case 2:
        if (!formData.laboratorio_id) newErrors.laboratorio = 'Laboratório é obrigatório'
        break
      case 3:
        if (!formData.classe_lente_id) newErrors.classe = 'Classe de lente é obrigatória'
        break
      case 4:
        if (!formData.cliente_nome) newErrors.cliente_nome = 'Nome do cliente é obrigatório'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // === SUBMIT ===
  const handleSubmit = useCallback(async () => {
    if (!validateStep(4)) return
    
    setIsSubmitting(true)
    try {
      const finalData: QuickFormData = {
        ...smartDefaults,
        ...formData,
        sla_calculado: calculatedSLA || undefined
      }
      
      await onSubmit(finalData)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, smartDefaults, calculatedSLA, onSubmit, onClose, validateStep])

  // === KEYBOARD SHORTCUTS ===
  useEffect(() => {
    if (!keyboardNavigation || !isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        if (currentStep === 4) {
          handleSubmit()
        } else {
          if (validateStep(currentStep)) {
            nextStep()
          }
        }
      }
      
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [keyboardNavigation, isOpen, currentStep, handleSubmit, validateStep, nextStep, onClose])

  if (!isOpen) return null

  // === PROGRESS CALCULATION ===
  const progress = (currentStep / 4) * 100
  const timeColor = elapsedTime > targetTime ? 'text-red-500' : elapsedTime > targetTime * 0.8 ? 'text-orange-500' : 'text-green-500'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-canvas)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header com Timer */}
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              ⚡ Nova Ordem Ultra-Rápida
            </h2>
            <div className="flex items-center gap-4">
              <div className={`text-sm font-mono ${timeColor}`}>
                ⏱️ {elapsedTime.toFixed(1)}s / {targetTime}s
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[var(--bg-muted)] hover:bg-[var(--bg-subtle)] flex items-center justify-center transition-all smart-transition"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-[var(--bg-muted)] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-600)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)]">
            <span>Passo {currentStep} de 4</span>
            <span>{progress.toFixed(0)}% completo</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          
          {/* Step 1: Loja */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                🏪 Selecionar Loja
              </h3>
              <SmartSelect
                options={lojas}
                value={formData.loja_id}
                onChange={(value, option) => {
                  setFormData(prev => ({ ...prev, loja_id: value }))
                  setTimeout(nextStep, 100) // Auto-advance
                }}
                placeholder="Digite ou selecione a loja..."
                autoFocus={autoFocus}
              />
              {errors.loja && (
                <p className="text-sm text-red-500">{errors.loja}</p>
              )}
            </div>
          )}

          {/* Step 2: Laboratório */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                🔬 Laboratório
              </h3>
              <SmartSelect
                options={laboratorios}
                value={formData.laboratorio_id}
                onChange={(value, option) => {
                  setFormData(prev => ({ ...prev, laboratorio_id: value }))
                  setTimeout(nextStep, 100)
                }}
                placeholder="Selecione o laboratório..."
                autoFocus
              />
              {errors.laboratorio && (
                <p className="text-sm text-red-500">{errors.laboratorio}</p>
              )}
            </div>
          )}

          {/* Step 3: Classe de Lente */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                👓 Classe de Lente
              </h3>
              <SmartSelect
                options={classesLente}
                value={formData.classe_lente_id}
                onChange={(value, option) => {
                  setFormData(prev => ({ ...prev, classe_lente_id: value }))
                  setTimeout(nextStep, 100)
                }}
                placeholder="Selecione a classe..."
                autoFocus
              />
              {errors.classe && (
                <p className="text-sm text-red-500">{errors.classe}</p>
              )}
              
              {/* SLA Preview */}
              {calculatedSLA && (
                <div className="p-3 bg-[var(--bg-subtle)] rounded-lg">
                  <p className="text-sm text-[var(--text-secondary)]">
                    📅 SLA Calculado: <strong>{calculatedSLA} dias</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Dados Finais */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                👤 Dados do Cliente
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Nome do Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.cliente_nome || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente_nome: e.target.value }))}
                    placeholder="Nome completo"
                    autoFocus
                    className="w-full px-3 py-2 border border-[var(--border-muted)] rounded-lg bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-all smart-transition"
                  />
                  {errors.cliente_nome && (
                    <p className="text-sm text-red-500 mt-1">{errors.cliente_nome}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade || 'NORMAL'}
                    onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[var(--border-muted)] rounded-lg bg-[var(--bg-canvas)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-all smart-transition"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="RUSH">Rush</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  CPF (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.cliente_cpf || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_cpf: e.target.value }))}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-[var(--border-muted)] rounded-lg bg-[var(--bg-canvas)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-all smart-transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex space-x-2">
            {currentStep > 1 && (
              <SmartButton
                variant="ghost"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                ← Anterior
              </SmartButton>
            )}
          </div>
          
          <div className="flex space-x-2">
            <QuickCancelButton
              onClick={onClose}
              disabled={isSubmitting}
            />
            
            {currentStep < 4 ? (
              <SmartButton
                variant="primary"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    nextStep()
                  }
                }}
                disabled={isSubmitting}
                shortcut="Ctrl+Enter"
              >
                Próximo →
              </SmartButton>
            ) : (
              <QuickSaveButton
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Salvando..."
                shortcut="Ctrl+Enter"
              >
                🚀 Criar Ordem
              </QuickSaveButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}