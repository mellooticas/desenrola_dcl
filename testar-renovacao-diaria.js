require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testarRenovacao() {
  console.log('🧪 TESTANDO SISTEMA DE RENOVAÇÃO DIÁRIA\n');
  console.log('============================================================\n');

  // 1. Status atual
  console.log('📊 PASSO 1: Status Atual');
  console.log('------------------------------------------------------------');
  
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];
  
  const { count: missoesHoje } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  const { count: missoesPendentesAntigas } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .lt('data_missao', hoje)
    .in('status', ['pendente', 'ativa']);

  console.log(`   Missões de hoje (${hoje}): ${missoesHoje}`);
  console.log(`   Missões pendentes antigas: ${missoesPendentesAntigas}`);
  
  // 2. Verificar se a função existe
  console.log('\n📋 PASSO 2: Verificando Funções SQL');
  console.log('------------------------------------------------------------');
  
  const funcoes = [
    'finalizar_missoes_antigas',
    'gerar_missoes_dia',
    'executar_renovacao_diaria_completa',
    'testar_renovacao'
  ];
  
  for (const funcao of funcoes) {
    const { data, error } = await supabase.rpc(funcao).limit(1);
    if (error && !error.message.includes('could not be found')) {
      console.log(`   ❌ ${funcao}: Existe mas com erro`);
    } else if (error) {
      console.log(`   ❌ ${funcao}: NÃO EXISTE`);
    } else {
      console.log(`   ✅ ${funcao}: OK`);
    }
  }
  
  // 3. Executar teste de renovação
  console.log('\n🚀 PASSO 3: Executando Renovação de Teste');
  console.log('------------------------------------------------------------');
  console.log('   (Este passo só funciona se o SQL foi executado)\n');
  
  try {
    const { data, error } = await supabase.rpc('testar_renovacao');
    
    if (error) {
      console.log('   ❌ Erro ao executar:', error.message);
      console.log('\n   💡 SOLUÇÃO:');
      console.log('      Execute o arquivo: corrigir-renovacao-diaria-completa.sql');
      console.log('      no SQL Editor do Supabase\n');
    } else {
      console.log('   ✅ Resultado:\n');
      console.log(data);
    }
  } catch (err) {
    console.log('   ❌ Erro:', err.message);
  }
  
  // 4. Verificar resultado
  console.log('\n📊 PASSO 4: Verificando Resultado');
  console.log('------------------------------------------------------------');
  
  const { count: missoesHojeDepois } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  const { count: missoesPendentesAntigasDepois } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .lt('data_missao', hoje)
    .in('status', ['pendente', 'ativa']);

  console.log(`   Missões de hoje: ${missoesHoje} → ${missoesHojeDepois}`);
  console.log(`   Pendentes antigas: ${missoesPendentesAntigas} → ${missoesPendentesAntigasDepois}`);
  
  if (missoesHojeDepois > missoesHoje) {
    console.log('\n   ✅ Missões criadas com sucesso!');
  }
  
  if (missoesPendentesAntigasDepois < missoesPendentesAntigas) {
    console.log('   ✅ Missões antigas finalizadas!');
  }
  
  console.log('\n============================================================');
  console.log('✅ Teste concluído!\n');
}

testarRenovacao().catch(console.error);
