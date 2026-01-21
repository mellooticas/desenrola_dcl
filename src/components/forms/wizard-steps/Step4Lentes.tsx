/**
 * 🔍 Step 4: Seleção de Lentes
 * 
 * FASE 1: Escolher grupo canônico (premium vs genéricas)
 * FASE 2: Escolher lente específica do grupo (por fornecedor/preço)
 */

'use client'

import { useState } from 'react'
import { Glasses, Package, ArrowRight, DollarSign } from 'lucide-react'
import { SeletorGruposLentes } from './components/SeletorGruposLentes'
import { SeletorLentesDetalhadas } from './components/SeletorLentesDetalhadas'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardData } from '../NovaOrdemWizard'

interface Step4Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

export function Step4Lentes({ data, onChange }: Step4Props) {
  // Estado interno: qual grupo foi selecionado
  const [grupoSelecionado, setGrupoSelecionado] = useState<string | null>(
    data.grupo_canonico_id || null
  )
  const [nomeGrupoSelecionado, setNomeGrupoSelecionado] = useState<string>('')

  // Handler: seleção do grupo
  const handleSelecionarGrupo = (grupoId: string, nomeGrupo: string) => {
    console.log('[Step4Lentes] Grupo selecionado:', grupoId, nomeGrupo)
    setGrupoSelecionado(grupoId)
    setNomeGrupoSelecionado(nomeGrupo)
    
    // Atualiza wizard com grupo selecionado
    onChange({
      ...data,
      grupo_canonico_id: grupoId,
    })
  }

  // Handler: seleção da lente específica
  const handleSelecionarLente = (
    lenteId: string,
    fornecedorId: string,
    precoCusto: number,
    precoTabela: number,
    prazo: number,
    nomeLente: string,
    fornecedorNome: string
  ) => {
    console.log('[Step4Lentes] Lente selecionada:', { 
      lenteId, fornecedorId, precoCusto, precoTabela, prazo 
    })
    
    onChange({
      ...data,
      lente_selecionada_id: lenteId,
      fornecedor_lente_id: fornecedorId,
      lente_dados: {
        ...data.lente_dados,
        nome_lente: nomeLente,
        nome_grupo: nomeGrupoSelecionado,
        fornecedor_id: fornecedorId,
        fornecedor_nome: fornecedorNome,
        preco_custo: precoCusto,
        preco_tabela: precoTabela,
        preco_venda_real: precoTabela, // Inicializa com preço tabela
        prazo_dias: prazo,
      },
    })
  }

  // Handler: alterar preço de venda real
  const handlePrecoVendaRealChange = (valor: number) => {
    if (data.lente_dados) {
      onChange({
        ...data,
        lente_dados: {
          ...data.lente_dados,
          preco_venda_real: valor,
        },
      })
    }
  }

  // Voltar para seleção de grupo
  const handleVoltarParaGrupos = () => {
    setGrupoSelecionado(null)
    setNomeGrupoSelecionado('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4">
        <Glasses className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Selecionar Lentes</h3>
        <p className="text-sm text-muted-foreground">
          {!grupoSelecionado
            ? 'Escolha o tipo de lente (premium ou genérica)'
            : 'Selecione o fornecedor e prazo de entrega'}
        </p>
      </div>

      {/* Breadcrumb de navegação */}
      {grupoSelecionado && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoltarParaGrupos}
            className="h-auto py-1 px-2 hover:bg-background"
          >
            <Package className="h-4 w-4 mr-1" />
            Voltar aos Grupos
          </Button>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="font-normal">
            {nomeGrupoSelecionado}
          </Badge>
        </div>
      )}

      {/* FASE 1: Seleção de Grupo Canônico */}
      {!grupoSelecionado && (
        <SeletorGruposLentes
          onSelecionarGrupo={handleSelecionarGrupo}
          grupoSelecionadoId={grupoSelecionado}
        />
      )}

      {/* FASE 2: Seleção de Lente Específica */}
      {grupoSelecionado && (
        <SeletorLentesDetalhadas
          grupoCanonicoId={grupoSelecionado}
          lenteSelecionadaId={data.lente_selecionada_id}
          onSelecionarLente={handleSelecionarLente}
        />
      )}

      {/* Resumo da seleção completa */}
      {data.lente_selecionada_id && data.lente_dados && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg space-y-4">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
            <Package className="h-4 w-4" />
            ✓ Lente Selecionada
          </h4>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="col-span-2">
              <span className="text-muted-foreground">Lente:</span>
              <p className="font-medium">{data.lente_dados.nome_lente || nomeGrupoSelecionado}</p>
            </div>
            
            {data.lente_dados.fornecedor_nome && (
              <div>
                <span className="text-muted-foreground">Fornecedor:</span>
                <p className="font-medium">{data.lente_dados.fornecedor_nome}</p>
              </div>
            )}
            
            <div>
              <span className="text-muted-foreground">Prazo:</span>
              <p className="font-medium">{data.lente_dados.prazo_dias} dias úteis</p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Custo:</span>
              <p className="font-medium text-orange-600 dark:text-orange-400">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(data.lente_dados.preco_custo)}
              </p>
            </div>
            
            <div>
              <span className="text-muted-foreground">Preço Tabela:</span>
              <p className="font-medium text-blue-600 dark:text-blue-400">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(data.lente_dados.preco_tabela)}
              </p>
            </div>
          </div>

          {/* Input: Preço Real de Venda */}
          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              <span>Preço de Venda Real</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Custo</Label>
                <div className="font-mono text-sm">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.lente_dados.preco_custo)}
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Preço Tabela</Label>
                <div className="font-mono text-sm">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.lente_dados.preco_tabela)}
                </div>
              </div>
              
              <div>
                <Label htmlFor="preco-venda-real-lente">
                  Preço de Venda Real <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="preco-venda-real-lente"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={data.lente_dados.preco_venda_real || ''}
                  onChange={(e) => handlePrecoVendaRealChange(parseFloat(e.target.value) || 0)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Com desconto aplicado
                </p>
              </div>
            </div>
            
            {data.lente_dados.preco_venda_real && (
              <div className="bg-muted p-3 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margem:</span>
                  <span className="font-semibold">
                    {((data.lente_dados.preco_venda_real - data.lente_dados.preco_custo) / data.lente_dados.preco_venda_real * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Lucro:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(data.lente_dados.preco_venda_real - data.lente_dados.preco_custo)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
