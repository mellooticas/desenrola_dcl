// 🚀 Script de Migração - Sistema de Configurações de Loja
// Aplicar estrutura de configurações e popular dados iniciais

const { createClient } = require('@supabase/supabase-js');

async function aplicarMigracaoConfiguracoes() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🚀 INICIANDO MIGRAÇÃO DO SISTEMA DE CONFIGURAÇÕES...\n');

  try {
    // ========================================
    // 1. VERIFICAR ESTRUTURA ATUAL
    // ========================================
    
    console.log('📋 1. Verificando estrutura atual...');
    
    // Verificar se as tabelas já existem
    const { data: tabelasExistentes, error: tabelasError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['loja_configuracoes_horario', 'loja_acoes_customizadas'])
      .eq('table_schema', 'public');

    if (tabelasError) {
      console.error('❌ Erro ao verificar tabelas:', tabelasError);
      return;
    }

    const tabelasExistentesNomes = tabelasExistentes?.map(t => t.table_name) || [];
    console.log(`✅ Tabelas encontradas: ${tabelasExistentesNomes.join(', ')}`);

    // ========================================
    // 2. BUSCAR LOJAS ATIVAS
    // ========================================
    
    console.log('\n🏪 2. Buscando lojas ativas...');
    
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
      .eq('ativo', true);

    if (lojasError) {
      console.error('❌ Erro ao buscar lojas:', lojasError);
      return;
    }

    console.log(`✅ ${lojas?.length || 0} lojas ativas encontradas`);
    lojas?.forEach(loja => {
      console.log(`   - ${loja.nome} (${loja.id})`);
    });

    // ========================================
    // 3. BUSCAR TEMPLATES ATIVOS
    // ========================================
    
    console.log('\n📝 3. Buscando templates de missão...');
    
    const { data: templates, error: templatesError } = await supabase
      .from('missao_templates')
      .select('id, nome, categoria, pontos_base, ativo')
      .eq('ativo', true);

    if (templatesError) {
      console.error('❌ Erro ao buscar templates:', templatesError);
      return;
    }

    console.log(`✅ ${templates?.length || 0} templates ativos encontrados`);
    templates?.forEach(template => {
      console.log(`   - ${template.nome} (${template.categoria}) - ${template.pontos_base} pts`);
    });

    // ========================================
    // 4. CONFIGURAÇÕES PADRÃO POR LOJA
    // ========================================
    
    console.log('\n⚙️ 4. Aplicando configurações padrão...');
    
    if (lojas && lojas.length > 0) {
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
            console.error(`❌ Erro ao criar configuração para ${loja.nome}:`, configError);
          } else {
            console.log(`✅ Configuração padrão criada para ${loja.nome}`);
          }
        } else {
          console.log(`⏭️ ${loja.nome} já possui configuração`);
        }

        // ========================================
        // 5. AÇÕES PADRÃO POR LOJA
        // ========================================
        
        if (templates && templates.length > 0) {
          // Verificar quantas ações já estão configuradas
          const { data: acoesExistentes } = await supabase
            .from('loja_acoes_customizadas')
            .select('template_id')
            .eq('loja_id', loja.id);

          const templatesJaConfigurados = acoesExistentes?.map(a => a.template_id) || [];
          
          // Adicionar templates que ainda não foram configurados
          for (const template of templates) {
            if (!templatesJaConfigurados.includes(template.id)) {
              
              // Definir configuração baseada na categoria
              let configuracaoTemplate = {
                loja_id: loja.id,
                template_id: template.id,
                ativa: true,
                prioridade: 2, // Normal por padrão
                obrigatoria: false,
                dias_semana: ['seg', 'ter', 'qua', 'qui', 'sex'],
                permite_delegacao: true,
                requer_evidencia: false,
                requer_justificativa_se_nao_feita: false
              };

              // Personalizar baseado na categoria
              switch (template.categoria) {
                case 'vendas':
                  configuracaoTemplate.prioridade = 4; // Alta
                  configuracaoTemplate.obrigatoria = true;
                  configuracaoTemplate.horario_especifico = '16:00';
                  break;
                  
                case 'estoque':
                  configuracaoTemplate.prioridade = 3; // Média
                  configuracaoTemplate.horario_especifico = '09:00';
                  configuracaoTemplate.requer_evidencia = true;
                  break;
                  
                case 'limpeza':
                  configuracaoTemplate.prioridade = 2; // Normal
                  configuracaoTemplate.horario_especifico = '08:30';
                  break;
                  
                case 'atendimento':
                  configuracaoTemplate.prioridade = 4; // Alta
                  configuracaoTemplate.obrigatoria = true;
                  break;
                  
                case 'administrativo':
                  configuracaoTemplate.prioridade = 2; // Normal
                  configuracaoTemplate.dias_semana = ['seg', 'qua', 'sex'];
                  configuracaoTemplate.horario_especifico = '17:00';
                  break;
                  
                default:
                  // Manter configuração padrão
                  break;
              }

              const { error: acaoError } = await supabase
                .from('loja_acoes_customizadas')
                .insert(configuracaoTemplate);

              if (acaoError && acaoError.code !== '23505') { // Ignorar duplicatas
                console.error(`❌ Erro ao criar ação ${template.nome} para ${loja.nome}:`, acaoError);
              } else if (!acaoError) {
                console.log(`✅ Ação ${template.nome} configurada para ${loja.nome}`);
              }
            }
          }
        }
      }
    }

    // ========================================
    // 6. ATUALIZAR TEMPLATES PARA PERMITIR CUSTOMIZAÇÃO
    // ========================================
    
    console.log('\n🔧 6. Atualizando templates para permitir customização...');
    
    const { error: updateTemplatesError } = await supabase
      .from('missao_templates')
      .update({
        permite_customizacao_loja: true,
        dias_semana_padrao: ['seg', 'ter', 'qua', 'qui', 'sex']
      })
      .eq('ativo', true);

    if (updateTemplatesError) {
      console.error('❌ Erro ao atualizar templates:', updateTemplatesError);
    } else {
      console.log('✅ Templates atualizados para permitir customização');
    }

    // ========================================
    // 7. RELATÓRIO FINAL
    // ========================================
    
    console.log('\n📊 7. Gerando relatório final...');
    
    // Contar configurações criadas
    const { data: totalConfiguracoes } = await supabase
      .from('loja_configuracoes_horario')
      .select('id', { count: 'exact' });

    const { data: totalAcoes } = await supabase
      .from('loja_acoes_customizadas')
      .select('id', { count: 'exact' });

    const { data: acoesAtivas } = await supabase
      .from('loja_acoes_customizadas')
      .select('id', { count: 'exact' })
      .eq('ativa', true);

    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(50));
    console.log(`📋 Lojas configuradas: ${totalConfiguracoes?.length || 0}`);
    console.log(`⚡ Total de ações: ${totalAcoes?.length || 0}`);
    console.log(`✅ Ações ativas: ${acoesAtivas?.length || 0}`);
    console.log(`📝 Templates disponíveis: ${templates?.length || 0}`);
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Acesse /admin/lojas/[lojaId]/configuracoes para ajustar configurações');
    console.log('2. Configure horários específicos por loja conforme necessário');
    console.log('3. Ative/desative ações conforme o perfil de cada loja');
    console.log('4. Ajuste prioridades e pontuações personalizadas');

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NA MIGRAÇÃO:', error);
    process.exit(1);
  }
}

// Executar migração
if (require.main === module) {
  aplicarMigracaoConfiguracoes()
    .then(() => {
      console.log('\n✨ Script finalizado!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { aplicarMigracaoConfiguracoes };