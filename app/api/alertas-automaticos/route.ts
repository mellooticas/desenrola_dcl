import { NextResponse } from 'next/server'
import { getServerSupabase, hasServerSupabaseEnv } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface AlertaConfig {
  tipo: string
  condicao: string
  template: {
    titulo: string
    mensagem: string
  }
  destinatarios_sql: string
  severidade: 'info' | 'warning' | 'error'
}

const ALERTAS_CONFIG: AlertaConfig[] = [
  {
    tipo: 'pagamento_atrasado',
    condicao: "status = 'AG_PAGAMENTO' AND data_limite_pagamento < CURRENT_DATE",
    template: {
      titulo: 'Pagamento em atraso',
      mensagem: 'Pedido {numero_sequencial} - {cliente_nome} está com pagamento em atraso'
    },
    destinatarios_sql: "SELECT email FROM usuarios WHERE role IN ('financeiro', 'gestor')",
    severidade: 'warning'
  },
  {
    tipo: 'producao_atrasada', 
    condicao: "status = 'PRODUCAO' AND data_prevista_pronto < CURRENT_DATE",
    template: {
      titulo: 'Produção atrasada',
      mensagem: 'Pedido {numero_sequencial} no laboratório {laboratorio_nome} está atrasado'
    },
    destinatarios_sql: "SELECT email FROM usuarios WHERE role IN ('dcl', 'gestor')",
    severidade: 'error'
  }
]

function interpolateTemplate(template: string, dados: Record<string, unknown>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return String(dados[key] || match)
  })
}

export async function POST() {
  try {
    if (!hasServerSupabaseEnv()) {
      return NextResponse.json({ sucesso: false, erro: 'Variáveis de ambiente não configuradas' }, { status: 500 })
    }

    const supabase = getServerSupabase()
    let totalAlertas = 0

    for (const alertaConfig of ALERTAS_CONFIG) {
      // Para cada config de alerta, buscar pedidos que atendem à condição
      // Nota: Esta é uma implementação simplificada. Em produção, use views ou RPCs otimizadas.
      
      let pedidosQuery = supabase.from('v_pedidos_kanban').select('*')
      
      // Aplicar condições baseadas no tipo
      if (alertaConfig.tipo === 'pagamento_atrasado') {
        pedidosQuery = pedidosQuery
          .eq('status', 'AG_PAGAMENTO')
          .lt('data_limite_pagamento', new Date().toISOString().split('T')[0])
      } else if (alertaConfig.tipo === 'producao_atrasada') {
        pedidosQuery = pedidosQuery
          .eq('status', 'PRODUCAO')
          .lt('data_prevista_pronto', new Date().toISOString().split('T')[0])
      }

      const { data: pedidos, error: pedidosError } = await pedidosQuery

      if (pedidosError) {
        console.error(`Erro ao buscar pedidos para alerta ${alertaConfig.tipo}:`, pedidosError)
        continue
      }

      // Para cada pedido, criar alerta se ainda não existe
      for (const pedido of pedidos || []) {
        const { data: alertaExistente } = await supabase
          .from('alertas')
          .select('id')
          .eq('pedido_id', pedido.id)
          .eq('tipo', alertaConfig.tipo)
          .eq('lido', false)
          .single()

        if (!alertaExistente) {
          const titulo = interpolateTemplate(alertaConfig.template.titulo, pedido)
          const mensagem = interpolateTemplate(alertaConfig.template.mensagem, pedido)

          const { error: insertError } = await supabase
            .from('alertas')
            .insert({
              pedido_id: pedido.id,
              tipo: alertaConfig.tipo,
              titulo,
              mensagem,
              lido: false,
              loja_id: pedido.loja_id,
              created_at: new Date().toISOString()
            })

          if (!insertError) {
            totalAlertas++
          }
        }
      }
    }

    return NextResponse.json({ 
      sucesso: true, 
      alertas_criados: totalAlertas,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao processar alertas automáticos:', error)
    return NextResponse.json(
      { sucesso: false, erro: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}