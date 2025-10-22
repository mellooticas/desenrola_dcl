# 🎯 MCP - Exemplos Práticos - Desenrola DCL

## 🧪 Chrome DevTools MCP - Casos de Uso Reais

### 1️⃣ Testar Criação de Pedido Completo

**Prompt para Copilot:**
```
Usando Chrome DevTools MCP, abra localhost:3000/pedidos/novo e:
1. Capture erros no console
2. Verifique se o formulário carrega
3. Tire um screenshot da página
4. Liste todas as requisições de API que falharem
```

**O que o MCP fará:**
- Abre o Chrome automaticamente
- Navega até a página
- Monitora console.log, console.error, console.warn
- Captura network requests (APIs do Supabase)
- Salva screenshots em `test-results/`

**Resultado esperado:**
```
✅ Página carregada
✅ Formulário renderizado
✅ 0 erros de console
✅ API /api/laboratorios: 200 OK
✅ API /api/classes: 200 OK
```

---

### 2️⃣ Validar MontadorSelector no Kanban

**Prompt para Copilot:**
```
Use Chrome DevTools MCP para:
1. Abrir /kanban
2. Localizar um card com status="PRONTO"
3. Clicar no card
4. Verificar se o MontadorSelector aparece no drawer
5. Capturar screenshot do estado
```

**O que o MCP fará:**
- Navega até Kanban
- Usa seletores CSS: `[data-status="PRONTO"]`
- Simula clique no card
- Verifica presença do componente MontadorSelector
- Screenshot do drawer aberto

**Resultado esperado:**
```
✅ Kanban carregado
✅ 3 cards encontrados com status=PRONTO
✅ Card clicado
✅ MontadorSelector APARECEU no drawer
✅ Screenshot salvo: drawer-montador-pronto.png
```

---

### 3️⃣ Debug de Erro de API em Tempo Real

**Prompt para Copilot:**
```
Com Chrome DevTools MCP, monitore /dashboard e:
1. Capture todas as chamadas de API
2. Identifique quais retornam erro 500
3. Mostre o corpo da resposta (JSON)
4. Liste os headers da requisição
```

**O que o MCP fará:**
- Intercepta todas as requests de fetch()
- Filtra por status >= 400
- Extrai response.json()
- Mostra headers (Authorization, Content-Type)

**Resultado esperado:**
```
⚠️ API FALHOU: /api/dashboard/evolucao-financeira
Status: 500
Error: column "lojas.updated_at" does not exist
Headers: {
  "Authorization": "Bearer eyJ...",
  "Content-Type": "application/json"
}
Solução: Executar migration add-updated-at-columns.sql
```

---

### 4️⃣ Testar Drag & Drop do Kanban

**Prompt para Copilot:**
```
Use Puppeteer MCP para testar drag & drop:
1. Abra /kanban
2. Localize card #177 na coluna "PAGO"
3. Arraste para coluna "PRODUCAO"
4. Verifique se status mudou no banco
5. Capture console logs durante operação
```

**O que o MCP fará:**
- Simula drag-start, drag-over, drop
- Monitora mutations no DOM
- Verifica se API de update foi chamada
- Consulta banco via Supabase MCP para confirmar

**Resultado esperado:**
```
✅ Card #177 arrastado
✅ API PATCH /api/pedidos/177: 200 OK
✅ Console: "Pedido atualizado: PAGO → PRODUCAO"
✅ Banco confirmado: SELECT status FROM pedidos WHERE id='...' → 'PRODUCAO'
```

---

## 🔍 Context7 MCP - Casos de Uso Reais

### 1️⃣ Buscar Solução para Erro Específico

**Prompt para Copilot:**
```
Use Context7 MCP para buscar no Stack Overflow:
"Next.js 14 App Router - Dynamic server usage Route couldn't be rendered statically"
```

