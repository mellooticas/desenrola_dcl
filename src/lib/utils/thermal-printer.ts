/**
 * Utilitário para gerar comandos ESC/POS para impressoras térmicas
 * Compatível com Epson i9, Sweda, Bematech e outras ESC/POS padrão
 */

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PedidoCompleto } from '@/lib/types/database'

// Comandos ESC/POS padrão
export const ESC = '\x1B'
export const GS = '\x1D'
export const LF = '\n'
export const FF = '\f'

export const COMMANDS = {
  // Inicialização
  INIT: ESC + '@',
  
  // Alinhamento
  ALIGN_LEFT: ESC + 'a' + '\x00',
  ALIGN_CENTER: ESC + 'a' + '\x01',
  ALIGN_RIGHT: ESC + 'a' + '\x02',
  
  // Tamanhos de texto
  FONT_SMALL: ESC + 'M' + '\x01',
  FONT_NORMAL: ESC + 'M' + '\x00',
  FONT_DOUBLE_WIDTH: GS + '!' + '\x10',
  FONT_DOUBLE_HEIGHT: GS + '!' + '\x01',
  FONT_DOUBLE: GS + '!' + '\x11',
  FONT_TRIPLE: GS + '!' + '\x22',
  FONT_RESET: GS + '!' + '\x00',
  
  // Estilos
  BOLD_ON: ESC + 'E' + '\x01',
  BOLD_OFF: ESC + 'E' + '\x00',
  UNDERLINE_ON: ESC + '-' + '\x01',
  UNDERLINE_OFF: ESC + '-' + '\x00',
  INVERSE_ON: GS + 'B' + '\x01',
  INVERSE_OFF: GS + 'B' + '\x00',
  
  // Corte
  CUT_FULL: GS + 'V' + '\x00',
  CUT_PARTIAL: GS + 'V' + '\x01',
  
  // Gaveta
  OPEN_DRAWER: ESC + 'p' + '\x00' + '\x19' + '\xFA',
  
  // QR Code (modelo 2)
  QR_MODEL: GS + '(k' + '\x04\x00' + '\x31\x41' + '\x32\x00',
  QR_SIZE: (size: number) => GS + '(k' + '\x03\x00' + '\x31\x43' + String.fromCharCode(size),
  QR_ERROR_CORRECTION: (level: number) => GS + '(k' + '\x03\x00' + '\x31\x45' + String.fromCharCode(level),
  QR_STORE: (data: string) => {
    const len = data.length + 3
    const pl = len % 256
    const ph = Math.floor(len / 256)
    return GS + '(k' + String.fromCharCode(pl) + String.fromCharCode(ph) + '\x31\x50\x30' + data
  },
  QR_PRINT: GS + '(k' + '\x03\x00' + '\x31\x51\x30',
}

export interface ThermalPrintConfig {
  incluirObservacoes: boolean
  incluirValores: boolean
  incluirTelefone: boolean
  incluirGarantia: boolean
  incluirSLA: boolean
  incluirOSLoja: boolean
  incluirOSLab: boolean
  incluirQRCode: boolean
  tamanhoFonte: 'pequeno' | 'medio' | 'grande'
  abrirGaveta: boolean
  numeroCopias: number
}

/**
 * Gera linha tracejada para separação
 */
export function gerarLinhaSeparadora(largura: 48 | 58 = 48): string {
  return '-'.repeat(largura) + LF
}

/**
 * Centraliza texto em uma linha
 */
export function centralizarTexto(texto: string, largura: 48 | 58 = 48): string {
  if (texto.length >= largura) return texto
  const espacos = Math.floor((largura - texto.length) / 2)
  return ' '.repeat(espacos) + texto
}

/**
 * Alinha texto à direita
 */
export function alinharDireita(texto: string, largura: 48 | 58 = 48): string {
  if (texto.length >= largura) return texto
  const espacos = largura - texto.length
  return ' '.repeat(espacos) + texto
}

/**
 * Formata linha com label e valor (tipo: "LABEL: Valor")
 */
export function formatarLinhaLabelValor(label: string, valor: string, largura: 48 | 58 = 48): string {
  const linha = `${label}: ${valor}`
  if (linha.length <= largura) return linha + LF
  
  // Se não couber, quebra em múltiplas linhas
  return label + ':' + LF + '  ' + valor + LF
}

/**
 * Quebra texto longo em múltiplas linhas
 */
