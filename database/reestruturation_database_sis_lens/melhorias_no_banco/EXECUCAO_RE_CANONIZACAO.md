# 🔄 Re-canonização Completa - Plano de Execução

## 📋 Situação Atual

### ❌ Problema Identificado:
- **219 lentes** em grupos **incompatíveis**
- Todas com tratamento **fotossensível incompatível**
- Grupos marcados como "+fotocromático" contêm lentes SEM o tratamento

### 🔍 Causa Raiz:
Dois triggers ativos com **lógicas diferentes**:
1. `trg_lentes_associar_grupo` → NÃO considera tratamentos ❌
2. `trg_lente_insert_update` → Considera TODOS os tratamentos ✅

## ✅ Solução: Re-canonização Completa

### 📝 Script Preparado:
`povoar_banco/99D_EXECUTAR_RE_CANONIZACAO_COMPLETA.sql`

### 🎯 O que o script faz:

#### 1️⃣ **Backup Automático**
- Cria tabelas temporárias com estado atual
- Segurança para reverter se necessário

#### 2️⃣ **Limpeza Controlada**
- Desativa todos os triggers
- Remove associações antigas
- Deleta grupos canônicos (serão recriados)

#### 3️⃣ **Re-criação Correta**
- Ativa APENAS o trigger correto
- Força UPDATE em todas as lentes
- Trigger recria grupos com TODOS os campos

#### 4️⃣ **Validação Automática**
- Verifica lentes órfãs (esperado: 0)
- Verifica incompatibilidades (esperado: 0)
- Mostra estatísticas completas

## 📊 Resultado Esperado

### Antes:
```
✅ 0 lentes órfãs
❌ 219 lentes em grupos incompatíveis
⚠️ 461 grupos canônicos
```

### Depois:
```
✅ 0 lentes órfãs
✅ 0 lentes em grupos incompatíveis
✅ ~600-700 grupos canônicos (separados por tratamentos)
```

**Por que mais grupos?**
Antes os grupos misturavam lentes com tratamentos diferentes. Agora cada combinação de tratamento terá seu próprio grupo (correto!).

Exemplo:
- **Antes**: 1 grupo "CR39 1.50 Multifocal +UV" com lentes fotocromáticas E não-fotocromáticas
- **Depois**: 2 grupos separados:
  - "CR39 1.50 Multifocal +UV" (sem foto)
  - "CR39 1.50 Multifocal +UV +fotocromático" (com foto)

## 🚀 Como Executar

### Passo 1: Preparação
```sql
-- Verificar estado atual
SELECT COUNT(*) FROM lens_catalog.lentes WHERE ativo = true;
SELECT COUNT(*) FROM lens_catalog.grupos_canonicos WHERE ativo = true;
```

### Passo 2: Executar Re-canonização
```sql
-- Copiar e executar TODO o conteúdo de:
-- povoar_banco/99D_EXECUTAR_RE_CANONIZACAO_COMPLETA.sql
```

### Passo 3: Validar Resultado
O script já faz validação automática, mas você pode conferir:

```sql
-- Deve retornar 0
SELECT COUNT(*) as lentes_orfas
FROM lens_catalog.lentes
WHERE ativo = true AND grupo_canonico_id IS NULL;

-- Deve retornar 0
SELECT COUNT(*) as incompatibilidades
FROM lens_catalog.grupos_canonicos gc
JOIN lens_catalog.lentes l ON l.grupo_canonico_id = gc.id
WHERE gc.ativo = true AND l.ativo = true
  AND (
    l.ar != gc.tratamento_antirreflexo
    OR l.uv400 != gc.tratamento_uv
    OR l.blue != gc.tratamento_blue_light
    OR COALESCE(l.fotossensivel, 'nenhum') != COALESCE(gc.tratamento_fotossensiveis, 'nenhum')
  );
```

## ⏱️ Tempo de Execução

- **Backup**: instantâneo
- **Limpeza**: ~10 segundos
- **Re-canonização**: ~2-5 minutos
- **Validação**: ~30 segundos
- **Total**: ~3-6 minutos

## 🛡️ Segurança

### ✅ Proteções:
- Tudo dentro de uma transação `BEGIN...COMMIT`
- Backup automático em tabelas temporárias
- Se houver erro, faz `ROLLBACK` automático
- Validações durante o processo

### 🔙 Como Reverter (se necessário):
Se algo der errado, o `ROLLBACK` automático reverte tudo. Mas se precisar reverter manualmente depois:

```sql
BEGIN;
-- Restaurar associações
UPDATE lens_catalog.lentes l
SET grupo_canonico_id = b.grupo_canonico_id
FROM backup_lentes_associacoes b
WHERE l.id = b.id;
COMMIT;
```

## 📌 Após a Re-canonização

### 1. Remover Triggers Duplicados
```sql
-- Manter apenas o trigger correto
DROP TRIGGER IF EXISTS trg_lentes_associar_grupo ON lens_catalog.lentes;
DROP TRIGGER IF EXISTS trg_lentes_atualizar_estatisticas ON lens_catalog.lentes;

-- Manter: trg_lente_insert_update (está correto)
```

### 2. Documentar Mudança
Atualizar documentação sobre qual trigger está ativo.

### 3. Monitorar
Nas próximas semanas, verificar se novas lentes estão sendo canonizadas corretamente.

## 🎯 Critérios de Sucesso

### ✅ Tudo certo se:
1. **0 lentes órfãs** (todas têm grupo)
2. **0 incompatibilidades** (lentes no grupo certo)
3. **Estatísticas corretas** (total_lentes = count real)
4. **~600-700 grupos** (separados por tratamentos)

### ⚠️ Problema se:
1. Lentes órfãs > 0 → Trigger não funcionou
2. Incompatibilidades > 0 → Trigger errado ainda ativo
3. Grupos < 400 → Tratamentos não sendo considerados

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs/notices do script
2. Execute as queries de validação
3. Revise o código dos triggers ativos

## 🎓 Lições Aprendidas

1. **Não manter triggers duplicados** com lógicas diferentes
2. **Sempre validar** campos na canonização
3. **Testar mudanças** em ambiente de desenvolvimento
4. **Documentar** qual trigger está ativo e por quê

---

**Data de Criação:** 22/01/2026  
**Status:** ✅ Script pronto para execução  
**Prioridade:** 🔴 Alta (219 lentes incorretas)  
**Impacto:** ✅ Positivo (correção completa)
