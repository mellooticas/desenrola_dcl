const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'
);

async function verificarTimeline() {
  console.log('\n🔍 VERIFICAÇÃO COMPLETA DA TIMELINE\n');
  console.log('='.repeat(80));

  try {
    // 1. Contar pedidos
    const { data: pedidos, error: erroPedidos } = await supabase
      .from('pedidos')
      .select('id, numero_sequencial, status, created_at', { count: 'exact' });

    if (erroPedidos) {
      console.error('❌ Erro ao buscar pedidos:', erroPedidos);
      return;
    }

    console.log(`\n📦 Total de Pedidos: ${pedidos.length}`);

    // 2. Contar eventos na timeline
    const { data: eventos, error: erroEventos, count: totalEventos } = await supabase
      .from('pedidos_timeline')
      .select('*', { count: 'exact' });

    if (erroEventos) {
      console.error('❌ Erro ao buscar timeline:', erroEventos);
      return;
    }

    console.log(`📊 Total de Eventos na Timeline: ${totalEventos || 0}`);
    
    if (pedidos.length > 0) {
      console.log(`📈 Cobertura: ${((totalEventos / pedidos.length) * 100).toFixed(1)}%`);
    }

    // 3. Ver últimos 5 eventos
    if (totalEventos > 0) {
      console.log('\n📋 ÚLTIMOS 5 EVENTOS NA TIMELINE:');
      console.log('-'.repeat(80));

      const { data: ultimosEventos } = await supabase
        .from('pedidos_timeline')
        .select(`
          id,
          status_anterior,
          status_novo,
          observacoes,
          created_at,
          pedido_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ultimosEventos && ultimosEventos.length > 0) {
        for (const evento of ultimosEventos) {
          // Buscar número do pedido
          const { data: pedido } = await supabase
            .from('pedidos')
            .select('numero_sequencial')
            .eq('id', evento.pedido_id)
            .single();

          console.log(`\n   Pedido #${pedido?.numero_sequencial || 'N/A'}`);
          console.log(`   Status: ${evento.status_anterior || 'NOVO'} → ${evento.status_novo}`);
          console.log(`   Descrição: ${evento.observacoes}`);
          console.log(`   Data: ${new Date(evento.created_at).toLocaleString('pt-BR')}`);
        }
      }
    } else {
      console.log('\n⚠️  Timeline está vazia!');
    }

    // 4. Testar o trigger - mudar status de um pedido
    console.log('\n\n🧪 TESTANDO TRIGGER (mudança de status):');
    console.log('-'.repeat(80));

    if (pedidos.length > 0) {
      const pedidoTeste = pedidos[0];
      console.log(`\n📦 Testando com pedido #${pedidoTeste.numero_sequencial} (${pedidoTeste.status})`);

      // Contar eventos antes
      const { count: eventosAntes } = await supabase
        .from('pedidos_timeline')
        .select('*', { count: 'exact', head: true })
        .eq('pedido_id', pedidoTeste.id);

      console.log(`   Eventos antes: ${eventosAntes || 0}`);

      // Mudar status
      const novoStatus = pedidoTeste.status === 'PAGO' ? 'PRODUCAO' : 'PAGO';
      console.log(`   Mudando status: ${pedidoTeste.status} → ${novoStatus}...`);

      const { error: erroUpdate } = await supabase
        .from('pedidos')
        .update({ 
          status: novoStatus,
          updated_at: new Date().toISOString(),
          updated_by: 'Teste Automático'
        })
        .eq('id', pedidoTeste.id);

      if (erroUpdate) {
        console.error('   ❌ Erro ao atualizar:', erroUpdate);
      } else {
        // Aguardar um pouco para o trigger executar
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Contar eventos depois
        const { count: eventosDepois } = await supabase
          .from('pedidos_timeline')
          .select('*', { count: 'exact', head: true })
          .eq('pedido_id', pedidoTeste.id);

        console.log(`   Eventos depois: ${eventosDepois || 0}`);

        if (eventosDepois > eventosAntes) {
          console.log('\n   ✅ TRIGGER FUNCIONANDO! Novo evento foi criado automaticamente');
          
          // Mostrar o novo evento
          const { data: novoEvento } = await supabase
            .from('pedidos_timeline')
            .select('*')
            .eq('pedido_id', pedidoTeste.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (novoEvento) {
            console.log(`\n   Novo evento criado:`);
            console.log(`   - Status: ${novoEvento.status_anterior} → ${novoEvento.status_novo}`);
            console.log(`   - Descrição: ${novoEvento.observacoes}`);
            console.log(`   - Data: ${new Date(novoEvento.created_at).toLocaleString('pt-BR')}`);
          }
        } else {
          console.log('\n   ❌ TRIGGER NÃO FUNCIONOU! Nenhum evento novo foi criado');
        }

        // Reverter mudança
        await supabase
          .from('pedidos')
          .update({ 
            status: pedidoTeste.status,
            updated_at: new Date().toISOString(),
            updated_by: 'Reversão Automática'
          })
          .eq('id', pedidoTeste.id);

        console.log('   ↩️  Status revertido para o original');
      }
    }

    // 5. Resumo final
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 RESUMO FINAL:');
    console.log('='.repeat(80));
    console.log(`Pedidos no sistema: ${pedidos.length}`);
    console.log(`Eventos na timeline: ${totalEventos || 0}`);
    
    if (pedidos.length > 0) {
      console.log(`Cobertura: ${((totalEventos / pedidos.length) * 100).toFixed(1)}%`);
    }
    
    if (totalEventos >= pedidos.length) {
      console.log('\n🎉 TIMELINE FUNCIONANDO PERFEITAMENTE!');
      console.log('   Todos os pedidos têm pelo menos um evento registrado.');
    } else if (totalEventos > 0) {
      console.log('\n⚠️  Timeline parcialmente populada.');
      console.log('   Execute o PASSO 4 do SQL novamente para popular com todos os pedidos.');
    } else {
      console.log('\n❌ Timeline completamente vazia!');
      console.log('   Execute o script SQL completo: corrigir-trigger-timeline.sql');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Erro geral:', error);
  }
}

verificarTimeline();
