"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Loader2, Settings } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PrintOrderButtonProps {
  pedido: PedidoCompleto | null
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
}

// Configurações de impressoras suportadas
const IMPRESSORAS_SUPORTADAS = [
  {
    id: 'elgin-i9',
    nome: 'Elgin i9',
    vendorId: 0x0483, // Substitua pelo vendor ID correto da Elgin
    largura: 48, // caracteres por linha
    usarESCPOS: true
  },
  {
    id: 'elgin-i7',
    nome: 'Elgin i7',
    vendorId: 0x0483,
    largura: 48,
    usarESCPOS: true
  },
  {
    id: 'daruma',
    nome: 'Daruma DR800',
    vendorId: 0x0dd4, // Vendor ID Daruma
    largura: 48,
    usarESCPOS: true
  },
  {
    id: 'bematech',
    nome: 'Bematech MP-4200',
    vendorId: 0x0b1b, // Vendor ID Bematech
    largura: 48,
    usarESCPOS: true
  },
  {
    id: 'generico',
    nome: 'Impressora Genérica (ESC/POS)',
    vendorId: null, // Qualquer vendor
    largura: 48,
    usarESCPOS: true
  }
]

// Funções auxiliares para formatação
function quebrarTexto(texto: string, maxChars: number): string[] {
  const palavras = texto.split(' ')
  const linhas: string[] = []
  let linhaAtual = ''

  palavras.forEach(palavra => {
    if ((linhaAtual + palavra).length <= maxChars) {
      linhaAtual += (linhaAtual ? ' ' : '') + palavra
    } else {
      if (linhaAtual) linhas.push(linhaAtual)
      linhaAtual = palavra
    }
  })
  
  if (linhaAtual) linhas.push(linhaAtual)
  return linhas
}

function quebrarLinha(texto: string, maxChars: number): string {
  return texto.length > maxChars ? texto.substring(0, maxChars - 3) + '...' : texto
}

