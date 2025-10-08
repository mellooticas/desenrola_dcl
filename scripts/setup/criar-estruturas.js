// 🏗️ Criar Estruturas Básicas - Sistema de Configurações
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function criarEstruturas() {
  console.log('🏗️ CRIANDO ESTRUTURAS BÁSICAS...\n');

  try {
    // 1. Criar tabela de configurações de horário
    console.log('1. Criando tabela loja_configuracoes_horario...');
    const { error: configError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS loja_configuracoes_horario (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          loja_id UUID NOT NULL,
          hora_abertura TIME NOT NULL DEFAULT '08:00',
          hora_fechamento TIME NOT NULL DEFAULT '18:00',
          hora_limite_missoes TIME NOT NULL DEFAULT '17:00',
          hora_renovacao_sistema TIME NOT NULL DEFAULT '20:00',
          prazo_padrao_horas INTEGER NOT NULL DEFAULT 8,
          permite_execucao_apos_horario BOOLEAN NOT NULL DEFAULT false,
          segunda_ativa BOOLEAN NOT NULL DEFAULT true,
          terca_ativa BOOLEAN NOT NULL DEFAULT true,
          quarta_ativa BOOLEAN NOT NULL DEFAULT true,
          quinta_ativa BOOLEAN NOT NULL DEFAULT true,
          sexta_ativa BOOLEAN NOT NULL DEFAULT true,
          sabado_ativa BOOLEAN NOT NULL DEFAULT false,
          domingo_ativa BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(loja_id)
        );
      `
    });

    if (configError) {
      console.log('❌ Erro ao criar tabela de configurações:', configError.message);
    } else {
      console.log('✅ Tabela loja_configuracoes_horario criada!');
    }

    // 2. Criar tabela de ações customizadas
    console.log('2. Criando tabela loja_acoes_customizadas...');
    const { error: acoesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS loja_acoes_customizadas (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          loja_id UUID NOT NULL,
          template_id UUID NOT NULL,
          ativa BOOLEAN NOT NULL DEFAULT true,
          prioridade INTEGER NOT NULL DEFAULT 1,
          horario_especifico TIME,
          prazo_customizado_horas INTEGER,
          pontos_customizados INTEGER,
          obrigatoria BOOLEAN NOT NULL DEFAULT false,
          dias_semana TEXT[] DEFAULT ARRAY['seg','ter','qua','qui','sex'],
          condicoes_especiais JSONB DEFAULT '{}',
          permite_delegacao BOOLEAN NOT NULL DEFAULT true,
          requer_evidencia BOOLEAN NOT NULL DEFAULT false,
          requer_justificativa_se_nao_feita BOOLEAN NOT NULL DEFAULT false,
          configurada_por UUID,
          configurada_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(loja_id, template_id)
        );
      `
    });

    if (acoesError) {
      console.log('❌ Erro ao criar tabela de ações:', acoesError.message);
    } else {
      console.log('✅ Tabela loja_acoes_customizadas criada!');
    }

    // 3. Testar se as tabelas foram criadas
    console.log('\n3. Testando se as tabelas foram criadas...');
    
    const { data: configTeste, error: configTesteError } = await supabase
      .from('loja_configuracoes_horario')
      .select('*')
      .limit(1);
    
    const { data: acoesTeste, error: acoesTesteError } = await supabase
      .from('loja_acoes_customizadas')
      .select('*')
      .limit(1);
    
    console.log('📊 Resultado dos testes:');
    console.log('- Configurações:', !configTesteError ? '✅ OK' : `❌ ${configTesteError.message}`);
    console.log('- Ações:', !acoesTesteError ? '✅ OK' : `❌ ${acoesTesteError.message}`);

    if (!configTesteError && !acoesTesteError) {
      console.log('\n🎉 ESTRUTURAS CRIADAS COM SUCESSO!');
      console.log('Agora você pode acessar /configuracoes/horarios-acoes');
    }

  } catch (error) {
    console.error('💥 Erro fatal:', error);
  }
}

criarEstruturas();