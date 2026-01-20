'use client'

import { Glasses } from 'lucide-react'
import { LenteSelector } from '@/components/lentes/LenteSelector'
import type { WizardData } from '../NovaOrdemWizard'

interface Step4Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

export function Step4Lentes({ data, onChange }: Step4Props) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Glasses className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Selecionar Lentes</h3>
        <p className="text-sm text-muted-foreground">
          Busque no catálogo e escolha o fornecedor/laboratório
        </p>
      </div>

      <LenteSelector
        onSelect={(lenteData) => {
          onChange({
            ...data,
            lente_selecionada_id: lenteData.lente_id,
            grupo_canonico_id: lenteData.grupo_canonico_id,
            fornecedor_lente_id: lenteData.fornecedor_id,
            lente_dados: {
              nome_lente: lenteData.nome_lente,
              nome_grupo: lenteData.nome_grupo,
              fornecedor_id: lenteData.fornecedor_id,
              fornecedor_nome: lenteData.fornecedor_nome,
              preco_custo: lenteData.preco_custo,
              prazo_dias: lenteData.prazo_dias,
            },
          })
        }}
        grupoSelecionadoId={data.grupo_canonico_id}
      />

      {/* Resumo da seleção */}
      {data.lente_dados && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h4 className="font-medium text-sm mb-2">✓ Lente Selecionada:</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Lente:</strong> {data.lente_dados.nome_lente}</p>
            <p><strong>Fornecedor:</strong> {data.lente_dados.fornecedor_nome}</p>
            <p><strong>Custo:</strong> R$ {data.lente_dados.preco_custo.toFixed(2)}</p>
            <p><strong>Prazo:</strong> {data.lente_dados.prazo_dias} dias úteis</p>
          </div>
        </div>
      )}
    </div>
  )
}
