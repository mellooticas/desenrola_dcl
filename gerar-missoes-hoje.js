require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function gerarMissoesHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`� Gerando missões para HOJE: ${hoje}\n`);
  console.log('============================================================\n');

  // 1. Buscar todas as lojas ativas
  const { data: lojas, error: lojasError } = await supabase
    .from('lojas')
    .select('id, nome')
    .eq('ativo', true);

  if (lojasError) {
    console.error('❌ Erro ao buscar lojas:', lojasError);
    return;
  }

  console.log(`� Lojas ativas: ${lojas.length}\n`);

  // 2. Buscar todos os templates ativos
  const { data: templates, error: templatesError } = await supabase
    .from('missao_templates')
    .select('*')
    .eq('ativo', true);

  if (templatesError) {
    console.error('❌ Erro ao buscar templates:', templatesError);
    return;
  }

  console.log(`� Templates ativos: ${templates.length}\n`);

  let totalMissoesCriadas = 0;
  const missoesCriar = [];

  // 3. Para cada loja, criar missões baseadas nos templates
  for (const loja of lojas) {
    console.log(`\n� Gerando missões para: ${loja.nome}`);
    
    for (const template of templates) {
      // Verificar se já existe missão para este template hoje
      const { data: existente } = await supabase
        .from('missoes_diarias')
        .select('id')
        .eq('loja_id', loja.id)
        .eq('template_id', template.id)
        .eq('data_missao', hoje)
        .single();

      if (existente) {
        console.log(`   ⚠️  Já existe: ${template.nome}`);
        continue;
      }

      // Criar missão baseada no template
      const missao = {
        loja_id: loja.id,
        template_id: template.id,
        data_missao: hoje,
        titulo: template.nome,
        descricao: template.descricao,
        instrucoes: template.instrucoes,
        tipo: template.tipo,
        categoria: template.categoria,
        horario_inicio: template.horario_inicio,
        horario_limite: template.horario_limite,
        tempo_estimado_min: template.tempo_estimado_min,
        pontos_base: template.pontos_base,
        pontos_bonus_rapido: Math.floor(template.pontos_base * (template.multiplicador_rapido - 1)),
        pontos_bonus_critico: Math.floor(template.pontos_base * (template.multiplicador_critico - 1)),
        status: 'pendente',
        pode_ser_antecipada: template.pode_ser_antecipada,
        requer_evidencia: template.requer_evidencia,
        requer_observacao: template.requer_observacao,
        pode_ser_delegada: template.pode_ser_delegada,
        icone: template.icone,
        cor_primary: template.cor_primary,
        cor_secondary: template.cor_secondary
      };

      missoesCriar.push(missao);
    }
  }

  console.log(`\n\n� Total de missões a criar: ${missoesCriar.length}`);
  console.log('   Criando em lote...\n');

  // 4. Inserir todas as missões de uma vez
  const { data: missoesInseridas, error: insertError } = await supabase
    .from('missoes_diarias')
    .insert(missoesCriar)
    .select();

  if (insertError) {
    console.error('❌ Erro ao inserir missões:', insertError);
    return;
  }

  totalMissoesCriadas = missoesInseridas?.length || 0;

  console.log('============================================================');
  console.log(`✅ SUCESSO! ${totalMissoesCriadas} missões criadas para hoje!`);
  console.log('============================================================\n');

  // 5. Verificar resultado
  const { count } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  console.log(`\n� Total de missões no banco para hoje: ${count}`);
  
  // Distribuição por loja
  console.log('\n� Distribuição por loja:\n');
  for (const loja of lojas) {
    const { count: countLoja } = await supabase
      .from('missoes_diarias')
      .select('*', { count: 'exact', head: true })
      .eq('data_missao', hoje)
      .eq('loja_id', loja.id);
    
    console.log(`   ${loja.nome}: ${countLoja} missões`);
  }

  console.log('\n✅ Pronto! Agora o Mission Control deve mostrar as missões de hoje!\n');
}

gerarMissoesHoje().catch(console.error);
