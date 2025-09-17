import { NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Gestor {
  id: string
  email: string
}

export async function POST() {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({ sucesso: false, erro: 'Variáveis de ambiente não configuradas' }, { status: 500 })
    }

    const supabase = getServerSupabase()

    // Buscar laboratórios com problemas (exemplo: SLA baixo, muitos atrasos)
    const { data: labsProblematicos, error: labsError } = await supabase
      .from('laboratorios')
      .select(`
        id,
        nome,
        sla_padrao_dias,
        ativo
      `)
      .eq('ativo', true)

    if (labsError) {
      return NextResponse.json({ sucesso: false, erro: labsError.message }, { status: 500 })
    }

    // Buscar gestores para notificar
    const { data: gestores, error: gestoresError } = await supabase
      .from('usuarios')
      .select('id, email, nome')
      .eq('role', 'gestor')
      .eq('ativo', true)

    if (gestoresError) {
      return NextResponse.json({ sucesso: false, erro: gestoresError.message }, { status: 500 })
    }

    let notificacoesCriadas = 0

    // Para cada laboratório, verificar métricas e criar resumo se necessário
    for (const lab of labsProblematicos || []) {
      // Buscar pedidos em atraso do laboratório
      const { data: pedidosAtrasados } = await supabase
        .from('v_pedidos_kanban')
        .select('id, numero_sequencial, cliente_nome, dias_para_vencer_sla')
        .eq('laboratorio_id', lab.id)
        .lt('dias_para_vencer_sla', 0) // Negativos = atrasados

      if (pedidosAtrasados && pedidosAtrasados.length > 0) {
        // Criar notificação de resumo diário
        for (const gestor of gestores as Gestor[]) {
          const { error: notifError } = await supabase
            .from('alertas')
            .insert({
              tipo: 'resumo_diario_laboratorio',
              titulo: `Resumo diário: ${lab.nome}`,
              mensagem: `${pedidosAtrasados.length} pedido(s) em atraso no laboratório ${lab.nome}`,
              lido: false,
              destinatario: gestor.email,
              created_at: new Date().toISOString()
            })

          if (!notifError) {
            notificacoesCriadas++
          }
        }
      }
    }

    // Criar resumo geral do dia
    const { data: resumoGeral } = await supabase
      .from('v_dashboard_resumo')
      .select('*')
      .single()

    if (resumoGeral) {
      for (const gestor of gestores as Gestor[]) {
        const { error: resumoError } = await supabase
          .from('alertas')
          .insert({
            tipo: 'resumo_diario_geral',
            titulo: 'Resumo diário do sistema',
            mensagem: `Total: ${resumoGeral.total_pedidos || 0} pedidos, ${resumoGeral.aguardando_pagamento || 0} aguardando pagamento, ${resumoGeral.em_producao || 0} em produção`,
            lido: false,
            destinatario: gestor.email,
            created_at: new Date().toISOString()
          })

        if (!resumoError) {
          notificacoesCriadas++
        }
      }
    }

    return NextResponse.json({ 
      sucesso: true, 
      labs_verificados: labsProblematicos?.length || 0,
      notificacoes_criadas: notificacoesCriadas,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao gerar resumo diário:', error)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}