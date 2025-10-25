"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Loader2, Eye, X } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PedidoCompleto } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'

interface PrintOrderButtonProps {
  pedido: PedidoCompleto | null
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
}

interface PrintConfig {
  incluirObservacoes: boolean
  incluirValores: boolean
  incluirTelefone: boolean
  incluirGarantia: boolean
  incluirSLA: boolean
  incluirOSLoja: boolean
  incluirOSLab: boolean
  tamanhoFonte: 'pequeno' | 'medio' | 'grande'
}

// Mapeamento de tamanhos de fonte
const TAMANHOS_FONTE = {
  pequeno: '10px',
  medio: '12px',
  grande: '14px'
} as const

export function PrintOrderButton({ 
  pedido, 
  variant = 'default',
  size = 'default',
  className = '',
  showLabel = true
}: PrintOrderButtonProps) {
  const [printing, setPrinting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    incluirObservacoes: true,
    incluirValores: true,
    incluirTelefone: true,
    incluirGarantia: true,
    incluirSLA: true,
    incluirOSLoja: true,
    incluirOSLab: true,
    tamanhoFonte: 'medio',
  })

  // Converter tamanho para valor do slider (0, 1, 2)
  const tamanhoParaSlider = (tamanho: 'pequeno' | 'medio' | 'grande'): number => {
    return tamanho === 'pequeno' ? 0 : tamanho === 'medio' ? 1 : 2
  }

  // Converter valor do slider para tamanho
  const sliderParaTamanho = (valor: number): 'pequeno' | 'medio' | 'grande' => {
    return valor === 0 ? 'pequeno' : valor === 1 ? 'medio' : 'grande'
  }

  const handlePrint = () => {
    if (!pedido) return
    
    setPrinting(true)

    const printWindow = window.open('', '_blank', 'width=350,height=600')
    if (!printWindow) {
      toast.error('Pop-up bloqueado. Habilite pop-ups para imprimir.')
      setPrinting(false)
      return
    }

    const tamanhoFonte = TAMANHOS_FONTE[printConfig.tamanhoFonte]

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${pedido.numero_sequencial}</title>
        <style>
          @media print {
            @page { 
              size: 80mm auto;
              margin: 0;
            }
            body { margin: 0; padding: 5mm; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: ${tamanhoFonte};
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            line-height: 1.4;
          }
          h1 { 
            text-align: center; 
            font-size: calc(${tamanhoFonte} + 4px); 
            margin: 5px 0 10px 0; 
            font-weight: bold;
          }
          .linha { 
            border-top: 1px dashed #000; 
            margin: 8px 0; 
          }
          .label { 
            font-weight: bold; 
            display: inline-block;
            min-width: 80px;
          }
          .section { 
            margin: 8px 0; 
          }
          .center { 
            text-align: center; 
          }
          .observacoes {
            margin-top: 5px;
            padding-left: 10px;
            white-space: pre-wrap;
            word-wrap: break-word;
          }
        </style>
      </head>
      <body>
        <h1>PEDIDO #${pedido.numero_sequencial}</h1>
        <div class="linha"></div>
        
        <div class="section">
          <div><span class="label">LOJA:</span> ${pedido.loja_nome || 'N/A'}</div>
          <div><span class="label">CLIENTE:</span> ${pedido.cliente_nome || 'N/A'}</div>
          ${printConfig.incluirTelefone && pedido.cliente_telefone ? `<div><span class="label">TELEFONE:</span> ${pedido.cliente_telefone}</div>` : ''}
        </div>
        
        <div class="linha"></div>
        
        <div class="section">
          ${printConfig.incluirOSLoja && pedido.numero_os_fisica ? `<div><span class="label">OS LOJA:</span> ${pedido.numero_os_fisica}</div>` : ''}
          ${printConfig.incluirOSLab && pedido.numero_pedido_laboratorio ? `<div><span class="label">OS LAB:</span> ${pedido.numero_pedido_laboratorio}</div>` : ''}
          <div><span class="label">LABORATÓRIO:</span> ${pedido.laboratorio_nome || 'N/A'}</div>
          <div><span class="label">CLASSE:</span> ${pedido.classe_nome || 'N/A'}</div>
        </div>
        
        <div class="linha"></div>
        
        <div class="section">
          <div><span class="label">DATA PEDIDO:</span> ${pedido.data_pedido ? format(new Date(pedido.data_pedido), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</div>
          ${pedido.data_prometida ? `<div><span class="label">DATA PROM.:</span> ${format(new Date(pedido.data_prometida), 'dd/MM/yyyy', { locale: ptBR })}</div>` : ''}
          ${printConfig.incluirSLA && pedido.dias_para_vencer_sla !== null ? `<div><span class="label">SLA:</span> ${
            pedido.dias_para_vencer_sla < 0 
              ? `ATRASADO (${Math.abs(pedido.dias_para_vencer_sla)} dias)`
              : pedido.dias_para_vencer_sla === 0
              ? 'VENCE HOJE'
              : `${pedido.dias_para_vencer_sla} dias restantes`
          }</div>` : ''}
        </div>
        
        <div class="linha"></div>
        
        <div class="section">
          <div><span class="label">STATUS:</span> ${pedido.status}</div>
          <div><span class="label">PRIORIDADE:</span> ${pedido.prioridade}</div>
        </div>
        
        ${printConfig.incluirValores && (pedido.valor_pedido || pedido.custo_lentes) ? `
          <div class="linha"></div>
          <div class="section">
            ${pedido.valor_pedido ? `<div><span class="label">VALOR TOTAL:</span> R$ ${pedido.valor_pedido.toFixed(2).replace('.', ',')}</div>` : ''}
            ${pedido.custo_lentes ? `<div><span class="label">CUSTO LENTES:</span> R$ ${pedido.custo_lentes.toFixed(2).replace('.', ',')}</div>` : ''}
          </div>
        ` : ''}
        
        ${printConfig.incluirObservacoes && pedido.observacoes ? `
          <div class="linha"></div>
          <div class="section">
            <div class="label">OBSERVAÇÕES:</div>
            <div class="observacoes">${pedido.observacoes}</div>
          </div>
        ` : ''}
        
        ${printConfig.incluirGarantia && pedido.eh_garantia && pedido.observacoes_garantia ? `
          <div class="linha"></div>
          <div class="section">
            <div class="label">*** GARANTIA ***</div>
            <div class="observacoes">${pedido.observacoes_garantia}</div>
          </div>
        ` : ''}
        
        <div class="linha"></div>
        <div class="center">Impresso em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = function() {
          printWindow.close()
          setPrinting(false)
          toast.success('Pedido enviado para impressão!')
          setShowPreview(false)
          setDialogOpen(false)
        }
      }, 250)
    }
  }

  if (!pedido) {
    return (
      <Button disabled variant={variant} size={size} className={className}>
        <Printer className="w-4 h-4 mr-2" />
        {showLabel && 'Imprimir'}
      </Button>
    )
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
          >
            <Printer className="w-4 h-4 mr-2" />
            {showLabel && 'Imprimir'}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview de Impressão - Pedido #{pedido.numero_sequencial}
            </DialogTitle>
            <DialogDescription>
              Configure o que deseja imprimir e visualize como ficará antes de enviar para a impressora
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda: Configurações */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm mb-3">Tamanho da Fonte</h3>
                <div className="space-y-2">
                  <Slider
                    value={[tamanhoParaSlider(printConfig.tamanhoFonte)]}
                    onValueChange={(value: number[]) => 
                      setPrintConfig(prev => ({ ...prev, tamanhoFonte: sliderParaTamanho(value[0]) }))
                    }
                    min={0}
                    max={2}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className={printConfig.tamanhoFonte === 'pequeno' ? 'font-semibold text-foreground' : ''}>
                      Pequeno
                    </span>
                    <span className={printConfig.tamanhoFonte === 'medio' ? 'font-semibold text-foreground' : ''}>
                      Médio
                    </span>
                    <span className={printConfig.tamanhoFonte === 'grande' ? 'font-semibold text-foreground' : ''}>
                      Grande
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-3">O que Imprimir</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="os-loja"
                      checked={printConfig.incluirOSLoja}
                      onCheckedChange={(checked) => 
                        setPrintConfig(prev => ({ ...prev, incluirOSLoja: checked as boolean }))
                      }
                    />
                    <Label htmlFor="os-loja" className="text-sm cursor-pointer">
                      OS da Loja
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="os-lab"
                      checked={printConfig.incluirOSLab}
                      onCheckedChange={(checked) => 
                        setPrintConfig(prev => ({ ...prev, incluirOSLab: checked as boolean }))
                      }
                    />
                    <Label htmlFor="os-lab" className="text-sm cursor-pointer">
                      OS do Laboratório
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="telefone"
                      checked={printConfig.incluirTelefone}
                      onCheckedChange={(checked) => 
                        setPrintConfig(prev => ({ ...prev, incluirTelefone: checked as boolean }))
                      }
                    />
                    <Label htmlFor="telefone" className="text-sm cursor-pointer">
                      Telefone do Cliente
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sla"
                      checked={printConfig.incluirSLA}
                      onCheckedChange={(checked) => 
                        setPrintConfig(prev => ({ ...prev, incluirSLA: checked as boolean }))
                      }
                    />
                    <Label htmlFor="sla" className="text-sm cursor-pointer">
                      Informações de SLA
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="valores"
                      checked={printConfig.incluirValores}
                      onCheckedChange={(checked) => 
                        setPrintConfig(prev => ({ ...prev, incluirValores: checked as boolean }))
                      }
                    />
                    <Label htmlFor="valores" className="text-sm cursor-pointer">
                      Valores (Total/Custo)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="observacoes"
                      checked={printConfig.incluirObservacoes}
                      onCheckedChange={(checked) => 
                        setPrintConfig(prev => ({ ...prev, incluirObservacoes: checked as boolean }))
                      }
                    />
                    <Label htmlFor="observacoes" className="text-sm cursor-pointer">
                      Observações
                    </Label>
                  </div>

                  {pedido.eh_garantia && (
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="garantia"
                        checked={printConfig.incluirGarantia}
                        onCheckedChange={(checked) => 
                          setPrintConfig(prev => ({ ...prev, incluirGarantia: checked as boolean }))
                        }
                      />
                      <Label htmlFor="garantia" className="text-sm cursor-pointer">
                        Informações de Garantia
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Marque/desmarque para personalizar a impressão
                </p>
              </div>
            </div>

            {/* Coluna Direita: Preview */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-sm mb-3">Preview (80mm)</h3>
              <ScrollArea className="h-[500px] w-full border rounded-lg bg-white">
                <div 
                  className="p-6 font-mono"
                  style={{ 
                    width: '80mm',
                    margin: '0 auto',
                    backgroundColor: 'white',
                    fontSize: TAMANHOS_FONTE[printConfig.tamanhoFonte]
                  }}
                >
                  {/* Preview em HTML simulando térmica */}
                  <div className="text-center font-bold text-lg mb-2">
                    PEDIDO #{pedido.numero_sequencial}
                  </div>
                  <div className="border-t-2 border-dashed my-2"></div>
                  
                  <div className="space-y-1">
                    <div><span className="font-bold">LOJA:</span> {pedido.loja_nome || 'N/A'}</div>
                    <div><span className="font-bold">CLIENTE:</span> {pedido.cliente_nome || 'N/A'}</div>
                    {printConfig.incluirTelefone && pedido.cliente_telefone && (
                      <div><span className="font-bold">TELEFONE:</span> {pedido.cliente_telefone}</div>
                    )}
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <div className="space-y-1">
                    {printConfig.incluirOSLoja && pedido.numero_os_fisica && (
                      <div><span className="font-bold">OS LOJA:</span> {pedido.numero_os_fisica}</div>
                    )}
                    {printConfig.incluirOSLab && pedido.numero_pedido_laboratorio && (
                      <div><span className="font-bold">OS LAB:</span> {pedido.numero_pedido_laboratorio}</div>
                    )}
                    <div><span className="font-bold">LABORATÓRIO:</span> {pedido.laboratorio_nome || 'N/A'}</div>
                    <div><span className="font-bold">CLASSE:</span> {pedido.classe_nome || 'N/A'}</div>
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <div className="space-y-1">
                    <div>
                      <span className="font-bold">DATA PEDIDO:</span> {' '}
                      {pedido.data_pedido ? format(new Date(pedido.data_pedido), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A'}
                    </div>
                    {pedido.data_prometida && (
                      <div>
                        <span className="font-bold">DATA PROMETIDA:</span> {' '}
                        {format(new Date(pedido.data_prometida), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    )}
                    {printConfig.incluirSLA && pedido.dias_para_vencer_sla !== null && (
                      <div>
                        <span className="font-bold">SLA:</span> {' '}
                        {pedido.dias_para_vencer_sla < 0 
                          ? `ATRASADO (${Math.abs(pedido.dias_para_vencer_sla)} dias)`
                          : pedido.dias_para_vencer_sla === 0
                          ? 'VENCE HOJE'
                          : `${pedido.dias_para_vencer_sla} dias restantes`
                        }
                      </div>
                    )}
                  </div>

                  <div className="border-t border-dashed my-2"></div>

                  <div className="space-y-1">
                    <div><span className="font-bold">STATUS:</span> {pedido.status}</div>
                    <div><span className="font-bold">PRIORIDADE:</span> {pedido.prioridade}</div>
                  </div>

                  {printConfig.incluirValores && (pedido.valor_pedido || pedido.custo_lentes) && (
                    <>
                      <div className="border-t border-dashed my-2"></div>
                      <div className="space-y-1">
                        {pedido.valor_pedido && (
                          <div>
                            <span className="font-bold">VALOR TOTAL:</span> R$ {pedido.valor_pedido.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {pedido.custo_lentes && (
                          <div>
                            <span className="font-bold">CUSTO LENTES:</span> R$ {pedido.custo_lentes.toFixed(2).replace('.', ',')}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {printConfig.incluirObservacoes && pedido.observacoes && (
                    <>
                      <div className="border-t border-dashed my-2"></div>
                      <div>
                        <div className="font-bold mb-1">OBSERVAÇÕES:</div>
                        <div className="whitespace-pre-wrap">{pedido.observacoes}</div>
                      </div>
                    </>
                  )}

                  {printConfig.incluirGarantia && pedido.eh_garantia && pedido.observacoes_garantia && (
                    <>
                      <div className="border-t border-dashed my-2"></div>
                      <div>
                        <div className="font-bold mb-1">*** GARANTIA ***</div>
                        <div className="whitespace-pre-wrap">{pedido.observacoes_garantia}</div>
                      </div>
                    </>
                  )}

                  <div className="border-t-2 border-dashed my-2"></div>
                  <div className="text-center text-xs">
                    Impresso em: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handlePrint}
              disabled={printing}
              className="flex-1"
            >
              {printing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Imprimindo...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 mr-2" />
                  Confirmar e Imprimir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
