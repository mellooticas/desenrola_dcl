// teste-evolucao-temporal.js
// Script para testar a nova API de evolução temporal

async function testarEvolucaoTemporal() {
  console.log('🔍 Testando API de Evolução Temporal...\n')
  
  const baseUrl = 'http://localhost:3000/api/dashboard/evolucao-temporal'
  
  const testes = [
    {
      nome: 'Teste 1: Agrupamento por Mês (Padrão)',
      url: `${baseUrl}?agrupamento=mes&data_inicio=2024-01-01&data_fim=2024-12-31`
    },
    {
      nome: 'Teste 2: Agrupamento por Dia (Últimos 30 dias)',
      url: `${baseUrl}?agrupamento=dia&data_inicio=2024-09-01&data_fim=2024-09-30`
    },
    {
      nome: 'Teste 3: Agrupamento por Semana',
      url: `${baseUrl}?agrupamento=semana&data_inicio=2024-09-01&data_fim=2024-11-30`
    },
    {
      nome: 'Teste 4: Agrupamento por Ano',
      url: `${baseUrl}?agrupamento=ano&data_inicio=2020-01-01&data_fim=2024-12-31`
    },
    {
      nome: 'Teste 5: Com Filtro de Laboratório',
      url: `${baseUrl}?agrupamento=mes&laboratorio_id=lab123&data_inicio=2024-01-01&data_fim=2024-12-31`
    }
  ]

  for (const teste of testes) {
    try {
      console.log(`📊 ${teste.nome}`)
      console.log(`URL: ${teste.url}`)
      
      const response = await fetch(teste.url)
      const data = await response.json()
      
      if (response.ok) {
        console.log('✅ Status: OK')
        console.log(`📈 Registros retornados: ${data.evolucao?.length || 0}`)
        console.log(`🔢 Total de registros processados: ${data.total_registros || 0}`)
        console.log(`📅 Agrupamento: ${data.agrupamento}`)
        
        if (data.evolucao && data.evolucao.length > 0) {
          const primeiro = data.evolucao[0]
          console.log('📋 Exemplo de dados:')
          console.log(`   - Período: ${primeiro.periodo}`)
          console.log(`   - Receita: R$ ${primeiro.receita?.toFixed(2) || '0.00'}`)
          console.log(`   - Pedidos: ${primeiro.pedidos || 0}`)
          console.log(`   - SLA: ${primeiro.sla?.toFixed(1) || '0.0'}%`)
        }
      } else {
        console.log('❌ Status: Erro')
        console.log(`Erro: ${data.error || 'Erro desconhecido'}`)
      }
      
    } catch (error) {
      console.log('❌ Status: Erro de Conexão')
      console.log(`Erro: ${error.message}`)
    }
    
    console.log('─'.repeat(60))
  }
  
  console.log('\n🎯 Teste da API de Evolução Temporal concluído!')
}

// Executar o teste
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testarEvolucaoTemporal }
} else {
  testarEvolucaoTemporal()
}