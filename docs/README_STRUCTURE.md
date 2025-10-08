# 📚 Documentação - Estrutura Organizacional

Este diretório contém toda a documentação do projeto, organizada por tipo e finalidade.

## 📂 Estrutura

### ⭐ `/features/` - Documentação de Features (3 arquivos)
Documentação completa de funcionalidades implementadas.

- `GAMIFICACAO_README.md` - Sistema de gamificação e pontos
- `RENOVACAO_DIARIA_README.md` - Sistema de renovação diária de missões
- `DEMO_USER_FRONTEND_PROTECTION.md` - Sistema de proteção para usuários demo

**Conteúdo típico:**
- Descrição da feature
- Como funciona
- Arquivos envolvidos
- Exemplos de uso
- Checklist de implementação

### 🔧 `/fixes/` - Documentação de Correções (3 arquivos)
Documentação de problemas resolvidos e suas soluções.

- `COMMIT_TIMELINE_FIX.md` - Correção do sistema de timeline
- `MISSION_CONTROL_FIX.md` - Correções do Mission Control
- `SOLUCAO_DEFINITIVA_TIMELINE.md` - Solução definitiva para timeline

**Conteúdo típico:**
- Problema identificado
- Diagnóstico
- Solução aplicada
- Código antes/depois
- Testes realizados

### 📖 `/instructions/` - Instruções e Guias (2 arquivos)
Guias passo-a-passo e instruções de uso.

- `INSTRUCOES-CRIAR-ESTRUTURAS.md` - Como criar estruturas base
- `INSTRUCOES_TIMELINE.md` - Instruções para trabalhar com timeline

**Conteúdo típico:**
- Passos detalhados
- Comandos a executar
- Validações necessárias
- Troubleshooting comum

### 📊 `/` (pasta raiz docs/)
Documentação geral e índices:

- `README.md` - Índice geral da documentação
- `ANALISE-BANCO.md` - Análise do banco de dados
- `ANALISE-COMPLETA-SISTEMA.md` - Análise completa do sistema
- `DEPLOY.md` - Instruções de deploy
- `INDICE-ORGANIZACIONAL.md` - Índice organizacional
- `ORGANIZACAO-DOCUMENTACAO.md` - Como organizar docs
- `RESUMO-DOCUMENTACAO.md` - Resumo de toda documentação
- `SISTEMA_TEMAS.md` - Sistema de temas do app
- `SOLUÇÃO-DEPLOY.md` - Solução de problemas de deploy
- `CLEANUP_PLAN.md` - Plano de limpeza e organização

**Subpastas existentes:**
- `api/` - Documentação de APIs
- `components/` - Documentação de componentes
- `configuracoes-loja/` - Docs de configurações de loja
- `database/` - Docs específicos de banco
- `debug-archive/` - Arquivo de debug sessions
- `deployment/` - Docs de deployment
- `development/` - Docs de desenvolvimento
- `mission-control/` - Docs do Mission Control
- `scripts/` - Docs de scripts
- `security/` - Docs de segurança
- `sql-queries/` - Queries SQL documentadas
- `supabase/` - Docs específicos do Supabase
- `temas_novo/` - Docs do novo sistema de temas

## 📝 Convenções de Documentação

### Estrutura de um documento de Feature
```markdown
# Nome da Feature

## 📋 Descrição
[O que é e para que serve]

## 🎯 Objetivo
[Problema que resolve]

## 🏗️ Arquitetura
[Como funciona tecnicamente]

## 📁 Arquivos Envolvidos
[Lista de arquivos]

## 🚀 Como Usar
[Exemplos práticos]

## ✅ Checklist
[Tarefas e validações]
```

### Estrutura de um documento de Fix
```markdown
# Fix: [Título do Problema]

## 🐛 Problema
[Descrição do bug/problema]

## 🔍 Diagnóstico
[Como foi identificado]

## ✅ Solução
[O que foi feito]

## 💻 Código
[Código antes/depois]

## 🧪 Testes
[Como validar a correção]
```

### Estrutura de um documento de Instruções
```markdown
# Instruções: [Título]

## 📝 Objetivo
[O que este guia ensina]

## ⚙️ Pré-requisitos
[O que é necessário]

## 📋 Passo a Passo
1. [Passo 1]
2. [Passo 2]
...

## ✅ Validação
[Como verificar sucesso]

## ⚠️ Troubleshooting
[Problemas comuns]
```

## 🔍 Navegação

### Encontrar documentação sobre:

**Features específicas:**
```bash
docs/features/         # Funcionalidades
docs/mission-control/  # Mission Control
docs/components/       # Componentes UI
```

**Problemas e soluções:**
```bash
docs/fixes/           # Correções documentadas
docs/debug-archive/   # Debug sessions antigas
```

**Como fazer algo:**
```bash
docs/instructions/    # Guias passo-a-passo
docs/development/     # Guias de desenvolvimento
docs/deployment/      # Guias de deploy
```

**Referências técnicas:**
```bash
docs/api/            # APIs
docs/database/       # Banco de dados
docs/security/       # Segurança
docs/sql-queries/    # Queries SQL
```

## 📚 Documentação Principal

1. **Começando:** `docs/README.md`
2. **Resumo geral:** `docs/RESUMO-DOCUMENTACAO.md`
3. **Índice organizacional:** `docs/INDICE-ORGANIZACIONAL.md`
4. **Organização:** `docs/ORGANIZACAO-DOCUMENTACAO.md`

## ✍️ Contribuindo

Ao adicionar nova documentação:

1. **Escolha a pasta certa:**
   - Feature nova? → `features/`
   - Correção? → `fixes/`
   - Guia? → `instructions/`
   - Docs específica? → Subpasta apropriada

2. **Use formato Markdown** (.md)

3. **Siga as convenções** de estrutura acima

4. **Adicione ao índice** principal se relevante

5. **Use emojis** para melhor visualização:
   - 📋 Descrição / Lista
   - 🎯 Objetivo / Meta
   - 🏗️ Arquitetura / Estrutura
   - 📁 Arquivos
   - 🚀 Uso / Deploy
   - ✅ Sucesso / Checklist
   - 🐛 Bug / Problema
   - 🔍 Investigação
   - 💻 Código
   - 🧪 Testes
   - ⚠️ Aviso / Cuidado
   - 🔐 Segurança
   - 📊 Análise / Dados

---

**Última atualização:** 08/01/2025