**O que o MCP fará:**
- Busca automática no Stack Overflow
- Filtra respostas com mais upvotes
- Resume solução em português
- Sugere código aplicável ao nosso projeto

**Resultado esperado:**
```
📚 3 resultados encontrados no Stack Overflow:

1. [Aceita ✓] Adicionar export const dynamic = 'force-dynamic'
   https://stackoverflow.com/questions/78123456
   
   Solução:
   // src/app/api/rota/route.ts
   export const dynamic = 'force-dynamic'
   export const runtime = 'nodejs'

2. [89 votes] Usar Route Segment Config
   https://stackoverflow.com/questions/77234567
   ...
```

---

### 2️⃣ Consultar Docs do Supabase RLS

**Prompt para Copilot:**
```
Context7 MCP: Busque na documentação do Supabase como criar RLS policy para multi-tenant por loja_id
```

**O que o MCP fará:**
- Acessa docs oficiais do Supabase
- Extrai seção sobre Row Level Security
- Mostra exemplos de policies
- Adapta para nossa estrutura (lojas, usuarios)

**Resultado esperado:**
```
📖 Documentação Supabase - Row Level Security

Policy para multi-tenant por loja_id:

CREATE POLICY "usuarios_isolamento_loja"
ON usuarios
FOR ALL
USING (
  loja_id = (
    SELECT loja_id 
    FROM auth.users 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "pedidos_isolamento_loja"
ON pedidos
FOR SELECT
USING (
  loja_id IN (
    SELECT loja_id 
    FROM usuarios 
    WHERE id = auth.uid()
  )
);

⚠️ Importante: Habilitar RLS: ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
```

---

### 3️⃣ Pesquisar Issues do GitHub

**Prompt para Copilot:**
```
Context7: Procure issues no repo @hello-pangea/dnd sobre problemas com drag and drop em dispositivos touch/mobile
```

**O que o MCP fará:**
- Acessa GitHub API
- Busca issues abertas + fechadas
- Filtra por labels: "mobile", "touch", "bug"
- Resume soluções implementadas

**Resultado esperado:**
```
🐛 Issues encontradas em @hello-pangea/dnd:

1. #234 [FECHADA] Touch events not working on iOS Safari
   Solução: Adicionar touch-action: none no CSS
   
   .draggable-item {
     touch-action: none;
   }

2. #189 [ABERTA] Drag preview offset on mobile
   Workaround temporário: Ajustar offset manualmente
   https://github.com/hello-pangea/dnd/issues/189#issuecomment-123456

3. #156 [FECHADA] Performance issues on Android
   Solução: Usar virtualização com react-window
```

---

### 4️⃣ Comparar Bibliotecas (Research)

**Prompt para Copilot:**
```
Context7 MCP: Compare @hello-pangea/dnd vs dnd-kit para Kanban em produção. Busque benchmarks, issues conhecidas e recomendações
```

**O que o MCP fará:**
- Busca comparações em blogs/artigos
- Analisa stars/forks no GitHub
- Lista prós/contras de cada lib
- Sugere melhor opção para nosso caso

**Resultado esperado:**
```
⚖️ Comparação: @hello-pangea/dnd vs dnd-kit

@hello-pangea/dnd:
✅ Mais maduro (fork do react-beautiful-dnd)
✅ API familiar
❌ Bundle maior (45kb)
❌ Menos performático em listas grandes (>100 items)

dnd-kit:
✅ Modular e leve (18kb)
✅ Melhor performance
✅ Suporte a touch nativo
❌ API mais complexa
❌ Menos exemplos prontos

🎯 Recomendação para Desenrola DCL:
Manter @hello-pangea/dnd - nosso Kanban tem <50 items, API já implementada, estável em produção.
```

---

## 🔗 Integração das 3 MCPs

### Workflow Completo: Debug de Bug Completo

**Cenário:** Usuário reporta erro ao criar pedido

