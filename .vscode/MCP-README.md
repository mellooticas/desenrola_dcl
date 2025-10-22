# 🎯 MCPs Configurados - Desenrola DCL

## ✅ Status da Configuração

| MCP                 | Status   | Descrição                                    |
| ------------------- | -------- | -------------------------------------------- |
| **Supabase**        | ✅ Ativo | Queries SQL, migrations, schema inspection   |
| **Chrome DevTools** | ✅ Ativo | Testes E2E, debug de UI, screenshots         |
| **Context7**        | ✅ Ativo | Busca em docs, Stack Overflow, GitHub issues |

---

## 🚀 Quick Start

### 1. Testar Chrome DevTools MCP

```bash
# Instalar browsers (primeira vez)
npx playwright install chromium

# Executar teste E2E
npm run test:e2e

# Ou via Copilot
"Execute o teste E2E do Kanban"
```

### 2. Testar Context7 MCP

**Via Copilot:**

```
"Use Context7 MCP para buscar na documentação do Next.js sobre Server Actions"
```

**Via terminal:**

```bash
npm run mcp:context7
```

---

## 📚 Documentação

- **Setup completo**: `docs/MCP-SETUP.md`
- **Exemplos práticos**: `docs/MCP-EXEMPLOS-PRATICOS.md`
- **Guia rápido**: `docs/MCP-QUICKSTART.md`

---

## 🎯 Comandos Mais Usados

### Testes Automáticos

```bash
npm run test:e2e              # Teste E2E completo
npm run test:e2e:watch        # Modo watch (reexecuta ao mudar código)
```

### Via Copilot (recomendado)

```
"Chrome MCP: teste criação de pedido"
"Chrome MCP: screenshot do Kanban"
"Chrome MCP: valide MontadorSelector"
"Supabase: SELECT * FROM pedidos LIMIT 5"
"Context7: docs do Next.js sobre Server Actions"
```

---

## 📁 Arquivos Criados

```
.vscode/
├── mcp-settings.json       # Configuração dos 3 MCPs
└── settings.json           # Settings do VS Code (Copilot, etc)

docs/
├── MCP-SETUP.md           # Guia completo de instalação
├── MCP-EXEMPLOS-PRATICOS.md  # 20+ exemplos reais
└── MCP-QUICKSTART.md      # Referência rápida

scripts/
└── test-mcp-chrome.mjs    # Script de teste E2E automático

test-results/              # Screenshots e logs dos testes
└── results.json
```

---

## 🔥 Próximos Passos

1. ✅ Playwright instalado
2. ✅ Scripts configurados no package.json
3. ⏳ Executar teste E2E: `npm run test:e2e`
4. ⏳ Obter Context7 API key (opcional)
5. ⏳ Testar workflow completo de debug

---

Criado em: 22/10/2025
