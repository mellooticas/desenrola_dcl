require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarMissionControl() {
  console.log('��� INVESTIGANDO MISSION CONTROL\n');
  console.log('============================================================\n');

  // 1. Verificar estrutura de tabelas relacionadas a missões
  console.log('��� PASSO 1: Verificando Tabelas de Missões');
  console.log('------------------------------------------------------------');
  
  const tabelas = [
    'missoes',
    'loja_missoes', 
    'missoes_loja',
    'gamificacao_missoes',
    'lojas_gamificacao'
  ];

  for (const tabela of tabelas) {
    const { data, error } = await supabase
      .from(tabela)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Tabela "${tabela}": NÃO EXISTE ou sem permissão`);
    } else {
      const { count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });
      console.log(`✅ Tabela "${tabela}": existe (${count || 0} registros)`);
    }
  }

  // 2. Verificar lojas disponíveis
  console.log('\n�� PASSO 2: Verificando Lojas');
  console.log('------------------------------------------------------------');
  
  const { data: lojas, error: lojasError } = await supabase
    .from('lojas')
    .select('id, nome, ativo')
    .order('nome');

  if (lojasError) {
    console.log('❌ Erro ao buscar lojas:', lojasError.message);
  } else {
    console.log(`✅ Total de lojas: ${lojas.length}`);
    lojas.slice(0, 5).forEach(loja => {
      console.log(`   - ${loja.nome} (${loja.ativo ? 'Ativa' : 'Inativa'})`);
    });
  }

  // 3. Verificar se existe gamificação configurada
  console.log('\n��� PASSO 3: Verificando Gamificação');
  console.log('------------------------------------------------------------');
  
  const { data: gamificacao, error: gamError } = await supabase
    .from('lojas_gamificacao')
    .select('*')
    .limit(5);

  if (gamError) {
    console.log('❌ Erro na gamificação:', gamError.message);
  } else {
    console.log(`✅ Registros de gamificação: ${gamificacao.length}`);
    if (gamificacao.length > 0) {
      console.log('\nExemplo de dados:');
      console.log(JSON.stringify(gamificacao[0], null, 2));
    }
  }

  // 4. Verificar API de missões
  console.log('\n��� PASSO 4: Testando API /api/mission-control');
  console.log('------------------------------------------------------------');
  
  try {
    const response = await fetch('http://localhost:3001/api/mission-control?action=listar');
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Erro ao testar API:', error.message);
    console.log('⚠️  O servidor dev precisa estar rodando na porta 3001');
  }

  // 5. Verificar estrutura esperada
  console.log('\n��� PASSO 5: Verificando Estrutura de Dados');
  console.log('------------------------------------------------------------');
  
  const { data: sample } = await supabase
    .from('lojas_gamificacao')
    .select('*')
    .limit(1)
    .single();

  if (sample) {
    console.log('\nColunas disponíveis na tabela lojas_gamificacao:');
    Object.keys(sample).forEach(col => {
      console.log(`   - ${col}: ${typeof sample[col]}`);
    });
  }

  console.log('\n============================================================');
  console.log('✅ Investigação concluída!\n');
}

verificarMissionControl().catch(console.error);
