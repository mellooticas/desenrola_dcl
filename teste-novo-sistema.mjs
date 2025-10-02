// Teste para verificar se o novo sistema está funcionando
async function testarNovoSistema() {
  try {
    console.log('🧪 Testando novo sistema de missões motivacional...')
    
    // Aguardar um pouco para o servidor recompilar
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Fazer uma requisição GET para verificar se conseguimos acessar
    const response = await fetch('http://localhost:3000/api/mission-control?action=missions&data=2025-10-01&loja_id=e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55')
    
    if (response.ok) {
      const missions = await response.json()
      console.log('✅ API acessível, total de missões:', missions.length)
      
      // Buscar uma missão pendente para iniciar
      const pendingMission = missions.find(m => m.status === 'pendente')
      if (!pendingMission) {
        console.log('❌ Nenhuma missão pendente encontrada para testar')
        return
      }
      
      console.log('🎯 Testando com missão:', pendingMission.id)
      
      // Testar iniciar missão
      console.log('📝 Iniciando missão...')
      const startResponse = await fetch('http://localhost:3000/api/mission-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_mission',
          missaoId: pendingMission.id,
          usuario: 'João Silva'
        })
      })
      
      if (startResponse.ok) {
        const startResult = await startResponse.json()
        console.log('✅ Missão iniciada:', startResult.message)
        console.log('🎊 Motivação:', startResult.motivationalMessage)
        
        // Aguardar um pouco e completar a missão
        console.log('⏳ Aguardando antes de completar...')
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        console.log('🏁 Completando missão...')
        const completeResponse = await fetch('http://localhost:3000/api/mission-control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'execute_mission',
            missaoId: pendingMission.id,
            usuario: 'João Silva',
            evidencias: ['Trabalho realizado com excelência!'],
            observacoes: 'Missão completada rapidamente com alta qualidade',
            qualidade: 5
          })
        })
        
        if (completeResponse.ok) {
          const completeResult = await completeResponse.json()
          console.log('🎉 SUCESSO! Missão completada:')
          console.log('  📈 Pontos ganhos:', completeResult.pontos_ganhos)
          console.log('  🏆 Badges:', completeResult.badges_conquistadas)
          console.log('  💬 Mensagem:', completeResult.message)
          console.log('  ⏱️ Tempo:', completeResult.detalhes?.tempo_formatado)
          console.log('  ⭐ Qualidade:', completeResult.detalhes?.qualidade_texto)
          console.log('  🚀 Eficiência:', completeResult.detalhes?.eficiencia)
        } else {
          const error = await completeResponse.text()
          console.log('❌ Erro ao completar:', error)
        }
        
      } else {
        const error = await startResponse.text()
        console.log('❌ Erro ao iniciar:', error)
      }
      
    } else {
      console.log('❌ Erro ao acessar API:', response.status)
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error.message)
  }
}

testarNovoSistema()