function gerarComandoESCPOS(pedido: PedidoCompleto, largura: number = 48): Uint8Array {
  const ESC = '\x1B'
  const GS = '\x1D'
  
  let comandos = ''
  
  // Reset da impressora
  comandos += ESC + '@'
  
  // ==================== CABEÇALHO ====================
  comandos += ESC + 'a' + '\x01' // Centralizar
  comandos += ESC + 'E' + '\x01' // Negrito ON
  comandos += GS + '!' + '\x11' // Fonte 2x
  comandos += 'PEDIDO #' + pedido.numero_sequencial + '\n'
  comandos += GS + '!' + '\x00' // Reset tamanho
  comandos += ESC + 'E' + '\x00' // Negrito OFF
  
  comandos += ESC + 'a' + '\x00' // Alinhar esquerda
  comandos += '='.repeat(largura) + '\n'
  
  // ==================== LOJA ====================
  comandos += ESC + 'E' + '\x01'
  comandos += 'LOJA: '
  comandos += ESC + 'E' + '\x00'
  comandos += quebrarLinha(pedido.loja_nome || 'N/A', largura - 6) + '\n'
  
  // ==================== CLIENTE ====================
  comandos += ESC + 'E' + '\x01'
  comandos += 'CLIENTE: '
  comandos += ESC + 'E' + '\x00'
  comandos += quebrarLinha(pedido.cliente_nome || 'N/A', largura - 9) + '\n'
  
  if (pedido.cliente_telefone) {
    comandos += ESC + 'E' + '\x01'
    comandos += 'TELEFONE: '
    comandos += ESC + 'E' + '\x00'
    comandos += pedido.cliente_telefone + '\n'
  }
  
  comandos += '-'.repeat(largura) + '\n'
  
  // ==================== DADOS DO PEDIDO ====================
  if (pedido.numero_os_fisica) {
    comandos += ESC + 'E' + '\x01'
    comandos += 'OS LOJA: '
    comandos += ESC + 'E' + '\x00'
    comandos += pedido.numero_os_fisica + '\n'
  }
  
  if (pedido.numero_pedido_laboratorio) {
    comandos += ESC + 'E' + '\x01'
    comandos += 'OS LAB: '
    comandos += ESC + 'E' + '\x00'
    comandos += pedido.numero_pedido_laboratorio + '\n'
  }
  
  comandos += ESC + 'E' + '\x01'
  comandos += 'LABORATORIO: '
  comandos += ESC + 'E' + '\x00'
  comandos += quebrarLinha(pedido.laboratorio_nome || 'N/A', largura - 13) + '\n'
  
  comandos += ESC + 'E' + '\x01'
  comandos += 'CLASSE: '
  comandos += ESC + 'E' + '\x00'
  comandos += quebrarLinha(pedido.classe_nome || 'N/A', largura - 8) + '\n'
  
  comandos += '-'.repeat(largura) + '\n'
  
  // ==================== DATAS ====================
  const dataPedido = pedido.data_pedido 
    ? format(new Date(pedido.data_pedido), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })
    : 'N/A'
  
  comandos += ESC + 'E' + '\x01'
  comandos += 'DATA PEDIDO: '
  comandos += ESC + 'E' + '\x00'
  comandos += dataPedido + '\n'
  
  if (pedido.data_prometida) {
    const dataPrometida = format(new Date(pedido.data_prometida), 'dd/MM/yyyy', { locale: ptBR })
    comandos += ESC + 'E' + '\x01'
    comandos += 'DATA PROMETIDA: '
    comandos += ESC + 'E' + '\x00'
    comandos += dataPrometida + '\n'
  }
  
  if (pedido.dias_para_vencer_sla !== null) {
    comandos += ESC + 'E' + '\x01'
    comandos += 'SLA: '
    comandos += ESC + 'E' + '\x00'
    
    const dias = pedido.dias_para_vencer_sla
    if (dias < 0) {
      comandos += `ATRASADO (${Math.abs(dias)} dias)`
    } else if (dias === 0) {
      comandos += 'VENCE HOJE'
    } else {
      comandos += `${dias} dias restantes`
    }
    comandos += '\n'
  }
  
  comandos += '-'.repeat(largura) + '\n'
  
  // ==================== STATUS E PRIORIDADE ====================
  comandos += ESC + 'E' + '\x01'
  comandos += 'STATUS: '
  comandos += ESC + 'E' + '\x00'
  
  const statusLabels: Record<string, string> = {
    'REGISTRADO': 'Registrado',
    'AG_PAGAMENTO': 'Aguard. Pagamento',
    'PAGO': 'Pago',
    'PRODUCAO': 'Em Producao',
    'PRONTO': 'Pronto',
    'ENVIADO': 'Enviado',
    'CHEGOU': 'Chegou',
    'ENTREGUE': 'Entregue',
    'CANCELADO': 'Cancelado'
  }
  comandos += (statusLabels[pedido.status] || pedido.status) + '\n'
  
  comandos += ESC + 'E' + '\x01'
  comandos += 'PRIORIDADE: '
  comandos += ESC + 'E' + '\x00'
  
  const prioridadeLabels: Record<string, string> = {
    'BAIXA': 'Baixa',
    'NORMAL': 'Normal',
    'ALTA': 'Alta',
    'URGENTE': 'URGENTE'
  }
  comandos += (prioridadeLabels[pedido.prioridade] || pedido.prioridade) + '\n'
  
  // ==================== VALORES ====================
  if (pedido.valor_pedido || pedido.custo_lentes) {
    comandos += '-'.repeat(largura) + '\n'
    
    if (pedido.valor_pedido) {
      comandos += ESC + 'E' + '\x01'
      comandos += 'VALOR TOTAL: '
      comandos += ESC + 'E' + '\x00'
      comandos += 'R$ ' + pedido.valor_pedido.toFixed(2).replace('.', ',') + '\n'
    }
    
    if (pedido.custo_lentes) {
      comandos += ESC + 'E' + '\x01'
      comandos += 'CUSTO LENTES: '
      comandos += ESC + 'E' + '\x00'
      comandos += 'R$ ' + pedido.custo_lentes.toFixed(2).replace('.', ',') + '\n'
    }
  }
  
  // ==================== OBSERVAÇÕES ====================
  if (pedido.observacoes) {
    comandos += '-'.repeat(largura) + '\n'
    comandos += ESC + 'E' + '\x01'
    comandos += 'OBSERVACOES:\n'
    comandos += ESC + 'E' + '\x00'
    
    const linhas = quebrarTexto(pedido.observacoes, largura)
    linhas.forEach(linha => {
      comandos += linha + '\n'
    })
  }
  
  if (pedido.eh_garantia && pedido.observacoes_garantia) {
    comandos += '-'.repeat(largura) + '\n'
    comandos += ESC + 'E' + '\x01'
    comandos += '*** GARANTIA ***\n'
    comandos += ESC + 'E' + '\x00'
    const linhas = quebrarTexto(pedido.observacoes_garantia, largura)
    linhas.forEach(linha => {
      comandos += linha + '\n'
    })
  }
  
  // ==================== RODAPÉ ====================
  comandos += '='.repeat(largura) + '\n'
  comandos += ESC + 'a' + '\x01' // Centralizar
  comandos += 'Impresso em: '
  comandos += format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }) + '\n'
  comandos += ESC + 'a' + '\x00'
  
  comandos += '\n\n\n'
  comandos += GS + 'V' + '\x00' // Corte total
  
  const encoder = new TextEncoder()
  return encoder.encode(comandos)
}

