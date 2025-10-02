// Teste rápido de conexão com Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testando conexão...');
console.log('URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testar() {
  try {
    console.log('🏪 Testando busca de lojas...');
    const { data, error } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
      .limit(5);
    
    console.log('Resultado:', { 
      total: data?.length || 0, 
      error: error?.message || 'nenhum erro',
      lojas: data?.map(l => l.nome) || []
    });

    // Testar se as tabelas de configuração existem
    console.log('\n🔧 Testando tabelas de configuração...');
    
    const { data: configTabela, error: configError } = await supabase
      .from('loja_configuracoes_horario')
      .select('*')
      .limit(1);
    
    console.log('Tabela configurações:', {
      existe: !configError,
      error: configError?.message || 'OK'
    });

    const { data: acoesTabela, error: acoesError } = await supabase
      .from('loja_acoes_customizadas')
      .select('*')
      .limit(1);
    
    console.log('Tabela ações:', {
      existe: !acoesError,
      error: acoesError?.message || 'OK'
    });

  } catch (e) {
    console.log('❌ Erro:', e.message);
  }
}

testar();