// src/hooks/useTimzoneBrasil.ts
// Hook para trabalhar com timezone brasileiro

import { useState, useEffect } from 'react'

interface TimezoneBrasil {
  dataAtual: Date
  horaAtual: string
  dataFormatada: string
  eDepoisDasVinte: boolean
  proximaRenovacao: Date
  tempoParaRenovacao: string
}

export function useTimezoneBrasil() {
  const [timeData, setTimeData] = useState<TimezoneBrasil | null>(null)

  useEffect(() => {
    const atualizarHora = () => {
      const agora = new Date()
      
      // Converter para timezone do Brasil
      const dataAtualBrasil = new Date(agora.toLocaleString('en-US', { 
        timeZone: 'America/Sao_Paulo' 
      }))
      
      const horaAtual = dataAtualBrasil.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      
      const dataFormatada = dataAtualBrasil.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      const eDepoisDasVinte = dataAtualBrasil.getHours() >= 20
      
      // Calcular próxima renovação (hoje às 20h ou amanhã às 20h)
      const proximaRenovacao = new Date(dataAtualBrasil)
      if (eDepoisDasVinte) {
        // Se já passou das 20h, próxima é amanhã
        proximaRenovacao.setDate(proximaRenovacao.getDate() + 1)
      }
      proximaRenovacao.setHours(20, 0, 0, 0)
      
      // Calcular tempo restante
      const diffMs = proximaRenovacao.getTime() - dataAtualBrasil.getTime()
      const horas = Math.floor(diffMs / (1000 * 60 * 60))
      const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const segundos = Math.floor((diffMs % (1000 * 60)) / 1000)
      
      const tempoParaRenovacao = diffMs <= 0 
        ? 'Renovação disponível!'
        : `${horas}h ${minutos}m ${segundos}s`
      
      setTimeData({
        dataAtual: dataAtualBrasil,
        horaAtual,
        dataFormatada,
        eDepoisDasVinte,
        proximaRenovacao,
        tempoParaRenovacao
      })
    }
    
    // Atualizar imediatamente
    atualizarHora()
    
    // Atualizar a cada segundo
    const interval = setInterval(atualizarHora, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return timeData
}

// Utilitários para trabalhar com datas brasileiras
export const timezoneBrasilUtils = {
  // Obter data atual no Brasil
  agora: () => new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
  
  // Obter data de hoje no Brasil (sem hora)
  hoje: () => {
    const agora = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    return new Date(agora).toISOString().split('T')[0]
  },
  
  // Obter data de ontem no Brasil
  ontem: () => {
    const agora = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    const ontem = new Date(agora)
    ontem.setDate(ontem.getDate() - 1)
    return ontem.toISOString().split('T')[0]
  },
  
  // Verificar se é após 20h no Brasil
  eDepoisDasVinte: () => {
    const agora = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    return new Date(agora).getHours() >= 20
  },
  
  // Formatar data para exibição brasileira
  formatarData: (data: string | Date) => {
    const date = typeof data === 'string' ? new Date(data) : data
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  },
  
  // Formatar data e hora para exibição brasileira
  formatarDataHora: (data: string | Date) => {
    const date = typeof data === 'string' ? new Date(data) : data
    return date.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  },
  
  // Obter próximo horário de renovação
  proximaRenovacao: () => {
    const agora = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })
    const agoraBrasil = new Date(agora)
    const proxima = new Date(agoraBrasil)
    
    if (agoraBrasil.getHours() >= 20) {
      // Se já passou das 20h, próxima é amanhã
      proxima.setDate(proxima.getDate() + 1)
    }
    proxima.setHours(20, 0, 0, 0)
    
    return proxima
  }
}