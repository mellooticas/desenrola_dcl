# ⚡ MCP QuickStart - Desenrola DCL

## 🚀 Setup em 3 Passos

### 1. Instalar dependências (uma vez só)

```bash
# Playwright para Chrome DevTools MCP
npm install -D playwright

# Instalar browsers
npx playwright install chromium
```

### 2. Configurar Context7 API Key

1. Acesse: https://context7.io (ou alternativa gratuita)
2. Crie conta e obtenha API key
3. Edite `.vscode/mcp-settings.json`:
   ```json
   "context7": {
     "env": {
       "CONTEXT7_API_KEY": "sua-chave-aqui"
     }
   }
   ```

### 3. Testar instalação

```bash
# Testar Chrome DevTools MCP
npm run test:e2e

# Ou via Copilot
"Execute o teste E2E e mostre os resultados"
```

---

## 🎯 Comandos Mais Usados

### Chrome DevTools (teste automático)

| O que fazer | Comando Copilot |
|-------------|-----------------|
| Testar criação de pedido | "Chrome MCP: abra /pedidos/novo e teste criar pedido" |
| Ver erros no Dashboard | "Chrome MCP: abra /dashboard, capture console.error" |
| Testar Kanban drag | "Chrome MCP: teste arrastar card no /kanban" |
| Screenshot de página | "Chrome MCP: screenshot de /kanban" |

### Context7 (busca docs/SO)

| O que buscar | Comando Copilot |
|--------------|-----------------|
| Docs Next.js | "Context7: como usar Server Actions no Next.js 14?" |
| Docs Supabase | "Context7: RLS policies para multi-tenant" |
| Stack Overflow | "Context7: busque 'NextJS dynamic route error'" |
| GitHub issues | "Context7: issues do @hello-pangea/dnd sobre mobile" |

### Supabase (já configurado ✅)

| O que fazer | Comando Copilot |
|-------------|-----------------|
| Query rápida | "Supabase: SELECT * FROM pedidos LIMIT 5" |
| Criar migration | "Supabase: crie migration para adicionar coluna X" |
| Ver schema | "Supabase: liste todas as tabelas" |
| Debug function | "Supabase: mostre função criar_pedido_simples" |

---

## 📚 Exemplos Prontos

### Exemplo 1: Debug de bug reportado

**Usuário diz:** "Erro ao criar pedido"

**Você faz:**
```
1. "Chrome MCP: abra /pedidos/novo e capture erros"
2. "Supabase: SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 3"
3. "Context7: busque este erro no Stack Overflow: [erro capturado]"
```

### Exemplo 2: Validar fix do MontadorSelector

```
"Chrome MCP: 
1. Abra /kanban
2. Clique em card com status=PRONTO
3. Verifique se MontadorSelector aparece
4. Screenshot do drawer"
```

### Exemplo 3: Research de feature nova

```
"Context7:
1. Busque docs do Next.js sobre Server Components
2. Procure exemplos de forms com Server Actions
3. Mostre código adaptado para nosso projeto"
```

---

## 🎓 Dicas Pro

### ✅ DOs

- Use Chrome MCP para bugs visuais/interação
- Use Context7 para dúvidas conceituais
- Use Supabase MCP para operações de banco
- Combine as 3 MCPs para debug completo
- Salve screenshots em `test-results/` para histórico

### ❌ DON'Ts

- Não use Chrome MCP para consultas SQL (use Supabase MCP)
- Não use Context7 para testar UI (use Chrome MCP)
- Não execute migrations sem revisar o SQL gerado
- Não teste em produção sem confirmar em dev primeiro

---

## 🔥 Workflows Matadores

### 1. Feature completa (do zero ao deploy)

```
1. Context7: "Como implementar [feature] no Next.js 14?"
2. [Implementa código]
3. Supabase: "Crie migration para tabela X"
4. Chrome MCP: "Teste a feature em /rota-nova"
5. Supabase: "Verifique dados inseridos"
6. Chrome MCP: "Smoke test em produção"
```

### 2. Bug fix acelerado

```
1. Chrome MCP: "Reproduza o bug em /rota"
2. Chrome MCP: "Mostre erros de console + APIs falhadas"
3. Supabase: "Query para investigar dados"
4. Context7: "Busque solução para [erro específico]"
5. [Aplica fix]
6. Chrome MCP: "Valide que bug foi corrigido"
```

### 3. Code review assistido

```
1. Chrome MCP: "Teste todas as rotas principais"
2. Supabase: "Verifique integridade dos dados"
3. Chrome MCP: "Performance profiling do Dashboard"
4. Context7: "Best practices para [código específico]"
```

---

## 🆘 Troubleshooting

### Chrome MCP não abre browser

```bash
# Reinstalar Playwright
npm install -D playwright
npx playwright install chromium --force
```

### Context7 retorna erro de API key

1. Verifique `.vscode/mcp-settings.json`
2. Teste key manualmente:
   ```bash
   curl -H "Authorization: Bearer YOUR_KEY" https://api.context7.io/health
   ```

### Supabase MCP connection refused

1. Verifique `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://zobgyjsocqmzaggrnwqd.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
2. Teste conexão:
   ```bash
   curl https://zobgyjsocqmzaggrnwqd.supabase.co/rest/v1/ \
     -H "apikey: YOUR_ANON_KEY"
   ```

---

## 📞 Suporte

**Documentação completa:** `docs/MCP-SETUP.md`
**Exemplos práticos:** `docs/MCP-EXEMPLOS-PRATICOS.md`
**Script de teste:** `scripts/test-mcp-chrome.mjs`

**Links oficiais:**
- Chrome DevTools MCP: https://github.com/modelcontextprotocol/servers
- Context7 MCP: https://context7.io/docs
- Supabase MCP: https://github.com/supabase/mcp-server-supabase

---

Última atualização: 22/10/2025
Projeto: Desenrola DCL
