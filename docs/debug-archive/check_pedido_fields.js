const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.lCXL8wSBHJkwWRt-M0aZs8WODhk5U9fLY7jcCCvhsL0'
);

(async () => {
  try {
    console.log('🔍 Consultando pedidos com todos os relacionamentos...');
    
    // Primeiro, ver um pedido da tabela direta com joins
    const { data: pedidoCompleto, error: pedidoError } = await supabase
      .from('pedidos')
      .select(`
        *,
        lojas!inner(nome, codigo, endereco, telefone, whatsapp),
        laboratorios!inner(nome, codigo, sla_padrao_dias, trabalha_sabado, especialidades),
        classes_lente!inner(nome, categoria, sla_base_dias, cor_badge)
      `)
      .limit(1);
    
    if (pedidoError) {
      console.error('❌ Erro pedido completo:', pedidoError);
    } else if (pedidoCompleto && pedidoCompleto.length > 0) {
      console.log('📊 CAMPOS DISPONÍVEIS NO PEDIDO COMPLETO:');
      console.log('=====================================');
      const pedido = pedidoCompleto[0];
      
      console.log('\n🎯 CAMPOS PRINCIPAIS DO PEDIDO:');
      Object.keys(pedido).forEach(key => {
        if (typeof pedido[key] !== 'object') {
          console.log(`  - ${key}: ${pedido[key]}`);
        }
      });
      
      console.log('\n🏪 DADOS DA LOJA:');
      if (pedido.lojas) {
        Object.keys(pedido.lojas).forEach(key => {
          console.log(`  - loja_${key}: ${pedido.lojas[key]}`);
        });
      }
      
      console.log('\n🔬 DADOS DO LABORATÓRIO:');
      if (pedido.laboratorios) {
        Object.keys(pedido.laboratorios).forEach(key => {
          console.log(`  - laboratorio_${key}: ${pedido.laboratorios[key]}`);
        });
      }
      
      console.log('\n👓 DADOS DA CLASSE DE LENTE:');
      if (pedido.classes_lente) {
        Object.keys(pedido.classes_lente).forEach(key => {
          console.log(`  - classe_${key}: ${pedido.classes_lente[key]}`);
        });
      }
      
      // Verificar se existe view v_pedidos_kanban
      console.log('\n🔍 Testando view v_pedidos_kanban...');
      const { data: viewData, error: viewError } = await supabase
        .from('v_pedidos_kanban')
        .select('*')
        .limit(1);
        
      if (viewError) {
        console.log('❌ View v_pedidos_kanban não existe:', viewError.message);
      } else if (viewData && viewData.length > 0) {
        console.log('✅ View v_pedidos_kanban existe!');
        console.log('\n📊 CAMPOS NA VIEW:');
        Object.keys(viewData[0]).sort().forEach(key => {
          console.log(`  - ${key}`);
        });
      } else {
        console.log('⚠️ View v_pedidos_kanban vazia');
      }
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
})();