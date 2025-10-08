require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verificarMissoesHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`� Verificando missões para HOJE: ${hoje}\n`);
  console.log('============================================================\n');

  // 1. Verificar se existem missões para hoje
  const { data: missoesHoje, count } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact' })
    .eq('data_missao', hoje);

  console.log(`� Total de missões para hoje: ${count || 0}\n`);

  if (count === 0) {
    console.log('❌ PROBLEMA: Nenhuma missão foi gerada para hoje!');
    console.log('   Precisamos gerar missões manualmente ou verificar o trigger.\n');
    
    // Verificar última data com missões
    const { data: ultimasMissoes } = await supabase
      .from('missoes_diarias')
      .select('data_missao')
      .order('data_missao', { ascending: false })
      .limit(1);
    
    if (ultimasMissoes && ultimasMissoes.length > 0) {
      console.log(`� Última data com missões: ${ultimasMissoes[0].data_missao}`);
      const ultimaData = new Date(ultimasMissoes[0].data_missao);
      const dataHoje = new Date(hoje);
      const diasDiferenca = Math.floor((dataHoje - ultimaData) / (1000 * 60 * 60 * 24));
      console.log(`   Diferença: ${diasDiferenca} dias sem missões!\n`);
    }
    
    // Verificar se o trigger existe
    console.log('� Investigando trigger de geração automática...\n');
    
  } else {
    console.log('✅ Missões encontradas para hoje!\n');
    
    // Analisar por loja
    const { data: lojas } = await supabase
      .from('lojas')
      .select('id, nome')
      .eq('ativo', true);
    
    console.log('� Distribuição por loja:\n');
    for (const loja of lojas) {
      const missoesLoja = missoesHoje.filter(m => m.loja_id === loja.id);
      if (missoesLoja.length > 0) {
        const pendentes = missoesLoja.filter(m => m.status === 'pendente').length;
        const ativas = missoesLoja.filter(m => m.status === 'ativa').length;
        const concluidas = missoesLoja.filter(m => m.status === 'concluida').length;
        console.log(`   ${loja.nome}: ${missoesLoja.length} missões`);
        console.log(`      ⚪ Pendentes: ${pendentes}`);
        console.log(`      � Ativas: ${ativas}`);
        console.log(`      ✅ Concluídas: ${concluidas}`);
      }
    }
  }
  
  console.log('\n============================================================');
}

verificarMissoesHoje().catch(console.error);