export function quebrarTexto(texto: string, largura: 48 | 58 = 48): string {
  if (!texto) return ''
  
  const palavras = texto.split(' ')
  const linhas: string[] = []
  let linhaAtual = ''
  
  palavras.forEach(palavra => {
    if ((linhaAtual + palavra).length <= largura) {
      linhaAtual += (linhaAtual ? ' ' : '') + palavra
    } else {
      if (linhaAtual) linhas.push(linhaAtual)
      linhaAtual = palavra
    }
  })
  
  if (linhaAtual) linhas.push(linhaAtual)
  return linhas.join(LF) + LF
}

/**
 * Gera QR Code com dados do pedido
 */
export function gerarQRCode(pedido: PedidoCompleto): string {
  // Dados para o QR Code: URL ou texto identificador
  const qrData = `OS:${pedido.numero_sequencial}|${pedido.cliente_nome}|${pedido.loja_nome}`
  
  return (
    COMMANDS.QR_MODEL +
    COMMANDS.QR_SIZE(6) + // Tamanho 6 (adequado para 80mm)
    COMMANDS.QR_ERROR_CORRECTION(48) + // Nível de correção M (48)
    COMMANDS.QR_STORE(qrData) +
    COMMANDS.QR_PRINT
  )
}

/**
 * Gera comando completo de impressão térmica ESC/POS
 */