export function PrintOrderButton({ 
  pedido, 
  variant = 'default',
  size = 'default',
  className = '',
  showLabel = true
}: PrintOrderButtonProps) {
  const [printing, setPrinting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [impressoraSelecionada, setImpressoraSelecionada] = useState('elgin-i9')

  const handlePrintUSB = async () => {
    if (!pedido) {
      toast.error('Nenhum pedido para imprimir')
      return
    }

    try {
      setPrinting(true)

      // Verificar se o navegador suporta Web USB API
      if (!('usb' in navigator)) {
        toast.error('Seu navegador não suporta impressão USB. Use Chrome/Edge.')
        handlePrintFallback()
        return
      }

      const configImpressora = IMPRESSORAS_SUPORTADAS.find(i => i.id === impressoraSelecionada)
      if (!configImpressora) {
        toast.error('Impressora não configurada')
        return
      }

      // Gerar comandos ESC/POS
      const escposData = gerarComandoESCPOS(pedido, configImpressora.largura)

      // Solicitar acesso ao dispositivo USB
      const filters = configImpressora.vendorId 
        ? [{ vendorId: configImpressora.vendorId }]
        : []

      const device = await (navigator as any).usb.requestDevice({ filters })
      
      if (!device) {
        toast.error('Nenhuma impressora selecionada')
        return
      }

      // Abrir conexão
      await device.open()
      
      // Selecionar configuração (geralmente a primeira)
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }

      // Encontrar interface de impressão (geralmente interface 0)
      const interfaceNumber = device.configuration.interfaces[0].interfaceNumber
      await device.claimInterface(interfaceNumber)

      // Encontrar endpoint de saída (OUT)
      const endpoints = device.configuration.interfaces[0].alternate.endpoints
      const outEndpoint = endpoints.find((ep: any) => ep.direction === 'out')

      if (!outEndpoint) {
        throw new Error('Endpoint de saída não encontrado')
      }

      // Enviar dados para impressora
      await device.transferOut(outEndpoint.endpointNumber, escposData)

      // Fechar conexão
      await device.releaseInterface(interfaceNumber)
      await device.close()

      toast.success(`Pedido impresso na ${configImpressora.nome}!`)
      setDialogOpen(false)
      
    } catch (error: any) {
      console.error('Erro ao imprimir:', error)
      
      if (error.name === 'NotFoundError') {
        toast.error('Nenhuma impressora selecionada')
      } else if (error.name === 'NetworkError') {
        toast.error('Erro de comunicação com a impressora')
      } else if (error.name === 'SecurityError') {
        toast.error('Permissão negada para acessar a impressora')
      } else {
        toast.error('Erro ao imprimir: ' + error.message)
        // Fallback para impressão via navegador
        handlePrintFallback()
      }
    } finally {
      setPrinting(false)
    }
  }

  const handlePrintFallback = () => {
    if (!pedido) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Pop-up bloqueado. Habilite pop-ups para imprimir.')
      return
    }

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
            body { margin: 0; padding: 10px; }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
          }
          h1 { text-align: center; font-size: 18px; margin: 10px 0; }
          .linha { border-top: 1px dashed #000; margin: 10px 0; }
          .label { font-weight: bold; }
          .section { margin: 10px 0; }
          .center { text-align: center; }
        </style>
      </head>
      <body>
        <h1>PEDIDO #${pedido.numero_sequencial}</h1>
        <div class="linha"></div>
        
        <div class="section">
          <div><span class="label">LOJA:</span> ${pedido.loja_nome || 'N/A'}</div>
          <div><span class="label">CLIENTE:</span> ${pedido.cliente_nome || 'N/A'}</div>
          ${pedido.cliente_telefone ? `<div><span class="label">TELEFONE:</span> ${pedido.cliente_telefone}</div>` : ''}
        </div>
        
        <div class="linha"></div>
        
        <div class="section">
          ${pedido.numero_os_fisica ? `<div><span class="label">OS LOJA:</span> ${pedido.numero_os_fisica}</div>` : ''}
          ${pedido.numero_pedido_laboratorio ? `<div><span class="label">OS LAB:</span> ${pedido.numero_pedido_laboratorio}</div>` : ''}
          <div><span class="label">LABORATÓRIO:</span> ${pedido.laboratorio_nome || 'N/A'}</div>
          <div><span class="label">CLASSE:</span> ${pedido.classe_nome || 'N/A'}</div>
        </div>
        
        <div class="linha"></div>
        
        <div class="section">
          <div><span class="label">DATA PEDIDO:</span> ${pedido.data_pedido ? format(new Date(pedido.data_pedido), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</div>
          ${pedido.data_prometida ? `<div><span class="label">DATA PROMETIDA:</span> ${format(new Date(pedido.data_prometida), 'dd/MM/yyyy', { locale: ptBR })}</div>` : ''}
        </div>
        
        <div class="linha"></div>
        
        <div class="section">
          <div><span class="label">STATUS:</span> ${pedido.status}</div>
          <div><span class="label">PRIORIDADE:</span> ${pedido.prioridade}</div>
        </div>
        
        ${pedido.observacoes ? `
          <div class="linha"></div>
          <div class="section">
            <div class="label">OBSERVAÇÕES:</div>
            <div>${pedido.observacoes}</div>
          </div>
        ` : ''}
        
        <div class="linha"></div>
        <div class="center">Impresso em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
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
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurar Impressão
          </DialogTitle>
          <DialogDescription>
            Selecione a impressora que deseja utilizar para imprimir o pedido #{pedido.numero_sequencial}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="impressora">Impressora</Label>
            <Select value={impressoraSelecionada} onValueChange={setImpressoraSelecionada}>
              <SelectTrigger id="impressora">
                <SelectValue placeholder="Selecione a impressora" />
              </SelectTrigger>
              <SelectContent>
                {IMPRESSORAS_SUPORTADAS.map(impressora => (
                  <SelectItem key={impressora.id} value={impressora.id}>
                    {impressora.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A impressora selecionada será conectada via USB
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">💡 Dica:</p>
              <p>Certifique-se de que a impressora está ligada e conectada via USB antes de imprimir.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePrintUSB}
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
                Imprimir
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
