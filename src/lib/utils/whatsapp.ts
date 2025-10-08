// ================================================================
// src/lib/utils/whatsapp.ts
// Utilitário para integração com WhatsApp via wa.me
// ================================================================

/**
 * Formata número de telefone brasileiro para WhatsApp
 * Remove caracteres especiais e adiciona código do país (55)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return ''
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Se já tem código do país, retorna
  if (cleanPhone.startsWith('55') && cleanPhone.length >= 12) {
    return cleanPhone
  }
  
  // Se começa com 0, remove
  const phoneWithoutZero = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone
  
  // Adiciona código do Brasil (55)
  return `55${phoneWithoutZero}`
}

/**
 * Abre WhatsApp Web/App com mensagem pré-formatada
 */
export function openWhatsApp(phone: string, message?: string): void {
  const formattedPhone = formatPhoneForWhatsApp(phone)
  
  if (!formattedPhone) {
    console.error('Número de telefone inválido')
    return
  }
  
  let url = `https://wa.me/${formattedPhone}`
  
  if (message) {
    // Codifica mensagem para URL
    const encodedMessage = encodeURIComponent(message)
    url += `?text=${encodedMessage}`
  }
  
  // Abre em nova aba
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Templates de mensagens para diferentes situações
 */
export const WhatsAppTemplates = {
  pedidoAtrasado: (clienteNome: string, numeroPedido: string, diasAtraso: number) => 
    `Olá ${clienteNome}! 👋\n\n` +
    `Seu pedido *#${numeroPedido}* está com *${diasAtraso} dia(s) de atraso*.\n\n` +
    `Estamos trabalhando para finalizar o mais rápido possível.\n\n` +
    `Qualquer dúvida, estou à disposição! 😊`,
  
  slaVencendo: (clienteNome: string, numeroPedido: string, diasRestantes: number) =>
    `Olá ${clienteNome}! 👋\n\n` +
    `Seu pedido *#${numeroPedido}* está previsto para ficar pronto em *${diasRestantes} dia(s)*.\n\n` +
    `Vamos avisar assim que estiver disponível para retirada! ✅`,
  
  pagamentoPendente: (clienteNome: string, numeroPedido: string, valor: number) =>
    `Olá ${clienteNome}! 👋\n\n` +
    `Identificamos que o pedido *#${numeroPedido}* no valor de *R$ ${valor.toFixed(2)}* está com pagamento pendente.\n\n` +
    `Poderia verificar? Qualquer dúvida, estou aqui! 😊`,
  
  pedidoPronto: (clienteNome: string, numeroPedido: string, lojaNome: string) =>
    `Olá ${clienteNome}! 👋\n\n` +
    `Seu pedido *#${numeroPedido}* está pronto para retirada na *${lojaNome}*! 🎉\n\n` +
    `Aguardamos sua visita! 😊`,
  
  custom: (clienteNome: string, message: string) =>
    `Olá ${clienteNome}! 👋\n\n${message}`
}