**1. Chrome DevTools MCP - Reproduzir o bug**
```
"Abra /pedidos/novo e tente criar um pedido com os dados:
- Cliente: João Silva
- CPF: 123.456.789-00
- Classe: LONGE
- Data: 25/10/2025
Capture todos os erros"
```

**2. Supabase MCP - Verificar dados**
```
"Execute: SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 1"
"Verifique se numero_sequencial está duplicado"
```

**3. Context7 MCP - Buscar solução**
```
"Busque no Stack Overflow: PostgreSQL duplicate key value violates unique constraint numero_sequencial"
```

**4. Supabase MCP - Aplicar correção**
```
"Crie migration para resetar sequence:
SELECT setval('pedidos_numero_sequencial_seq', 
  (SELECT MAX(numero_sequencial) FROM pedidos) + 1
)"
```

**5. Chrome DevTools MCP - Validar fix**
```
"Teste criar pedido novamente e confirme sucesso"
```

---

## 📊 Scripts Prontos para o Projeto

### Script 1: Teste Completo E2E

Salvo em: `scripts/test-mcp-chrome.mjs`

**Executar:**
```bash
npm install playwright
node scripts/test-mcp-chrome.mjs
```

**Ou via Copilot:**
```
"Execute o script test-mcp-chrome.mjs e mostre os resultados"
```

---

### Script 2: Monitoramento Contínuo

**Prompt para Copilot:**
```
"Use Chrome DevTools MCP para monitorar /kanban por 30 segundos e capturar:
- Todos os console.error
- APIs que demorarem >3s
- Memory leaks (heap snapshots)
```

---

### Script 3: Smoke Test Pós-Deploy

**Prompt para Copilot:**
```
"Execute smoke test em produção:
1. Acesse https://desenrola-dcl.vercel.app
2. Teste login
3. Verifique se Dashboard carrega
4. Confirme que Kanban mostra cards
5. Gere relatório de health check"
```

---

## 🎓 Aprendendo com MCPs

### Para cada tipo de problema:

| Problema | MCP a usar | Comando exemplo |
|----------|------------|-----------------|
| **Bug visual/UI** | Chrome DevTools | "Screenshot da página X e compare com design" |
| **Erro de API** | Chrome DevTools + Supabase | "Monitore API e consulte banco" |
| **Erro desconhecido** | Context7 | "Busque este erro no Stack Overflow" |
| **Dúvida de docs** | Context7 | "Como fazer X no Next.js 14?" |
| **Migration SQL** | Supabase | "Crie migration para Y" |
| **Performance** | Chrome DevTools | "Faça profiling da página Z" |

---

## ⚡ Atalhos Rápidos

### Debug Rápido
```
"Chrome MCP: abra /pedidos/novo, capture erros, screenshot"
```

### Pesquisa Rápida
```
"Context7: docs do Supabase sobre RLS policies"
```

### Teste Rápido
```
"Chrome MCP: teste drag and drop no Kanban"
```

### Query Rápida
```
"Supabase MCP: SELECT * FROM pedidos WHERE status='PRONTO' LIMIT 5"
```

---

## 🚀 Próximos Passos

1. ✅ Instalar Playwright: `npm install -D playwright`
2. ✅ Configurar Context7 API key (obter em context7.io)
3. ✅ Testar script: `node scripts/test-mcp-chrome.mjs`
4. ✅ Criar auth-state.json para testes autenticados
5. ✅ Adicionar mais casos de teste específicos do projeto

---

## 📝 Notas Importantes

- **Chrome DevTools MCP**: Funciona mesmo sem API key
- **Context7 MCP**: Requer API key (free tier disponível)
- **Supabase MCP**: Já configurado ✅
- **Screenshots**: Salvos em `test-results/`
- **Logs**: Formato JSON para fácil análise

---

Criado em: 22/10/2025
Atualizado por: Copilot + Dev Team
Projeto: Desenrola DCL
