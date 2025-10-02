import fetch from 'node-fetch';

async function testarCompletar() {
  try {
    console.log('🧪 Testando completar missão diretamente...')
    
    // Primeiro vamos buscar uma missão ativa
    const resposta1 = await fetch('http://localhost:3000/api/mission-control?action=missions&data=2025-10-01&loja_id=e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55')
    const missoes = await resposta1.json()
    
    console.log('📋 Total de missões:', missoes.length)
    
    // Buscar uma missão ativa
    const missaoAtiva = missoes.find(m => m.status === 'ativa')
    if (!missaoAtiva) {
      console.log('❌ Nenhuma missão ativa encontrada')
      return
    }
    
    console.log('🎯 Tentando completar missão:', missaoAtiva.id)
    
    // Tentar completar a missão
    const resposta2 = await fetch('http://localhost:3000/api/mission-control', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'execute_mission',
        missaoId: missaoAtiva.id,
        usuario: 'user-demo',
        evidencias: [],
        observacoes: 'Teste de completar missão',
        qualidade: 5
      })
    })
    
    if (resposta2.ok) {
      const resultado = await resposta2.json()
      console.log('✅ Missão completada com sucesso:', resultado)
    } else {
      const erro = await resposta2.text()
      console.log('❌ Erro ao completar missão:', erro)
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

testarCompletar()