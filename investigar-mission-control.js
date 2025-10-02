// Verificar estrutura do Mission Control no banco
const { createClient } = require('@supabase/supabase-js')

// URLs e keys corretas
const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

async function investigarMissionControl() {
  console.log('🔍 Investigando estrutura Mission Control...')
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })

  try {
    // 1. Verificar se existem views relacionadas a missões
    console.log('\n1. Verificando views de missões...')
    
    // Tentar buscar a view v_missoes_timeline
    try {
      const { data: viewTest, error: viewError } = await supabase
        .from('v_missoes_timeline')
        .select('*')
        .limit(1)
      
      if (viewError) {
        console.log('❌ View v_missoes_timeline não existe:', viewError.message)
      } else {
        console.log('✅ View v_missoes_timeline existe com estrutura:', Object.keys(viewTest?.[0] || {}))
      }
    } catch (e) {
      console.log('❌ Erro ao acessar v_missoes_timeline:', e.message)
    }

    // 2. Verificar tabelas relacionadas a missões
    console.log('\n2. Verificando tabelas de missões...')
    
    const tabelasPossiveis = [
      'missoes_diarias',
      'missoes',
      'mission_control',
      'missions',
      'lojas_missoes',
      'loja_missoes'
    ]

    for (const tabela of tabelasPossiveis) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)
        
        if (!error && data) {
          console.log(`✅ Tabela ${tabela} existe:`, Object.keys(data[0] || {}))
          
          // Se encontrou dados, buscar algumas linhas para análise
          const { data: sample, error: sampleError } = await supabase
            .from(tabela)
            .select('*')
            .limit(5)
          
          if (!sampleError && sample) {
            console.log(`📊 Dados de exemplo de ${tabela}:`, sample.length, 'registros')
          }
        }
      } catch (e) {
        // Tabela não existe, continuar
      }
    }

    // 3. Verificar tabelas de lojas para relacionamento
    console.log('\n3. Verificando tabelas de lojas...')
    
    try {
      const { data: lojas, error: lojasError } = await supabase
        .from('lojas')
        .select('id, nome, ativo')
        .eq('ativo', true)
        .limit(10)
      
      if (!lojasError && lojas) {
        console.log('✅ Lojas ativas encontradas:')
        lojas.forEach(loja => {
          console.log(`  - ${loja.nome} (ID: ${loja.id})`)
        })
      }
    } catch (e) {
      console.log('❌ Erro ao buscar lojas:', e.message)
    }

    // 4. Verificar se há dados relacionados a gamificação
    console.log('\n4. Verificando gamificação...')
    
    const tabelasGamificacao = [
      'gamification',
      'pontuacao',
      'rankings',
      'usuario_pontos'
    ]

    for (const tabela of tabelasGamificacao) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('*')
          .limit(1)
        
        if (!error && data) {
          console.log(`✅ Tabela ${tabela} existe:`, Object.keys(data[0] || {}))
        }
      } catch (e) {
        // Tabela não existe, continuar
      }
    }

    // 5. Listar todas as tabelas do schema public
    console.log('\n5. Listando todas as tabelas disponíveis...')
    
    try {
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names')
      
      if (tablesError) {
        console.log('❌ Não foi possível listar tabelas via RPC')
        
        // Tentar método alternativo
        const { data: infoSchema, error: infoError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_type', 'BASE TABLE')
        
        if (!infoError && infoSchema) {
          console.log('✅ Tabelas encontradas via information_schema:')
          infoSchema.forEach(table => console.log(`  - ${table.table_name}`))
        }
      } else {
        console.log('✅ Tabelas encontradas via RPC:', tables)
      }
    } catch (e) {
      console.log('❌ Não foi possível listar tabelas:', e.message)
    }

    console.log('\n🎯 Investigação concluída!')

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

investigarMissionControl()