require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function gerarApenasHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`ÌæØ Gerando miss√µes APENAS para hoje: ${hoje}\n`);

  // 1. Verificar se j√° existem
  const { count: existentes } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  if (existentes > 0) {
    console.log(`‚ö†Ô∏è  J√Å EXISTEM ${existentes} miss√µes para hoje!`);
    console.log('   Abortando para evitar duplicatas.\n');
    return;
  }

  // 2. Buscar lojas e templates
  const { data: lojas } = await supabase.from('lojas').select('id, nome').eq('ativo', true);
  const { data: templates } = await supabase.from('missao_templates').select('*').eq('ativo', true);

  console.log(`Ì≥ä Criar: ${lojas.length} lojas √ó ${templates.length} templates = ${lojas.length * templates.length} miss√µes\n`);

  // 3. Criar array de miss√µes
  const missoes = [];
  for (const loja of lojas) {
    for (const template of templates) {
      missoes.push({
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
        pontos_bonus_rapido: Math.floor(template.pontos_base * 0.2),
        pontos_bonus_critico: Math.floor(template.pontos_base * 2),
        status: 'pendente',
        pode_ser_antecipada: template.pode_ser_antecipada,
        requer_evidencia: template.requer_evidencia,
        requer_observacao: template.requer_observacao,
        pode_ser_delegada: template.pode_ser_delegada,
        icone: template.icone,
        cor_primary: template.cor_primary,
        cor_secondary: template.cor_secondary
      });
    }
  }

  console.log(`Ì≥ù Inserindo ${missoes.length} miss√µes...`);
  
  // 4. Inserir em lote
  const { data, error } = await supabase
    .from('missoes_diarias')
    .insert(missoes)
    .select('id');

  if (error) {
    console.error('‚ùå Erro ao inserir:', error.message);
    return;
  }

  console.log(`‚úÖ ${data.length} miss√µes criadas!\n`);

  // 5. Verificar resultado
  for (const loja of lojas) {
    const { count } = await supabase
      .from('missoes_diarias')
      .select('*', { count: 'exact', head: true })
      .eq('data_missao', hoje)
      .eq('loja_id', loja.id);
    
    console.log(`   ${loja.nome}: ${count} miss√µes`);
  }

  console.log(`\n‚úÖ Pronto! Mission Control deve funcionar agora!\n`);
}

gerarApenasHoje().catch(console.error);
