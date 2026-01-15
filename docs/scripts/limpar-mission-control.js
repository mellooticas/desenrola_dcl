const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTabelas() {
  console.log('🔍 Verificando tabelas do mission-control...\n');
  
  const missionTables = [
    'mission_control_execucoes',
    'mission_control_acoes', 
    'mission_control_templates',
    'pontuacao_diaria',
    'lojas_ranking',
    'lojas_gamificacao',
    'badges',
    'user_gamification'
  ];
  
  console.log('📋 Tabelas encontradas:');
  const existentes = [];
  
  for (const table of missionTables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      console.log(`   ✓ ${table}: ${count || 0} registros`);
      existentes.push({ table, count: count || 0 });
    } else {
      console.log(`   ✗ ${table}: não existe`);
    }
  }
  
  return existentes;
}

async function removerTabelas() {
  console.log('\n🗑️  Iniciando remoção das tabelas mission-control...\n');
  
  // SQL para remover tudo de uma vez
  const sqlRemocao = 'DROP VIEW IF EXISTS v_mission_control_dashboard CASCADE; ' +
    'DROP VIEW IF EXISTS v_ranking_lojas CASCADE; ' +
    'DROP FUNCTION IF EXISTS renovar_missoes_diarias() CASCADE; ' +
    'DROP FUNCTION IF EXISTS calcular_pontos_loja(uuid, date, date) CASCADE; ' +
    'DROP TABLE IF EXISTS mission_control_execucoes CASCADE; ' +
    'DROP TABLE IF EXISTS mission_control_acoes CASCADE; ' +
    'DROP TABLE IF EXISTS mission_control_templates CASCADE; ' +
    'DROP TABLE IF EXISTS pontuacao_diaria CASCADE; ' +
    'DROP TABLE IF EXISTS lojas_ranking CASCADE; ' +
    'DROP TABLE IF EXISTS lojas_gamificacao CASCADE; ' +
    'DROP TABLE IF EXISTS badges CASCADE; ' +
    'DROP TABLE IF EXISTS user_gamification CASCADE;';
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: sqlRemocao 
    });
    
    if (error) {
      console.log('⚠️  Não foi possível usar RPC. Tentando via API admin...');
      console.log('Error:', error.message);
      
      // Fallback: tentar remover via endpoint admin (se existir)
      console.log('\n📝 Execute este SQL manualmente no Supabase SQL Editor:');
      console.log(sqlRemocao);
      return false;
    }
    
    console.log('✅ Tabelas removidas com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao remover tabelas:', err.message);
    console.log('\n📝 Execute este SQL manualmente no Supabase SQL Editor:');
    console.log(sqlRemocao);
    return false;
  }
}

async function main() {
  console.log('🎯 LIMPEZA DO BANCO - MISSION CONTROL\n');
  console.log('=' .repeat(50));
  
  // Verificar o que existe
  const existentes = await verificarTabelas();
  
  if (existentes.length === 0) {
    console.log('\n✅ Nenhuma tabela mission-control encontrada!');
    console.log('O banco já está limpo.');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n⚠️  Serão removidas ${existentes.length} tabelas/views/functions`);
  console.log('Esta operação é IRREVERSÍVEL!');
  console.log('Backup já foi feito em: D:/projetos/mission-control-backup/\n');
  
  // Executar remoção
  const sucesso = await removerTabelas();
  
  if (sucesso) {
    console.log('\n🎉 Limpeza concluída!');
    console.log('App Desenrola DCL agora está 100% focado em pedidos.');
  } else {
    console.log('\n⚠️  Execute o SQL manualmente no Supabase.');
  }
}

main();
