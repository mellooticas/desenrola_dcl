# 🎮 Como Usar os MCPs - Guia Visual

## 🎯 Cenários Práticos com Comandos Exatos

### 📝 CENÁRIO 1: Usuário reporta bug ao criar pedido

#### Passo 1: Reproduzir o bug automaticamente

**Digite no Copilot:**

```
Use o Chrome DevTools MCP para:
1. Abrir http://localhost:3000/pedidos/novo
2. Capturar todos os erros de console
3. Monitorar requisições de API
4. Tirar screenshot da página
5. Salvar resultados em test-results/
```

**O que vai acontecer:**

- ✅ Browser Chrome abre automaticamente
- ✅ Navega até a página
- ✅ Captura console.log, console.error, console.warn
- ✅ Monitora fetch() e XMLHttpRequest
- ✅ Screenshot salvo em `test-results/pedido-novo-inicial.png`

**Resultado esperado:**

```
✅ Página carregada em 1.2s
✅ Formulário renderizado
❌ ERRO ENCONTRADO:
   "TypeError: Cannot read property 'nome' of undefined"
   Linha: PedidoForm.tsx:145
📊 APIs chamadas:
   ✅ GET /api/laboratorios - 200 OK (345ms)
   ✅ GET /api/classes - 200 OK (234ms)
   ❌ GET /api/lojas - 500 Error (1.2s)
      Error: column "lojas.updated_at" does not exist
```

#### Passo 2: Investigar no banco

**Digite no Copilot:**

```
Use o Supabase MCP para executar:
SELECT * FROM lojas ORDER BY created_at DESC LIMIT 3;
```

**Resultado:**

```
✅ Query executada
📊 3 lojas encontradas
⚠️ CONFIRMADO: Coluna updated_at não existe
```

#### Passo 3: Buscar solução

**Digite no Copilot:**

```
Use o Context7 MCP para buscar no Stack Overflow:
"PostgreSQL add column to existing table migration best practices"
```

**Resultado:**

```
📚 5 resultados encontrados:

1. [Aceita ✓] Adicionar coluna com ALTER TABLE
   ALTER TABLE lojas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

2. [67 votes] Criar trigger para updated_at automático
   CREATE TRIGGER set_updated_at...
```

#### Passo 4: Aplicar correção

**Digite no Copilot:**

```
Use o Supabase MCP para executar a migration em database/migrations/add-updated-at-columns.sql
```

#### Passo 5: Validar fix

**Digite no Copilot:**

```
Use o Chrome DevTools MCP para testar criação de pedido novamente
```

**Resultado:**

```
✅ Teste passou!
✅ API /api/lojas - 200 OK
✅ Pedido criado: #213
✅ Screenshot: test-results/pedido-criado-sucesso.png
```

---

### 📝 CENÁRIO 2: Testar MontadorSelector após fix

**Digite no Copilot:**

```
Execute o script test-mcp-chrome.mjs e mostre os resultados do teste de MontadorSelector
```

**O que vai acontecer:**

1. Script abre automaticamente
2. Navega até `/kanban`
3. Procura cards com `status="PRONTO"`
4. Clica no primeiro card
5. Verifica se MontadorSelector aparece
6. Tira screenshot do drawer
7. Salva resultados em JSON

**Resultado esperado:**

```json
{
  "test": "Kanban MontadorSelector",
  "success": true,
  "cardCount": 12,
  "cardsPronto": 3,
  "montadorSelectorFound": true,
  "screenshot": "test-results/drawer-montador.png"
}
```

---

### 📝 CENÁRIO 3: Validar Performance do Dashboard

**Digite no Copilot:**

```
Use Chrome DevTools MCP para:
1. Abrir /dashboard
2. Fazer profiling de performance
3. Capturar todas as APIs que demorarem mais de 2s
4. Medir tempo de carregamento dos KPIs
5. Verificar memory leaks
```

**Resultado:**

```
📊 Performance Report:

Carregamento Total: 2.8s
├─ HTML inicial: 340ms
├─ JavaScript: 890ms
├─ API calls: 1450ms
└─ Render final: 120ms

🐌 APIs Lentas:
1. GET /api/dashboard/evolucao-financeira - 1.2s
   Sugestão: Adicionar índice em pedidos.created_at

2. GET /api/gamificacao/historico - 950ms
   Sugestão: Usar view materializada

💾 Memória:
├─ Heap inicial: 24MB
├─ Heap após load: 38MB
└─ ✅ Sem leaks detectados
```

---

### 📝 CENÁRIO 4: Research de Nova Feature

**Objetivo:** Implementar notificações push no sistema

**Digite no Copilot:**

```
Use Context7 MCP para:
1. Buscar na documentação do Next.js sobre Web Push API
2. Procurar exemplos de push notifications com Supabase
3. Ver issues do GitHub sobre push em Next.js 14 App Router
4. Listar bibliotecas recomendadas
```

