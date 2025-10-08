const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM'
);

async function verificarTimelineCompleta() {
  console.log('🔍 Verificando estrutura completa da timeline...');
  
  // Verificar pedidos_timeline
  try {
    const { data, error } = await supabase
      .from('pedidos_timeline')
      .select('*')
      .limit(1);
      
    if (error) {
      console.log('❌ Tabela pedidos_timeline:', error.message);
    } else {
      console.log('✅ Tabela pedidos_timeline existe');
      
      const { count } = await supabase
        .from('pedidos_timeline')
        .select('*', { count: 'exact', head: true });
        
      console.log('   Registros:', count);
    }
  } catch (err) {
    console.log('❌ Erro ao acessar pedidos_timeline:', err.message);
  }
  
  // Verificar pedidos_historico (alternativa)
  try {
    const { data, error } = await supabase
      .from('pedidos_historico')
      .select('*')
      .limit(1);
      
    if (!error) {
      console.log('✅ Tabela pedidos_historico existe');
      
      const { count } = await supabase
        .from('pedidos_historico')
        .select('*', { count: 'exact', head: true });
        
      console.log('   Registros:', count);
      
      if (data && data.length > 0) {
        console.log('   Estrutura:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ Erro ao acessar pedidos_historico:', err.message);
  }
  
  // Verificar se existe algum mecanismo de auditoria na tabela pedidos
  console.log('\n🔍 Verificando últimas mudanças de status...');
  
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('id, numero_sequencial, status, updated_at, updated_by')
    .order('updated_at', { ascending: false })
    .limit(5);
    
  if (pedidos) {
    console.log('📦 Últimas atualizações de pedidos:');
    pedidos.forEach(p => {
      console.log(`  - #${p.numero_sequencial}: ${p.status} (${p.updated_at} por ${p.updated_by || 'Sistema'})`);
    });
  }
}

verificarTimelineCompleta().catch(console.error);