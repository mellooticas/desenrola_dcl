'use client'

/**
 * 🧙‍♂️ NovaOrdemWizard - Wizard de 7 Passos para Criar Pedido Multimodal
 * 
 * Fluxo completo:
 * 1. Loja + OS Física
 * 2. Tipo de Serviço (LENTES, ARMACAO, COMPLETO, SERVICO)
 * 3. Armação (condicional: se ARMACAO ou COMPLETO)
 * 4. Lentes (condicional: se LENTES ou COMPLETO)
 * 5. Cliente + SLA
 * 6. Revisão
 * 7. Confirmação/Salvar
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

// Steps
import { Step1LojaOS } from './wizard-steps/Step1LojaOS'
import { Step2TipoServico } from './wizard-steps/Step2TipoServico'
import { Step3Armacao } from './wizard-steps/Step3Armacao'
import { Step4Lentes } from './wizard-steps/Step4Lentes'
import { Step5ClienteSLA } from './wizard-steps/Step5ClienteSLA'
import { Step6Revisao } from './wizard-steps/Step6Revisao'
import { Step7Confirmacao } from './wizard-steps/Step7Confirmacao'
import { SeletorServicos } from '../pedidos/novo/SeletorServicos'
import { SeletorAcessorios } from '../pedidos/novo/SeletorAcessorios'

export type TipoPedido = 'LENTES' | 'ARMACAO' | 'COMPLETO' | 'SERVICO' | 'LENTES_CONTATO'

export interface WizardData {
  // Step 1
  loja_id: string
  numero_os_fisica: string
  
  // Step 2
  tipo_pedido: TipoPedido | null
  tipo_servico?: string // Só se tipo = SERVICO
  
  // Step 3 (condicional)
  armacao_id: string | null
  armacao_dados?: {
    sku: string
    sku_visual: string
    descricao: string
    preco_custo?: number
    preco_tabela: number
    preco_venda_real?: number // Preço que realmente foi vendido (com desconto)
  }
  cliente_trouxe_armacao: boolean
  
  // Step 4 (condicional)
  tipo_fonte_lente?: 'CANONICA' | 'LABORATORIO' | 'LENTES_CONTATO' // Escolha entre grupos canônicos, laboratório direto ou lentes de contato
  lente_selecionada_id: string | null
  lente_dados?: {
    nome_lente: string
    nome_grupo: string
    fornecedor_id: string
    fornecedor_nome: string
    preco_custo: number
    preco_tabela: number
    preco_venda_real?: number // Preço que realmente foi vendido (com desconto)
    prazo_dias: number
  }
  grupo_canonico_id: string | null
  fornecedor_lente_id: string | null
  classe_lente_id: string | null
  
  // Step 5
  cliente_nome: string
  cliente_telefone: string
  cliente_cpf?: string
  sla_dias_lab: number
  sla_margem_cliente: number
  data_prometida_manual?: string
  prioridade: 'NORMAL' | 'URGENTE' | 'CRITICA'
  
  // Serviços e Acessórios (opcionais)
  servico_selecionado?: {
    produto_id: string
    sku_visual: string
    descricao: string
    preco_venda: number
    custo: number
    preco_final: number
    desconto_percentual: number
  }
  montador_id?: string // Quem fez a montagem
  acessorios_selecionados?: Array<{
    produto_id: string
    sku_visual: string
    descricao: string
    preco_venda: number
    custo: number
    quantidade: number
    subtotal: number
  }>
  
  // Step 6 (revisão - sem campos, apenas exibe)
  
  // Campos gerais
  observacoes?: string
  eh_garantia: boolean
  observacoes_garantia?: string
  numero_pedido_laboratorio?: string
}

interface NovaOrdemWizardProps {
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showTrigger?: boolean
  triggerLabel?: string
  initialNumeroOsFisica?: string
}

export function NovaOrdemWizard({
  onSuccess,
  open: openProp,
  onOpenChange,
  showTrigger = true,
  triggerLabel = 'Nova Ordem',
  initialNumeroOsFisica,
}: NovaOrdemWizardProps) {
  const { userProfile } = useAuth()
  const [openInternal, setOpenInternal] = useState(false)
  const isControlled = typeof openProp === 'boolean'
  const open = isControlled ? openProp : openInternal
  
  const setOpen = (next: boolean) => {
    if (!isControlled) setOpenInternal(next)
    onOpenChange?.(next)
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pedidoCriado, setPedidoCriado] = useState<any>(null) // Armazena pedido após criação
  
  const [data, setData] = useState<WizardData>({
    loja_id: '',
    numero_os_fisica: initialNumeroOsFisica || '',
    tipo_pedido: null,
    cliente_trouxe_armacao: false,
    armacao_id: null,
    lente_selecionada_id: null,
    grupo_canonico_id: null,
    fornecedor_lente_id: null,
    classe_lente_id: null,
    cliente_nome: '',
    cliente_telefone: '',
    sla_dias_lab: 7,
    sla_margem_cliente: 2,
    prioridade: 'NORMAL',
    eh_garantia: false,
  })

  // Atualiza OS inicial quando prop muda
  useEffect(() => {
    if (initialNumeroOsFisica) {
      setData(prev => ({ ...prev, numero_os_fisica: initialNumeroOsFisica }))
    }
  }, [initialNumeroOsFisica])

  // Calcula quantos steps são necessários baseado no tipo
  const getTotalSteps = () => {
    if (!data.tipo_pedido) return 7 // Valor padrão
    
    const baseSteps = 5 // 1.Loja, 2.Tipo, 5.Cliente, 6.Revisão, 7.Confirmação
    let conditionalSteps = 0
    
    if (data.tipo_pedido === 'ARMACAO' || data.tipo_pedido === 'COMPLETO') {
      conditionalSteps += 1 // Step 3
    }
    if (data.tipo_pedido === 'LENTES' || data.tipo_pedido === 'COMPLETO' || data.tipo_pedido === 'LENTES_CONTATO') {
      conditionalSteps += 1 // Step 4
    }
    
    return baseSteps + conditionalSteps
  }

  const totalSteps = getTotalSteps()
  const progressPercent = (currentStep / totalSteps) * 100

  // Lógica de navegação: pula steps condicionais
  const getNextStep = (current: number): number => {
    if (current === 2) {
      // Após escolher tipo, redireciona
      if (data.tipo_pedido === 'LENTES' || data.tipo_pedido === 'LENTES_CONTATO') return 4 // Pula armação
      if (data.tipo_pedido === 'ARMACAO') return 3 // Vai p/ armação, pula lentes
      if (data.tipo_pedido === 'COMPLETO') return 3 // Armação primeiro
      if (data.tipo_pedido === 'SERVICO') return 5 // Pula ambos
    }
    if (current === 3 && data.tipo_pedido === 'ARMACAO') return 5 // Pula lentes
    if (current === 4 && (data.tipo_pedido === 'LENTES' || data.tipo_pedido === 'LENTES_CONTATO')) return 5 // Vai direto p/ cliente
    
    return current + 1
  }

  const getPrevStep = (current: number): number => {
    if (current === 5) {
      if (data.tipo_pedido === 'SERVICO') return 2
      if (data.tipo_pedido === 'LENTES' || data.tipo_pedido === 'LENTES_CONTATO') return 4
      if (data.tipo_pedido === 'ARMACAO') return 3
      if (data.tipo_pedido === 'COMPLETO') return 4
    }
    if (current === 4 && data.tipo_pedido === 'COMPLETO') return 3
    if (current === 3) return 2
    
    return current - 1
  }

  const handleNext = () => {
    const next = getNextStep(currentStep)
    setCurrentStep(next)
  }

  const handlePrev = () => {
    const prev = getPrevStep(currentStep)
    setCurrentStep(prev)
  }

  const handleSalvar = async () => {
    setLoading(true)
    try {
      console.log('[NovaOrdemWizard] Salvando pedido:', data)
      
      // Preparar dados base
      const pedidoData: any = {
        // Campos obrigatórios
        loja_id: data.loja_id,
        numero_os_fisica: data.numero_os_fisica,
        tipo_pedido: data.tipo_pedido,
        cliente_nome: data.cliente_nome,
        cliente_telefone: data.cliente_telefone,
        prioridade: data.prioridade,
        
        // Status: PRONTO (Lentes no DCL) para SERVICO e ARMACAO
        // REGISTRADO para LENTES, COMPLETO e LENTES_CONTATO
        status: (data.tipo_pedido === 'SERVICO' || data.tipo_pedido === 'ARMACAO')
          ? 'PRONTO'      // 🔧 Vai para coluna "Lentes no DCL" (SERVICO e ARMACAO)
          : 'REGISTRADO', // 📦 Vai para coluna "Registrado" (LENTES, COMPLETO, LENTES_CONTATO)
        
        // Campos gerais
        observacoes: data.observacoes,
        eh_garantia: data.eh_garantia,
        observacoes_garantia: data.eh_garantia ? data.observacoes_garantia : null,
        numero_pedido_laboratorio: data.numero_pedido_laboratorio,
        
        // Auditoria
        created_by: userProfile?.id,
      }

      // Campos condicionais por tipo de pedido
      if (data.tipo_pedido === 'ARMACAO' || data.tipo_pedido === 'COMPLETO') {
        console.log('[Wizard] 🛍️ Salvando armação:', {
          armacao_id: data.armacao_id,
          cliente_trouxe: data.cliente_trouxe_armacao,
          armacao_dados: data.armacao_dados
        })
        
        pedidoData.armacao_id = data.armacao_id
        pedidoData.origem_armacao = data.cliente_trouxe_armacao ? 'cliente_trouxe' : 'estoque'
        
        // Preços da armação
        if (data.armacao_dados) {
          pedidoData.preco_armacao = data.armacao_dados.preco_venda_real || data.armacao_dados.preco_tabela
          pedidoData.custo_armacao = data.armacao_dados.preco_custo || 0
          
          console.log('[Wizard] 💰 Preços armação:', {
            preco_venda_real: data.armacao_dados.preco_venda_real,
            preco_tabela: data.armacao_dados.preco_tabela,
            custo: data.armacao_dados.preco_custo,
            salvando_preco: pedidoData.preco_armacao
          })
        } else {
          console.warn('[Wizard] ⚠️ armacao_dados está undefined!')
        }
      }

      if (data.tipo_pedido === 'LENTES' || data.tipo_pedido === 'COMPLETO') {
        pedidoData.lente_selecionada_id = data.lente_selecionada_id
        pedidoData.grupo_canonico_id = data.grupo_canonico_id
        
        // 🔄 CONVERSÃO: fornecedor_id (SIS_LENS) → laboratorio_id (DESENROLA_DCL)
        // UUIDs são DIFERENTES entre os bancos, precisa converter via função
        const fornecedorIdSisLens = data.fornecedor_lente_id || data.lente_dados?.fornecedor_id
        
        if (fornecedorIdSisLens) {
          // Chamar função PostgreSQL para converter UUID
          const { data: resultado, error: erroConversao } = await supabase.rpc(
            'converter_fornecedor_para_laboratorio',
            { p_fornecedor_id_sis_lens: fornecedorIdSisLens }
          )
          
          if (erroConversao) {
            console.error('[NovaOrdemWizard] ❌ Erro ao converter fornecedor→laboratorio:', erroConversao)
            throw new Error(`Erro ao converter laboratório: ${erroConversao.message}`)
          }
          
          if (!resultado) {
            console.error('[NovaOrdemWizard] ❌ Fornecedor não mapeado:', fornecedorIdSisLens)
            throw new Error(`Laboratório não encontrado para o fornecedor selecionado`)
          }
          
          pedidoData.laboratorio_id = resultado
          console.log('[NovaOrdemWizard] ✅ Conversão:', { fornecedorIdSisLens, laboratorio_id: resultado })
        } else if (data.fornecedor_lente_id) {
          // Fallback: tentar conversão direto do fornecedor_lente_id
          const { data: resultadoFallback, error: erroFallback } = await supabase.rpc(
            'converter_fornecedor_para_laboratorio',
            { p_fornecedor_id_sis_lens: data.fornecedor_lente_id }
          )
          if (!erroFallback && resultadoFallback) {
            pedidoData.laboratorio_id = resultadoFallback
          }
        }
        
        // Valores/Preços das lentes
        if (data.lente_dados) {
          pedidoData.preco_lente = data.lente_dados.preco_venda_real || data.lente_dados.preco_tabela
          pedidoData.custo_lente = data.lente_dados.preco_custo || 0
        }
        pedidoData.classe_lente_id = data.classe_lente_id
        
        // SLA baseado no prazo do laboratório
        const prazoLab = data.lente_dados?.prazo_dias || data.sla_dias_lab
        pedidoData.prazo_laboratorio_dias = prazoLab
        pedidoData.margem_cliente_dias = data.sla_margem_cliente
        
        // Calcular data prometida se não foi manual
        if (data.data_prometida_manual) {
          pedidoData.data_prometida = data.data_prometida_manual
        }
      }

      if (data.tipo_pedido === 'SERVICO') {
        pedidoData.tipo_servico = data.tipo_servico
      }

      // 🔧 SERVIÇOS ADICIONAIS (opcional para qualquer tipo de pedido)
      if (data.servico_selecionado) {
        console.log('[Wizard] 🔧 Salvando serviço:', data.servico_selecionado)
        
        pedidoData.servico_produto_id = data.servico_selecionado.produto_id
        pedidoData.servico_sku_visual = data.servico_selecionado.sku_visual
        pedidoData.servico_descricao = data.servico_selecionado.descricao
        pedidoData.servico_preco_tabela = data.servico_selecionado.preco_venda
        pedidoData.servico_desconto_percentual = data.servico_selecionado.desconto_percentual
        pedidoData.servico_preco_final = data.servico_selecionado.preco_final
        pedidoData.servico_custo = data.servico_selecionado.custo
        
        // Montador (se houver)
        if (data.montador_id) {
          pedidoData.montador_nome = data.montador_id // Por enquanto salva como texto
          console.log('[Wizard] 👷 Montador:', data.montador_id)
        }
        
        console.log('[Wizard] 💰 Preços serviço:', {
          preco_tabela: data.servico_selecionado.preco_venda,
          desconto: data.servico_selecionado.desconto_percentual + '%',
          preco_final: data.servico_selecionado.preco_final,
          custo: data.servico_selecionado.custo
        })
      }
      
      // Log do status definido
      console.log('[Wizard] 📍 Status definido:', {
        status: pedidoData.status,
        tipo_pedido: data.tipo_pedido,
        motivo: pedidoData.status === 'PRONTO' 
          ? '🔧 SERVICO ou ARMACAO - vai para "Lentes no DCL"' 
          : '📦 LENTES/COMPLETO/LENTES_CONTATO - vai para "Registrado"'
      })

      console.log('[NovaOrdemWizard] Dados preparados para insert:', pedidoData)

      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert(pedidoData)
        .select()
        .single()

      if (error) {
        console.error('[NovaOrdemWizard] Erro do Supabase:', error)
        throw error
      }

      console.log('[NovaOrdemWizard] ✅ Pedido criado:', pedido)
      setPedidoCriado(pedido) // Armazena pedido criado
      setCurrentStep(7) // Vai para confirmação
      onSuccess?.()
    } catch (error: any) {
      console.error('[NovaOrdemWizard] ❌ Erro ao salvar:', error)
      alert(`Erro ao salvar pedido: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1LojaOS data={data} onChange={setData} />
      case 2:
        return <Step2TipoServico data={data} onChange={setData} />
      case 3:
        return <Step3Armacao data={data} onChange={setData} />
      case 4:
        return <Step4Lentes data={data} onChange={setData} />
      case 5:
        return <Step5ClienteSLA data={data} onChange={setData} />
      case 6:
        return <Step6Revisao data={data} />
      case 7:
        return <Step7Confirmacao pedido={pedidoCriado} onClose={() => setOpen(false)} />
      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.loja_id && data.numero_os_fisica
      case 2:
        return data.tipo_pedido !== null
      case 3:
        return data.cliente_trouxe_armacao || data.armacao_id !== null
      case 4:
        return data.lente_selecionada_id !== null
      case 5:
        return data.cliente_nome && data.cliente_telefone
      case 6:
        return true // Revisão sempre pode avançar
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {triggerLabel}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 7 ? '✅ Pedido Criado!' : 'Nova Ordem de Serviço'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        {currentStep < 7 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Passo {currentStep} de {totalSteps}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < 7 && (
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            {currentStep === 6 ? (
              <Button onClick={handleSalvar} disabled={loading}>
                {loading ? 'Salvando...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar Pedido
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
