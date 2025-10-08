require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function gerarMissoesHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`ÌæØ Gerando miss√µes para HOJE: ${hoje}\n`);

  const { count: existentes } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  if (existentes > 0) {
    console.log(`‚úÖ J√Å EXISTEM ${existentes} miss√µes para hoje!`);
    console.log('   N√£o precisa gerar novamente.\n');
    return;
  }

  const { data: lojas } = await supabase.from('lojas').select('id, nome').eq('ativo', true);
  const { data: templates } = await supabase.from('missao_templates').select('*').eq('ativo', true);

  console.log(`Ì≥ä ${lojas.length} lojas √ó ${templates.length} templates = ${lojas.length * templates.length} miss√µes\n`);

  const missoes = [];
  for (const loja of lojas) {
    for (const template of templates) {
      missoes.push({
        loja_id: loja.id,
        template_id: template.id,
        data_missao: hoje,
        data_vencimento: hoje,
        status: 'pendente',
        pontos_base: template.pontos_base || 50,
        pontos_bonus: 0,
        criada_automaticamente: true,
        requer_atencao: false
      });
    }
  }

  console.log(`Ì≥ù Inserindo ${missoes.length} miss√µes...\n`);
  
  const { data, error } = await supabase
    .from('missoes_diarias')
    .insert(missoes)
    .select('id');

  if (error) {
    console.error('‚ùå Erro:', error.message);
    if (error.details) console.error('   Detalhes:', error.details);
    if (error.hint) console.error('   Dica:', error.hint);
    return;
  }

  console.log(`‚úÖ ${data.length} miss√µes criadas com sucesso!\n`);

  console.log('Ì≥ä Distribui√ß√£o por loja:\n');
  for (const loja of lojas) {
    const { count } = await supabase
      .from('missoes_diarias')
      .select('*', { count: 'exact', head: true })
      .eq('data_missao', hoje)
      .eq('loja_id', loja.id);
    
    console.log(`   ${loja.nome}: ${count} miss√µes`);
  }

  console.log(`\n============================================================`);
  console.log(`‚úÖ SUCESSO! Mission Control pronto para usar!`);
  console.log(`============================================================\n`);
}

gerarMissoesHoje().catch(console.error);
