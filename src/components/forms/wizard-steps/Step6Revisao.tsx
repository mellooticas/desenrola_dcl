'use client'

import { CheckCircle2, Eye, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { WizardData } from '../NovaOrdemWizard'

interface Step6Props {
  data: WizardData
}

export function Step6Revisao({ data }: Step6Props) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Eye className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Revisão do Pedido</h3>
        <p className="text-sm text-muted-foreground">
          Confira todos os dados antes de finalizar
        </p>
      </div>

      {/* Tipo de Pedido */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Tipo de Pedido
        </h4>
        <Badge variant="default" className="text-base">
          {data.tipo_pedido}
        </Badge>
        {data.tipo_servico && (
          <p className="text-sm mt-2">
            <strong>Serviço:</strong> {data.tipo_servico}
          </p>
        )}
      </div>

      {/* Dados da Loja */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Loja e OS</h4>
        <div className="p-3 bg-muted/50 rounded text-sm space-y-1">
          <p><strong>Loja:</strong> {data.loja_id}</p>
          <p><strong>OS Física:</strong> {data.numero_os_fisica}</p>
        </div>
      </div>

      {/* Armação (condicional) */}
      {(data.tipo_pedido === 'ARMACAO' || data.tipo_pedido === 'COMPLETO') && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Armação</h4>
            <div className="p-3 bg-muted/50 rounded text-sm space-y-1">
              {data.cliente_trouxe_armacao ? (
                <p className="text-orange-600">
                  ⚠️ Cliente trouxe armação própria
                </p>
              ) : data.armacao_dados ? (
                <>
                  <p><strong>SKU:</strong> {data.armacao_dados.sku_visual}</p>
                  <p><strong>Descrição:</strong> {data.armacao_dados.descricao}</p>
                  <p><strong>Valor:</strong> R$ {data.armacao_dados.preco_venda.toFixed(2)}</p>
                </>
              ) : (
                <p className="text-muted-foreground italic">Não selecionada</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Lentes (condicional) */}
      {(data.tipo_pedido === 'LENTES' || data.tipo_pedido === 'COMPLETO') && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Lentes</h4>
            {data.lente_dados ? (
              <div className="p-3 bg-muted/50 rounded text-sm space-y-1">
                <p><strong>Lente:</strong> {data.lente_dados.nome_lente}</p>
                <p><strong>Grupo:</strong> {data.lente_dados.nome_grupo}</p>
                <p><strong>Fornecedor:</strong> {data.lente_dados.fornecedor_nome}</p>
                <p><strong>Custo:</strong> R$ {data.lente_dados.preco_custo.toFixed(2)}</p>
                <p><strong>Prazo:</strong> {data.lente_dados.prazo_dias} dias úteis</p>
              </div>
            ) : (
              <div className="p-3 bg-muted/50 rounded text-sm text-muted-foreground italic">
                Não selecionada
              </div>
            )}
          </div>
        </>
      )}

      {/* Cliente */}
      <Separator />
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Cliente</h4>
        <div className="p-3 bg-muted/50 rounded text-sm space-y-1">
          <p><strong>Nome:</strong> {data.cliente_nome || '-'}</p>
          <p><strong>Telefone:</strong> {data.cliente_telefone || '-'}</p>
          {data.cliente_cpf && <p><strong>CPF:</strong> {data.cliente_cpf}</p>}
        </div>
      </div>

      {/* SLA */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Prazo de Entrega</h4>
        <div className="p-3 bg-muted/50 rounded text-sm space-y-1">
          <p><strong>Prazo Lab:</strong> {data.lente_dados?.prazo_dias || data.sla_dias_lab} dias úteis</p>
          <p><strong>Margem Cliente:</strong> {data.sla_margem_cliente} dias</p>
          <p><strong>Prioridade:</strong> <Badge variant="outline">{data.prioridade}</Badge></p>
          {data.data_prometida_manual && (
            <p className="text-orange-600">
              ⚠️ Data manual definida: {new Date(data.data_prometida_manual).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {/* Garantia */}
      {data.eh_garantia && (
        <>
          <Separator />
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Pedido de Garantia</p>
                {data.observacoes_garantia && (
                  <p className="text-xs mt-1 text-muted-foreground">
                    {data.observacoes_garantia}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Observações */}
      {data.observacoes && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Observações</h4>
            <div className="p-3 bg-muted/50 rounded text-sm">
              {data.observacoes}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
