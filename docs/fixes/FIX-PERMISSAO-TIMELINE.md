# 🔧 FIX: Erro de Permissão no Kanban (Timeline)

## ❌ Problema Identificado

**Erro:** `permission denied for table pedidos_timeline`

**Quando ocorre:** Ao tentar avançar status de pedidos no Kanban (qualquer usuário exceto admin)

**Causa raiz:** Usuários autenticados não têm permissão para inserir registros na tabela `pedidos_timeline`, que armazena o histórico de mudanças de status.

---

## 📋 Detalhes Técnicos

```
POST /rest/v1/rpc/alterar_status_pedido
Status: 401 (Unauthorized)
Error Code: 42501
Message: permission denied for table pedidos_timeline
```

A função `alterar_status_pedido` tenta inserir um registro no histórico (`pedidos_timeline`), mas o usuário DCL não tem permissão de INSERT nessa tabela.

---

## ✅ Solução

### Opção 1: Executar SQL no Supabase (Recomendado)

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Execute o arquivo: `database/fix-permissions-timeline.sql`

Ou copie e execute:

```sql
-- Dar permissões básicas
GRANT SELECT, INSERT, UPDATE ON TABLE public.pedidos_timeline TO authenticated;
GRANT USAGE ON SEQUENCE pedidos_timeline_id_seq TO authenticated;

-- Ativar RLS
ALTER TABLE public.pedidos_timeline ENABLE ROW LEVEL SECURITY;

-- Política para INSERT
CREATE POLICY "Usuários autenticados podem inserir no timeline"
ON public.pedidos_timeline
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para SELECT
CREATE POLICY "Usuários autenticados podem ver timeline"
ON public.pedidos_timeline
FOR SELECT
TO authenticated
USING (true);
```

### Opção 2: Alterar a função (Se Opção 1 não resolver)

Se após executar o SQL acima ainda houver erro, pode ser necessário modificar a função `alterar_status_pedido` para usar `SECURITY DEFINER`:

```sql
ALTER FUNCTION alterar_status_pedido(uuid, text, text, text) SECURITY DEFINER;
```

Isso faz a função executar com as permissões do criador (que tem acesso total), não do usuário que a chama.

---

## 🧪 Teste

Após aplicar o fix:

1. **No Supabase SQL Editor**, execute:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'pedidos_timeline';
   ```
   Deve retornar as 2 políticas criadas.

2. **No sistema**, teste como usuário DCL:
   - Abra um pedido no Kanban
   - Clique na seta para avançar status (→)
   - Deve funcionar sem erro

---

## 📊 Impacto

**Antes do fix:**
- ❌ DCL não consegue mover pedidos
- ❌ Financeiro não consegue marcar pagamento
- ❌ Loja não consegue entregar pedido
- ✅ Admin funcionava (tem permissões totais)

**Depois do fix:**
- ✅ Todos os usuários podem mover pedidos
- ✅ Histórico registrado corretamente
- ✅ Sistema funciona conforme documentado em `docs/PERMISSOES_KANBAN.md`

---

## 🔍 Prevenção

Para evitar esse erro em futuras tabelas:

1. Sempre criar políticas RLS ao criar tabelas novas
2. Testar com usuários não-admin antes de deploy
3. Usar `SECURITY DEFINER` em funções que precisam de permissões elevadas

---

## 📝 Checklist de Aplicação

- [ ] Executar `database/fix-permissions-timeline.sql` no Supabase
- [ ] Verificar políticas criadas: `SELECT * FROM pg_policies WHERE tablename = 'pedidos_timeline';`
- [ ] Testar com usuário DCL no Kanban
- [ ] Testar com usuário Financeiro (AG_PAGAMENTO → PAGO)
- [ ] Testar com usuário Loja (CHEGOU → ENTREGUE)
- [ ] Validar que histórico está sendo registrado

---

## 🆘 Se Ainda Houver Erro

Me envie:
1. A mensagem de erro completa do console
2. O resultado de: `SELECT * FROM pg_policies WHERE tablename = 'pedidos_timeline';`
3. O resultado de: `SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_name LIKE '%status%';`

Isso me ajudará a identificar se o problema está nas políticas ou na função.
