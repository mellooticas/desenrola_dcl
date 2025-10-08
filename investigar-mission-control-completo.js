require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Credenciais service_role não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function investigarCompleto() {
  console.log('� INVESTIGAÇÃO COMPLETA - MISSION CONTROL\n');
  console.log('============================================================\n');

  const tabelas = [
    'lojas', 'lojas_gamificacao', 'pontuacao_diaria', 'badges',
    'missoes', 'missoes_historico', 'pedidos'
  ];

  console.log('� PASSO 1: Verificando tabelas');
  console.log('------------------------------------------------------------');
  for (const tabela of tabelas) {
    const { error, count } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ "${tabela}": ${error.message}`);
    } else {
      console.log(`✅ "${tabela}": ${count || 0} registros`);
    }
  }

  console.log('\n� PASSO 2: Dados de lojas_gamificacao');
  console.log('------------------------------------------------------------');
  const { data: gamif } = await supabase.from('lojas_gamificacao').select('*').limit(1);
  if (gamif && gamif.length > 0) {
    console.log('Colunas:', Object.keys(gamif[0]).join(', '));
  } else {
    console.log('⚠️  Tabela vazia');
  }

  console.log('\n� PASSO 3: Exemplo de missão');
  console.log('------------------------------------------------------------');
  const { data: missoes, count } = await supabase.from('missoes').select('*', { count: 'exact' }).limit(1);
  console.log(`Total de missões: ${count || 0}`);
  if (missoes && missoes.length > 0) {
    const m = missoes[0];
    console.log(`Exemplo: ${m.titulo || m.missao_nome || 'N/A'} - Status: ${m.status}`);
    console.log('Colunas:', Object.keys(m).join(', '));
  }

  console.log('\n============================================================');
  console.log('✅ Investigação completa!\n');
}

investigarCompleto().catch(console.error);
