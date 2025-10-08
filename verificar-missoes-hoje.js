require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verificarMissoesHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`í´ Verificando missÃµes para HOJE: ${hoje}\n`);
  console.log('============================================================\n');

  // 1. Verificar se existem missÃµes para hoje
  const { data: missoesHoje, count } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact' })
    .eq('data_missao', hoje);

  console.log(`í³Š Total de missÃµes para hoje: ${count || 0}\n`);

  if (count === 0) {
    console.log('âŒ PROBLEMA: Nenhuma missÃ£o foi gerada para hoje!');
    console.log('   Precisamos gerar missÃµes manualmente ou verificar o trigger.\n');
    
    // Verificar Ãºltima data com missÃµes
    const { data: ultimasMissoes } = await supabase
      .from('missoes_diarias')
      .select('data_missao')
      .order('data_missao', { ascending: false })
      .limit(1);
    
    if (ultimasMissoes && ultimasMissoes.length > 0) {
      console.log(`í³… Ãšltima data com missÃµes: ${ultimasMissoes[0].data_missao}`);
      const ultimaData = new Date(ultimasMissoes[0].data_missao);
      const dataHoje = new Date(hoje);
      const diasDiferenca = Math.floor((dataHoje - ultimaData) / (1000 * 60 * 60 * 24));
      console.log(`   DiferenÃ§a: ${diasDiferenca} dias sem missÃµes!\n`);
    }
    
    // Verificar se o trigger existe
    console.log('í´ Investigando trigger de geraÃ§Ã£o automÃ¡tica...\n');
    
  } else {
    console.log('âœ… MissÃµes encontradas para hoje!\n');
    
    // Analisar por loja
    const { data: lojas } = await supabase
      .from('lojas')
      .select('id, nome')
      .eq('ativo', true);
    
    console.log('í³Š DistribuiÃ§Ã£o por loja:\n');
    for (const loja of lojas) {
      const missoesLoja = missoesHoje.filter(m => m.loja_id === loja.id);
      if (missoesLoja.length > 0) {
        const pendentes = missoesLoja.filter(m => m.status === 'pendente').length;
        const ativas = missoesLoja.filter(m => m.status === 'ativa').length;
        const concluidas = missoesLoja.filter(m => m.status === 'concluida').length;
        console.log(`   ${loja.nome}: ${missoesLoja.length} missÃµes`);
        console.log(`      âšª Pendentes: ${pendentes}`);
        console.log(`      í´µ Ativas: ${ativas}`);
        console.log(`      âœ… ConcluÃ­das: ${concluidas}`);
      }
    }
  }
  
  console.log('\n============================================================');
}

verificarMissoesHoje().catch(console.error);
