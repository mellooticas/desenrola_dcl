import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Verificar se o webhook vem do Supabase
    const webhookSecret = request.headers.get('x-webhook-secret')
    
    if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Webhook não autorizado' },
        { status: 401 }
      )
    }
    
    const payload = await request.json()
    const { table, record, old_record, type } = payload
    
    console.log('Webhook recebido:', { table, type, record_id: record?.id })
    
    // Processar diferentes tipos de eventos
    switch (table) {
      case 'pedidos':
        await processarEventoPedido(type, record, old_record)
        break
        
      case 'alertas':
        await processarEventoAlerta(type, record)
        break
        
      default:
        console.log('Tabela não processada pelo webhook:', table)
    }
    
    return NextResponse.json({ success: true, processed: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do webhook' },
      { status: 500 }
    )
  }
}

async function processarEventoPedido(type: string, record: any, old_record: any) {
  try {
  const supabase = getServerSupabase()
    
    if (type === 'UPDATE' && old_record && record) {
      // Status mudou?
      if (old_record.status !== record.status) {
        console.log(`Status alterado: ${old_record.status} → ${record.status}`)
        
        // Se mudou para PAGO, calcular SLA
        if (record.status === 'PAGO' && old_record.status !== 'PAGO') {
          await supabase.rpc('calcular_sla_pedido', {
            pedido_uuid: record.id
          })
        }
        
        // Se chegou na loja, criar alerta para cliente
        if (record.status === 'CHEGOU') {
          await supabase
            .from('alertas')
            .insert({
              pedido_id: record.id,
              tipo: 'pedido_chegou',
              titulo: 'Pedido chegou na loja',
              mensagem: `Seu pedido #${record.numero_sequencial} chegou na loja e está pronto para retirada!`,
              lido: false,
              destinatario: 'cliente'
            })
        }
      }
      
      // Valor mudou?
      if (old_record.valor_pedido !== record.valor_pedido) {
        console.log(`Valor alterado: ${old_record.valor_pedido} → ${record.valor_pedido}`)
      }
    }
    
    if (type === 'INSERT') {
      console.log('Novo pedido criado:', record.numero_sequencial)
      
      // Criar evento inicial
      await supabase
        .from('pedido_eventos')
        .insert({
          pedido_id: record.id,
          tipo: 'CREATE',
          titulo: 'Pedido registrado',
          descricao: 'Pedido criado no sistema',
          status_novo: record.status,
          usuario: record.created_by || 'system',
          automatico: true
        })
    }
  } catch (error) {
    console.error('Erro ao processar evento de pedido:', error)
  }
}

async function processarEventoAlerta(type: string, record: any) {
  try {
    if (type === 'INSERT') {
      console.log('Novo alerta criado:', record.titulo)
      
      // Aqui você pode integrar com:
      // - Push notifications
      // - WhatsApp
      // - Email
      // - Slack
      
      // Exemplo: Se for alerta crítico, enviar notificação imediata
      if (record.tipo === 'payment_overdue' || record.tipo === 'production_delayed') {
        console.log('⚠️ ALERTA CRÍTICO:', record.titulo)
        // TODO: Implementar notificação push/WhatsApp
      }
    }
  } catch (error) {
    console.error('Erro ao processar evento de alerta:', error)
  }
}

// Endpoint para laboratórios externos enviarem atualizações
export async function PUT(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    
    // Verificar API key do laboratório
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key obrigatória' },
        { status: 401 }
      )
    }
    
  const supabase = getServerSupabase()
    
    // Verificar se o laboratório é válido
    const { data: laboratorio, error: labError } = await supabase
      .from('laboratorios')
      .select('id, nome')
      .eq('codigo', apiKey)
      .eq('ativo', true)
      .single()
    
    if (labError || !laboratorio) {
      return NextResponse.json(
        { error: 'Laboratório não autorizado' },
        { status: 401 }
      )
    }
    
    const { numero_pedido_laboratorio, status, observacao } = await request.json()
    
    if (!numero_pedido_laboratorio || !status) {
      return NextResponse.json(
        { error: 'Número do pedido e status são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Buscar pedido pelo número do laboratório
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, status, numero_sequencial')
      .eq('numero_pedido_laboratorio', numero_pedido_laboratorio)
      .eq('laboratorio_id', laboratorio.id)
      .single()
    
    if (pedidoError || !pedido) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    // Mapear status do laboratório para nosso sistema
    const statusMap: Record<string, string> = {
      'em_producao': 'PRODUCAO',
      'producao': 'PRODUCAO',
      'pronto': 'PRONTO',
      'finalizado': 'PRONTO',
      'enviado': 'ENVIADO',
      'despachado': 'ENVIADO'
    }
    
    const novoStatus = statusMap[status.toLowerCase()] || status.toUpperCase()
    
    // Atualizar status do pedido
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({
        status: novoStatus,
        updated_at: new Date().toISOString(),
        updated_by: `lab_${laboratorio.nome}`
      })
      .eq('id', pedido.id)
    
    if (updateError) {
      return NextResponse.json(
        { error: 'Erro ao atualizar pedido' },
        { status: 500 }
      )
    }
    
    // Registrar evento
    await supabase
      .from('pedido_eventos')
      .insert({
        pedido_id: pedido.id,
        tipo: 'LAB_UPDATE',
        titulo: `Atualização do laboratório: ${novoStatus}`,
        descricao: observacao || `Status atualizado pelo laboratório ${laboratorio.nome}`,
        status_anterior: pedido.status,
        status_novo: novoStatus,
        usuario: `lab_${laboratorio.nome}`,
        automatico: true
      })
    
    return NextResponse.json({
      success: true,
      message: 'Status atualizado com sucesso',
      pedido_numero: pedido.numero_sequencial,
      status_anterior: pedido.status,
      status_novo: novoStatus
    })
  } catch (error) {
    console.error('Erro no webhook de laboratório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}