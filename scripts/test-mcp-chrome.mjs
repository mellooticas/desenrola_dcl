#!/usr/bin/env node
/**
 * 🧪 Script de Teste - Chrome DevTools MCP
 * 
 * Testa automaticamente fluxos críticos do Desenrola DCL usando Puppeteer
 * 
 * Uso via Copilot:
 * "Execute o script test-mcp-chrome.mjs para testar criação de pedido"
 */

import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const TEST_TIMEOUT = 30000

/**
 * 🎯 Teste 1: Criação de Pedido
 */
async function testCriarPedido(page) {
  console.log('🧪 Teste: Criação de Pedido')
  
  try {
    // Navegar para página de novo pedido
    await page.goto(`${BASE_URL}/pedidos/novo`, { waitUntil: 'networkidle' })
    console.log('✅ Página carregada')

    // Verificar se o formulário existe
    const hasForm = await page.locator('form').count() > 0
    if (!hasForm) {
      throw new Error('❌ Formulário não encontrado!')
    }

    // Capturar console logs
    const logs = []
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() })
    })

    // Capturar erros
    const errors = []
    page.on('pageerror', error => {
      errors.push(error.message)
    })

    // Screenshot do estado inicial
    await page.screenshot({ 
      path: 'test-results/pedido-novo-inicial.png',
      fullPage: true 
    })

    console.log('✅ Teste concluído')
    console.log('📊 Logs capturados:', logs.length)
    console.log('❌ Erros capturados:', errors.length)

    if (errors.length > 0) {
      console.log('\n⚠️ ERROS ENCONTRADOS:')
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`))
    }

    return { success: true, logs, errors }
  } catch (error) {
    console.error('❌ Teste falhou:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 🎯 Teste 2: Kanban - MontadorSelector
 */
async function testKanbanMontador(page) {
  console.log('\n🧪 Teste: Kanban - MontadorSelector')
  
  try {
    await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' })
    console.log('✅ Kanban carregado')

    // Verificar se há cards
    const cardCount = await page.locator('[data-pedido-card]').count()
    console.log(`📊 Cards encontrados: ${cardCount}`)

    // Screenshot do Kanban
    await page.screenshot({ 
      path: 'test-results/kanban-estado.png',
      fullPage: true 
    })

    // Procurar por cards na coluna "Lentes no DCL" (status=PRONTO)
    const cardsPronto = await page.locator('[data-status="PRONTO"]').count()
    console.log(`✅ Cards na coluna "Lentes no DCL": ${cardsPronto}`)

    if (cardsPronto > 0) {
      // Clicar no primeiro card
      await page.locator('[data-status="PRONTO"]').first().click()
      await page.waitForTimeout(1000)

      // Verificar se MontadorSelector aparece
      const hasMontadorSelector = await page.locator('text=Selecionar Montador').count() > 0
      console.log(hasMontadorSelector ? '✅ MontadorSelector APARECEU' : '❌ MontadorSelector NÃO apareceu')

      // Screenshot do drawer
      await page.screenshot({ 
        path: 'test-results/drawer-montador.png',
        fullPage: true 
      })
    }

    return { success: true, cardCount, cardsPronto }
  } catch (error) {
    console.error('❌ Teste falhou:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 🎯 Teste 3: Dashboard - Carregamento de KPIs
 */
async function testDashboardKPIs(page) {
  console.log('\n🧪 Teste: Dashboard KPIs')
  
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' })
    console.log('✅ Dashboard carregado')

    // Capturar requests de API
    const apiRequests = []
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        })
      }
    })

    // Capturar responses com erro
    const failedRequests = []
    page.on('response', response => {
      if (response.status() >= 400 && response.url().includes('/api/')) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        })
      }
    })

    await page.waitForTimeout(3000) // Esperar KPIs carregarem

    // Screenshot do dashboard
    await page.screenshot({ 
      path: 'test-results/dashboard-kpis.png',
      fullPage: true 
    })

    console.log('📊 API Requests:', apiRequests.length)
    console.log('❌ Failed Requests:', failedRequests.length)

    if (failedRequests.length > 0) {
      console.log('\n⚠️ REQUESTS FALHARAM:')
      failedRequests.forEach(req => console.log(`  ${req.status} - ${req.url}`))
    }

    return { success: true, apiRequests, failedRequests }
  } catch (error) {
    console.error('❌ Teste falhou:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 🚀 Executar todos os testes
 */
async function runAllTests() {
  console.log('🚀 Iniciando testes automatizados - Desenrola DCL\n')
  
  // Criar pasta para resultados
  const fs = await import('fs')
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results')
  }

  const browser = await chromium.launch({ 
    headless: false, // Mostrar browser para debug
    slowMo: 100 // Desacelerar ações
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // Simular usuário logado (se necessário)
    // storageState: 'auth-state.json'
  })
  
  const page = await context.newPage()

  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  }

  // Executar testes
  results.tests.push({
    name: 'Criação de Pedido',
    ...(await testCriarPedido(page))
  })

  results.tests.push({
    name: 'Kanban MontadorSelector',
    ...(await testKanbanMontador(page))
  })

  results.tests.push({
    name: 'Dashboard KPIs',
    ...(await testDashboardKPIs(page))
  })

  // Salvar resultados
  fs.writeFileSync(
    'test-results/results.json',
    JSON.stringify(results, null, 2)
  )

  console.log('\n✅ Todos os testes concluídos!')
  console.log('📁 Resultados salvos em: test-results/')

  await browser.close()
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error)
}

export { testCriarPedido, testKanbanMontador, testDashboardKPIs }
