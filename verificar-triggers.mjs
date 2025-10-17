import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Usar service role para acesso ao pg_proc

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarCorrecao() {
  try {
    // Executar diretamente como query SQL
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname, prosecdef')
      .in('proname', ['trigger_atualizar_datas_pedido', 'trigger_criar_evento_timeline', 'trigger_pedidos_timeline'])
    
    if (error) {
      console.error('Erro:', error)
    } else {
      console.log('=== VERIFICAÇÃO DAS FUNÇÕES TRIGGER ===')
      data.forEach(func => {
        const secType = func.prosecdef ? 'SECURITY DEFINER' : 'SECURITY INVOKER'
        console.log(`${func.proname}: ${secType}`)
      })
    }
  } catch (err) {
    console.error('Erro de conexão:', err)
  }
}

verificarCorrecao()