# 🎯 Plano de Ação - Correção dos 2 Problemas

**Data:** 15 de janeiro de 2026  
**Status:** Diagnóstico completo - Pronto para correção

---

## 📊 Diagnóstico Final

### ✅ Problema 1: Módulo de Montagens para Financeiro

**Status:** ✅ **JÁ CORRIGIDO**

- Middleware atualizado com rota `/montagens`
- Permissões: `['gestor', 'dcl', 'financeiro', 'demo_viewer']`

---

### ❌ Problema 2A: Montador Não Aparece nos Detalhes

**Causa Raiz Identificada:**

```
Tabela 'pedidos' tem apenas:     ✅ montador_id (UUID)
Tabela 'pedidos' NÃO tem:        ❌ montador_nome
                                 ❌ montador_local
                                 ❌ montador_contato
                                 ❌ custo_montagem
                                 ❌ data_montagem
```

**O que está acontecendo:**

- ✅ Kanban tenta salvar esses campos
- ❌ Campos não existem no banco
- ❌ Salvamento falha silenciosamente
- ❌ Detalhes não mostram informações do montador

**Solução:**
Executar migração: `database/migrations/add-campos-montador-pedidos.sql`

---

### ❌ Problema 2B: Edição de Pedidos Não Funciona

**Causa:**

- RLS policy de UPDATE muito restritiva ou ausente

**Solução:**
Executar correção: `database/fix-rls-edicao-pedidos-simples.sql`

---

## 🚀 Ordem de Execução

### 📝 Passo 1: Adicionar Colunas de Montador

**Executar:** `database/migrations/add-campos-montador-pedidos.sql`

**O que faz:**

```sql
ALTER TABLE pedidos ADD COLUMN montador_nome TEXT;
ALTER TABLE pedidos ADD COLUMN montador_local TEXT;
ALTER TABLE pedidos ADD COLUMN montador_contato TEXT;
ALTER TABLE pedidos ADD COLUMN custo_montagem NUMERIC(10,2);
ALTER TABLE pedidos ADD COLUMN data_montagem TIMESTAMPTZ;
```

**Resultado esperado:**

- 5 colunas adicionadas
- Pedidos existentes com montador_id terão dados populados automaticamente
- Script valida e mostra estrutura final

---

### 📝 Passo 2: Corrigir RLS de UPDATE

**Executar:** `database/fix-rls-edicao-pedidos-simples.sql`

**O que faz:**

- Remove policies antigas de UPDATE
- Cria nova policy permitindo:
  - Usuários da mesma loja
  - Gestores, DCL e Financeiro
  - Usuários do laboratório vinculado

**Resultado esperado:**

- 1 policy de UPDATE ativa
- Edição de pedidos funciona

---

## 🧪 Testes Após Correção

### Teste 1: Kanban - Atribuir Montador

1. Ir para `/kanban`
2. Arrastar pedido para coluna "Enviado" (que tem montagem)
3. Selecionar um montador
4. ✅ Deve salvar com sucesso
5. ✅ Console não deve mostrar erros

### Teste 2: Detalhes - Ver Montador

1. Abrir pedido que tem montador: `/pedidos/[id]`
2. ✅ Deve aparecer card "Montador Responsável"
3. ✅ Deve mostrar:
   - Nome do montador
   - Local de trabalho
   - Contato (se disponível)

### Teste 3: Edição de Pedidos

1. Ir para `/pedidos/[id]/editar`
2. Alterar campo "Observações"
3. Clicar em "Salvar"
4. ✅ Toast de sucesso
5. ✅ Dados atualizados

---

## 📋 Checklist

**Execução:**

- [ ] 1. Executar `add-campos-montador-pedidos.sql`
- [ ] 2. Verificar se 5 colunas foram criadas
- [ ] 3. Executar `fix-rls-edicao-pedidos-simples.sql`
- [ ] 4. Verificar se policy foi criada

**Testes:**

- [ ] Atribuir montador no Kanban
- [ ] Ver montador nos detalhes
- [ ] Editar pedido
- [ ] Verificar logs do console

**Commit:**

- [ ] Commit das alterações no middleware
- [ ] Commit dos scripts SQL

---

## 🎯 Resumo Técnico

**Arquivos para Executar no Supabase (nesta ordem):**

1. `database/migrations/add-campos-montador-pedidos.sql`
2. `database/fix-rls-edicao-pedidos-simples.sql`

**Arquivos Já Modificados (já committados):**

- ✅ `src/middleware.ts`

**Arquivos de Diagnóstico (opcional):**

- `database/diagnostico-estrutura-montadores.sql`

**Documentação:**

- `docs/DIAGNOSTICO_MONTADORES.md`
- `docs/CORRECAO_MONTAGENS_EDICAO.md`

---

## ❓ FAQ

**Q: Por que não usar JOIN com tabela montadores?**
A: Sistema usa desnormalização intencional para manter histórico e performance.

**Q: Os dados do montador vão ficar desatualizados?**
A: Sim, mas é intencional - cada pedido mantém snapshot do montador no momento da atribuição.

**Q: E se eu quiser atualizar dados do montador em pedidos antigos?**
A: Seria necessário um UPDATE manual, mas não é recomendado (perde histórico).

---

## 🆘 Troubleshooting

**Erro: "column already exists"**

- Normal se rodar script 2x
- Script tem verificação e apenas informa

**Erro: "permission denied"**

- Usar usuário com permissão de ALTER TABLE
- No Supabase SQL Editor, usar a aba SQL que tem privilégios

**Edição ainda não funciona:**

1. Verificar console do navegador
2. Verificar Network tab (resposta do Supabase)
3. Testar com diferentes roles (gestor, dcl, loja)
4. Verificar se usuário está na mesma loja do pedido

---

**Pronto para executar!** 🚀
