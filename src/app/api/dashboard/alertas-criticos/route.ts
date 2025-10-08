// ================================================================
// src/app/api/dashboard/alertas-criticos/route.ts
// VERSÃO COMPLETA PARA CENTRO DE COMANDO
// ================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabase()
    const { searchParams } = new URL(request.url)
    
    // Extrair todos os filtros disponíveis
    const lojaId = searchParams.get('loja_id')
    const laboratorioId = searchParams.get('laboratorio_id')
    const dataInicio = searchParams.get('data_inicio')
    const dataFim = searchParams.get('data_fim')
    
    console.log('🚨 Calculando alertas críticos com filtros:', { 
      lojaId, 
      laboratorioId, 
      dataInicio, 
      dataFim 
    })
    
    // Definir período de análise (se não especificado, últimos 30 dias)
    const dataFimAnalise = dataFim || new Date().toISOString().split('T')[0]
    const dataInicioAnalise = dataInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // 1. PEDIDOS ATRASADOS (considerando período)
    let queryAtrasados = supabase
      .from('pedidos')
      .select(`
        id, numero_sequencial, cliente_nome, 
        data_prevista_pronto, status,
        loja_id, laboratorio_id, data_pedido
      `)
      .not('data_prevista_pronto', 'is', null)
      .not('status', 'in', '("ENTREGUE", "CANCELADO")')
      .gte('data_pedido', dataInicioAnalise)
      .lte('data_pedido', dataFimAnalise)
      .lt('data_prevista_pronto', new Date().toISOString().split('T')[0])
      .order('data_prevista_pronto', { ascending: true })
      .limit(10)
    
    if (lojaId) {
      queryAtrasados = queryAtrasados.eq('loja_id', lojaId)
    }
    
    if (laboratorioId) {
      queryAtrasados = queryAtrasados.eq('laboratorio_id', laboratorioId)
    }
    
    const { data: pedidosAtrasados } = await queryAtrasados
    
    // 2. PEDIDOS PRÓXIMOS AO VENCIMENTO (próximos 2 dias dentro do período)
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + 2)
    
    let queryVencimento = supabase
      .from('pedidos')
      .select(`
        id, numero_sequencial, cliente_nome,
        data_prevista_pronto, status, data_pedido
      `)
      .not('data_prevista_pronto', 'is', null)
      .not('status', 'in', '("ENTREGUE", "CANCELADO")')
      .gte('data_pedido', dataInicioAnalise)
      .lte('data_pedido', dataFimAnalise)
      .gte('data_prevista_pronto', new Date().toISOString().split('T')[0])
      .lte('data_prevista_pronto', dataLimite.toISOString().split('T')[0])
      .order('data_prevista_pronto', { ascending: true })
      .limit(5)
    
    if (lojaId) {
      queryVencimento = queryVencimento.eq('loja_id', lojaId)
    }
    
    if (laboratorioId) {
      queryVencimento = queryVencimento.eq('laboratorio_id', laboratorioId)
    }
    
    const { data: pedidosVencimento } = await queryVencimento
    
    // 3. PAGAMENTOS PENDENTES (mais de 3 dias dentro do período)
    const dataLimitePagamento = new Date()
    dataLimitePagamento.setDate(dataLimitePagamento.getDate() - 3)
    
    let queryPagamentos = supabase
      .from('pedidos')
      .select(`
        id, numero_sequencial, cliente_nome,
        valor_pedido, data_pedido, status
      `)
      .eq('status', 'AG_PAGAMENTO')
      .gte('data_pedido', dataInicioAnalise)
      .lte('data_pedido', dataFimAnalise)
      .lt('data_pedido', dataLimitePagamento.toISOString().split('T')[0])
      .order('data_pedido', { ascending: true })
      .limit(5)
    
    if (lojaId) {
      queryPagamentos = queryPagamentos.eq('loja_id', lojaId)
    }
    
    if (laboratorioId) {
      queryPagamentos = queryPagamentos.eq('laboratorio_id', laboratorioId)
    }
    
    const { data: pagamentosPendentes } = await queryPagamentos
    
    // 4. ALERTAS DO SISTEMA (não lidos)
    let queryAlertas = supabase
      .from('alertas')
      .select('*')
      .eq('lido', false)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (lojaId) {
      queryAlertas = queryAlertas.eq('loja_id', lojaId)
    }
    
    const { data: alertasSistema } = await queryAlertas
    
    // 5. COMPILAR TODOS OS ALERTAS
    type AlertaItem = {
      id: string
      tipo: string
      prioridade: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA'
      titulo: string
      mensagem: string
      dados: any
      created_at: string
    }
    
    const alertas: AlertaItem[] = []
    
    // Processar pedidos atrasados
    if (pedidosAtrasados && pedidosAtrasados.length > 0) {
      pedidosAtrasados.forEach(p => {
        const diasAtraso = Math.floor(
          (new Date().getTime() - new Date(p.data_prevista_pronto).getTime()) / (1000 * 60 * 60 * 24)
        )
        alertas.push({
          id: `atraso-${p.id}`,
          tipo: 'PEDIDO_ATRASADO',
          prioridade: diasAtraso > 7 ? 'CRITICA' : diasAtraso > 3 ? 'ALTA' : 'MEDIA',
          titulo: `Pedido #${p.numero_sequencial} atrasado`,
          mensagem: `Cliente ${p.cliente_nome} - ${diasAtraso} dias de atraso`,
          dados: p,
          created_at: p.data_prevista_pronto
        })
      })
    }
    
    // Processar próximos ao vencimento
    if (pedidosVencimento && pedidosVencimento.length > 0) {
      pedidosVencimento.forEach(p => {
        const diasRestantes = Math.floor(
          (new Date(p.data_prevista_pronto).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
        alertas.push({
          id: `vencimento-${p.id}`,
          tipo: 'SLA_PROXIMO_VENCIMENTO',
          prioridade: diasRestantes <= 1 ? 'ALTA' : 'MEDIA',
          titulo: `SLA próximo ao vencimento`,
          mensagem: `Pedido #${p.numero_sequencial} vence em ${diasRestantes} dia(s)`,
          dados: p,
          created_at: new Date().toISOString()
        })
      })
    }
    
    // Processar pagamentos pendentes
    if (pagamentosPendentes && pagamentosPendentes.length > 0) {
      pagamentosPendentes.forEach(p => {
        const diasPendente = Math.floor(
          (new Date().getTime() - new Date(p.data_pedido).getTime()) / (1000 * 60 * 60 * 24)
        )
        alertas.push({
          id: `pagamento-${p.id}`,
          tipo: 'PAGAMENTO_PENDENTE',
          prioridade: diasPendente > 7 ? 'ALTA' : 'MEDIA',
          titulo: `Pagamento pendente há ${diasPendente} dias`,
          mensagem: `Pedido #${p.numero_sequencial} - R$ ${p.valor_pedido}`,
          dados: p,
          created_at: p.data_pedido
        })
      })
    }
    
    // Processar alertas do sistema
    if (alertasSistema && alertasSistema.length > 0) {
      alertasSistema.forEach(a => {
        alertas.push({
          id: `sistema-${a.id}`,
          tipo: a.tipo,
          prioridade: 'MEDIA',
          titulo: a.titulo || 'Alerta do sistema',
          mensagem: a.mensagem,
          dados: a,
          created_at: a.created_at
        })
      })
    }
    
    // 6. ORDENAR POR PRIORIDADE E DATA
    const prioridadeOrdem = { 'CRITICA': 0, 'ALTA': 1, 'MEDIA': 2, 'BAIXA': 3 }
    alertas.sort((a, b) => {
      if (prioridadeOrdem[a.prioridade] !== prioridadeOrdem[b.prioridade]) {
        return prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    // 7. RESUMO ESTATÍSTICO
    const resumo = {
      total_alertas: alertas.length,
      criticos: alertas.filter(a => a.prioridade === 'CRITICA').length,
      alta_prioridade: alertas.filter(a => a.prioridade === 'ALTA').length,
      pedidos_atrasados: pedidosAtrasados?.length || 0,
      pagamentos_pendentes: pagamentosPendentes?.length || 0,
      proximos_vencimento: pedidosVencimento?.length || 0
    }
    
    console.log(`✅ Alertas processados: ${alertas.length} encontrados`)
    
    // Converter prioridade para severidade para compatibilidade com o frontend
    const alertasFormatados = alertas.slice(0, 20).map(alerta => ({
      ...alerta,
      severidade: alerta.prioridade.toLowerCase(),
      descricao: alerta.mensagem
    }))
    
    return NextResponse.json({
      alertas: alertasFormatados,
      resumo,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro na API de alertas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar alertas críticos' },
      { status: 500 }
    )
  }
}