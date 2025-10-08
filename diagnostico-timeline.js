const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM'
);

async function diagnosticoCompleto() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO SISTEMA DE TIMELINE');
  console.log('='.repeat(60));
  
  // 1. Verificar tabelas
  console.log('\n📋 1. VERIFICANDO TABELAS:');
  
  const { count: timelineCount, error: timelineError } = await supabase
    .from('pedidos_timeline')
    .select('*', { count: 'exact', head: true });
    
  console.log(`   pedidos_timeline: ${timelineCount} registros`);
  if (timelineError) console.log('   Erro:', timelineError.message);
  
  const { count: historicoCount, error: historicoError } = await supabase
    .from('pedidos_historico')
    .select('*', { count: 'exact', head: true });
    
  console.log(`   pedidos_historico: ${historicoCount} registros`);
  if (historicoError) console.log('   Erro:', historicoError.message);
  
  // 2. Verificar views
  console.log('\n👁️  2. VERIFICANDO VIEWS:');
  
  const { count: viewTimelineCount, error: viewTimelineError } = await supabase
    .from('v_pedido_timeline_completo')
    .select('*', { count: 'exact', head: true });
    
  console.log(`   v_pedido_timeline_completo: ${viewTimelineCount} registros`);
  if (viewTimelineError) console.log('   Erro:', viewTimelineError.message);
  
  const { count: viewHistoricoCount, error: viewHistoricoError } = await supabase
    .from('v_pedidos_historico')
    .select('*', { count: 'exact', head: true });
    
  console.log(`   v_pedidos_historico: ${viewHistoricoCount} registros`);
  if (viewHistoricoError) console.log('   Erro:', viewHistoricoError.message);
  
  // 3. Testar mudança de status
  console.log('\n🧪 3. TESTANDO TRIGGER (mudança de status):');
  
  // Pegar um pedido para testar
  const { data: pedidoTeste, error: pedidoError } = await supabase
    .from('pedidos')
    .select('id, numero_sequencial, status')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
    
  if (pedidoTeste) {
    console.log(`   Pedido de teste: #${pedidoTeste.numero_sequencial} (${pedidoTeste.status})`);
    
    // Verificar timeline antes
    const { count: antesTeste } = await supabase
      .from('pedidos_timeline')
      .select('*', { count: 'exact', head: true })
      .eq('pedido_id', pedidoTeste.id);
      
    console.log(`   Timeline ANTES do teste: ${antesTeste} eventos`);
    
    // Fazer mudança de status (volta para o mesmo depois)
    const statusOriginal = pedidoTeste.status;
    const statusTeste = statusOriginal === 'PAGO' ? 'PRODUCAO' : 'PAGO';
    
    console.log(`   Mudando de ${statusOriginal} → ${statusTeste}...`);
    
    const { error: updateError } = await supabase
      .from('pedidos')
      .update({ 
        status: statusTeste,
        updated_at: new Date().toISOString(),
        updated_by: 'Teste Trigger Timeline'
      })
      .eq('id', pedidoTeste.id);
      
    if (updateError) {
      console.log('   ❌ Erro ao atualizar:', updateError.message);
    } else {
      // Aguardar um pouco para trigger processar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar timeline depois
      const { count: depoisTeste, data: eventosNovos } = await supabase
        .from('pedidos_timeline')
        .select('*', { count: 'exact' })
        .eq('pedido_id', pedidoTeste.id)
        .order('created_at', { ascending: false });
        
      console.log(`   Timeline DEPOIS do teste: ${depoisTeste} eventos`);
      
      if (depoisTeste > antesTeste) {
        console.log('   ✅ TRIGGER FUNCIONANDO! Novo evento registrado:');
        if (eventosNovos && eventosNovos[0]) {
          console.log(`      ${eventosNovos[0].status_anterior} → ${eventosNovos[0].status_novo}`);
          console.log(`      Criado em: ${eventosNovos[0].created_at}`);
        }
      } else {
        console.log('   ❌ TRIGGER NÃO FUNCIONOU! Nenhum evento novo registrado');
      }
      
      // Voltar ao status original
      console.log(`   Voltando para ${statusOriginal}...`);
      await supabase
        .from('pedidos')
        .update({ status: statusOriginal })
        .eq('id', pedidoTeste.id);
    }
  }
  
  // 4. Verificar estrutura atual
  console.log('\n📊 4. RESUMO DO ESTADO ATUAL:');
  
  const { data: pedidos } = await supabase
    .from('pedidos')
    .select('id')
    .limit(1, { count: 'exact', head: true });
    
  const { count: totalPedidos } = await supabase
    .from('pedidos')
    .select('*', { count: 'exact', head: true });
    
  console.log(`   Total de pedidos: ${totalPedidos}`);
  console.log(`   Eventos na timeline: ${timelineCount || 0}`);
  console.log(`   Cobertura: ${totalPedidos > 0 ? ((timelineCount || 0) / totalPedidos * 100).toFixed(1) : 0}%`);
  
  console.log('\n' + '='.repeat(60));
}

diagnosticoCompleto().catch(console.error);