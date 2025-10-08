require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function investigarSistemaMissoes() {
  console.log('ÌæØ INVESTIGA√á√ÉO COMPLETA DO SISTEMA DE MISS√ïES\n');
  console.log('============================================================\n');

  const tabelasMissoes = [
    'missao_templates', 'missoes_diarias', 'missoes', 'mission_eventos',
    'mission_control_config', 'missoes_historico', 'lojas_gamificacao', 'pontuacao_diaria'
  ];

  console.log('Ì≥ã PASSO 1: Tabelas do Sistema');
  console.log('------------------------------------------------------------');
  const estatisticas = {};
  for (const tabela of tabelasMissoes) {
    const { error, count } = await supabase.from(tabela).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`‚ùå "${tabela}": ${error.message}`);
      estatisticas[tabela] = { existe: false, count: 0 };
    } else {
      console.log(`‚úÖ "${tabela}": ${count || 0} registros`);
      estatisticas[tabela] = { existe: true, count: count || 0 };
    }
  }

  console.log('\nÌ≥ã PASSO 2: Templates');
  console.log('------------------------------------------------------------');
  const { data: templates } = await supabase.from('missao_templates').select('tipo, categoria').limit(100);
  if (templates) {
    const tipos = [...new Set(templates.map(t => t.tipo))];
    const categorias = [...new Set(templates.map(t => t.categoria))];
    console.log(`Tipos: ${tipos.join(', ')}`);
    console.log(`Categorias: ${categorias.join(', ')}`);
  }

  console.log('\nÌ≥ã PASSO 3: Miss√µes Di√°rias (475 registros)');
  console.log('------------------------------------------------------------');
  const { data: diarias } = await supabase.from('missoes_diarias').select('data_missao, status, loja_id').order('data_missao', { ascending: false });
  
  if (diarias && diarias.length > 0) {
    const datasUnicas = [...new Set(diarias.map(m => m.data_missao))].sort();
    console.log(`\nDatas com miss√µes: ${datasUnicas[0]} at√© ${datasUnicas[datasUnicas.length - 1]}`);
    console.log(`\n√öltimos 7 dias:`);
    datasUnicas.slice(-7).forEach(data => {
      const missoesNaData = diarias.filter(m => m.data_missao === data);
      const concluidas = missoesNaData.filter(m => m.status === 'concluida').length;
      const ativas = missoesNaData.filter(m => m.status === 'ativa').length;
      const pendentes = missoesNaData.filter(m => m.status === 'pendente').length;
      console.log(`   ${data}: ${missoesNaData.length} miss√µes (‚úÖ ${concluidas}, Ì¥µ ${ativas}, ‚ö™ ${pendentes})`);
    });

    console.log(`\nPor loja:`);
    const lojasUnicas = [...new Set(diarias.map(m => m.loja_id))];
    for (const lojaId of lojasUnicas) {
      const { data: loja } = await supabase.from('lojas').select('nome').eq('id', lojaId).single();
      const missoesLoja = diarias.filter(m => m.loja_id === lojaId);
      const concluidas = missoesLoja.filter(m => m.status === 'concluida').length;
      console.log(`   ${loja?.nome || 'Desconhecida'}: ${missoesLoja.length} miss√µes (${concluidas} conclu√≠das)`);
    }
  }

  console.log('\nÌ≥ã PASSO 4: Views');
  console.log('------------------------------------------------------------');
  const views = ['v_missoes_timeline', 'v_missoes_diarias', 'v_mission_control'];
  for (const view of views) {
    const { error, count } = await supabase.from(view).select('*', { count: 'exact', head: true });
    console.log(error ? `‚ùå "${view}": n√£o existe` : `‚úÖ "${view}": ${count || 0} registros`);
  }

  console.log('\nÌ≥ã PASSO 5: Config Mission Control');
  console.log('------------------------------------------------------------');
  const { data: config } = await supabase.from('mission_control_config').select('*');
  if (config) {
    for (const c of config) {
      const { data: loja } = await supabase.from('lojas').select('nome').eq('id', c.loja_id).single();
      console.log(`   ${loja?.nome}: ativo=${c.ativo}, auto_gerar=${c.gerar_missoes_automaticamente}`);
    }
  }

  console.log('\nÌ≥ã PASSO 6: O que o Frontend Recebe?');
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

    console.log(`Total de miss√µes da loja: ${missoesFront?.length || 0}`);
    const missoesHoje = missoesFront?.filter(m => m.data_missao === hoje) || [];
    const missoesConcluidas = missoesFront?.filter(m => m.status === 'concluida') || [];
    
    console.log(`   - Miss√µes de HOJE (${hoje}): ${missoesHoje.length}`);
    console.log(`   - Miss√µes CONCLU√çDAS (total): ${missoesConcluidas.length}`);
    console.log(`   - Miss√µes PENDENTES: ${(missoesFront?.length || 0) - missoesConcluidas.length}`);
    
    if (missoesHoje.length > 0) {
      console.log(`\n   Miss√µes de hoje:`);
      missoesHoje.forEach(m => {
        console.log(`   - ${m.titulo || m.nome} [${m.status}]`);
      });
    }
  }

  console.log('\n============================================================');
  console.log('Ì¥ç DIAGN√ìSTICO');
  console.log('============================================================\n');
  console.log(`‚úÖ Templates: ${estatisticas.missao_templates?.count || 0}`);
  console.log(`‚úÖ Miss√µes di√°rias geradas: ${estatisticas.missoes_diarias?.count || 0}`);
  console.log(`${estatisticas.lojas_gamificacao?.count === 0 ? '‚ö†Ô∏è ' : '‚úÖ'} Lojas com gamifica√ß√£o: ${estatisticas.lojas_gamificacao?.count || 0}`);
  
  console.log('\nÌ≤° PROBLEMA IDENTIFICADO:');
  console.log('   O frontend s√≥ mostra miss√µes CONCLU√çDAS do primeiro dia.');
  console.log('   Precisa mostrar TODAS as miss√µes (pendentes, ativas, conclu√≠das).\n');
  console.log('============================================================\n');
}

investigarSistemaMissoes().catch(console.error);
