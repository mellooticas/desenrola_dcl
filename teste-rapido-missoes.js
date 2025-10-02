// Teste rápido das missões criadas para hoje
async function testarMissoesHoje() {
  console.log('🔍 Testando missões para hoje...')
  
  const hoje = new Date().toISOString().split('T')[0]
  const lojaId = 'e974fc5d-ed39-4831-9e5e-4a5544489de6' // Escritório Central
  
  try {
    console.log(`📅 Data teste: ${hoje}`)
    console.log(`🏪 Loja teste: ${lojaId}`)
    
    const response = await fetch(`http://localhost:3000/api/mission-control?action=missions&data=${hoje}&loja_id=${lojaId}`)
    console.log(`📊 Status API: ${response.status}`)
    
    if (response.ok) {
      const result = await response.json()
      console.log(`✅ Missões encontradas: ${result.missions?.length || 0}`)
      console.log(`📄 Source: ${result.source}`)
      
      if (result.missions && result.missions.length > 0) {
        console.log('\n📋 Primeiras 3 missões:')
        result.missions.slice(0, 3).forEach((missao, index) => {
          console.log(`${index + 1}. ${missao.missao_nome} (${missao.tipo}) - ${missao.status}`)
        })
        
        // Verificar tipos de missões
        const tipos = {}
        result.missions.forEach(m => {
          tipos[m.tipo] = (tipos[m.tipo] || 0) + 1
        })
        
        console.log('\n🎯 Distribuição por tipo:')
        Object.entries(tipos).forEach(([tipo, quantidade]) => {
          console.log(`   ${tipo}: ${quantidade} missões`)
        })
        
        console.log('\n🎉 Mission Control funcionando com dados reais!')
      } else {
        console.log('❌ Nenhuma missão encontrada')
      }
    } else {
      const error = await response.text()
      console.error('❌ Erro na API:', error)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// Aguardar servidor carregar e executar
setTimeout(testarMissoesHoje, 3000)