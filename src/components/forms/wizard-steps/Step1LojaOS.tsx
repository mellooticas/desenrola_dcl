'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, Hash } from 'lucide-react'
import { supabaseHelpers } from '@/lib/supabase/helpers'
import type { WizardData } from '../NovaOrdemWizard'

interface Loja {
  id: string
  nome: string
  cidade?: string
}

interface Step1Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

export function Step1LojaOS({ data, onChange }: Step1Props) {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregarLojas() {
      try {
        console.log('[Step1] Carregando lojas...')
        const lojasData = await supabaseHelpers.getLojas()
        
        console.log('[Step1] Lojas carregadas:', lojasData)
        setLojas(lojasData)
      } catch (error) {
        console.error('[Step1] Erro ao carregar lojas:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarLojas()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-lg font-semibold">Dados Iniciais</h3>
        <p className="text-sm text-muted-foreground">
          Selecione a loja e informe o número da OS física
        </p>
      </div>

      {/* Loja */}
      <div className="space-y-2">
        <Label htmlFor="loja">Loja *</Label>
        <Select
          value={data.loja_id}
          onValueChange={(value) => onChange({ ...data, loja_id: value })}
          disabled={loading}
        >
          <SelectTrigger id="loja">
            <SelectValue placeholder={loading ? 'Carregando...' : 'Selecione a loja'} />
          </SelectTrigger>
          <SelectContent>
            {lojas.length === 0 && !loading ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nenhuma loja disponível
              </div>
            ) : (
              lojas.map((loja) => (
                <SelectItem key={loja.id} value={loja.id}>
                  {loja.nome} {loja.cidade && `- ${loja.cidade}`}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {!loading && lojas.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {lojas.length} loja{lojas.length > 1 ? 's' : ''} disponível{lojas.length > 1 ? 'eis' : ''}
          </p>
        )}
      </div>

      {/* Número OS Física */}
      <div className="space-y-2">
        <Label htmlFor="os-fisica">Número OS Física *</Label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="os-fisica"
            value={data.numero_os_fisica}
            onChange={(e) => onChange({ ...data, numero_os_fisica: e.target.value })}
            placeholder="Ex: 12345"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Este número deve corresponder ao da OS física da loja
        </p>
      </div>
    </div>
  )
}
