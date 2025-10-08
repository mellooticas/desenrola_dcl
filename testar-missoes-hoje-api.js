require('dotenv').config({ path: '.env.local' });

async function testarAPI() {
  const hoje = new Date().toISOString().split('T')[0];
  
  // Pegar uma loja qualquer
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data: lojas } = await supabase
    .from('lojas')
    .select('id, nome')
    .eq('ativo', true)
    .limit(1);
  
  if (!lojas || lojas.length === 0) {
    console.log('‚ùå Nenhuma loja encontrada!');
    return;
  }
  
  const loja = lojas[0];
  console.log(`Ì∑™ Testando API com loja: ${loja.nome}\n`);
  console.log(`Ì≥Ö Data: ${hoje}\n`);
  
  const url = `http://localhost:3001/api/mission-control?action=missions&data=${hoje}&loja_id=${loja.id}`;
  console.log(`Ì¥ó URL: ${url}\n`);
  console.log('============================================================\n');
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${response.status} ${response.ok ? '‚úÖ' : '‚ùå'}\n`);
    
    if (response.ok) {
      const missoes = data.missions || data || [];
      console.log(`Ì≥ä Miss√µes retornadas: ${missoes.length}\n`);
      
      if (missoes.length > 0) {
        console.log('‚úÖ SUCESSO! As primeiras 5 miss√µes:');
        missoes.slice(0, 5).forEach((m, i) => {
          console.log(`   ${i + 1}. ${m.titulo || m.nome || m.missao_nome} [${m.status}]`);
        });
        console.log('\nÌæâ Mission Control deve estar funcionando!');
      } else {
        console.log('‚ö†Ô∏è  API retornou mas sem miss√µes.');
      }
    } else {
      console.log('‚ùå Erro na API:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('‚ùå Erro ao chamar API:', error.message);
    console.log('\n‚ö†Ô∏è  O servidor dev precisa estar rodando:');
    console.log('   npm run dev');
  }
  
  console.log('\n============================================================\n');
}

testarAPI().catch(console.error);
