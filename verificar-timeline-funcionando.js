const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM'
);

async function verificarTimeline() {
  console.log('🔍 VERIFICANDO SISTEMA DE TIMELINE\n');
  console.log('='.repeat(60));

  try {
    // 1. Verificar se a tabela foi populada
    console.log('\n📊 PASSO 1: Verificando População da Timeline');
    console.log('-'.repeat(60));
    
    const { data: timelineData, error: countError } = await supabase
      .from('v_pedido_timeline_completo')
      .select('id');
    
    if (countError) {
      console.error('❌ Erro ao buscar timeline:', countError);
      return;
    }

    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('id');

    const timelineCount = timelineData?.length || 0;
    const pedidosCount = pedidosData?.length || 0;

    console.log(`✅ Pedidos no sistema: ${pedidosCount}`);
    console.log(`✅ Eventos na timeline: ${timelineCount}`);
    console.log(`✅ Cobertura: ${((timelineCount / pedidosCount) * 100).toFixed(1)}%`);

    // 2. Ver alguns exemplos da timeline
    console.log('\n📋 PASSO 2: Exemplos de Eventos Registrados');
    console.log('-'.repeat(60));
    
    const { data: exemplos, error: exemplosError } = await supabase
      .from('v_pedido_timeline_completo')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (exemplosError) {
      console.error('❌ Erro ao buscar exemplos:', exemplosError);
    } else {
      exemplos.forEach((evento, idx) => {
        console.log(`\n${idx + 1}. Pedido #${evento.numero_pedido || evento.pedido_id.substring(0, 8)}`);
        console.log(`   Status: ${evento.status_anterior || 'CRIAÇÃO'} → ${evento.status_novo}`);
        console.log(`   Ação: ${evento.observacoes}`);
        console.log(`   Quando: ${new Date(evento.created_at).toLocaleString('pt-BR')}`);
        console.log(`   Responsável: ${evento.responsavel_nome || 'Sistema'}`);
      });
    }

    // 3. TESTE PRÁTICO: Fazer uma mudança de status e verificar se a trigger funciona
    console.log('\n\n🧪 PASSO 3: TESTE PRÁTICO DA TRIGGER');
    console.log('-'.repeat(60));
    
    // Pegar um pedido qualquer
    const { data: pedidoTeste, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, numero_pedido, status')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (pedidoError || !pedidoTeste) {
      console.error('❌ Erro ao buscar pedido para teste:', pedidoError);
      return;
    }

    console.log(`\n📦 Pedido de teste: #${pedidoTeste.numero_pedido}`);
    console.log(`   Status atual: ${pedidoTeste.status}`);

    // Contar eventos ANTES da mudança
    const { data: beforeData } = await supabase
      .from('v_pedido_timeline_completo')
      .select('id')
      .eq('pedido_id', pedidoTeste.id);

    const eventosBefore = beforeData?.length || 0;

    console.log(`   Eventos antes: ${eventosBefore}`);

    // Fazer a mudança de status
    const statusTeste = pedidoTeste.status === 'PAGO' ? 'PRODUCAO' : 'PAGO';
    console.log(`\n🔄 Mudando status para: ${statusTeste}`);
    
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ 
        status: statusTeste,
        updated_at: new Date().toISOString(),
        updated_by: 'Teste Automático Timeline'
      })
      .eq('id', pedidoTeste.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar pedido:', updateError);
      return;
    }

    // Aguardar um pouco para a trigger executar
    await new Promise(resolve => setTimeout(resolve, 500));

    // Contar eventos DEPOIS da mudança
    const { data: afterData } = await supabase
      .from('v_pedido_timeline_completo')
      .select('id')
      .eq('pedido_id', pedidoTeste.id);

    const eventosAfter = afterData?.length || 0;

    console.log(`   Eventos depois: ${eventosAfter}`);

    if (eventosAfter > eventosBefore) {
      console.log('\n✅ SUCESSO! Trigger está funcionando corretamente!');
      console.log(`   Novo evento foi registrado automaticamente`);
      
      // Buscar o evento criado
      const { data: novoEvento } = await supabase
        .from('v_pedido_timeline_completo')
        .select('*')
        .eq('pedido_id', pedidoTeste.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (novoEvento) {
        console.log(`\n   📝 Detalhes do evento criado:`);
        console.log(`      Status: ${novoEvento.status_anterior} → ${novoEvento.status_novo}`);
        console.log(`      Observação: ${novoEvento.observacoes}`);
        console.log(`      Responsável: ${novoEvento.responsavel_nome || 'Sistema'}`);
      }
    } else {
      console.log('\n❌ FALHA! Trigger não está funcionando!');
      console.log('   Nenhum evento novo foi registrado após a mudança de status');
    }

    // Reverter a mudança
    console.log(`\n🔄 Revertendo status para: ${pedidoTeste.status}`);
    await supabase
      .from('pedidos')
      .update({ 
        status: pedidoTeste.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', pedidoTeste.id);

    console.log('✅ Status revertido');

    // 4. Resumo final
    console.log('\n\n📊 RESUMO FINAL');
    console.log('='.repeat(60));
    
    const { data: stats } = await supabase
      .rpc('contar_eventos_por_status');

    if (stats) {
      console.log('\n📈 Distribuição de eventos por status:');
      stats.forEach(stat => {
        console.log(`   ${stat.status_novo}: ${stat.total} eventos`);
      });
    }

    console.log('\n✨ Verificação concluída!\n');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
verificarTimeline();
