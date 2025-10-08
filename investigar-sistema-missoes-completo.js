require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function investigarSistemaMissoes() {
  console.log('� INVESTIGAÇÃO COMPLETA DO SISTEMA DE MISSÕES\n');
  console.log('============================================================\n');

  const tabelasMissoes = [
    'missao_templates', 'missoes_diarias', 'missoes', 'mission_eventos',
    'mission_control_config', 'missoes_historico', 'lojas_gamificacao', 'pontuacao_diaria'
  ];

  console.log('� PASSO 1: Tabelas do Sistema');
  console.log('------------------------------------------------------------');
  const estatisticas = {};
  for (const tabela of tabelasMissoes) {
    const { error, count } = await supabase.from(tabela).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ "${tabela}": ${error.message}`);
      estatisticas[tabela] = { existe: false, count: 0 };
    } else {
      console.log(`✅ "${tabela}": ${count || 0} registros`);
      estatisticas[tabela] = { existe: true, count: count || 0 };
    }
  }

  console.log('\n� PASSO 2: Templates');
  console.log('------------------------------------------------------------');
  const { data: templates } = await supabase.from('missao_templates').select('tipo, categoria').limit(100);
  if (templates) {
    const tipos = [...new Set(templates.map(t => t.tipo))];
    const categorias = [...new Set(templates.map(t => t.categoria))];
    console.log(`Tipos: ${tipos.join(', ')}`);
    console.log(`Categorias: ${categorias.join(', ')}`);
  }

  console.log('\n� PASSO 3: Missões Diárias (475 registros)');
  console.log('------------------------------------------------------------');
  const { data: diarias } = await supabase.from('missoes_diarias').select('data_missao, status, loja_id').order('data_missao', { ascending: false });
  
  if (diarias && diarias.length > 0) {
    const datasUnicas = [...new Set(diarias.map(m => m.data_missao))].sort();
    console.log(`\nDatas com missões: ${datasUnicas[0]} até ${datasUnicas[datasUnicas.length - 1]}`);
    console.log(`\nÚltimos 7 dias:`);
    datasUnicas.slice(-7).forEach(data => {
      const missoesNaData = diarias.filter(m => m.data_missao === data);
      const concluidas = missoesNaData.filter(m => m.status === 'concluida').length;
      const ativas = missoesNaData.filter(m => m.status === 'ativa').length;
      const pendentes = missoesNaData.filter(m => m.status === 'pendente').length;
      console.log(`   ${data}: ${missoesNaData.length} missões (✅ ${concluidas}, � ${ativas}, ⚪ ${pendentes})`);
    });

    console.log(`\nPor loja:`);
    const lojasUnicas = [...new Set(diarias.map(m => m.loja_id))];
    for (const lojaId of lojasUnicas) {
      const { data: loja } = await supabase.from('lojas').select('nome').eq('id', lojaId).single();
      const missoesLoja = diarias.filter(m => m.loja_id === lojaId);
      const concluidas = missoesLoja.filter(m => m.status === 'concluida').length;
      console.log(`   ${loja?.nome || 'Desconhecida'}: ${missoesLoja.length} missões (${concluidas} concluídas)`);
    }
  }

  console.log('\n� PASSO 4: Views');
  console.log('------------------------------------------------------------');
  const views = ['v_missoes_timeline', 'v_missoes_diarias', 'v_mission_control'];
  for (const view of views) {
    const { error, count } = await supabase.from(view).select('*', { count: 'exact', head: true });
    console.log(error ? `❌ "${view}": não existe` : `✅ "${view}": ${count || 0} registros`);
  }

  console.log('\n� PASSO 5: Config Mission Control');
  console.log('------------------------------------------------------------');
  const { data: config } = await supabase.from('mission_control_config').select('*');
  if (config) {
    for (const c of config) {
      const { data: loja } = await supabase.from('lojas').select('nome').eq('id', c.loja_id).single();
      console.log(`   ${loja?.nome}: ativo=${c.ativo}, auto_gerar=${c.gerar_missoes_automaticamente}`);
    }
  }

  console.log('\n� PASSO 6: O que o Frontend Recebe?');
  console.log('------------------------------------------------------------');
  const { data: lojas } = await supabase.from('lojas').select('id, nome').eq('ativo', true).limit(1);
  if (lojas && lojas.length > 0) {
    const loja = lojas[0];
    console.log(`Testando com: ${loja.nome}\n`);
    
    const hoje = new Date().toISOString().split('T')[0];
    const { data: missoesFront } = await supabase
      .from('missoes_diarias')
      .select('*')
      .eq('loja_id', loja.id)
      .order('data_missao', { ascending: false });

    console.log(`Total de missões da loja: ${missoesFront?.length || 0}`);
    const missoesHoje = missoesFront?.filter(m => m.data_missao === hoje) || [];
    const missoesConcluidas = missoesFront?.filter(m => m.status === 'concluida') || [];
    
    console.log(`   - Missões de HOJE (${hoje}): ${missoesHoje.length}`);
    console.log(`   - Missões CONCLUÍDAS (total): ${missoesConcluidas.length}`);
    console.log(`   - Missões PENDENTES: ${(missoesFront?.length || 0) - missoesConcluidas.length}`);
    
    if (missoesHoje.length > 0) {
      console.log(`\n   Missões de hoje:`);
      missoesHoje.forEach(m => {
        console.log(`   - ${m.titulo || m.nome} [${m.status}]`);
      });
    }
  }

  console.log('\n============================================================');
  console.log('� DIAGNÓSTICO');
  console.log('============================================================\n');
  console.log(`✅ Templates: ${estatisticas.missao_templates?.count || 0}`);
  console.log(`✅ Missões diárias geradas: ${estatisticas.missoes_diarias?.count || 0}`);
  console.log(`${estatisticas.lojas_gamificacao?.count === 0 ? '⚠️ ' : '✅'} Lojas com gamificação: ${estatisticas.lojas_gamificacao?.count || 0}`);
  
  console.log('\n� PROBLEMA IDENTIFICADO:');
  console.log('   O frontend só mostra missões CONCLUÍDAS do primeiro dia.');
  console.log('   Precisa mostrar TODAS as missões (pendentes, ativas, concluídas).\n');
  console.log('============================================================\n');
}

investigarSistemaMissoes().catch(console.error);
