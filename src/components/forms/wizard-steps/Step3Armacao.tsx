'use client'

import { Frame, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ArmacaoSelector } from '@/components/armacoes/ArmacaoSelector'
import { buscarArmacoes } from '@/lib/supabase/crm-erp-client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { WizardData } from '../NovaOrdemWizard'

interface Step3Props {
  data: WizardData
  onChange: (data: WizardData) => void
}

export function Step3Armacao({ data, onChange }: Step3Props) {
  const [carregandoDados, setCarregandoDados] = useState(false)

  // Quando armacao_id mudar, buscar dados da armação
  useEffect(() => {
    if (data.armacao_id && !data.armacao_dados) {
      buscarDadosArmacao(data.armacao_id)
    }
  }, [data.armacao_id])

  const buscarDadosArmacao = async (armacaoId: string) => {
    setCarregandoDados(true)
    try {
      console.log('[Step3Armacao] 🔍 Buscando dados armação ID:', armacaoId)
      
      // Buscar diretamente do CRM_ERP pelo UUID
      const crmErpClient = await import('@/lib/supabase/crm-erp-client').then(m => m.getCrmErpClient())
      
      const { data: resultado, error } = await crmErpClient
        .from('vw_estoque_completo')
        .select('*')
        .eq('produto_id', armacaoId)
        .single()

      if (error) {
        console.error('[Step3Armacao] ❌ Erro ao buscar armação:', error)
        throw error
      }

      if (resultado) {
        console.log('[Step3Armacao] ✅ Dados encontrados:', resultado)
        console.log('[Step3Armacao] 📦 Atualizando wizard com:', {
          armacao_id: armacaoId,
          sku: resultado.sku,
          preco_custo: resultado.custo,
          preco_tabela: resultado.preco_venda
        })
        
        onChange({
          ...data,
          armacao_id: armacaoId,
          armacao_dados: {
            sku: resultado.sku || '',
            sku_visual: resultado.sku_visual || resultado.sku || '',
            descricao: resultado.descricao || 'Armação sem descrição',
            preco_custo: resultado.custo || 0,
            preco_tabela: resultado.preco_venda || 0,
            preco_venda_real: resultado.preco_venda || 0 // 🎯 Inicializa com preço tabela
          }
        })
        
        console.log('[Step3Armacao] ✅ Wizard atualizado com sucesso')
      }
    } catch (error) {
      console.error('[Step3Armacao] ❌ Erro ao buscar dados da armação:', error)
    } finally {
      setCarregandoDados(false)
    }
  }

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
          console.log('[Step3] 🎯 Armação selecionada:', armacaoId)
          if (armacaoId) {
            // Limpa dados antigos e busca novos
            onChange({ ...data, armacao_id: armacaoId, armacao_dados: undefined })
            buscarDadosArmacao(armacaoId)
          } else {
            // Se desmarcou, limpa tudo
            console.log('[Step3] 🗑️ Armação desmarcada')
            onChange({ ...data, armacao_id: null, armacao_dados: undefined })
          }
        }}
        onClienteTrouxeChange={(trouxe) => {
          console.log('[Step3] 👤 Cliente trouxe armação:', trouxe)
          onChange({ 
            ...data, 
            cliente_trouxe_armacao: trouxe, 
            armacao_id: trouxe ? null : data.armacao_id,
            armacao_dados: trouxe ? undefined : data.armacao_dados
          })
        }}
      />
      
      {carregandoDados && (
        <div className="text-center text-sm text-muted-foreground">
          Carregando dados da armação...
        </div>
      )}

      {/* Preço de Venda Real */}
      {data.armacao_id && data.armacao_dados && !data.cliente_trouxe_armacao && (
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            <span>Preços da Armação</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Custo</Label>
              <div className="font-mono text-sm">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(data.armacao_dados.preco_custo || 0)}
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Preço Tabela</Label>
              <div className="font-mono text-sm">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(data.armacao_dados.preco_tabela)}
              </div>
            </div>
            
            <div>
              <Label htmlFor="preco-venda-real-armacao">
                Preço de Venda Real <span className="text-red-500">*</span>
              </Label>
              <Input
                id="preco-venda-real-armacao"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={data.armacao_dados.preco_venda_real || ''}
                onChange={(e) => {
                  const valor = parseFloat(e.target.value) || 0
                  onChange({
                    ...data,
                    armacao_dados: {
                      ...data.armacao_dados!,
                      preco_venda_real: valor
                    }
                  })
                }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Com desconto aplicado
              </p>
            </div>
          </div>
          
          {data.armacao_dados.preco_venda_real && (
            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Margem:</span>
                <span className="font-semibold">
                  {((data.armacao_dados.preco_venda_real - (data.armacao_dados.preco_custo || 0)) / data.armacao_dados.preco_venda_real * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Lucro:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.armacao_dados.preco_venda_real - (data.armacao_dados.preco_custo || 0))}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
