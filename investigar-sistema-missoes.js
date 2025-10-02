// Investigação profunda: Sistema de criação de missões
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function investigarSistemaMissoes() {
  console.log('🔍 Investigação profunda: Sistema de criação de missões...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  try {
    // 1. Buscar todas as tabelas relacionadas a templates/missões
    console.log('\n1. Investigando templates e configurações...')
    
    const tabelasPossiveis = [
      'missoes_templates',
      'templates_missoes', 
      'mission_templates',
      'missao_templates',
      'templates',
      'configuracao_missoes',
      'missoes_config',
      'agendamento_missoes',
      'jobs_missoes',
      'regras_missoes'
    ]

    for (const tabela of tabelasPossiveis) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(5)
        
        if (!error && data) {
          console.log(`✅ Tabela ${tabela} encontrada:`)
          console.log(`   Registros: ${data.length}`)
          if (data.length > 0) {
            console.log(`   Campos: ${Object.keys(data[0]).join(', ')}`)
            console.log(`   Exemplo: ${JSON.stringify(data[0], null, 2)}`)
          }
        }
      } catch (e) {
        // Tabela não existe, continuar
      }
    }

    // 2. Verificar se há alguma relação template_id nas missões existentes
    console.log('\n2. Analisando template_id das missões existentes...')
    
    const { data: missoesComTemplate, error: templateError } = await supabase
      .from('missoes_diarias')
      .select('template_id, data_missao, status, loja_id')
      .not('template_id', 'is', null)
      .limit(10)
    
    if (!templateError && missoesComTemplate) {
      console.log(`✅ Encontradas ${missoesComTemplate.length} missões com template_id`)
      
      // Buscar templates únicos
      const templatesUnicos = [...new Set(missoesComTemplate.map(m => m.template_id))]
      console.log(`📋 Templates únicos usados: ${templatesUnicos.length}`)
      
      // Tentar buscar os templates
      for (const templateId of templatesUnicos.slice(0, 3)) {
        try {
          const { data: template } = await supabase
            .from('missoes_templates')
            .select('*')
            .eq('id', templateId)
            .single()
          
          if (template) {
            console.log(`🎯 Template ${templateId}:`)
            console.log(`   Nome: ${template.nome || template.missao_nome || 'sem nome'}`)
            console.log(`   Tipo: ${template.tipo}`)
            console.log(`   Ativo: ${template.ativo}`)
            console.log(`   Frequencia: ${template.frequencia || 'não definida'}`)
          }
        } catch (e) {
          console.log(`❌ Template ${templateId} não encontrado em missoes_templates`)
        }
      }
    }

    // 3. Verificar funções/procedures do banco
    console.log('\n3. Verificando funções do banco...')
    
    try {
      // Verificar se existe função gerar_missoes_diarias
      const { data: functions, error: funcError } = await supabase
        .from('information_schema.routines')
        .select('routine_name, routine_type')
        .eq('routine_schema', 'public')
        .ilike('routine_name', '%missao%')
      
      if (!funcError && functions && functions.length > 0) {
        console.log('✅ Funções relacionadas a missões encontradas:')
        functions.forEach(f => {
          console.log(`   - ${f.routine_name} (${f.routine_type})`)
        })
      } else {
        console.log('❌ Nenhuma função relacionada a missões encontrada')
      }
    } catch (e) {
      console.log('❌ Erro ao verificar funções:', e.message)
    }

    // Verificar outras funções possíveis
    const funcoesPossiveis = [
      'create_daily_missions',
      'gerar_missoes',
      'criar_missoes_diarias',
      'populate_missions',
      'schedule_missions'
    ]

    for (const funcao of funcoesPossiveis) {
      try {
        const { data, error } = await supabase.rpc(funcao)
        if (!error) {
          console.log(`✅ Função ${funcao} existe e foi executada`)
        }
      } catch (e) {
        // Função não existe ou erro na execução
      }
    }

    // 4. Verificar cron jobs / triggers
    console.log('\n4. Verificando triggers e jobs automáticos...')
    
    try {
      // Verificar se há triggers na tabela missoes_diarias
      const { data: triggers } = await supabase
        .from('information_schema.triggers')
        .select('*')
        .eq('event_object_table', 'missoes_diarias')
      
      if (triggers && triggers.length > 0) {
        console.log('✅ Triggers encontrados em missoes_diarias:')
        triggers.forEach(t => {
          console.log(`   - ${t.trigger_name}: ${t.event_manipulation}`)
        })
      }
    } catch (e) {
      console.log('❌ Não foi possível verificar triggers')
    }

    // 5. Verificar padrões de data nas missões
    console.log('\n5. Analisando padrões de criação de missões...')
    
    const { data: padroesDatas, error: dataError } = await supabase
      .from('missoes_diarias')
      .select('data_missao, created_at, criada_automaticamente')
      .order('created_at', { ascending: false })
      .limit(20)
    
    if (!dataError && padroesDatas) {
      console.log('📅 Últimas missões criadas:')
      padroesDatas.forEach(m => {
        const criacao = new Date(m.created_at).toLocaleString('pt-BR')
        console.log(`   ${m.data_missao} - Criada: ${criacao} - Auto: ${m.criada_automaticamente}`)
      })
      
      // Verificar gap entre última missão e hoje
      const ultimaData = padroesDatas[0]?.data_missao
      const hoje = new Date().toISOString().split('T')[0]
      
      if (ultimaData) {
        const diasDiferenca = Math.floor((new Date(hoje) - new Date(ultimaData)) / (1000 * 60 * 60 * 24))
        console.log(`\n⚠️ Gap identificado: ${diasDiferenca} dias entre última missão (${ultimaData}) e hoje (${hoje})`)
      }
    }

    // 6. Verificar configurações de agendamento
    console.log('\n6. Verificando configurações e jobs...')
    
    const tabelasConfig = [
      'pg_cron.job',
      'cron_jobs', 
      'schedulers',
      'job_schedules',
      'system_config'
    ]

    for (const tabela of tabelasConfig) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(5)
        
        if (!error && data) {
          console.log(`✅ Tabela ${tabela} encontrada com ${data.length} registros`)
          if (data.length > 0) {
            console.log(`   Exemplo: ${JSON.stringify(data[0], null, 2)}`)
          }
        }
      } catch (e) {
        // Tabela não existe
      }
    }

    console.log('\n🎯 Investigação concluída!')
    console.log('\n💡 Próximos passos sugeridos:')
    console.log('   1. Verificar se há processo manual de criação de missões')
    console.log('   2. Criar missões para hoje baseado nos templates existentes')
    console.log('   3. Implementar job automático de criação diária')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

investigarSistemaMissoes()