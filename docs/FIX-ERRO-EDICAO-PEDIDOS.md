# 🔧 Correção: Erro ao Editar Pedidos

## ❌ Problema Reportado

```
Erro ao salvar pedido: Error: Nenhum registro foi atualizado.
Verifique se você tem permissão para editar este pedido.
```

**Origem:** [src/app/pedidos/[id]/editar/page.tsx:190](d:\projetos\desenrola_dcl\src\app\pedidos[id]\editar\page.tsx)

---

## 🔍 Causa Raiz

A **política RLS de UPDATE** na tabela `pedidos` está:

- ❌ Não existe (foi deletada)
- ❌ Muito restritiva (bloqueia seu usuário)
- ❌ Com sintaxe incorreta

Quando você tenta salvar um pedido editado, o Supabase executa:

```sql
UPDATE pedidos SET ... WHERE id = 'xxx'
```

Mas a policy RLS bloqueia o UPDATE porque:

1. Seu usuário não passa no filtro `USING (...)`
2. A policy nem existe

---

## ✅ Solução em 2 Passos

### Passo 1: Diagnóstico 🔍

Execute no **Supabase SQL Editor**:

```
database/DIAGNOSTICO-RLS-EDICAO.sql
```

**O que vai mostrar:**

- ✅ Todas as policies atuais na tabela `pedidos`
- ✅ Seu usuário atual (role, loja_id, etc)
- ✅ Se o pedido que você quer editar é visível
- ✅ Se RLS está habilitado

**Resultado esperado:**

```sql
-- Deve mostrar seu usuário com role 'gestor', 'dcl' ou 'financeiro'
-- E deve mostrar se a policy "pedidos_update_policy" existe
```

---

### Passo 2: Correção 🔧

Execute no **Supabase SQL Editor**:

```
database/FIX-RLS-UPDATE-DEFINITIVO.sql
```

**O que vai fazer:**

1. ✅ Remove TODAS as policies antigas de UPDATE
2. ✅ Cria policy NOVA e DEFINITIVA
3. ✅ Garante que RLS está habilitado
4. ✅ Valida a correção com queries de teste

**Lógica da Nova Policy:**

```sql
-- REGRA 1: Gestor, DCL, Financeiro → PODEM TUDO ✅
-- REGRA 2: Role 'loja' → Pode editar pedidos da SUA loja ✅
-- REGRA 3: Usuário de lab → Pode editar pedidos do SEU lab ✅
-- REGRA 4: Demo viewer → Não pode editar ❌
```

---

## 🎯 Como Testar

### Após executar o script:

1. **Faça logout e login** novamente no sistema

   - Isso garante que as permissões são atualizadas

2. **Vá até um pedido**

   ```
   http://localhost:3000/pedidos/[id]/editar
   ```

3. **Altere algum campo** (ex: Observações)

4. **Clique em Salvar**

5. **Deve aparecer:**
   ```
   ✅ Pedido atualizado com sucesso!
   ```

---

## 🐛 Se Ainda Der Erro

### Erro persiste após script?

Execute no Supabase:

```sql
SELECT
  id,
  email,
  role,
  loja_id,
  laboratorio_id
FROM usuarios
WHERE id = auth.uid();
```

**Verifique:**

- ✅ Seu `role` é `gestor`, `dcl` ou `financeiro`?
- ✅ Se for `loja`, seu `loja_id` bate com o pedido?
- ✅ Você tem algum valor em `loja_id`?

---

## 🔐 Estrutura da Policy (Referência)

```sql
CREATE POLICY "pedidos_update_policy" ON pedidos
  FOR UPDATE
  TO authenticated
  USING (
    -- Quem PODE ver o registro para editar
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
        AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Garante que não muda loja_id para uma não autorizada
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
        AND role IN ('gestor', 'dcl', 'financeiro')
    )
    OR
    loja_id IN (
      SELECT loja_id FROM usuarios WHERE id = auth.uid()
    )
  );
```

---

## 📝 Checklist Final

Antes de considerar resolvido:

- [ ] Executei `DIAGNOSTICO-RLS-EDICAO.sql` e vi meu usuário
- [ ] Executei `FIX-RLS-UPDATE-DEFINITIVO.sql` sem erros
- [ ] Vi mensagem "✅ Policy criada com sucesso"
- [ ] Fiz logout + login no sistema
- [ ] Consegui editar e salvar um pedido
- [ ] Toast verde "Pedido atualizado com sucesso!" apareceu

---

## 🚀 Próximos Passos

Depois de resolver:

1. Commit das mudanças no banco (documentar a policy)
2. Testar com diferentes roles (gestor, loja, financeiro)
3. Validar que `demo_viewer` NÃO consegue editar (segurança)

---

**Status:** ⏳ AGUARDANDO EXECUÇÃO DOS SCRIPTS  
**Prioridade:** 🔴 ALTA (bloqueando edição de pedidos)  
**Impacto:** Todos os usuários não conseguem editar pedidos
