// Análise simples - verificar dados usando o cliente do projeto
const { supabase } = require('./src/lib/supabase/client.js')

async function verificarDados() {
  console.log('Verificando dados do banco...\n')
  
  try {
    // Buscar alguns pedidos para análise
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select('numero_os_fisica, numero_pedido_laboratorio, laboratorio_responsavel_producao, data_limite_pagamento')
      .limit(10)
    
    if (error) {
      console.error('Erro:', error.message)
      return
    }
    
    console.log(`Analisando ${pedidos.length} pedidos:\n`)
    
    pedidos.forEach((pedido, index) => {
      console.log(`Pedido ${index + 1}:`)
      console.log(`- OS Física: ${pedido.numero_os_fisica || 'VAZIO'}`)
      console.log(`- Pedido Lab: ${pedido.numero_pedido_laboratorio || 'VAZIO'}`)
      console.log(`- Responsável Prod: ${pedido.laboratorio_responsavel_producao || 'VAZIO'}`)
      console.log(`- Data Limite Pgto: ${pedido.data_limite_pagamento || 'VAZIO'}`)
      console.log()
    })
    
  } catch (error) {
    console.error('Erro geral:', error.message)
  }
}

verificarDados()