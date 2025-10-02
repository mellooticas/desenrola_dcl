// Script para verificar conexão com Supabase e estrutura do banco
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zobgyjsocqmzaggrnwqd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.jK9CWJu3_WO4WYhxtqPJthwOKq8zjD5O4Kv2V84Rxnw'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarBanco() {
  console.log('🔍 Verificando conexão com Supabase...')
  
  try {
    // Verificar se a tabela usuarios existe
    const { data: usuarios, error: errorUsuarios } = await supabase
      .from('usuarios')
      .select('id, email, nome, role')
      .limit(5)
    
    if (errorUsuarios) {
      console.log('❌ Erro ao acessar tabela usuarios:', errorUsuarios.message)
    } else {
      console.log('✅ Tabela usuarios existe!')
      console.log('📊 Usuários encontrados:', usuarios?.length || 0)
      if (usuarios && usuarios.length > 0) {
        console.log('👤 Primeiros usuários:', usuarios)
      }
    }

    // Verificar outras tabelas importantes
    const tabelas = ['lojas', 'pedidos', 'laboratorios']
    
    for (const tabela of tabelas) {
      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabela ${tabela}: ${error.message}`)
      } else {
        console.log(`✅ Tabela ${tabela}: OK`)
      }
    }

  } catch (error) {
    console.log('❌ Erro geral:', error)
  }
}

verificarBanco()