'use client'

import { Frame } from 'lucide-react'
import { ArmacaoSelector } from '@/components/armacoes/ArmacaoSelector'
import type { WizardData } from '../NovaOrdemWizard'

interface Step3Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

export function Step3Armacao({ data, onChange }: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Frame className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Selecionar Armação</h3>
        <p className="text-sm text-muted-foreground">
          Escolha uma armação do estoque ou indique que o cliente trouxe
        </p>
      </div>

      <ArmacaoSelector
        lojaId={data.loja_id}
        armacaoSelecionada={data.armacao_id}
        clienteTrouxeArmacao={data.cliente_trouxe_armacao}
        onArmacaoSelect={(armacaoId) => {
          onChange({ ...data, armacao_id: armacaoId })
        }}
        onClienteTrouxeChange={(trouxe) => {
          onChange({ ...data, cliente_trouxe_armacao: trouxe, armacao_id: trouxe ? null : data.armacao_id })
        }}
      />
    </div>
  )
}
