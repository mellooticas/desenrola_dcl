const fs = require('fs');
const path = require('path');

async function implementarTimeline() {
  console.log('🚀 Implementando sistema completo de timeline...');
  
  // Ler o arquivo SQL
  const sqlFile = path.join(__dirname, 'implementar-timeline-completa.sql');
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  
  try {
    // Enviar para API de execução SQL do admin
    const response = await fetch('http://localhost:3001/api/admin/execute-sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: sqlContent,
        description: 'Implementação completa do sistema de timeline'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Sistema de timeline implementado com sucesso!');
      console.log('📊 Resultado:', result);
      
      // Verificar se foi criado corretamente
      console.log('\n🔍 Verificando implementação...');
      await verificarImplementacao();
      
    } else {
      console.error('❌ Erro ao implementar timeline:', result);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

async function verificarImplementacao() {
  try {
    // Verificar se a tabela tem registros agora
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      'https://zobgyjsocqmzaggrnwqd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM'
    );
    
    // Verificar pedidos_historico
    const { count, error } = await supabase
      .from('pedidos_historico')
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.log('⚠️  Ainda sem acesso direto ao histórico:', error.message);
    } else {
      console.log(`📈 Registros no histórico: ${count}`);
    }
    
    // Verificar últimos registros
    const { data: historico, error: historicoError } = await supabase
      .from('pedidos_historico')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (!historicoError && historico?.length > 0) {
      console.log('📝 Últimos eventos registrados:');
      historico.forEach(h => {
        console.log(`  - Pedido: ${h.pedido_id} | ${h.status_anterior || 'NOVO'} → ${h.status_novo} | ${h.responsavel_nome}`);
      });
    }
    
  } catch (error) {
    console.log('⚠️  Verificação manual necessária:', error.message);
  }
}

// Executar
implementarTimeline().catch(console.error);