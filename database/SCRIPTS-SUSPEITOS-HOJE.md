# 🚨 SCRIPTS QUE PODEM TER CAUSADO PROBLEMA

## Scripts executados hoje que podem ter quebrado o sistema:

### 1. `FIX-STATUS-PEDIDOS-AUTO.sql`

**Risco: ALTO** ⚠️

- Converte ENUM para TEXT
- Adiciona CHECK constraint para status
- **PODE TER USADO SCHEMA ERRADO** se não executado no schema correto

### 2. `FIX-TRIGGER-OS-TIMEOUT.sql`

**Risco: MÉDIO** ⚠️

- Modificou trigger de OS sequencia
- Pode ter causado problemas ao inserir pedidos

### 3. `DESABILITAR-TRIGGERS-PEDIDOS-TEMP.sql`

**Risco: CRÍTICO** 🚨

- Se executado, desabilitou TODOS os triggers
- Pode ter ficado desabilitado sem querer

### 4. `FIX-VIEW-LENTES-PRECOS.sql`

**Risco: BAIXO** ✅

- Apenas deu GRANT em view
- Provavelmente não causou problema

## 🔍 INVESTIGAÇÃO NECESSÁRIA:

1. **Execute PRIMEIRO**: `DIAGNOSTICO-COMPLETO-URGENTE.sql`
   - Vai mostrar EXATAMENTE qual é o problema
2. **Se confirmar problema, execute**: `REVERSAO-EMERGENCIA.sql`
   - Vai desfazer mudanças e restaurar estado funcional

## 📋 CHECKLIST DE VERIFICAÇÃO:

- [ ] Triggers estão habilitados?
- [ ] RLS policies permitem INSERT?
- [ ] Tipo de status é TEXT ou ENUM?
- [ ] Laboratórios ativos existem?
- [ ] Grants estão corretos?

## 🎯 AÇÃO IMEDIATA:

```sql
-- 1. Execute este diagnóstico rápido:
SELECT
  'TRIGGERS' as tipo,
  COUNT(*) FILTER (WHERE tgenabled = 'O') as habilitados,
  COUNT(*) FILTER (WHERE tgenabled = 'D') as desabilitados
FROM pg_trigger
WHERE tgrelid = 'pedidos'::regclass AND NOT tgisinternal;

-- 2. Verifique RLS:
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'pedidos';

-- 3. Tente inserir:
INSERT INTO pedidos (loja_id, laboratorio_id, classe_lente_id, status, prioridade, cliente_nome)
SELECT
  (SELECT id FROM lojas LIMIT 1),
  (SELECT id FROM laboratorios WHERE ativo = true LIMIT 1),
  (SELECT id FROM classe_lente LIMIT 1),
  'REGISTRADO',
  'NORMAL',
  'TESTE';
```

Se o INSERT falhar, copie o ERRO EXATO e envie!
