// 🔧 Configurador Automático - Após Criar as Estruturas
// Execute APENAS depois de executar o SQL no Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function configurarLojas() {
  console.log('🔧 CONFIGURANDO LOJAS AUTOMATICAMENTE...\n');

  try {
    // 1. Verificar se as estruturas existem
    console.log('1. Verificando estruturas...');
    
    const { error: testError } = await supabase
      .from('loja_configuracoes_horario')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Estruturas não encontradas. Execute primeiro:');
      console.log('   - O SQL no Supabase (veja INSTRUCOES-CRIAR-ESTRUTURAS.md)');
      return;
    }
    
    console.log('✅ Estruturas encontradas!');

    // 2. Buscar lojas ativas
    console.log('\n2. Buscando lojas ativas...');
    
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
      .eq('ativo', true);

    if (lojasError) throw lojasError;
    
    console.log(`✅ ${lojas?.length || 0} lojas ativas encontradas`);

    // 3. Aplicar configurações padrão
    if (lojas && lojas.length > 0) {
      console.log('\n3. Aplicando configurações padrão...');
      
      for (const loja of lojas) {
        // Verificar se já tem configuração
        const { data: configExistente } = await supabase
          .from('loja_configuracoes_horario')
          .select('id')
          .eq('loja_id', loja.id)
          .single();

        if (!configExistente) {
          // Criar configuração padrão
          const { error: configError } = await supabase
            .from('loja_configuracoes_horario')
            .insert({
              loja_id: loja.id,
              hora_abertura: '08:00',
              hora_fechamento: '18:00',
              hora_limite_missoes: '17:00',
              hora_renovacao_sistema: '20:00',
              prazo_padrao_horas: 8,
              permite_execucao_apos_horario: false,
              segunda_ativa: true,
              terca_ativa: true,
              quarta_ativa: true,
              quinta_ativa: true,
              sexta_ativa: true,
              sabado_ativa: false,
              domingo_ativa: false
            });

          if (configError) {
            console.log(`❌ Erro ao configurar ${loja.nome}:`, configError.message);
          } else {
            console.log(`✅ ${loja.nome} configurada!`);
          }
        } else {
          console.log(`⏭️ ${loja.nome} já configurada`);
        }
      }
    }

    // 4. Verificar templates de missão
    console.log('\n4. Verificando templates de missão...');
    
    const { data: templates, error: templatesError } = await supabase
      .from('missao_templates')
      .select('id, nome, categoria, pontos_base, ativo')
      .eq('ativo', true);

    if (templatesError) {
      console.log('⚠️ Tabela missao_templates não encontrada. Isso é normal se você ainda não implementou o sistema de gamificação.');
    } else {
      console.log(`✅ ${templates?.length || 0} templates encontrados`);
      
      if (templates && templates.length > 0) {
        console.log('📝 Templates disponíveis:');
        templates.forEach(t => {
          console.log(`   - ${t.nome} (${t.categoria}) - ${t.pontos_base} pts`);
        });
      }
    }

    // 5. Status final
    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('=' .repeat(40));
    console.log('✅ Estruturas criadas');
    console.log(`✅ ${lojas?.length || 0} lojas configuradas`);
    console.log('✅ Sistema pronto para uso');
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Acesse /configuracoes/horarios-acoes');
    console.log('2. Selecione uma loja');
    console.log('3. Configure horários e ações');
    console.log('4. Teste o sistema!');

  } catch (error) {
    console.error('💥 Erro:', error);
  }
}

configurarLojas();