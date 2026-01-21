'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Glasses, Frame, Package, Wrench, Contact } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WizardData, TipoPedido } from '../NovaOrdemWizard'

interface Step2Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

const TIPOS_SERVICO = [
  {
    value: 'LENTES' as TipoPedido,
    label: 'Só Lentes',
    icon: Glasses,
    description: 'Pedido apenas de lentes (cliente já tem armação)',
  },
  {
    value: 'LENTES_CONTATO' as TipoPedido,
    label: 'Lentes de Contato',
    icon: Contact,
    description: 'Venda de lentes de contato',
  },
  {
    value: 'ARMACAO' as TipoPedido,
    label: 'Só Armação',
    icon: Frame,
    description: 'Venda de armação sem lentes de grau',
  },
  {
    value: 'COMPLETO' as TipoPedido,
    label: 'Completo',
    icon: Package,
    description: 'Armação + Lentes de grau',
  },
  {
    value: 'SERVICO' as TipoPedido,
    label: 'Serviços',
    icon: Wrench,
    description: 'Montagem, ajuste, reparo ou outros serviços',
  },
]

export function Step2TipoServico({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Package className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Tipo de Serviço</h3>
        <p className="text-sm text-muted-foreground">
          Selecione o que será feito neste pedido
        </p>
      </div>

      <RadioGroup
        value={data.tipo_pedido || ''}
        onValueChange={(value) => onChange({ ...data, tipo_pedido: value as TipoPedido })}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIPOS_SERVICO.map((tipo) => {
            const Icon = tipo.icon
            const isSelected = data.tipo_pedido === tipo.value

            return (
              <label
                key={tipo.value}
                className={cn(
                  'relative flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  'hover:border-primary/50 hover:bg-accent/50',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                )}
              >
                <RadioGroupItem value={tipo.value} id={tipo.value} className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium">{tipo.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tipo.description}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      </RadioGroup>

      {/* Campo adicional para tipo SERVICO */}
      {data.tipo_pedido === 'SERVICO' && (
        <div className="space-y-2 mt-4 p-4 bg-muted/50 rounded-lg">
          <Label htmlFor="tipo-servico">Especifique o tipo de serviço</Label>
          <Input
            id="tipo-servico"
            value={data.tipo_servico || ''}
            onChange={(e) => onChange({ ...data, tipo_servico: e.target.value })}
            placeholder="Ex: Montagem, Ajuste, Troca de hastes, etc."
          />
        </div>
      )}
    </div>
  )
}
