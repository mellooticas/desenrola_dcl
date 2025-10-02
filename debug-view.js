const { createClient } = require('@supabase/supabase-js')

// Credenciais do Supabase
const supabaseUrl = 'https://bhhvoxekbzhbsdamosqg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoaHZveGVrYnpoYnNkYW1vc3FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzg3MDc1NCwiZXhwIjoyMDQ5NDQ2NzU0fQ.YGqrzDO2eNjw4Lsv8Js-yI_sAXjnqVJLLF67ykHMBoo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugView() {
  console.log('🔍 Verificando estrutura da view v_missoes_timeline...')
  
  try {
    // Primeiro, vamos ver se a view existe
    const { data: viewInfo, error: viewError } = await supabase
      .from('information_schema.views')
      .select('*')
      .eq('table_name', 'v_missoes_timeline')
    
    if (viewError) {
      console.log('❌ Erro ao buscar informações da view:', viewError)
    } else {
      console.log('📊 Informações da view:', viewInfo)
    }
    
    // Vamos verificar as colunas da tabela missoes_diarias
    const { data: columns, error: colError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'missoes_diarias')
      .order('ordinal_position')
    
    if (colError) {
      console.log('❌ Erro ao buscar colunas da tabela:', colError)
    } else {
      console.log('📋 Colunas da tabela missoes_diarias:')
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`)
      })
    }
    
    // Vamos tentar fazer uma query simples na view para ver o erro
    console.log('\n🧪 Testando query na view...')
    const { data: testData, error: testError } = await supabase
      .from('v_missoes_timeline')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.log('❌ Erro na query de teste:', testError)
    } else {
      console.log('✅ Query de teste bem-sucedida, primeira linha:', testData[0])
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

debugView()