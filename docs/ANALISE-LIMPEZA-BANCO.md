# 🔍 ANÁLISE DE LIMPEZA DO BANCO - DESENROLA DCL

## 📊 RESUMO EXECUTIVO

**Data da Análise**: 15 de Janeiro de 2026  
**Objetivo**: Identificar tabelas, views, functions e código não utilizados para limpeza segura

---

## 🎯 TABELAS POR CATEGORIA

### ✅ CORE DO SISTEMA (NÃO REMOVER)

#### Gestão de Pedidos (CRÍTICO)

- ✅ **pedidos** - 637 registros, 3.1MB, 15 triggers
- ✅ **pedido_eventos** - 8.3K registros, 3.9MB
- ✅ **pedidos_timeline** - 4.3K registros, 1.2MB
- ✅ **pedidos_historico** - Auditoria
- ✅ **pedido_tratamentos** - 6 registros
- ✅ **tratamentos** - 6 registros

#### Controle de OS (CRÍTICO)

- ✅ **os_sequencia** - 4.3K registros, **350MB** (maior tabela!)
- ✅ **controle_os** - 2K registros, 75MB
- ⚠️ **os_nao_lancadas** - Vazia, mas pode ser usada

#### Autenticação e Usuários

- ✅ **usuarios** - 7 registros
- ✅ **lojas** - Config multi-loja
- ✅ **user_sessions** - Sessões ativas

#### Laboratórios e Lentes

- ✅ **laboratorios** - 0 registros (mas usado no sistema)
- ✅ **laboratorio_sla** - 78 registros
- ✅ **classes_lente** - 19 registros

#### Montadores (NOVO - acabamos de adicionar)

- ✅ **montadores** - 11 policies, 1 trigger

#### Notificações e Alertas (USADO)

- ✅ **alertas** - Usado em 18 lugares no frontend
- ✅ **notificacoes** - Hooks ativos (useNotifications.ts)

---

### ⚠️ TABELAS SUSPEITAS (INVESTIGAR)

#### Gamificação (não usado atualmente?)

- ❓ **missoes_diarias** - 699 registros, 376KB, 7 policies
- ❓ **missao_templates** - -1 registros, 112KB
- ❓ **desafios** - Vazia
- ❓ **desafios_participacao** - Vazia
- ❓ **renovacao_diaria** - Vazia

**Status**: Sistema de gamificação parece ter sido implementado mas não está em produção.  
**Ação**: Verificar se há rotas `/mission-control` ou similar no frontend.

#### Colaboradores

- ❓ **colaboradores** - Vazia, 3 policies
  **Status**: Tabela criada mas nunca populada  
  **Ação**: Verificar se é necessária ou pode ser removida

#### Clientes

- ❓ **clientes** - Vazia, 3 policies
  **Status**: Pedidos guardam cliente_nome diretamente, não FK  
  **Ação**: Pode ser legacy de design antigo

#### Permissões Legacy

- ❓ **role_permissions** - Vazia
- ❓ **role_status_permissoes_legacy** - Vazia (nome diz "legacy"!)
  **Status**: Claramente código antigo  
  **Ação**: Remover se RLS substituiu

#### Configurações de Loja

- ❓ **loja_acoes_customizadas** - Vazia, 1 trigger
- ❓ **loja_configuracoes_horario** - Vazia, 1 trigger
  **Status**: Features não implementadas?  
  **Ação**: Verificar se triggers fazem algo importante

#### Sistema

- ❓ **sistema_config** - Vazia
  **Status**: Config global não usada?  
  **Ação**: Verificar se há constantes no código que deveriam vir daqui

---

## 🔍 VIEWS ENCONTRADAS

### Core

- ✅ **v_pedidos_kanban** - View principal do sistema (USADA)
- ✅ **v_alertas_criticos** - Dashboard de alertas (USADA)

### Investigar

- ❓ Outras views (preciso ver lista completa da query 2)

---

## 🎬 TRIGGERS ATIVOS

**Total**: 20+ triggers distribuídos

### Principais:

