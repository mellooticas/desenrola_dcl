"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PedidoCompleto } from '@/lib/types/database'

interface PrintOrderButtonProps {
  pedido: PedidoCompleto | null
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showLabel?: boolean
}

export function PrintOrderButton({ 
  pedido, 
  variant = 'default',
  size = 'default',
  className = '',
  showLabel = true
}: PrintOrderButtonProps) {
  const [printing, setPrinting] = useState(false)

  const gerarComandoESCPOS = (pedido: PedidoCompleto): string => {
    const ESC = '\x1B'
    const GS = '\x1D'
    
    let comandos = ''
    
    // Reset da impressora
    comandos += ESC + '@'
    
    // ==================== CABEÇALHO ====================
    // Centralizado, negrito, fonte grande
    comandos += ESC + 'a' + '\x01' // Centralizar
    comandos += ESC + 'E' + '\x01' // Negrito ON
    comandos += GS + '!' + '\x11' // Fonte 2x altura e largura
    comandos += 'PEDIDO #' + pedido.numero_sequencial + '\n'
    comandos += GS + '!' + '\x00' // Reset tamanho fonte
    comandos += ESC + 'E' + '\x00' // Negrito OFF
    
    // Linha separadora
    comandos += ESC + 'a' + '\x00' // Alinhar esquerda
    comandos += '================================\n'
    
    // ==================== LOJA ====================
    comandos += ESC + 'E' + '\x01' // Negrito ON
    comandos += 'LOJA: '
    comandos += ESC + 'E' + '\x00' // Negrito OFF
    comandos += (pedido.loja_nome || 'N/A') + '\n'
    
    // ==================== CLIENTE ====================
    comandos += ESC + 'E' + '\x01'
    comandos += 'CLIENTE: '
    comandos += ESC + 'E' + '\x00'
    comandos += (pedido.cliente_nome || 'N/A') + '\n'
    
    if (pedido.cliente_telefone) {
      comandos += ESC + 'E' + '\x01'
      comandos += 'TELEFONE: '
      comandos += ESC + 'E' + '\x00'
      comandos += pedido.cliente_telefone + '\n'
    }
    
    comandos += '--------------------------------\n'
    
    // ==================== DADOS DO PEDIDO ====================
    // OS da Loja
    if (pedido.numero_os_fisica) {
      comandos += ESC + 'E' + '\x01'
      comandos += 'OS LOJA: '
      comandos += ESC + 'E' + '\x00'
      comandos += pedido.numero_os_fisica + '\n'
    }
    
    // OS do Laboratório
    if (pedido.numero_pedido_laboratorio) {
      comandos += ESC + 'E' + '\x01'
      comandos += 'OS LAB: '
      comandos += ESC + 'E' + '\x00'
      comandos += pedido.numero_pedido_laboratorio + '\n'
    }
    
    // Laboratório
    comandos += ESC + 'E' + '\x01'
    comandos += 'LABORATORIO: '
    comandos += ESC + 'E' + '\x00'
    comandos += (pedido.laboratorio_nome || 'N/A') + '\n'
    
    // Classe de Lente
    comandos += ESC + 'E' + '\x01'
    comandos += 'CLASSE: '
    comandos += ESC + 'E' + '\x00'
    comandos += (pedido.classe_nome || 'N/A') + '\n'
    
    comandos += '--------------------------------\n'
    
    // ==================== DATAS ====================
    const dataPedido = pedido.data_pedido 
      ? format(new Date(pedido.data_pedido), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
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
    
    // SLA
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
    
    comandos += '--------------------------------\n'
    
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
      comandos += '--------------------------------\n'
      
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
      comandos += '--------------------------------\n'
      comandos += ESC + 'E' + '\x01'
      comandos += 'OBSERVACOES:\n'
      comandos += ESC + 'E' + '\x00'
      
      // Quebrar observações em linhas de 32 caracteres
      const obs = pedido.observacoes
      const maxChars = 32
      for (let i = 0; i < obs.length; i += maxChars) {
        comandos += obs.substring(i, i + maxChars) + '\n'
      }
    }
    
    // Garantia
    if (pedido.eh_garantia && pedido.observacoes_garantia) {
      comandos += '--------------------------------\n'
      comandos += ESC + 'E' + '\x01'
      comandos += '*** GARANTIA ***\n'
      comandos += ESC + 'E' + '\x00'
      comandos += pedido.observacoes_garantia + '\n'
    }
    
    // ==================== RODAPÉ ====================
    comandos += '================================\n'
    comandos += ESC + 'a' + '\x01' // Centralizar
    comandos += 'Impresso em: '
    comandos += format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR }) + '\n'
    comandos += ESC + 'a' + '\x00' // Alinhar esquerda
    
    // Espaço para corte
    comandos += '\n\n\n'
    
    // Cortar papel
    comandos += GS + 'V' + '\x00' // Corte total
    
    return comandos
  }

  const handlePrint = async () => {
    if (!pedido) {
      toast.error('Nenhum pedido para imprimir')
      return
    }

    try {
      setPrinting(true)

      // Gerar comandos ESC/POS
      const escposCommands = gerarComandoESCPOS(pedido)
      
      // Converter para Uint8Array
      const encoder = new TextEncoder()
      const data = encoder.encode(escposCommands)

      // Verificar se o navegador suporta Web Serial API
      if (!('serial' in navigator)) {
        toast.error('Seu navegador não suporta impressão direta. Use Chrome/Edge.')
        return
      }

      // Solicitar porta serial
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 9600 })

      // Enviar dados
      const writer = port.writable.getWriter()
      await writer.write(data)
      writer.releaseLock()

      // Fechar porta
      await port.close()

      toast.success('Pedido impresso com sucesso!')
    } catch (error: any) {
      console.error('Erro ao imprimir:', error)
      
      if (error.name === 'NotFoundError') {
        toast.error('Nenhuma impressora selecionada')
      } else if (error.name === 'NetworkError') {
        toast.error('Erro de comunicação com a impressora')
      } else {
        toast.error('Erro ao imprimir: ' + error.message)
      }
    } finally {
      setPrinting(false)
    }
  }

  const handlePrintFallback = () => {
    if (!pedido) return

    // Fallback: abrir janela de impressão do navegador
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
    <Button
      onClick={handlePrint}
      disabled={printing}
      variant={variant}
      size={size}
      className={className}
    >
      {printing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Printer className="w-4 h-4 mr-2" />
      )}
      {showLabel && (printing ? 'Imprimindo...' : 'Imprimir')}
    </Button>
  )
}
