# 🔧 Correções Aplicadas - Wizard Nova Ordem

**Data:** 20/01/2026  
**Problema:** Erro ao salvar pedido + Armação não aparece na revisão

---

## ❌ Problemas Identificados

### 1. Erro no Salvamento

```
ERROR: Could not find the 'armacao_id' column of 'pedidos' in the schema cache
```

**Causa:** A coluna `armacao_id` não existe na tabela `pedidos` do Supabase.

### 2. Armação Não Aparece

- No Step 6 (Revisão), a armação selecionada não é exibida
- **Causa:** `armacao_dados` não estava sendo populado quando `armacao_id` era selecionado

---

## ✅ Soluções Aplicadas

### 1. Script de Migração SQL

**Arquivo:** `database/MIGRAR-ADD-CAMPOS-MULTIMODAL.sql`

Execute este script no **Supabase SQL Editor** para adicionar:

#### Colunas Adicionadas:

- ✅ `tipo_pedido` (enum: LENTES, ARMACAO, COMPLETO, SERVICO)
- ✅ `armacao_id` (UUID) - Link com produtos do CRM_ERP
- ✅ `origem_armacao` (TEXT) - "estoque" ou "cliente_trouxe"
- ✅ `lente_selecionada_id` (UUID) - ID da lente do sis_lens
- ✅ `grupo_canonico_id` (UUID) - Grupo canônico da lente
- ✅ `fornecedor_lente_id` (UUID) - Fornecedor/laboratório
- ✅ `prazo_laboratorio_dias` (INTEGER) - Prazo do lab
- ✅ `margem_cliente_dias` (INTEGER) - Margem de segurança
- ✅ `tipo_servico` (TEXT) - Tipo de serviço (quando tipo=SERVICO)
- ✅ `numero_os_automatico` (TEXT) - OS gerada automaticamente

#### Recursos Adicionados:

- ✅ Índices para performance
- ✅ Comentários de documentação
- ✅ Verificação automática de integridade
- ✅ Notificação para reload do schema cache

### 2. Correção no Step3Armacao

**Arquivo:** `src/components/forms/wizard-steps/Step3Armacao.tsx`

#### O que foi corrigido:

- ✅ Adicionado `useEffect` para buscar dados da armação quando `armacao_id` muda
- ✅ Nova função `buscarDadosArmacao()` que:
  - Busca produto no CRM_ERP pelo ID
  - Popula `armacao_dados` com: sku, sku_visual, descricao, preco_venda
  - Exibe feedback visual durante carregamento
- ✅ Limpa `armacao_dados` quando cliente trouxe armação própria

---

## 📋 Passos para Aplicar

### PASSO 1: Executar Migração SQL

```bash
1. Acesse: https://supabase.com
2. Selecione projeto: desenrola_dcl
3. Vá em: SQL Editor
4. Cole e execute: database/MIGRAR-ADD-CAMPOS-MULTIMODAL.sql
5. Aguarde mensagem: ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!
```

### PASSO 2: Reload do Schema Cache (Importante!)

Após executar a migração, o Supabase precisa recarregar o schema:

**Opção A - Automático** (o script já faz isso):

```sql
NOTIFY pgrst, 'reload schema';
```

**Opção B - Manual** (se não funcionar):

1. Vá em: Settings → API
2. Clique em: "Restart PostgREST"
3. Aguarde ~30 segundos

**Opção C - Alteração Simples** (force reload):

```sql
-- Qualquer ALTER force reload do cache
ALTER TABLE pedidos ALTER COLUMN armacao_id SET DEFAULT NULL;
```

### PASSO 3: Testar Frontend

```bash
# O código já foi corrigido, basta testar:
1. Acesse: /kanban
2. Clique em: Nova Ordem
3. Preencha até Step 3 (Armação)
4. Selecione uma armação
5. Continue até Step 6 (Revisão)
6. Verifique se armação aparece
7. Clique em Salvar
8. Verifique se salva sem erro
```

---

## 🧪 Validações

### Validar Migração SQL

```sql
-- Verificar se colunas existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
  AND column_name IN ('armacao_id', 'tipo_pedido', 'lente_selecionada_id')
ORDER BY column_name;

-- Deve retornar 3 linhas
```

### Validar Schema Cache

```sql
-- Tentar inserir um registro de teste
INSERT INTO pedidos (
  loja_id,
  numero_os_fisica,
  tipo_pedido,
  armacao_id,
  cliente_nome
) VALUES (
  'bab835bc-2df1-4f54-87c3-8151c61ec642',
  'TEST-001',
  'ARMACAO',
  '0991b0dc-1953-4e6b-879c-85ba4febdccb',
  'TESTE'
);

-- Se funcionar, o schema foi recarregado
-- Depois delete o teste:
DELETE FROM pedidos WHERE numero_os_fisica = 'TEST-001';
```

---

## 🎯 Resultado Esperado

### Antes:

- ❌ Erro ao salvar: "Could not find 'armacao_id' column"
- ❌ Armação não aparece no Step 6
- ❌ Wizard incompleto

### Depois:

- ✅ Salva pedido com sucesso
- ✅ Armação exibida no Step 6 com SKU, descrição e preço
- ✅ Suporte completo para pedidos multimodais
- ✅ Dados persistidos corretamente

---

## 📊 Estrutura do Pedido Multimodal

```typescript
// TIPO: COMPLETO (lentes + armação)
{
  tipo_pedido: 'COMPLETO',
  armacao_id: 'uuid-da-armacao',
  lente_selecionada_id: 'uuid-da-lente',
  grupo_canonico_id: 'uuid-do-grupo',
  fornecedor_lente_id: 'uuid-do-fornecedor',
  ...
}

// TIPO: ARMACAO (só armação)
{
  tipo_pedido: 'ARMACAO',
  armacao_id: 'uuid-da-armacao',
  lente_selecionada_id: null,
  ...
}

// TIPO: LENTES (só lentes)
{
  tipo_pedido: 'LENTES',
  armacao_id: null,
  lente_selecionada_id: 'uuid-da-lente',
  ...
}
```

---

## 🚨 Troubleshooting

### Erro persiste após migração?

```sql
-- 1. Verificar se colunas existem de fato
\d pedidos

-- 2. Forçar reload do schema
NOTIFY pgrst, 'reload schema';

-- 3. Restart manual do PostgREST
-- Settings → API → Restart PostgREST
```

### Armação ainda não aparece?

```javascript
// 1. Verificar console do browser
// Deve aparecer: [Step3Armacao] Dados da armação carregados

// 2. Verificar estado do wizard
console.log(data.armacao_dados);
// Deve mostrar: { sku, sku_visual, descricao, preco_venda }

// 3. Hard refresh do browser
Ctrl + Shift + R(Windows / Linux);
Cmd + Shift + R(Mac);
```

---

## ✅ Checklist Final

- [ ] Migração SQL executada com sucesso
- [ ] Schema cache recarregado
- [ ] Teste de inserção manual funcionou
- [ ] Frontend recarregado (hard refresh)
- [ ] Armação aparece no Step 6
- [ ] Pedido salva sem erro
- [ ] Dados persistem no banco

---

**🎉 Após executar esses passos, o sistema estará 100% funcional!**