- ✅ **pedidos** - 15 triggers (auto-montagem, controle OS, etc)
- ✅ **os_sequencia** - 1 trigger
- ✅ **laboratorios** - 1 trigger
- ✅ **montadores** - 1 trigger
- ⚠️ **loja_acoes_customizadas** - 1 trigger (mas tabela vazia!)
- ⚠️ **loja_configuracoes_horario** - 1 trigger (mas tabela vazia!)

**Ação**: Investigar triggers em tabelas vazias - podem estar causando overhead

---

## 📋 PRÓXIMOS PASSOS

### PASSO 1: Analisar Frontend (AGORA)

```bash
# Buscar uso de tabelas suspeitas
grep -r "missoes_diarias\|missao_templates\|desafios" src/
grep -r "colaboradores\|clientes" src/
grep -r "role_permissions\|role_status" src/
```

### PASSO 2: Verificar Rotas Mortas

- [ ] Listar todas as rotas em `src/app/`
- [ ] Verificar quais não estão no menu/middleware
- [ ] Identificar código órfão

### PASSO 3: Decisão Conservadora

**Critérios para REMOÇÃO SEGURA**:

1. ✅ Tabela vazia (0 registros)
2. ✅ Sem trigger ativo
3. ✅ Nome contém "legacy" ou similar
4. ✅ Sem referência no código frontend
5. ✅ Não é FK de outra tabela

### PASSO 4: Script de Backup

Antes de deletar QUALQUER coisa:

```sql
-- Backup completo das tabelas candidatas
CREATE TABLE backup_[tabela]_20260115 AS SELECT * FROM [tabela];
```

### PASSO 5: Remoção Ordenada

1. DROP TRIGGER (se houver)
2. DROP POLICY (se houver)
3. DROP VIEW (se depende)
4. DROP TABLE

---

## ⚠️ CUIDADOS ESPECIAIS

### NÃO TOCAR (ainda):

- ❌ **os_sequencia** - 350MB mas é histórico importante
- ❌ **controle_os** - 75MB mas é core do negócio
- ❌ **pedido_eventos** - Auditoria essencial

### Investigar tamanho:

- 🔍 **os_sequencia (350MB)** - Por que tão grande? Há dados antigos desnecessários?
- 🔍 **controle_os (75MB)** - Pode ser arquivado?

---

## 🎯 ALVOS MAIS PROVÁVEIS PARA REMOÇÃO

### Alta probabilidade de remoção segura:

1. ✅ **desafios** (vazia)
2. ✅ **desafios_participacao** (vazia)
3. ✅ **role_status_permissoes_legacy** (nome diz tudo!)
4. ✅ **renovacao_diaria** (vazia)

### Média probabilidade (precisa investigar uso):

1. ⚠️ **colaboradores**
2. ⚠️ **clientes**
3. ⚠️ **sistema_config**
4. ⚠️ **loja_acoes_customizadas**
5. ⚠️ **loja_configuracoes_horario**

### Sistema de gamificação (decisão de produto):

1. 🎮 **missoes_diarias** (699 registros - já foi usado!)
2. 🎮 **missao_templates** (tem dados)
3. 🎮 **renovacao_diaria**

**DESCOBERTA**: ✅ **Mission Control ESTÁ ATIVO NO SISTEMA!**

- ✅ Rota existe: `/mission-control`
- ✅ Componentes ativos: `MissionCard.tsx`, `loja-selector.tsx`
- ✅ Documentação completa em `/docs/mission-control/`
- ✅ **MANTER TODAS AS TABELAS DE GAMIFICAÇÃO**
- ⚠️ **desafios** e **desafios_participacao** - Vazias mas podem ser feature futura

### Permissões (código vs banco):

**DESCOBERTA**: ❌ **Permissões estão HARDCODED no frontend!**

- ❌ `ROLE_PERMISSIONS` definido em `constants.ts` e `use-permissions.ts`
- ❌ Tabelas **role_permissions** e **role_status_permissoes_legacy** nunca foram usadas
- ✅ **CANDIDATAS FORTES PARA REMOÇÃO** (banco vazio, código não usa)

---

## 📝 PRÓXIMA AÇÃO IMEDIATA

Vou agora buscar no código frontend por referências às tabelas suspeitas para decidir o que é realmente órfão.
