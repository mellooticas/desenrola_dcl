const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zobgyjsocqmzaggrnwqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM'
);

async function verificarTabelasTimeline() {
  console.log('🔍 Verificando tabelas de timeline...');
  
  const tabelasPossíveis = [
    'pedidos_eventos',
    'pedidos_historico', 
    'eventos_pedidos',
    'historico_pedidos',
    'timeline_pedidos',
    'pedidos_timeline',
    'log_pedidos',
    'auditoria_pedidos',
    'movimentacoes_pedidos'
  ];
  
  for (const tabela of tabelasPossíveis) {
    const { data, error } = await supabase
      .from(tabela)
      .select('*')
      .limit(1);
      
    if (!error) {
      console.log('✅ Tabela encontrada:', tabela);
      
      const { count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
        
      console.log('   Registros:', count);
      
      if (data && data.length > 0) {
        console.log('   Estrutura:', Object.keys(data[0]));
      }
    }
  }
  
  console.log('\n🔍 Verificando pedidos recentes...');
  
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('id, numero_sequencial, status, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(3);
    
  if (pedidos) {
    console.log('📦 Últimos pedidos:');
    pedidos.forEach(p => {
      const updated = p.updated_at || 'N/A';
      console.log(`  - #${p.numero_sequencial}: ${p.status} (criado: ${p.created_at}, atualizado: ${updated})`);
    });
  }
  
  // Verificar se há alguma estrutura para mudanças de status
  console.log('\n🔍 Verificando se existe histórico de mudanças...');
  
  const { data: estruturas, error: estruturasError } = await supabase
    .from('pedidos')
    .select('*')
    .limit(1);
    
  if (estruturas && estruturas.length > 0) {
    console.log('📋 Campos disponíveis em pedidos:', Object.keys(estruturas[0]));
  }
}

verificarTabelasTimeline().catch(console.error);