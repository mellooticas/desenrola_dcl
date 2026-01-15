const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrhevexrzaoeyhmpwvgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo'
);

(async () => {
  try {
    console.log('🔍 Analisando estrutura do banco de lentes...\n');
    
    // Testar acesso direto às tabelas internas
    console.log('📦 TABELAS NO SCHEMA lens_catalog:\n');
    
    const tabelasInternas = [
      'lens_catalog.lentes',
      'lens_catalog.marcas',
      'lens_catalog.grupos_canonicos',
      'lens_catalog.lentes_canonicas',
      'core.fornecedores',
      'compras.pedidos',
      'compras.estoque_saldo'
    ];
    
    for (const tabela of tabelasInternas) {
      const [schema, table] = tabela.split('.');
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
        
      if (!error) {
        console.log(`✅ ${tabela.padEnd(40)} - ${count || 0} registros`);
      } else {
        console.log(`❌ ${tabela.padEnd(40)} - ${error.code}: ${error.message.substring(0, 60)}`);
      }
    }
    
    // Tentar buscar dados diretos das lentes
    console.log('\n📊 ANÁLISE DE DADOS:\n');
    
    const { data: lentes, error: erroLentes } = await supabase
      .from('lentes')
      .select('id, nome_lente, preco_custo')
      .limit(3);
      
    if (lentes && lentes.length > 0) {
      console.log('   ✅ Tabela lentes acessível:');
      lentes.forEach(l => console.log(`      - ${l.nome_lente} (R$ ${l.preco_custo})`));
    } else {
      console.log(`   ❌ Erro ao acessar lentes: ${erroLentes?.message}`);
    }
    
    const { data: marcas, error: erroMarcas } = await supabase
      .from('marcas')
      .select('id, nome, is_premium')
      .limit(3);
      
    if (marcas && marcas.length > 0) {
      console.log('\n   ✅ Tabela marcas acessível:');
      marcas.forEach(m => console.log(`      - ${m.nome} (Premium: ${m.is_premium})`));
    } else {
      console.log(`\n   ❌ Erro ao acessar marcas: ${erroMarcas?.message}`);
    }
    
    const { data: fornecedores, error: erroForn } = await supabase
      .from('fornecedores')
      .select('id, nome, prazo_visao_simples')
      .limit(3);
      
    if (fornecedores && fornecedores.length > 0) {
      console.log('\n   ✅ Tabela fornecedores acessível:');
      fornecedores.forEach(f => console.log(`      - ${f.nome} (Prazo: ${f.prazo_visao_simples} dias)`));
    } else {
      console.log(`\n   ❌ Erro ao acessar fornecedores: ${erroForn?.message}`);
    }
    
    console.log('\n🎯 CONCLUSÃO:\n');
    console.log('   O banco está configurado mas pode estar:');
    console.log('   1. Sem dados populados (tabelas vazias)');
    console.log('   2. Com RLS impedindo acesso via anon key');
    console.log('   3. Views precisam ser recriadas após população');
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
})();
