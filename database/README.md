# 💾 Database - Estrutura de SQL

Este diretório contém todos os arquivos SQL do projeto, organizados por finalidade.

## 📂 Estrutura

### 🗄️ `/setup/` - Setup Inicial (4 arquivos)
Scripts SQL para configuração inicial do banco de dados.
- `criar-*.sql` - Criação de estruturas base
- `configurar-*.sql` - Configuração de componentes
- `setup-*.sql` - Setup completo de sistemas

**Exemplos:**
- `criar-estruturas-basicas.sql` - Tabelas base do sistema
- `configurar-rls-timeline.sql` - RLS policies
- `setup-mission-control-completo.sql` - Sistema de missões

### 🔄 `/migrations/` - Migrações e Correções (5 arquivos)
Scripts SQL para migrações e correções de estrutura.
- `migrar-*.sql` - Migrações de dados
- `corrigir-*.sql` - Correções de estrutura/dados
- `reconstruir-*.sql` - Reconstrução de estruturas

**Exemplos:**
- `migrar-pedido-eventos-para-timeline.sql` - Migração de eventos
- `corrigir-renovacao-diaria-completa.sql` - Correção de renovação
- `reconstruir-historico-timeline.sql` - Reconstrução de histórico

### 📜 `/scripts/` - Scripts Utilitários (4 arquivos)
Scripts SQL para operações e consultas utilitárias.
- `implementar-*.sql` - Implementação de features
- `popular-*.sql` - População de dados
- `investigar-*.sql` - Queries de investigação

**Exemplos:**
- `implementar-timeline-completa.sql` - Implementação de timeline
- `popular-timeline-manual.sql` - População manual de dados
- `investigar-pedido-eventos.sql` - Query de análise

### 📦 `/` (pasta raiz database/)
Arquivos SQL de configuração geral que já existiam:
- `configuracoes_loja_basico.sql`
- `configuracoes_loja_setup.sql`
- `gamificacao_setup_completo.sql`
- `gamificacao_setup.sql`
- `pontuacao_diaria_setup.sql`
- `renovacao_diaria_setup.sql`

## 🚀 Uso

### Setup Inicial do Banco
```sql
-- 1. Executar estruturas básicas
\i database/setup/criar-estruturas-basicas.sql

-- 2. Configurar RLS
\i database/setup/configurar-rls-timeline.sql

-- 3. Setup de sistemas
\i database/setup/setup-mission-control-completo.sql
```

### Aplicar Migrações
```sql
-- Executar em ordem cronológica
\i database/migrations/migrar-pedido-eventos-para-timeline.sql
\i database/migrations/corrigir-renovacao-diaria-completa.sql
```

### Scripts Utilitários
```sql
-- Implementar features
\i database/scripts/implementar-timeline-completa.sql

-- Popular dados de teste
\i database/scripts/popular-timeline-manual.sql

-- Investigar problemas
\i database/scripts/investigar-pedido-eventos.sql
```

## 📝 Convenções

- **Setup**: Scripts idempotentes, podem ser executados múltiplas vezes
- **Migrations**: Scripts que modificam estrutura, executar apenas uma vez
- **Scripts**: Operações utilitárias, podem ser ad-hoc

## ⚠️ Importante

- Sempre fazer backup antes de executar migrações
- Scripts de setup devem ser idempotentes (safe para reexecutar)
- Migrations devem ter controle de versão
- Testar scripts em ambiente de desenvolvimento primeiro
- Usar transações quando possível

## 🔐 Segurança

- Nunca commitar credenciais nos arquivos SQL
- Usar variáveis de ambiente para dados sensíveis
- Revisar RLS policies antes de aplicar em produção

---

**Última atualização:** 08/01/2025
