import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function buscarIdsValidos() {
  console.log('🔍 BUSCANDO IDS VÁLIDOS...')
  
  try {
    // Buscar IDs de lojas
    const { data: lojas } = await supabase
      .from('lojas')
      .select('id, nome')
      .limit(3)
    
    console.log('🏪 Lojas disponíveis:', lojas)
    
    // Buscar IDs de laboratórios
    const { data: labs } = await supabase
      .from('laboratorios')
      .select('id, nome')
      .limit(3)
    
    console.log('🔬 Laboratórios disponíveis:', labs)
    
    // Buscar IDs de classes de lente
    const { data: classes } = await supabase
      .from('classes_lente')
      .select('id, nome')
      .limit(3)
    
    console.log('👓 Classes de lente disponíveis:', classes)
    
    if (lojas?.length && labs?.length && classes?.length) {
      // Agora testar inserção com IDs corretos
      const novoPedido = {
        loja_id: lojas[0].id,
        laboratorio_id: labs[0].id,
        classe_lente_id: classes[0].id,
        status: 'REGISTRADO',
        prioridade: 'NORMAL',
        cliente_nome: 'Teste Usuario UUID',
        cliente_telefone: '11999999999',
        observacoes: 'Teste com UUIDs corretos',
        eh_garantia: false
      }
      
      console.log('\n📝 Testando inserção com UUIDs corretos...')
      console.log('Usando:', {
        loja: lojas[0].nome,
        laboratorio: labs[0].nome,
        classe: classes[0].nome
      })
      
      const { data, error } = await supabase
        .from('pedidos')
        .insert(novoPedido)
        .select()
        .single()
      
      if (error) {
        console.error('❌ ERRO:', error)
        
        if (error.message.includes('laboratorio_sla')) {
          console.log('\n🎯 CONFIRMADO: Problema é o trigger acessando laboratorio_sla')
        }
      } else {
        console.log('✅ SUCESSO! Pedido criado:', {
          id: data.id,
          numero_sequencial: data.numero_sequencial
        })
      }
    }
    
  } catch (err) {
    console.error('Erro:', err)
  }
}

buscarIdsValidos()