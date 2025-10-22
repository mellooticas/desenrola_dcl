# 🛠️ MCP Tools Setup - Desenrola DCL

## MCPs Configurados

### 1. **Supabase MCP** ✅ (Já configurado)
- Gerenciamento direto do banco de dados
- Migrations, queries, functions
- Schema inspection

### 2. **Chrome DevTools MCP** 🆕
- Automação de testes no browser
- Captura de console logs e erros
- Network monitoring
- Screenshots automáticos

### 3. **Context7 MCP** 🆕
- Busca em documentação (Next.js, React, Supabase)
- Stack Overflow integration
- GitHub issues search
- Contextualização inteligente

---

## 🚀 Instalação

### Chrome DevTools MCP

```bash
# Instalar globalmente
npm install -g @modelcontextprotocol/server-puppeteer

# Ou via npx (recomendado)
npx @modelcontextprotocol/server-puppeteer
```

**Configuração no VS Code settings.json:**
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    }
  }
}
```

### Context7 MCP

```bash
# Instalar
npm install -g @context7/mcp-server

# Ou via npx
npx @context7/mcp-server
```

**Configuração no VS Code settings.json:**
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@context7/mcp-server"
      ],
      "env": {
        "CONTEXT7_API_KEY": "sua-api-key-aqui"
      }
    }
  }
}
```

---

## 🎯 Casos de Uso Práticos

### Chrome DevTools MCP

**1. Testar criação de pedido automaticamente:**
```
"Abra localhost:3000/pedidos/novo, preencha o formulário com dados de teste e capture qualquer erro no console"
```

**2. Verificar Kanban drag & drop:**
```
"Navegue até /kanban, arraste um card para coluna 'Lentes no DCL' e verifique se o MontadorSelector aparece"
```

**3. Capturar erro de API:**
```
"Acesse /dashboard e capture todas as requisições que falharam (status 500)"
```

### Context7 MCP

**1. Buscar solução para erro específico:**
```
"Busque no Stack Overflow soluções para 'NextJS 14 dynamic route force-dynamic'"
```

**2. Consultar docs do Supabase:**
```
"Procure na documentação do Supabase como criar RLS policies para multi-tenant"
```

**3. Ver issues do GitHub:**
```
"Verifique issues no repo do @hello-pangea/dnd sobre problemas com drag and drop em mobile"
```

---

## 🔧 Scripts Úteis

### package.json

Adicione estes scripts para facilitar testes:

```json
{
  "scripts": {
    "test:e2e": "echo 'Use Chrome DevTools MCP para testes E2E'",
    "test:api": "echo 'Teste APIs com Supabase MCP'",
    "docs": "echo 'Busque docs com Context7 MCP'"
  }
}
```

---

## 📝 Workflow Recomendado

### Ao encontrar um bug:

1. **Chrome DevTools MCP**: Reproduzir automaticamente
   ```
   "Abra a página onde o bug ocorre e capture o console"
   ```

2. **Supabase MCP**: Verificar dados
   ```
   "Execute SELECT * FROM pedidos ORDER BY created_at DESC LIMIT 5"
   ```

3. **Context7 MCP**: Buscar solução
   ```
   "Busque soluções para este erro específico"
   ```

### Ao implementar feature:

1. **Context7 MCP**: Pesquisar best practices
   ```
   "Como implementar drag and drop acessível em React?"
   ```

2. **Chrome DevTools MCP**: Testar implementação
   ```
   "Teste a feature e valide se está acessível"
   ```

3. **Supabase MCP**: Criar migrations necessárias
   ```
   "Crie migration para adicionar coluna X"
   ```

---

## ⚠️ Considerações

### Chrome DevTools MCP
- **Pros**: Testes automáticos, captura de erros real-time
- **Contras**: Consome mais recursos (abre browser)
- **Quando usar**: Testes E2E, debug de UI issues

### Context7 MCP
- **Pros**: Acesso instantâneo a docs, StackOverflow
- **Contras**: Requer API key (pode ter limite)
- **Quando usar**: Research, busca de soluções

### Supabase MCP
- **Pros**: Controle direto do banco, migrations fáceis
- **Contras**: Requer credentials (já configurado)
- **Quando usar**: Database operations, schema changes

---

## 🎓 Próximos Passos

1. Instalar Chrome DevTools MCP
2. Configurar Context7 MCP (obter API key)
3. Testar workflow completo com as 3 MCPs
4. Documentar casos de uso específicos do projeto

---

## 📚 Links Úteis

- [Chrome DevTools MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer)
- [Context7 MCP](https://github.com/context7/mcp-server)
- [Supabase MCP](https://github.com/supabase/mcp-server-supabase)
- [MCP Specification](https://modelcontextprotocol.io/)
