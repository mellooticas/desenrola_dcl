// Testar API Mission Control com dados reais
async function testarAPIMissionControl() {
  console.log('🔍 Testando API Mission Control...')
  
  const hoje = new Date().toISOString().split('T')[0]
  const dataComDados = '2025-09-19' // Data onde sabemos que há dados
  
  try {
    // 1. Testar para data atual (hoje)
    console.log(`\n1. Testando missões para hoje (${hoje})...`)
    
    const lojaId = 'e974fc5d-ed39-4831-9e5e-4a5544489de6' // Escritório Central
    
    const response1 = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}&loja_id=${lojaId}`)
    const result1 = await response1.json()
    
    console.log('📊 Status:', response1.status)
    console.log('📊 Resultado hoje:', {
      total: result1.missions?.length || 0,
      source: result1.source,
      debug: result1.debug
    })

    // 2. Testar para data com dados conhecidos
    console.log(`\n2. Testando missões para data com dados (${dataComDados})...`)
    
    const response2 = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${dataComDados}&loja_id=${lojaId}`)
    const result2 = await response2.json()
    
    console.log('📊 Status:', response2.status)
    console.log('📊 Resultado data passada:', {
      total: result2.missions?.length || 0,
      source: result2.source,
      debug: result2.debug
    })
    
    if (result2.missions?.length > 0) {
      console.log('📋 Exemplo de missão encontrada:')
      const missao = result2.missions[0]
      console.log(`  - Nome: ${missao.missao_nome}`)
      console.log(`  - Tipo: ${missao.tipo}`)
      console.log(`  - Status: ${missao.status}`)
      console.log(`  - Loja: ${missao.loja_nome}`)
    }

    // 3. Testar dashboard
    console.log(`\n3. Testando dashboard...`)
    
    const response3 = await fetch(`http://localhost:3000/api/mission-control?action=dashboard&data=${dataComDados}&loja_id=${lojaId}`)
    const result3 = await response3.json()
    
    console.log('📊 Dashboard Status:', response3.status)
    console.log('📊 Dashboard Result:', result3)

    // 4. Testar sem loja_id (caso geral)
    console.log(`\n4. Testando sem loja_id...`)
    
    const response4 = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}`)
    const result4 = await response4.json()
    
    console.log('📊 Status sem loja:', response4.status)
    console.log('📊 Resultado sem loja:', result4)

    // 5. Listar todas as lojas para referência
    console.log(`\n5. Listando lojas disponíveis...`)
    
    const responseLojas = await fetch('http://localhost:3000/api/lojas?ativo=true')
    const lojas = await responseLojas.json()
    
    if (lojas.lojas) {
      console.log('🏪 Lojas ativas:')
      lojas.lojas.forEach(loja => {
        console.log(`  - ${loja.nome} (ID: ${loja.id})`)
      })
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

// Aguardar um pouco e executar
setTimeout(testarAPIMissionControl, 2000)