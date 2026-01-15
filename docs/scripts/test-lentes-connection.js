const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrhevexrzaoeyhmpwvgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo'
);

(async () => {
  try {
    console.log('🔍 Analisando banco de lentes...\n');
    
    // Testar views conhecidas do blueprint
    const viewsTestadas = [
      'v_grupos_canonicos',
      'v_grupos_canonicos_completos',
      'v_grupos_premium_marcas',
      'v_grupos_por_receita_cliente',
      'v_grupos_por_faixa_preco',
      'v_grupos_melhor_margem',
      'v_sugestoes_upgrade',
      'v_fornecedores_por_lente',
      'v_lentes_cotacao_compra',
      'v_filtros_grupos_canonicos',
      'v_grupos_com_lentes',
      'v_fornecedores_catalogo'
    ];
    
    console.log('📋 VIEWS DISPONÍVEIS:\n');
    
    for (const view of viewsTestadas) {
      const { data, error } = await supabase
        .from(view)
        .select('*', { count: 'exact', head: true });
        
      if (!error) {
        console.log(`✅ ${view.padEnd(40)} - ${data || 0} registros`);
      } else {
        console.log(`❌ ${view.padEnd(40)} - ${error.message}`);
      }
    }
    
    console.log('\n📊 ESTATÍSTICAS RÁPIDAS:\n');
    
    // Contar grupos canônicos
    const { count: totalGrupos } = await supabase
      .from('v_grupos_canonicos')
      .select('*', { count: 'exact', head: true });
      
    console.log(`   Total de grupos canônicos: ${totalGrupos || 0}`);
    
    // Buscar um grupo de exemplo
    const { data: grupoExemplo } = await supabase
      .from('v_grupos_canonicos')
      .select('*')
      .limit(1)
      .single();
      
    if (grupoExemplo) {
      console.log(`   Exemplo de grupo: ${grupoExemplo.nome_grupo}`);
      console.log(`   Preço médio: R$ ${grupoExemplo.preco_medio}`);
      console.log(`   Total lentes: ${grupoExemplo.total_lentes}`);
    }
    
    // Testar busca por receita
    console.log('\n🔬 TESTE: Busca por receita (-5.00 esférico):\n');
    
    const { data: gruposPorReceita, error: erroReceita } = await supabase
      .from('v_grupos_por_receita_cliente')
      .select('nome_grupo, preco_medio, total_lentes')
      .gte('grau_esferico_min', -5.00)
      .lte('grau_esferico_max', -5.00)
      .order('preco_medio')
      .limit(3);
      
    if (!erroReceita && gruposPorReceita) {
      gruposPorReceita.forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.nome_grupo}`);
        console.log(`      Preço: R$ ${g.preco_medio} | ${g.total_lentes} opções\n`);
      });
    } else {
      console.log(`   ❌ Erro: ${erroReceita?.message}`);
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err.message);
  }
})();
