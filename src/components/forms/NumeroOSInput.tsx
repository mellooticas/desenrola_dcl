// =====================================================
// COMPONENTE: Input de Número de OS com Validação
// =====================================================
// Input inteligente que valida duplicidade em tempo real
// e sugere próximo número disponível

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Lightbulb,
  AlertTriangle 
} from 'lucide-react'
import { useValidacaoNumeroOS } from '@/lib/hooks/useValidacaoNumeroOS'
import { cn } from '@/lib/utils'

interface NumeroOSInputProps {
  value: string
  onChange: (value: string) => void
  lojaId: string
  pedidoIdAtual?: string // Para edição
  prefixo?: string // Prefixo padrão (ex: 'OS-')
  obrigatorio?: boolean
  disabled?: boolean
  className?: string
  label?: string
  placeholder?: string
}

export function NumeroOSInput({
  value,
  onChange,
  lojaId,
  pedidoIdAtual,
  prefixo,
  obrigatorio = false,
  disabled = false,
  className,
  label = 'Número da OS Física',
  placeholder = 'Ex: 1234 ou deixe vazio'
}: NumeroOSInputProps) {
  const { validarNumeroOS, buscarProximoNumero, validando } = useValidacaoNumeroOS()
  
  const [validacaoResult, setValidacaoResult] = useState<{
    isValid: boolean
    mensagem?: string
  } | null>(null)
  const [mostrarSugestao, setMostrarSugestao] = useState(false)
  const [sugestaoNumero, setSugestaoNumero] = useState<string | null>(null)

  // Validação com debounce quando usuário digita
  useEffect(() => {
    if (!lojaId) return

    const timer = setTimeout(async () => {
      if (value.trim() === '') {
        setValidacaoResult(null)
        setMostrarSugestao(false)
        return
      }

      const resultado = await validarNumeroOS(value, lojaId, pedidoIdAtual)
      setValidacaoResult(resultado)
      
      // Se inválido, mostrar sugestão
      if (!resultado.isValid) {
        setMostrarSugestao(true)
      }
    }, 800) // Debounce de 800ms

    return () => clearTimeout(timer)
  }, [value, lojaId, pedidoIdAtual, validarNumeroOS])

  // Buscar sugestão quando solicitado
  const handleBuscarSugestao = useCallback(async () => {
    const resultado = await buscarProximoNumero(lojaId, prefixo)
    
    if (resultado.numero) {
      setSugestaoNumero(resultado.numero)
      setMostrarSugestao(true)
    } else {
      setSugestaoNumero(null)
      setMostrarSugestao(false)
    }
  }, [lojaId, prefixo, buscarProximoNumero])

  // Aplicar sugestão
  const handleAplicarSugestao = useCallback(() => {
    if (sugestaoNumero) {
      onChange(sugestaoNumero)
      setMostrarSugestao(false)
      setSugestaoNumero(null)
    }
  }, [sugestaoNumero, onChange])

  // Determinar estado visual
  const getEstadoVisual = () => {
    if (validando) return 'validando'
    if (!value.trim()) return 'vazio'
    if (validacaoResult?.isValid) return 'valido'
    if (validacaoResult?.isValid === false) return 'invalido'
    return 'neutro'
  }

  const estadoVisual = getEstadoVisual()

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label com indicador de obrigatoriedade */}
      <div className="flex items-center justify-between">
        <Label htmlFor="numero_os_fisica" className="flex items-center gap-2">
          {label}
          {obrigatorio && <span className="text-red-500">*</span>}
        </Label>

        {/* Botão de sugestão */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBuscarSugestao}
          disabled={disabled}
          className="h-auto py-1 text-xs"
        >
          <Lightbulb className="w-3 h-3 mr-1" />
          Sugerir número
        </Button>
      </div>

      {/* Input com ícone de status */}
      <div className="relative">
        <Input
          id="numero_os_fisica"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-10',
            estadoVisual === 'valido' && 'border-green-500 focus:ring-green-500',
            estadoVisual === 'invalido' && 'border-red-500 focus:ring-red-500'
          )}
        />

        {/* Ícone de status */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {validando && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {!validando && estadoVisual === 'valido' && (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          )}
          {!validando && estadoVisual === 'invalido' && (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      </div>

      {/* Mensagem de validação */}
      {validacaoResult && !validacaoResult.isValid && (
        <Alert variant="destructive" className="py-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {validacaoResult.mensagem}
          </AlertDescription>
        </Alert>
      )}

      {/* Mensagem de sucesso */}
      {validacaoResult && validacaoResult.isValid && value.trim() !== '' && (
        <Alert className="py-2 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-700 dark:text-green-400">
            Número de OS disponível
          </AlertDescription>
        </Alert>
      )}

      {/* Sugestão de número */}
      {mostrarSugestao && sugestaoNumero && (
        <Alert className="py-2 border-blue-500 bg-blue-50 dark:bg-blue-950">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 dark:text-blue-400">
                Próximo número disponível: <strong>{sugestaoNumero}</strong>
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAplicarSugestao}
                className="ml-2 h-auto py-1 text-xs border-blue-500 text-blue-700"
              >
                Usar este
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Texto de ajuda */}
      <p className="text-xs text-muted-foreground">
        {obrigatorio 
          ? 'Digite o número da OS ou use a sugestão automática'
          : 'Opcional: Deixe vazio para não vincular a uma OS física'
        }
      </p>
    </div>
  )
}
