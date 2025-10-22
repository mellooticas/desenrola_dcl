#!/usr/bin/env node
/**
 * 🧪 Teste Automático - Botões do Kanban
 * 
 * Testa se os botões de mudança de status estão funcionando
 */

import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:3000'

async function testKanbanButtons() {
  console.log('🚀 Iniciando teste dos botões do Kanban\n')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  })
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  })
  
  const page = await context.newPage()

  // Capturar console logs
  const consoleLogs = []
  page.on('console', msg => {
    const text = msg.text()
    consoleLogs.push({ type: msg.type(), text })
    
    // Mostrar logs importantes
    if (text.includes('🔘') || text.includes('🎯') || text.includes('❌') || text.includes('✅')) {
      console.log(`  📝 ${msg.type()}: ${text}`)
    }
  })

  // Capturar erros
  const errors = []
  page.on('pageerror', error => {
    errors.push(error.message)
    console.error(`  ❌ Erro na página: ${error.message}`)
  })

  try {
    // 1. Navegar para Kanban
    console.log('1️⃣ Navegando para /kanban...')
    await page.goto(`${BASE_URL}/kanban`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)

    // 2. Verificar se há cards
    const cardCount = await page.locator('[data-pedido-card]').count()
    console.log(`✅ ${cardCount} cards encontrados no Kanban\n`)

    if (cardCount === 0) {
      console.log('⚠️ Nenhum card encontrado para testar')
      await browser.close()
      return
    }

    // 3. Clicar no primeiro card
    console.log('2️⃣ Clicando no primeiro card...')
    await page.locator('[data-pedido-card]').first().click()
    await page.waitForTimeout(1500)

    // 4. Verificar se drawer abriu
    const drawerOpen = await page.locator('[role="dialog"]').isVisible()
    console.log(`${drawerOpen ? '✅' : '❌'} Drawer ${drawerOpen ? 'aberto' : 'NÃO abriu'}\n`)

    if (!drawerOpen) {
      console.log('❌ Drawer não abriu, teste interrompido')
      await page.screenshot({ path: 'test-results/drawer-nao-abriu.png', fullPage: true })
      await browser.close()
      return
    }

    // 5. Verificar se há botões de ação
    const botaoAvancar = page.locator('button:has-text("Avançar"), button:has-text("Marcar Pago"), button:has-text("Marcar Entregue")')
    const botaoRetroceder = page.locator('button:has-text("Voltar"), button:has-text("Retroceder")')
    
    const temBotaoAvancar = await botaoAvancar.count() > 0
    const temBotaoRetroceder = await botaoRetroceder.count() > 0

    console.log('3️⃣ Verificando botões disponíveis:')
    console.log(`  ${temBotaoAvancar ? '✅' : '❌'} Botão Avançar: ${temBotaoAvancar ? 'PRESENTE' : 'AUSENTE'}`)
    console.log(`  ${temBotaoRetroceder ? '✅' : '❌'} Botão Retroceder: ${temBotaoRetroceder ? 'PRESENTE' : 'AUSENTE'}\n`)

    // 6. Screenshot do drawer
    await page.screenshot({ path: 'test-results/drawer-com-botoes.png', fullPage: true })

    // 7. Testar clique no botão Avançar (se existir)
    if (temBotaoAvancar) {
      console.log('4️⃣ Testando botão AVANÇAR...')
      console.log('  ⏳ Clicando no botão...')
      
      // Limpar logs anteriores
      consoleLogs.length = 0
      
      await botaoAvancar.first().click()
      await page.waitForTimeout(2000)

      // Verificar logs
      const logBotaoClicado = consoleLogs.find(log => log.text.includes('🔘 Botão Avançar CLICADO'))
      const logFuncaoChamada = consoleLogs.find(log => log.text.includes('🎯 handleAdvanceStatus CHAMADO'))
      const logErro = consoleLogs.find(log => log.type === 'error')

      console.log(`\n  📊 Resultado:`)
      console.log(`    ${logBotaoClicado ? '✅' : '❌'} onClick executado: ${logBotaoClicado ? 'SIM' : 'NÃO'}`)
      console.log(`    ${logFuncaoChamada ? '✅' : '❌'} Função chamada: ${logFuncaoChamada ? 'SIM' : 'NÃO'}`)
      console.log(`    ${!logErro ? '✅' : '❌'} Erros: ${logErro ? logErro.text : 'Nenhum'}`)

      // Screenshot após clicar
      await page.screenshot({ path: 'test-results/apos-clicar-avancar.png', fullPage: true })
    }

    // 8. Resumo dos logs capturados
    console.log(`\n📋 RESUMO DOS LOGS (${consoleLogs.length} total):`)
    const logsImportantes = consoleLogs.filter(log => 
      log.text.includes('🔘') || 
      log.text.includes('🎯') || 
      log.text.includes('❌') ||
      log.text.includes('⚠️')
    )
    
    if (logsImportantes.length > 0) {
      logsImportantes.forEach(log => {
        console.log(`  - ${log.text}`)
      })
    } else {
      console.log('  ⚠️ Nenhum log importante capturado!')
    }

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message)
    await page.screenshot({ path: 'test-results/erro-teste.png', fullPage: true })
  } finally {
    console.log('\n✅ Teste concluído!')
    console.log('📸 Screenshots salvos em test-results/')
    
    // Aguardar 3 segundos para ver o resultado
    await page.waitForTimeout(3000)
    await browser.close()
  }
}

// Executar
testKanbanButtons().catch(console.error)
