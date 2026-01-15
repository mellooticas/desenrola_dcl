const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrhevexrzaoeyhmpwvgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo'
);

(async () => {
  try {
    console.log('🔍 ANÁLISE COMPLETA - BANCO DE LENTES\n');
    console.log('=' .repeat(60));
    
    // Views documentadas nos blueprints
    const viewsDisponiveis = {
      'Catálogo e Grupos': [
        'v_lentes_catalogo',
        'v_lentes_busca', 
        'v_lentes_destaques',
        'v_grupos_canonicos',
        'v_grupos_canonicos_completos',
        'v_grupos_premium_marcas',
        'v_grupos_com_lentes',
        'v_filtros_disponiveis',
        'v_filtros_grupos_canonicos'
      ],
      'PDV / Vendas': [
        'v_grupos_por_receita_cliente',
        'v_grupos_por_faixa_preco',
        'v_grupos_melhor_margem',
        'v_sugestoes_upgrade'
      ],
      'Sistema DCL / Compras': [
        'v_fornecedores_por_lente',
        'v_lentes_cotacao_compra',
        'v_fornecedores_catalogo'
      ]
    };
    
    for (const [categoria, views] of Object.entries(viewsDisponiveis)) {
      console.log(`\n📋 ${categoria.toUpperCase()}:\n`);
      
      for (const view of views) {
        try {
          const { data, error, count } = await supabase
            .from(view)
            .select('*', { count: 'exact', head: false })
            .limit(1);
            
          if (!error && data) {
            // Pegar estatísticas reais
            const { count: totalRegistros } = await supabase
              .from(view)
              .select('*', { count: 'exact', head: true });
              
            console.log(`✅ ${view.padEnd(40)} ${String(totalRegistros || 0).padStart(6)} registros`);
            
            // Mostrar estrutura da primeira linha
            if (data.length > 0) {
              const campos = Object.keys(data[0]);
              console.log(`   📦 Campos (${campos.length}): ${campos.slice(0, 5).join(', ')}${campos.length > 5 ? '...' : ''}`);
            }
          } else {
            console.log(`❌ ${view.padEnd(40)} ${error.message.substring(0, 40)}`);
          }
        } catch (err) {
          console.log(`❌ ${view.padEnd(40)} ${err.message.substring(0, 40)}`);
        }
      }
    }
    
    // ANÁLISE DETALHADA
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANÁLISE DETALHADA\n');
    
    // 1. Total de grupos canônicos
    console.log('1️⃣ GRUPOS CANÔNICOS:');
    const { data: grupos, count: totalGrupos } = await supabase
      .from('v_grupos_canonicos')
      .select('tipo_lente, categoria, preco_medio', { count: 'exact' })
      .limit(5);
      
    if (grupos) {
      console.log(`   Total: ${totalGrupos} grupos`);
      console.log('   Exemplos:');
      grupos.forEach(g => {
        console.log(`   - ${g.tipo_lente} | ${g.categoria} | R$ ${g.preco_medio}`);
      });
    }
    
    // 2. Teste busca por receita
    console.log('\n2️⃣ TESTE BUSCA POR RECEITA (grau -5.00):');
    const { data: receitaTest } = await supabase
      .from('v_grupos_por_receita_cliente')
      .select('nome_grupo, preco_medio, total_lentes')
      .gte('grau_esferico_min', -5.25)
      .lte('grau_esferico_max', -4.75)
      .order('preco_medio')
      .limit(3);
      
    if (receitaTest && receitaTest.length > 0) {
      receitaTest.forEach((g, i) => {
        console.log(`   ${i + 1}. ${g.nome_grupo || 'N/A'}`);
        console.log(`      R$ ${g.preco_medio} | ${g.total_lentes} opções`);
      });
    } else {
      console.log('   ⚠️ Nenhum resultado (view pode não estar configurada)');
    }
    
    // 3. Fornecedores disponíveis
    console.log('\n3️⃣ FORNECEDORES:');
    const { data: fornecedores, count: totalFornecedores } = await supabase
      .from('v_fornecedores_catalogo')
      .select('fornecedor_nome, total_lentes, prazo_medio', { count: 'exact' })
      .limit(5);
      
    if (fornecedores) {
      console.log(`   Total: ${totalFornecedores} fornecedores`);
      fornecedores.forEach(f => {
        console.log(`   - ${f.fornecedor_nome}: ${f.total_lentes} lentes (${f.prazo_medio}d)`);
      });
    }
    
    // 4. Filtros disponíveis
    console.log('\n4️⃣ FILTROS DISPONÍVEIS:');
    const { data: filtros } = await supabase
      .from('v_filtros_grupos_canonicos')
      .select('filtro_categoria, filtro_valor, total_grupos')
      .order('total_grupos', { ascending: false })
      .limit(10);
      
    if (filtros) {
      const porCategoria = {};
      filtros.forEach(f => {
        if (!porCategoria[f.filtro_categoria]) porCategoria[f.filtro_categoria] = [];
        porCategoria[f.filtro_categoria].push(`${f.filtro_valor} (${f.total_grupos})`);
      });
      
      Object.entries(porCategoria).forEach(([cat, vals]) => {
        console.log(`   ${cat}: ${vals.join(', ')}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ANÁLISE COMPLETA!\n');
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
})();
