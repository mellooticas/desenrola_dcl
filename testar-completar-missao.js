// Teste específico da funcionalidade de completar missão
async function testarCompletarMissao() {
  console.log('🧪 Testando funcionalidade de completar missão...')
  
  const hoje = new Date().toISOString().split('T')[0]
  const lojaId = 'e974fc5d-ed39-4831-9e5e-4a5544489de6' // Escritório Central
  
  try {
    // 1. Buscar missões disponíveis
    console.log('\n1. Buscando missões disponíveis...')
    const response = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}&loja_id=${lojaId}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar missões: ${response.status}`)
    }
    
    const result = await response.json()
    const missoes = result.missions
    
    if (!missoes || missoes.length === 0) {
      console.log('❌ Nenhuma missão encontrada para testar')
      return
    }
    
    console.log(`✅ Encontradas ${missoes.length} missões`)
    
    // 2. Selecionar uma missão pendente para teste
    const missaoPendente = missoes.find(m => m.status === 'pendente')
    
    if (!missaoPendente) {
      console.log('❌ Nenhuma missão pendente encontrada')
      return
    }
    
    console.log(`\n2. Testando com missão: "${missaoPendente.missao_nome}"`)
    console.log(`   ID: ${missaoPendente.id}`)
    console.log(`   Status atual: ${missaoPendente.status}`)
    console.log(`   Tipo: ${missaoPendente.tipo}`)
    
    // 3. Primeiro iniciar a missão
    console.log('\n3. Iniciando missão...')
    const startResponse = await fetch('http://localhost:3000/api/mission-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'start_mission',
        missaoId: missaoPendente.id,
        usuario: 'junior@oticastatymello.com.br'
      })
    })
    
    if (!startResponse.ok) {
      const errorText = await startResponse.text()
      console.error('❌ Erro ao iniciar missão:', startResponse.status, errorText)
      return
    }
    
    const startResult = await startResponse.json()
    console.log('✅ Missão iniciada:', startResult.success)
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 4. Tentar completar a missão
    console.log('\n4. Tentando completar missão...')
    const completeResponse = await fetch('http://localhost:3000/api/mission-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute_mission',
        missaoId: missaoPendente.id,
        usuario: 'junior@oticastatymello.com.br',
        evidencias: [],
        observacoes: 'Teste de conclusão automática',
        qualidade: 5
      })
    })
    
    console.log(`📊 Status da resposta de conclusão: ${completeResponse.status}`)
    
    if (!completeResponse.ok) {
      const errorText = await completeResponse.text()
      console.error('❌ ERRO AO COMPLETAR MISSÃO:')
      console.error('   Status:', completeResponse.status)
      console.error('   Erro:', errorText)
      
      // Tentar parsear como JSON para mais detalhes
      try {
        const errorJson = JSON.parse(errorText)
        console.error('   Detalhes:', errorJson)
      } catch (e) {
        console.error('   Resposta raw:', errorText)
      }
      
      return
    }
    
    const completeResult = await completeResponse.json()
    console.log('✅ MISSÃO COMPLETADA COM SUCESSO!')
    console.log('   Pontos ganhos:', completeResult.pontos_ganhos || 0)
    console.log('   Tempo execução:', completeResult.tempo_execucao || 0, 'segundos')
    
    // 5. Verificar status final
    console.log('\n5. Verificando status final...')
    const finalResponse = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}&loja_id=${lojaId}`)
    const finalResult = await finalResponse.json()
    const missaoFinal = finalResult.missions.find(m => m.id === missaoPendente.id)
    
    if (missaoFinal) {
      console.log(`✅ Status final da missão: ${missaoFinal.status}`)
      console.log(`   Concluída em: ${missaoFinal.concluida_em}`)
      console.log(`   Executada por: ${missaoFinal.executada_por}`)
    }
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message)
  }
}

// Aguardar servidor carregar e executar
console.log('⏳ Aguardando servidor carregar...')
setTimeout(testarCompletarMissao, 4000)