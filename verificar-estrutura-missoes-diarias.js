require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function verificarEstrutura() {
  console.log('Ì¥ç Verificando estrutura de missoes_diarias\n');
  
  const { data, error } = await supabase
    .from('missoes_diarias')
    .select('*')
    .limit(1);

  if (error) {
    console.error('‚ùå Erro:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('‚úÖ Colunas dispon√≠veis:\n');
    Object.keys(data[0]).forEach(col => {
      console.log(`   - ${col}`);
    });
  } else {
    console.log('‚ö†Ô∏è  Tabela vazia, vou tentar inserir um registro de teste...');
  }
}

verificarEstrutura().catch(console.error);
