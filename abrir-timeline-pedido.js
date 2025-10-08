const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'
);

async function buscarPedidoComHistorico() {
  console.log('\n🔍 Buscando pedido com histórico rico para visualizar...\n');

  // Buscar pedidos com mais eventos
  const { data: pedidosComHistorico } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT 
          p.id,
          p.numero_sequencial,
          p.status,
          COUNT(pt.id) as total_eventos
        FROM pedidos p
        LEFT JOIN pedidos_timeline pt ON pt.pedido_id = p.id
        GROUP BY p.id, p.numero_sequencial, p.status
        HAVING COUNT(pt.id) > 3
        ORDER BY total_eventos DESC
        LIMIT 5
      `
    });

  if (!pedidosComHistorico || pedidosComHistorico.length === 0) {
    console.log('Erro ao buscar pedidos. Tentando método alternativo...\n');
    
    // Método alternativo - buscar direto
    const { data: pedidos } = await supabase
      .from('pedidos')
      .select('id, numero_sequencial, status')
      .eq('numero_sequencial', 83)
      .single();

    if (pedidos) {
      console.log(`📦 Pedido #${pedidos.numero_sequencial}`);
      console.log(`   Status: ${pedidos.status}`);
      console.log(`   ID: ${pedidos.id}`);
      console.log(`\n🔗 URL da Timeline:`);
      console.log(`   http://localhost:3001/pedidos/${pedidos.id}/timeline\n`);
      
      // Buscar eventos deste pedido
      const { data: eventos } = await supabase
        .from('pedidos_timeline')
        .select('*')
        .eq('pedido_id', pedidos.id)
        .order('created_at', { ascending: true });

      if (eventos) {
        console.log(`📊 Total de eventos: ${eventos.length}\n`);
        console.log('📋 Histórico:');
        eventos.forEach((evt, idx) => {
          const data = new Date(evt.created_at).toLocaleString('pt-BR');
          console.log(`   ${idx + 1}. ${evt.status_anterior || 'NOVO'} → ${evt.status_novo} (${data})`);
          console.log(`      ${evt.observacoes}`);
        });
      }
    }
    return;
  }

  console.log('📋 Top 5 Pedidos com Mais Histórico:\n');
  pedidosComHistorico.forEach((p, idx) => {
    console.log(`${idx + 1}. Pedido #${p.numero_sequencial} - ${p.total_eventos} eventos`);
    console.log(`   Status: ${p.status}`);
    console.log(`   URL: http://localhost:3001/pedidos/${p.id}/timeline\n`);
  });

  // Pegar o primeiro pedido e mostrar detalhes
  const pedidoTop = pedidosComHistorico[0];
  const { data: eventos } = await supabase
    .from('pedidos_timeline')
    .select('*')
    .eq('pedido_id', pedidoTop.id)
    .order('created_at', { ascending: true });

  console.log(`\n🔍 Detalhes do Pedido #${pedidoTop.numero_sequencial}:`);
  console.log('─'.repeat(80));
  if (eventos) {
    eventos.forEach((evt, idx) => {
      const data = new Date(evt.created_at).toLocaleString('pt-BR');
      console.log(`\n${idx + 1}. ${evt.status_anterior || 'NOVO'} → ${evt.status_novo}`);
      console.log(`   Data: ${data}`);
      console.log(`   Descrição: ${evt.observacoes}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n🌐 Abra esta URL no navegador:`);
  console.log(`   http://localhost:3001/pedidos/${pedidoTop.id}/timeline\n`);
}

buscarPedidoComHistorico();
