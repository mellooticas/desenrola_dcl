const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jrhevexrzaoeyhmpwvgs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaGV2ZXhyemFvZXlobXB3dmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNDI1MTMsImV4cCI6MjA3NTcxODUxM30.fOMiindaZq_hGdvv1AeFkRvj5LXp6K1HSAt3hqYg6mo'
);

(async () => {
  try {
    console.log('🔍 DESCOBERTA EXPLORATÓRIA - Testando diferentes nomes\n');
    
    // Possíveis variações de nomenclatura
    const variantes = [
      // Sem prefixo v_
      'grupos_canonicos',
      'lentes_catalogo',
      'fornecedores_catalogo',
      'lentes_cotacao_compra',
      'fornecedores_por_lente',
      
      // Tabelas diretas que podem estar expostas
      'lentes',
      'marcas',
      'fornecedores',
      'grupos_canonicos',
      'lentes_canonicas',
      
      // Views com nome diferente
      'view_grupos_canonicos',
      'vw_grupos_canonicos',
      'catalogo_lentes',
      'catalogo_grupos',
      
      // Singular
      'lente',
      'marca',
      'fornecedor',
      'grupo_canonico',
      
      // Inglês
      'lens',
      'lenses',
      'brands',
      'suppliers',
      'canonical_groups'
    ];
    
    console.log('Testando variantes de nomes...\n');
    const encontrados = [];
    
    for (const nome of variantes) {
      try {
        const { data, error, count } = await supabase
          .from(nome)
          .select('*', { count: 'exact', head: true });
          
        if (!error) {
          console.log(`✅ ${nome.padEnd(35)} - ${count || 0} registros`);
          encontrados.push({ nome, count });
        }
      } catch (err) {
        // Ignora erros
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n🎯 ENCONTRADOS: ${encontrados.length} tabelas/views acessíveis\n`);
    
    if (encontrados.length > 0) {
      // Analisa o primeiro com dados
      const comDados = encontrados.find(e => e.count > 0);
      
      if (comDados) {
        console.log(`📊 Analisando: ${comDados.nome} (${comDados.count} registros)\n`);
        
        const { data } = await supabase
          .from(comDados.nome)
          .select('*')
          .limit(2);
          
        if (data && data.length > 0) {
          console.log('Estrutura dos dados:');
          console.log(JSON.stringify(data[0], null, 2).substring(0, 500));
          console.log('\n...\n');
          
          console.log(`Campos disponíveis (${Object.keys(data[0]).length}):`);
          Object.keys(data[0]).forEach(key => {
            const valor = data[0][key];
            const tipo = typeof valor;
            console.log(`  - ${key.padEnd(30)} : ${tipo}`);
          });
        }
      }
    } else {
      console.log('⚠️ Nenhuma tabela acessível encontrada!');
      console.log('\nPossíveis causas:');
      console.log('1. As views precisam ser criadas no Supabase');
      console.log('2. RLS está bloqueando acesso da anon key');
      console.log('3. As tabelas estão em schemas não-públicos');
      console.log('\n💡 Solução: Acessar Supabase Studio e verificar:');
      console.log('   - Table Editor > Qual schema está visível?');
      console.log('   - SQL Editor > Executar: SELECT * FROM information_schema.tables WHERE table_schema = \'public\'');
    }
    
  } catch (err) {
    console.error('❌ Erro:', err);
  }
})();
