require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('âŒ Credenciais service_role nÃ£o encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function investigarCompleto() {
  console.log('í´ INVESTIGAÃ‡ÃƒO COMPLETA - MISSION CONTROL\n');
  console.log('============================================================\n');

  const tabelas = [
    'lojas', 'lojas_gamificacao', 'pontuacao_diaria', 'badges',
    'missoes', 'missoes_historico', 'pedidos'
  ];

  console.log('í³‹ PASSO 1: Verificando tabelas');
  console.log('------------------------------------------------------------');
  for (const tabela of tabelas) {
    const { error, count } = await supabase
      .from(tabela)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`âŒ "${tabela}": ${error.message}`);
    } else {
      console.log(`âœ… "${tabela}": ${count || 0} registros`);
    }
  }

  console.log('\ní³‹ PASSO 2: Dados de lojas_gamificacao');
  console.log('------------------------------------------------------------');
  const { data: gamif } = await supabase.from('lojas_gamificacao').select('*').limit(1);
  if (gamif && gamif.length > 0) {
    console.log('Colunas:', Object.keys(gamif[0]).join(', '));
  } else {
    console.log('âš ï¸  Tabela vazia');
  }

  console.log('\ní³‹ PASSO 3: Exemplo de missÃ£o');
  console.log('------------------------------------------------------------');
  const { data: missoes, count } = await supabase.from('missoes').select('*', { count: 'exact' }).limit(1);
  console.log(`Total de missÃµes: ${count || 0}`);
  if (missoes && missoes.length > 0) {
    const m = missoes[0];
    console.log(`Exemplo: ${m.titulo || m.missao_nome || 'N/A'} - Status: ${m.status}`);
    console.log('Colunas:', Object.keys(m).join(', '));
  }

  console.log('\n============================================================');
  console.log('âœ… InvestigaÃ§Ã£o completa!\n');
}

investigarCompleto().catch(console.error);
