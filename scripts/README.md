# 📁 Scripts - Estrutura Organizacional

Este diretório contém todos os scripts do projeto, organizados por categoria e finalidade.

## 📂 Estrutura

### 🔧 `/dev/` - Scripts de Desenvolvimento (NÃO vão para produção)
Scripts auxiliares para desenvolvimento, teste e debug. **Esta pasta está no `.gitignore`.**

- **`tests/`** - Scripts de teste (15 arquivos)
  - `testar-*.js` - Testes de funcionalidades
  - `teste-*.js/mjs` - Testes diversos
  - Exemplos: `testar-login.js`, `teste-conexao.js`

- **`diagnostics/`** - Scripts de diagnóstico (12 arquivos)
  - `verificar-*.js` - Verificação de estado do sistema
  - Exemplos: `verificar-mission-control.js`, `verificar-conectividade.js`

- **`investigations/`** - Scripts de investigação (8 arquivos)
  - `investigar-*.js` - Análise profunda de problemas
  - Exemplos: `investigar-sistema-missoes.js`, `investigar-montadores.js`

- **`debug/`** - Scripts e arquivos temporários de debug
  - Arquivos temporários usados durante debug
  - Exemplos: `login-anon-route.ts`, `missoes-para-criar.json`

### ⚙️ `/setup/` - Scripts de Configuração Inicial (7 arquivos)
Scripts para configuração inicial do sistema (VÃO para produção).
- `criar-*.js` - Criação de estruturas base
- `configurar-*.js` - Configuração de componentes
- `gerar-hash-senha.js` - Geração de senhas
- Exemplos: `criar-estruturas.js`, `configurar-lojas.js`

### 🏗️ `/generators/` - Scripts Geradores (5 arquivos)
Scripts que geram dados ou estruturas automaticamente (VÃO para produção).
- `gerar-*.js` - Geração de dados
- Exemplos: `gerar-missoes-hoje.js`, `gerar-apenas-hoje.js`

### 🔄 `/operations/` - Scripts Operacionais
Scripts para operações e manutenção do sistema (VÃO para produção).
- `aplicar-*.js` - Aplicação de mudanças
- Exemplos: `aplicar-configuracoes-loja.js`

## 🚀 Uso

### Scripts de Produção (setup, generators, operations)
```bash
# Executar setup inicial
node scripts/setup/criar-estruturas.js

# Gerar dados
node scripts/generators/gerar-missoes-hoje.js
```

### Scripts de Desenvolvimento (dev/)
```bash
# Rodar testes
node scripts/dev/tests/testar-login.js

# Diagnóstico
node scripts/dev/diagnostics/verificar-mission-control.js

# Investigação
node scripts/dev/investigations/investigar-sistema-missoes.js
```

## 📝 Convenções

- **Scripts de teste** começam com `testar-` ou `teste-`
- **Scripts de diagnóstico** começam com `verificar-`
- **Scripts de investigação** começam com `investigar-`
- **Scripts de setup** começam com `criar-` ou `configurar-`
- **Scripts geradores** começam com `gerar-`
- **Scripts operacionais** começam com `aplicar-`

## ⚠️ Importante

- Scripts em `/dev/` **NÃO** vão para o repositório (estão no `.gitignore`)
- Scripts em `/setup/`, `/generators/` e `/operations/` **SIM** vão para o repositório
- Sempre use caminhos absolutos ou relativos corretos ao executar scripts
- Mantenha variáveis de ambiente no `.env.local`

---

**Última atualização:** 08/01/2025
