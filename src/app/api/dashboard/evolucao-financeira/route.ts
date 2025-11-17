// api/dashboard/evolucao-financeira/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface DadosEvolucaoFinanceira {
  periodo: string
  receita: number
  custos: number
  margem: number
  pedidos: number
  ticket_medio: number
  margem_percentual: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parâmetros de filtro
    const dataInicio = searchParams.get('data_inicio') 
    const dataFim = searchParams.get('data_fim')
    const periodo = searchParams.get('periodo') || '30' // dias (fallback)
    const agrupamento = searchParams.get('agrupamento') || 'day' // day, week, month, year
    const laboratorio_id = searchParams.get('laboratorio_id')
    const loja_id = searchParams.get('loja_id')
    const classe = searchParams.get('classe')

    const supabase = createServerComponentClient({ cookies })

    // Calcular datas
    let dataFinalInicio: Date
    let dataFinalFim: Date
    
    if (dataInicio && dataFim) {
      dataFinalInicio = new Date(dataInicio)
      dataFinalFim = new Date(dataFim)
    } else {
      dataFinalFim = new Date()
      dataFinalInicio = new Date()
      dataFinalInicio.setDate(dataFinalFim.getDate() - parseInt(periodo))
    }

    // Formato de agrupamento SQL
    const formatosAgrupamento = {
      day: "DATE(data_criacao) as periodo_grupo",
      week: "DATE_TRUNC('week', data_criacao) as periodo_grupo", 
      month: "DATE_TRUNC('month', data_criacao) as periodo_grupo",
      year: "DATE_TRUNC('year', data_criacao) as periodo_grupo"
    }

    const agrupamentoSQL = formatosAgrupamento[agrupamento as keyof typeof formatosAgrupamento]

    // Construir query com filtros - usando estrutura correta da tabela pedidos
    let query = supabase
      .from('pedidos')
      .select(`
        created_at,
        valor_pedido,
        custo_lentes,
        laboratorio_id,
        loja_id
      `)
      .neq('status', 'CANCELADO')
      .gte('created_at', dataFinalInicio.toISOString())
      .lte('created_at', dataFinalFim.toISOString())
      .order('created_at', { ascending: true })

    // Aplicar filtros opcionais
    if (laboratorio_id) {
      query = query.eq('laboratorio_id', laboratorio_id)
    }
    if (loja_id) {
      query = query.eq('loja_id', loja_id)
    }
    // Removido filtro por classe pois a coluna não existe

    const { data: pedidos, error } = await query

    if (error) {
      console.error('Erro ao buscar pedidos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar dados de evolução financeira' },
        { status: 500 }
      )
    }

    // Processar dados por período
    const dadosAgrupados = new Map<string, {
      receita: number
      custos: number
      pedidos: number
    }>()

    pedidos?.forEach(pedido => {
      const data = new Date(pedido.created_at)
      let chaveGrupo: string

      switch (agrupamento) {
        case 'day':
          chaveGrupo = data.toISOString().split('T')[0]
          break
        case 'week':
          const inicioSemana = new Date(data)
          inicioSemana.setDate(data.getDate() - data.getDay())
          chaveGrupo = inicioSemana.toISOString().split('T')[0]
          break
        case 'month':
          chaveGrupo = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-01`
          break
        case 'year':
          chaveGrupo = `${data.getFullYear()}-01-01`
          break
        default:
          chaveGrupo = data.toISOString().split('T')[0]
      }

      const grupoExistente = dadosAgrupados.get(chaveGrupo) || {
        receita: 0,
        custos: 0,
        pedidos: 0
      }

      grupoExistente.receita += pedido.valor_pedido || 0
      grupoExistente.custos += pedido.custo_lentes || 0
      grupoExistente.pedidos += 1

      dadosAgrupados.set(chaveGrupo, grupoExistente)
    })

    // Converter para array e calcular métricas derivadas
    const evolucaoFinanceira: DadosEvolucaoFinanceira[] = Array.from(dadosAgrupados.entries())
      .map(([periodo, dados]) => ({
        periodo,
        receita: dados.receita,
        custos: dados.custos,
        margem: dados.receita - dados.custos,
        pedidos: dados.pedidos,
        ticket_medio: dados.pedidos > 0 ? dados.receita / dados.pedidos : 0,
        margem_percentual: dados.receita > 0 ? ((dados.receita - dados.custos) / dados.receita) * 100 : 0
      }))
      .sort((a, b) => new Date(a.periodo).getTime() - new Date(b.periodo).getTime())

    // Preencher períodos vazios para continuidade visual
    if (evolucaoFinanceira.length > 0) {
      const periodoCompleto: DadosEvolucaoFinanceira[] = []
      const inicio = new Date(evolucaoFinanceira[0].periodo)
      const fim = new Date(evolucaoFinanceira[evolucaoFinanceira.length - 1].periodo)

      let dataAtual = new Date(inicio)
      while (dataAtual <= fim) {
        const chaveData = dataAtual.toISOString().split('T')[0]
        const dadosExistentes = evolucaoFinanceira.find(d => d.periodo === chaveData)
        
        if (dadosExistentes) {
          periodoCompleto.push(dadosExistentes)
        } else {
          periodoCompleto.push({
            periodo: chaveData,
            receita: 0,
            custos: 0,
            margem: 0,
            pedidos: 0,
            ticket_medio: 0,
            margem_percentual: 0
          })
        }

        // Incrementar data baseado no agrupamento
        switch (agrupamento) {
          case 'day':
            dataAtual.setDate(dataAtual.getDate() + 1)
            break
          case 'week':
            dataAtual.setDate(dataAtual.getDate() + 7)
            break
          case 'month':
            dataAtual.setMonth(dataAtual.getMonth() + 1)
            break
          case 'year':
            dataAtual.setFullYear(dataAtual.getFullYear() + 1)
            break
        }
      }

      return NextResponse.json(periodoCompleto)
    }

    return NextResponse.json(evolucaoFinanceira)

  } catch (error) {
    console.error('Erro na API de evolução financeira:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}