export function gerarComandoThermal(
  pedido: PedidoCompleto,
  config: ThermalPrintConfig
): string {
  let comando = ''
  const largura: 48 | 58 = 48 // 80mm = ~48 caracteres
  
  // Inicializa impressora
  comando += COMMANDS.INIT
  
  // Abre gaveta se configurado
  if (config.abrirGaveta) {
    comando += COMMANDS.OPEN_DRAWER
  }
  
  // Cabeçalho
  comando += COMMANDS.ALIGN_CENTER
  comando += COMMANDS.FONT_DOUBLE
  comando += COMMANDS.BOLD_ON
  comando += `PEDIDO #${pedido.numero_sequencial}${LF}`
  comando += COMMANDS.FONT_RESET
  comando += COMMANDS.BOLD_OFF
  comando += LF
  comando += gerarLinhaSeparadora(largura)
  comando += LF
  
  // Informações da loja e cliente
  comando += COMMANDS.ALIGN_LEFT
  comando += COMMANDS.FONT_NORMAL
  comando += formatarLinhaLabelValor('LOJA', pedido.loja_nome || 'N/A', largura)
  comando += formatarLinhaLabelValor('CLIENTE', pedido.cliente_nome || 'N/A', largura)
  
  if (config.incluirTelefone && pedido.cliente_telefone) {
    comando += formatarLinhaLabelValor('TELEFONE', pedido.cliente_telefone, largura)
  }
  
  comando += LF
  comando += gerarLinhaSeparadora(largura)
  comando += LF
  
  // Números de OS
  if (config.incluirOSLoja && pedido.numero_os_fisica) {
    comando += formatarLinhaLabelValor('OS LOJA', pedido.numero_os_fisica, largura)
  }
  
  if (config.incluirOSLab && pedido.numero_pedido_laboratorio) {
    comando += formatarLinhaLabelValor('OS LAB', pedido.numero_pedido_laboratorio, largura)
  }
  
  comando += formatarLinhaLabelValor('LABORATORIO', pedido.laboratorio_nome || 'N/A', largura)
  comando += formatarLinhaLabelValor('CLASSE', pedido.classe_nome || 'N/A', largura)
  
  comando += LF
  comando += gerarLinhaSeparadora(largura)
  comando += LF
  
  // Datas
  if (pedido.data_pedido) {
    const dataPedido = format(new Date(pedido.data_pedido), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    comando += formatarLinhaLabelValor('DATA PEDIDO', dataPedido, largura)
  }
  
  if (pedido.data_prometida) {
    const dataPrometida = format(new Date(pedido.data_prometida), 'dd/MM/yyyy', { locale: ptBR })
    comando += formatarLinhaLabelValor('DATA PROM.', dataPrometida, largura)
  }
  
  // SLA
  if (config.incluirSLA && pedido.dias_para_vencer_sla !== null) {
    let slaTexto = ''
    if (pedido.dias_para_vencer_sla < 0) {
      slaTexto = `ATRASADO (${Math.abs(pedido.dias_para_vencer_sla)} dias)`
    } else if (pedido.dias_para_vencer_sla === 0) {
      slaTexto = 'VENCE HOJE'
    } else {
      slaTexto = `${pedido.dias_para_vencer_sla} dias restantes`
    }
    comando += formatarLinhaLabelValor('SLA', slaTexto, largura)
  }
  
  comando += LF
  comando += gerarLinhaSeparadora(largura)
  comando += LF
  
  // Status e Prioridade
  comando += formatarLinhaLabelValor('STATUS', pedido.status, largura)
  comando += formatarLinhaLabelValor('PRIORIDADE', pedido.prioridade, largura)
  
  // Valores
  if (config.incluirValores && (pedido.valor_pedido || pedido.custo_lentes)) {
    comando += LF
    comando += gerarLinhaSeparadora(largura)
    comando += LF
    
    if (pedido.valor_pedido) {
      const valorFormatado = `R$ ${pedido.valor_pedido.toFixed(2).replace('.', ',')}`
      comando += formatarLinhaLabelValor('VALOR TOTAL', valorFormatado, largura)
    }
    
    if (pedido.custo_lentes) {
      const custoFormatado = `R$ ${pedido.custo_lentes.toFixed(2).replace('.', ',')}`
      comando += formatarLinhaLabelValor('CUSTO LENTES', custoFormatado, largura)
    }
  }
  
  // Observações
  if (config.incluirObservacoes && pedido.observacoes) {
    comando += LF
    comando += gerarLinhaSeparadora(largura)
    comando += LF
    comando += COMMANDS.BOLD_ON
    comando += 'OBSERVACOES:' + LF
    comando += COMMANDS.BOLD_OFF
    comando += quebrarTexto(pedido.observacoes, largura)
  }
  
  // Garantia
  if (config.incluirGarantia && pedido.eh_garantia && pedido.observacoes_garantia) {
    comando += LF
    comando += gerarLinhaSeparadora(largura)
    comando += LF
    comando += COMMANDS.BOLD_ON
    comando += COMMANDS.INVERSE_ON
    comando += '*** GARANTIA ***' + LF
    comando += COMMANDS.INVERSE_OFF
    comando += COMMANDS.BOLD_OFF
    comando += quebrarTexto(pedido.observacoes_garantia, largura)
  }
  
  // QR Code
  if (config.incluirQRCode) {
    comando += LF
    comando += gerarLinhaSeparadora(largura)
    comando += LF
    comando += COMMANDS.ALIGN_CENTER
    comando += gerarQRCode(pedido)
    comando += LF
    comando += 'Escaneie para detalhes' + LF
  }
  
  // Rodapé
  comando += LF
  comando += gerarLinhaSeparadora(largura)
  comando += COMMANDS.ALIGN_CENTER
  const dataImpressao = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  comando += `Impresso em: ${dataImpressao}${LF}`
  comando += LF
  comando += LF
  comando += LF
  
  // Corte
  comando += COMMANDS.CUT_PARTIAL
  
  return comando
}

/**
 * Envia comando ESC/POS para impressora via Web Serial API
 * Suporta conexão direta USB com impressoras térmicas
 */
export async function imprimirViaWebSerial(comando: string): Promise<void> {
  if (!('serial' in navigator)) {
    throw new Error('Web Serial API não disponível neste navegador. Use Chrome/Edge.')
  }
  
  try {
    // Solicita acesso à porta serial
    const port = await (navigator as any).serial.requestPort({
      filters: [
        { usbVendorId: 0x04b8 }, // Epson
        { usbVendorId: 0x0519 }, // Bematech
        { usbVendorId: 0x0fe6 }, // IVI/Sweda
      ]
    })
    
    // Abre a porta
    await port.open({ 
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      flowControl: 'none'
    })
    
    // Converte string para bytes
    const encoder = new TextEncoder()
    const data = encoder.encode(comando)
    
    // Envia dados
    const writer = port.writable.getWriter()
    await writer.write(data)
    writer.releaseLock()
    
    // Aguarda impressão
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Fecha porta
    await port.close()
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      throw new Error('Nenhuma impressora selecionada')
    }
    throw error
  }
}

/**
 * Download do comando ESC/POS como arquivo .prn
 * Útil para impressão via software intermediário
 */
export function downloadComandoPRN(comando: string, nomeArquivo: string): void {
  const blob = new Blob([comando], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo + '.prn'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Envia para impressora via fetch (requer servidor bridge local)
 * Útil para integração com software de impressão já instalado
 */
export async function imprimirViaBridge(
  comando: string,
  endpointUrl: string = 'http://localhost:9100'
): Promise<void> {
  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: comando,
    })
    
    if (!response.ok) {
      throw new Error(`Erro na impressão: ${response.statusText}`)
    }
  } catch (error) {
    if ((error as Error).name === 'TypeError') {
      throw new Error('Servidor de impressão não encontrado. Verifique se está rodando na porta 9100.')
    }
    throw error
  }
}
