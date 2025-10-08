require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function gerarMissoesHoje() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`� Gerando missões para HOJE: ${hoje}\n`);

  const { count: existentes } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  if (existentes > 0) {
    console.log(`✅ JÁ EXISTEM ${existentes} missões para hoje!`);
    console.log('   Não precisa gerar novamente.\n');
    return;
  }

  const { data: lojas } = await supabase.from('lojas').select('id, nome').eq('ativo', true);
  const { data: templates } = await supabase.from('missao_templates').select('*').eq('ativo', true);

  console.log(`� ${lojas.length} lojas × ${templates.length} templates = ${lojas.length * templates.length} missões\n`);

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

  console.log(`� Inserindo ${missoes.length} missões...\n`);
  
  const { data, error } = await supabase
    .from('missoes_diarias')
    .insert(missoes)
    .select('id');

  if (error) {
    console.error('❌ Erro:', error.message);
    if (error.details) console.error('   Detalhes:', error.details);
    if (error.hint) console.error('   Dica:', error.hint);
    return;
  }

  console.log(`✅ ${data.length} missões criadas com sucesso!\n`);

  console.log('� Distribuição por loja:\n');
  for (const loja of lojas) {
    const { count } = await supabase
      .from('missoes_diarias')
      .select('*', { count: 'exact', head: true })
      .eq('data_missao', hoje)
      .eq('loja_id', loja.id);
    
    console.log(`   ${loja.nome}: ${count} missões`);
  }

  console.log(`\n============================================================`);
  console.log(`✅ SUCESSO! Mission Control pronto para usar!`);
  console.log(`============================================================\n`);
}

gerarMissoesHoje().catch(console.error);
