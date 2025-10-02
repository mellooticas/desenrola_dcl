// 🚀 Inicializador Simples - Sistema de Configurações de Loja
// Script básico para criar apenas as estruturas essenciais

const { createClient } = require('@supabase/supabase-js');

async function inicializarEstruturasBasicas() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🚀 INICIALIZANDO ESTRUTURAS BÁSICAS...\n');

  try {
    // ========================================
    // 1. VERIFICAR SE AS TABELAS EXISTEM
    // ========================================
    
    console.log('📋 1. Verificando estruturas existentes...');
    
    const { data: tabelas, error: tabelasError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['loja_configuracoes_horario', 'loja_acoes_customizadas']);

    if (tabelasError) {
      console.error('❌ Erro ao verificar tabelas:', tabelasError);
      return;
    }

    const tabelasExistentes = tabelas?.map(t => t.table_name) || [];
    console.log(`✅ Tabelas encontradas: ${tabelasExistentes.join(', ') || 'nenhuma'}`);

    // ========================================
    // 2. VERIFICAR LOJAS ATIVAS
    // ========================================
    
    console.log('\n🏪 2. Verificando lojas ativas...');
    
    const { data: lojas, error: lojasError } = await supabase
      .from('lojas')
      .select('id, nome, ativo')
      .eq('ativo', true);

    if (lojasError) {
      console.error('❌ Erro ao buscar lojas:', lojasError);
      return;
    }

    console.log(`✅ ${lojas?.length || 0} lojas ativas encontradas`);
    if (lojas && lojas.length > 0) {
      lojas.forEach(loja => {
        console.log(`   - ${loja.nome} (${loja.id})`);
      });
    }

    // ========================================
    // 3. VERIFICAR TEMPLATES DE MISSÃO
    // ========================================
    
    console.log('\n📝 3. Verificando templates de missão...');
    
    const { data: templates, error: templatesError } = await supabase
      .from('missao_templates')
      .select('id, nome, categoria, pontos_base, ativo')
      .eq('ativo', true);

    if (templatesError) {
      console.error('❌ Erro ao buscar templates:', templatesError);
      return;
    }

    console.log(`✅ ${templates?.length || 0} templates ativos encontrados`);
    if (templates && templates.length > 0) {
      // Agrupar por categoria
      const porCategoria = templates.reduce((acc, template) => {
        const categoria = template.categoria || 'outros';
        if (!acc[categoria]) acc[categoria] = [];
        acc[categoria].push(template);
        return acc;
      }, {});

      Object.keys(porCategoria).forEach(categoria => {
        console.log(`   📂 ${categoria}: ${porCategoria[categoria].length} templates`);
        porCategoria[categoria].forEach(template => {
          console.log(`      - ${template.nome} (${template.pontos_base} pts)`);
        });
      });
    }

    // ========================================
    // 4. VERIFICAR CONFIGURAÇÕES EXISTENTES
    // ========================================
    
    if (tabelasExistentes.includes('loja_configuracoes_horario')) {
      console.log('\n⚙️ 4. Verificando configurações existentes...');
      
      const { data: configuracoes, error: configError } = await supabase
        .from('loja_configuracoes_horario')
        .select('loja_id')
        .limit(10);

      if (!configError && configuracoes) {
        console.log(`✅ ${configuracoes.length} lojas já têm configurações`);
      }
    }

    if (tabelasExistentes.includes('loja_acoes_customizadas')) {
      const { data: acoes, error: acoesError } = await supabase
        .from('loja_acoes_customizadas')
        .select('loja_id, ativa')
        .limit(10);

      if (!acoesError && acoes) {
        const acoesAtivas = acoes.filter(a => a.ativa).length;
        console.log(`✅ ${acoes.length} ações configuradas (${acoesAtivas} ativas)`);
      }
    }

    // ========================================
    // 5. STATUS FINAL
    // ========================================
    
    console.log('\n📊 STATUS DO SISTEMA:');
    console.log('=' .repeat(40));
    
    const status = {
      estruturas_prontas: tabelasExistentes.length >= 2,
      lojas_disponiveis: (lojas?.length || 0) > 0,
      templates_disponiveis: (templates?.length || 0) > 0,
      sistema_funcional: tabelasExistentes.length >= 2 && (lojas?.length || 0) > 0 && (templates?.length || 0) > 0
    };

    console.log(`🏗️  Estruturas do banco: ${status.estruturas_prontas ? '✅ Prontas' : '❌ Precisam ser criadas'}`);
    console.log(`🏪 Lojas disponíveis: ${status.lojas_disponiveis ? '✅ Sim' : '❌ Nenhuma loja ativa'}`);
    console.log(`📝 Templates disponíveis: ${status.templates_disponiveis ? '✅ Sim' : '❌ Nenhum template ativo'}`);
    console.log(`🎯 Sistema funcional: ${status.sistema_funcional ? '✅ Pronto para usar' : '❌ Requer configuração'}`);

    // ========================================
    // 6. RECOMENDAÇÕES
    // ========================================
    
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('-' .repeat(30));

    if (!status.estruturas_prontas) {
      console.log('1. ⚠️  Execute o SQL em database/configuracoes_loja_setup.sql para criar as tabelas');
    } else {
      console.log('1. ✅ Estruturas do banco estão prontas');
    }

    if (!status.lojas_disponiveis) {
      console.log('2. ⚠️  Cadastre lojas ativas no sistema');
    } else {
      console.log('2. ✅ Lojas ativas encontradas');
    }

    if (!status.templates_disponiveis) {
      console.log('3. ⚠️  Crie templates de missão ativos');
    } else {
      console.log('3. ✅ Templates de missão encontrados');
    }

    if (status.sistema_funcional) {
      console.log('4. 🎉 Acesse /configuracoes/horarios-acoes para começar a configurar!');
    } else {
      console.log('4. ⏳ Complete os itens acima primeiro');
    }

    console.log('\n📚 DOCUMENTAÇÃO:');
    console.log('- docs/configuracoes-loja/README.md - Documentação completa');
    console.log('- /configuracoes/horarios-acoes - Interface de configuração');

  } catch (error) {
    console.error('💥 ERRO:', error);
  }
}

// Executar verificação
if (require.main === module) {
  inicializarEstruturasBasicas()
    .then(() => {
      console.log('\n✨ Verificação concluída!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { inicializarEstruturasBasicas };