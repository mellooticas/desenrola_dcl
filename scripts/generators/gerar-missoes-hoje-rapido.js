require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function gerarMissoesRapido() {
  const hoje = new Date().toISOString().split('T')[0];
  console.log(`� Gerando missões para: ${hoje}\n`);

  const { data: lojas } = await supabase.from('lojas').select('id, nome').eq('ativo', true);
  const { data: templates } = await supabase.from('missao_templates').select('*').eq('ativo', true);

  console.log(`� ${lojas.length} lojas x ${templates.length} templates = ${lojas.length * templates.length} missões\n`);

  const missoesCriar = [];
  for (const loja of lojas) {
    for (const template of templates) {
      missoesCriar.push({
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
        pontos_bonus_rapido: Math.floor(template.pontos_base * ((template.multiplicador_rapido || 1.2) - 1)),
        pontos_bonus_critico: Math.floor(template.pontos_base * ((template.multiplicador_critico || 3) - 1)),
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

  console.log(`�� Inserindo ${missoesCriar.length} missões...`);
  
  const { data, error } = await supabase
    .from('missoes_diarias')
    .insert(missoesCriar)
    .select();

  if (error) {
    console.error('❌ Erro:', error.message);
    if (error.details) console.error('Detalhes:', error.details);
    return;
  }

  console.log(`\n✅ ${data.length} missões criadas com sucesso!`);
  
  // Verificar
  const { count } = await supabase
    .from('missoes_diarias')
    .select('*', { count: 'exact', head: true })
    .eq('data_missao', hoje);

  console.log(`� Total no banco para hoje: ${count}\n`);
}

gerarMissoesRapido().catch(console.error);