**Resultado:**

```
📚 Documentação Next.js - Web Push API

1. Server Actions + Push API:
   // app/actions/notifications.ts
   'use server'
   export async function sendPushNotification(userId: string) {
     const subscription = await getSubscription(userId)
     await webpush.sendNotification(subscription, payload)
   }

2. Bibliotecas recomendadas:
   ✅ web-push (8.5k ⭐) - Suporte nativo
   ✅ @supabase/realtime - Para Supabase integration

3. Issues relevantes:
   - #52341 - Push API com App Router (resolvida)
   - #51234 - Service Worker em Next.js 14 (aberta)

4. Exemplo prático:
   // public/sw.js
   self.addEventListener('push', (event) => {
     const data = event.data.json()
     self.registration.showNotification(data.title, {
       body: data.message,
       icon: '/icon.png'
     })
   })
```

---

### 📝 CENÁRIO 5: Smoke Test Pós-Deploy

**Após fazer deploy em produção:**

**Digite no Copilot:**

```
Use Chrome DevTools MCP para executar smoke test em https://desenrola-dcl.vercel.app:
1. Verificar se homepage carrega (< 3s)
2. Testar login com credenciais de demo
3. Confirmar que Dashboard mostra KPIs
4. Validar que Kanban carrega cards
5. Testar criar pedido (não salvar)
6. Gerar relatório de health check
```

**Resultado:**

```
🔍 Smoke Test - Produção

✅ Homepage: 1.8s (OK)
✅ Login: Sucesso (demo@desenroladcl.com)
✅ Dashboard:
   ✅ KPIs carregados (4/4)
   ✅ Gráficos renderizados (3/3)
   ✅ Alertas: 2 pendentes
✅ Kanban:
   ✅ 45 cards carregados
   ✅ Drag & drop funcional
   ✅ Filtros aplicando corretamente
✅ Novo Pedido:
   ✅ Formulário valida campos
   ✅ APIs de busca funcionando

🎉 Status: TUDO FUNCIONANDO
📸 Screenshots salvos em: test-results/smoke-test-prod/
```

---

## 🎓 Atalhos Rápidos

### Testes E2E

```bash
# Via terminal
npm run test:e2e

# Via Copilot (recomendado)
"Execute teste E2E completo"
"Teste apenas criação de pedido"
"Valide MontadorSelector no Kanban"
```

### Debug Rápido

```
"Chrome MCP: screenshot de /dashboard"
"Chrome MCP: capture erros em /kanban"
"Chrome MCP: monitore APIs em /pedidos/novo"
```

### Queries Rápidas

```
"Supabase: últimos 5 pedidos criados"
"Supabase: conte pedidos por status"
"Supabase: mostre função criar_pedido_simples"
```

### Busca Rápida

```
"Context7: docs do Supabase sobre RLS"
"Context7: Next.js 14 Server Actions exemplos"
"Context7: busque erro 'duplicate key violation'"
```

---

## 💡 Dicas Pro

### ✅ Combine MCPs para máximo poder

**Workflow ideal de debug:**

```
1. Chrome MCP: Reproduza o bug
2. Chrome MCP: Capture logs e APIs
3. Supabase MCP: Investigue dados
4. Context7 MCP: Busque solução
5. [Aplique fix]
6. Chrome MCP: Valide correção
7. Supabase MCP: Confirme dados
```

### 🎯 Use comandos específicos

❌ **Ruim:** "Teste o sistema"
✅ **Bom:** "Use Chrome MCP para abrir /kanban, arrastar card #177 para coluna PRONTO, e verificar se MontadorSelector aparece"

### 📸 Sempre salve evidências

Todos os testes salvam automaticamente:

- Screenshots em `test-results/*.png`
- Logs em `test-results/results.json`
- Network requests em formato JSON
- Console errors com stack traces

---

## 🆘 Troubleshooting Rápido

### "Chrome MCP não responde"

```bash
# Reinstalar browsers
npx playwright install chromium --force
```

### "Context7 API key inválida"

```bash
# Verificar configuração
cat .vscode/mcp-settings.json | grep CONTEXT7_API_KEY
```

### "Teste falhou mas manualmente funciona"

```
"Chrome MCP: execute teste com slowMo: 500 para desacelerar e ver o que acontece"
```

---

## 📚 Arquivos de Referência

- **Setup completo**: `docs/MCP-SETUP.md`
- **20+ exemplos**: `docs/MCP-EXEMPLOS-PRATICOS.md`
- **Guia rápido**: `docs/MCP-QUICKSTART.md`
- **Script de teste**: `scripts/test-mcp-chrome.mjs`

---

Criado em: 22/10/2025
Atualizado: Sempre que adicionar novos casos de uso
