# 🛠️ Guia de Manutenção - Sistema de Canonização

## 📋 Índice

1. [Tarefas do Dia a Dia](#tarefas-do-dia-a-dia)
2. [Adicionar Novas Lentes](#adicionar-novas-lentes)
3. [Adicionar Novas Marcas](#adicionar-novas-marcas)
4. [Verificações de Saúde](#verificações-de-saúde)
5. [Re-canonização](#re-canonização)
6. [Troubleshooting](#troubleshooting)
7. [Scripts Úteis](#scripts-úteis)

---

## 🔄 Tarefas do Dia a Dia

### ✅ Checklist Diário

```bash
# 1. Verificar lentes órfãs (sem grupo)
psql -f verificacoes/check_orfas.sql

# 2. Verificar inconsistências
psql -f verificacoes/check_inconsistencias.sql

# 3. Ver estatísticas gerais
psql -f verificacoes/stats_grupos.sql
```

### 📊 Verificação Rápida

Execute no psql ou DBeaver:

```sql
-- Status geral do sistema
SELECT 
  (SELECT COUNT(*) FROM lens_catalog.lentes WHERE ativo = true) as total_lentes,
  (SELECT COUNT(*) FROM lens_catalog.grupos_canonicos WHERE ativo = true) as total_grupos,
  (SELECT COUNT(*) FROM lens_catalog.lentes WHERE ativo = true AND grupo_canonico_id IS NULL) as lentes_orfas;
```

**Resultado esperado:**
```
total_lentes | total_grupos | lentes_orfas
-------------|--------------|-------------
    1411     |     234      |      0
```

---

## ➕ Adicionar Novas Lentes

### 🤖 Processo Automático (Recomendado)

O sistema **canoniza automaticamente** quando você insere uma lente:

```sql
INSERT INTO lens_catalog.lentes (
  nome_lente,
  marca_id,
  fornecedor_id,
  tipo_lente,
  material,
  indice_refracao,
  categoria,
  esferico_min,
  esferico_max,
  cilindrico_min,
  cilindrico_max,
  ar,
  uv400,
  fotossensivel,
  preco_venda_sugerido,
  ativo
) VALUES (
  'Lente Policarbonato 1.59 AR+UV',
  'uuid-marca-essilor',        -- ← is_premium será buscado automaticamente
  'uuid-fornecedor',
  'visao_simples',
  'POLICARBONATO',
  '1.59',
  'premium',
  -6.00,
  4.00,
  -2.00,
  0.00,
  true,                        -- antirreflexo
  true,                        -- uv400
  'nenhum',
  250.00,
  true
);
```

**O que acontece automaticamente:**

1. ✅ Trigger `trg_lente_insert_update` dispara
2. ✅ Busca `is_premium` da marca Essilor → `true`
3. ✅ Converte `fotossensivel` se necessário
4. ✅ Procura grupo existente com os 16 critérios
5. ✅ Se não existir, **cria novo grupo premium**
6. ✅ Atribui `grupo_canonico_id` à lente
7. ✅ Atualiza estatísticas do grupo

### 🔍 Verificar Resultado

```sql
-- Ver a lente e seu grupo
SELECT 
  l.nome_lente,
  gc.nome_grupo,
  gc.is_premium,
  gc.total_lentes,
  gc.preco_medio
FROM lens_catalog.lentes l
JOIN lens_catalog.grupos_canonicos gc ON gc.id = l.grupo_canonico_id
WHERE l.id = 'uuid-da-lente-inserida';
```

### ⚠️ Importação em Massa

Para inserir muitas lentes de uma vez (ex: CSV):

```sql
-- Desabilitar trigger temporariamente (CUIDADO!)
ALTER TABLE lens_catalog.lentes DISABLE TRIGGER trg_lente_insert_update;

-- Importar lentes
\copy lens_catalog.lentes FROM 'lentes.csv' WITH CSV HEADER;

-- Reabilitar trigger
ALTER TABLE lens_catalog.lentes ENABLE TRIGGER trg_lente_insert_update;

-- Canonizar todas as importadas
UPDATE lens_catalog.lentes
SET updated_at = NOW()
WHERE grupo_canonico_id IS NULL AND ativo = true;
```

---

## 🏷️ Adicionar Novas Marcas

### 1. Inserir Marca

```sql
INSERT INTO lens_catalog.marcas (nome, slug, is_premium, ativo)
VALUES ('Nova Marca Premium', 'nova-marca-premium', true, true);
```

### 2. Definir se é Premium

**Marcas Premium** (geralmente):
- Essilor / Varilux
- Zeiss
- Hoya
- Transitions
- Crizal

**Marcas Standard** (geralmente):
- Marcas genéricas
- Marcas econômicas
- Marcas regionais

```sql
-- Marcar como premium
UPDATE lens_catalog.marcas
SET is_premium = true
WHERE UPPER(nome) LIKE '%ESSILOR%'
   OR UPPER(nome) LIKE '%ZEISS%'
   OR UPPER(nome) LIKE '%HOYA%';

-- Marcar como standard
UPDATE lens_catalog.marcas
SET is_premium = false
WHERE UPPER(nome) LIKE '%GENERIC%'
   OR UPPER(nome) LIKE '%ECONOLENS%';
```

### 3. Verificar Impacto

```sql
-- Quantas lentes serão afetadas?
SELECT 
  m.nome,
  m.is_premium,
  COUNT(l.id) as total_lentes
FROM lens_catalog.marcas m
LEFT JOIN lens_catalog.lentes l ON l.marca_id = m.id AND l.ativo = true
WHERE m.nome = 'Nova Marca Premium'
GROUP BY m.nome, m.is_premium;
```

### 4. Re-canonizar Lentes da Marca (se necessário)

Se a marca já tinha lentes e você mudou `is_premium`:

```sql
-- Re-processar lentes desta marca
UPDATE lens_catalog.lentes l
SET updated_at = NOW(),
    grupo_canonico_id = NULL  -- Força re-canonização
WHERE l.marca_id = (SELECT id FROM lens_catalog.marcas WHERE nome = 'Nova Marca Premium')
  AND l.ativo = true;
```

---

## 🔍 Verificações de Saúde

### Script 99X - Verificação Completa

```bash
psql -f povoar_banco/99X_VERIFICAR_MARCAS_PREMIUM.sql
```

**O que verifica:**
- ✅ Lentes sem `marca_id`
- ✅ Marcas sem `is_premium` definido
- ✅ Distribuição premium/standard
- ✅ Lentes por marca

**Resultado esperado:**
```
✅ TODAS as lentes têm marca definida
✅ TODAS as marcas têm is_premium definido
✅ TUDO OK - Pode continuar operando normalmente
```

### Script 99Y - Verificação Rápida

```bash
psql -f povoar_banco/99Y_VERIFICAR_MARCAS_PREMIUM_RAPIDO.sql
```

Verificação rápida de 1-2 segundos.

### Script 99Z - Diagnóstico de Marcas

```bash
psql -f povoar_banco/99Z_DIAGNOSTICO_MARCAS_PREMIUM.sql
```

**Mostra:**
- Total de marcas premium vs standard
- Lista todas as marcas com contagem de lentes
- Sugestões de marcas que deveriam ser premium

---

## 🔄 Re-canonização

### Quando Re-canonizar?

Re-canonização completa é necessária quando:

- ✅ Mudou critérios de agrupamento
- ✅ Alterou `is_premium` de múltiplas marcas
- ✅ Corrigiu dados em massa
- ✅ Detectou muitas inconsistências

### Processo de Re-canonização

**⚠️ ATENÇÃO:** Re-canonização deleta TODOS os grupos e recria. Execute em horário de baixo tráfego.

#### Passo 1: Backup

```sql
-- Criar tabela de backup dos grupos atuais
CREATE TABLE grupos_canonicos_backup_20260122 AS 
SELECT * FROM lens_catalog.grupos_canonicos;

-- Criar tabela de backup das associações
CREATE TABLE lentes_grupos_backup_20260122 AS
SELECT id, grupo_canonico_id FROM lens_catalog.lentes;
```

#### Passo 2: Atualizar Funções (se necessário)

```bash
psql -f povoar_banco/99V_INCLUIR_PREMIUM_CANONIZACAO.sql
```

#### Passo 3: Executar Re-canonização

```bash
psql -f povoar_banco/99W_RE_CANONIZAR_COM_PREMIUM.sql
```

**O que o script faz:**

1. ✅ Remove trigger temporariamente
2. ✅ Seta todos `grupo_canonico_id = NULL`
3. ✅ Deleta todos os grupos antigos
4. ✅ Recria o trigger
5. ✅ Força UPDATE em todas as lentes (dispara canonização)
6. ✅ Mostra estatísticas finais

#### Passo 4: Validar Resultado

```sql
-- Deve retornar 0
SELECT COUNT(*) as lentes_orfas
FROM lens_catalog.lentes
WHERE ativo = true AND grupo_canonico_id IS NULL;

-- Ver estatísticas
SELECT 
  is_premium,
  COUNT(*) as total_grupos,
  SUM(total_lentes) as lentes_agrupadas
FROM lens_catalog.grupos_canonicos
WHERE ativo = true
GROUP BY is_premium;
```

**Resultado esperado:**
```
is_premium | total_grupos | lentes_agrupadas
-----------|--------------|------------------
   false   |     192      |       1163
   true    |      42      |        248
```

---

## 🚨 Troubleshooting

### Problema 1: Lentes Órfãs

**Sintoma:**
```sql
SELECT COUNT(*) FROM lens_catalog.lentes 
WHERE ativo = true AND grupo_canonico_id IS NULL;
-- Resultado: > 0
```

**Solução:**

```sql
-- Verificar se trigger está ativo
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'lens_catalog.lentes'::regclass
  AND tgname = 'trg_lente_insert_update';

-- Se tgenabled = 'D' (disabled), reativar:
ALTER TABLE lens_catalog.lentes 
ENABLE TRIGGER trg_lente_insert_update;

-- Forçar re-processamento
UPDATE lens_catalog.lentes
SET updated_at = NOW()
WHERE grupo_canonico_id IS NULL AND ativo = true;
```

### Problema 2: Marca sem is_premium

**Sintoma:**
```sql
SELECT COUNT(*) FROM lens_catalog.marcas 
WHERE ativo = true AND is_premium IS NULL;
-- Resultado: > 0
```

**Solução:**

```sql
-- Listar marcas problemáticas
SELECT nome, COUNT(l.id) as total_lentes
FROM lens_catalog.marcas m
LEFT JOIN lens_catalog.lentes l ON l.marca_id = m.id
WHERE m.is_premium IS NULL
GROUP BY m.nome;

-- Definir is_premium para cada marca
UPDATE lens_catalog.marcas
SET is_premium = false  -- ou true, conforme o caso
WHERE nome = 'Nome da Marca';

-- Re-canonizar lentes afetadas
UPDATE lens_catalog.lentes l
SET updated_at = NOW(), grupo_canonico_id = NULL
WHERE l.marca_id IN (
  SELECT id FROM lens_catalog.marcas WHERE nome = 'Nome da Marca'
);
```

### Problema 3: Incompatibilidades Fotossensíveis

**Sintoma:**
```sql
-- Grupos com lentes de fotossensível diferente
SELECT gc.nome_grupo, 
       STRING_AGG(DISTINCT l.fotossensivel, ', ') as variacoes
FROM lens_catalog.grupos_canonicos gc
JOIN lens_catalog.lentes l ON l.grupo_canonico_id = gc.id
WHERE l.ativo = true
GROUP BY gc.id, gc.nome_grupo
HAVING COUNT(DISTINCT l.fotossensivel) > 1;
```

**Solução:**

Isso **NÃO DEVE ACONTECER** com o sistema atual. Se acontecer:

```sql
-- 1. Verificar função de conversão
SELECT 
  fotossensivel,
  CASE 
    WHEN fotossensivel = 'fotocromático' THEN 'fotocromático'
    WHEN fotossensivel IN ('transitions', 'xtractive', 'acclimates', 
                           'sunsync', 'sensity', 'polarizado') THEN 'fotocromático'
    ELSE 'nenhum'
  END as convertido
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY fotossensivel;

-- 2. Re-canonizar forçadamente
\i povoar_banco/99W_RE_CANONIZAR_COM_PREMIUM.sql
```

### Problema 4: Grupos Duplicados

**Sintoma:**
```sql
-- Mesmas características, múltiplos grupos
SELECT 
  tipo_lente, material, is_premium,
  COUNT(*) as duplicatas
FROM lens_catalog.grupos_canonicos
WHERE ativo = true
GROUP BY tipo_lente, material, indice_refracao, is_premium,
         grau_esferico_min, grau_esferico_max
HAVING COUNT(*) > 1;
```

**Solução:**

```sql
-- Re-canonizar (vai consolidar)
\i povoar_banco/99W_RE_CANONIZAR_COM_PREMIUM.sql
```

---

## 📜 Scripts Úteis

### Queries de Diagnóstico

```sql
-- 1. Grupos mais populares
SELECT 
  nome_grupo,
  is_premium,
  total_lentes,
  total_marcas,
  preco_medio
FROM lens_catalog.grupos_canonicos
WHERE ativo = true
ORDER BY total_lentes DESC
LIMIT 20;

-- 2. Marcas com mais lentes
SELECT 
  m.nome,
  m.is_premium,
  COUNT(l.id) as total_lentes
FROM lens_catalog.marcas m
LEFT JOIN lens_catalog.lentes l ON l.marca_id = m.id AND l.ativo = true
GROUP BY m.nome, m.is_premium
ORDER BY total_lentes DESC;

-- 3. Distribuição de lentes por tipo e premium
SELECT 
  gc.tipo_lente,
  gc.is_premium,
  COUNT(DISTINCT gc.id) as grupos,
  COUNT(l.id) as lentes
FROM lens_catalog.grupos_canonicos gc
LEFT JOIN lens_catalog.lentes l ON l.grupo_canonico_id = gc.id AND l.ativo = true
WHERE gc.ativo = true
GROUP BY gc.tipo_lente, gc.is_premium
ORDER BY gc.tipo_lente, gc.is_premium DESC;

-- 4. Grupos sem lentes (para limpar)
SELECT 
  id,
  nome_grupo,
  total_lentes
FROM lens_catalog.grupos_canonicos
WHERE ativo = true AND total_lentes = 0;

-- 5. Lentes com preço muito diferente do grupo
SELECT 
  l.nome_lente,
  l.preco_venda_sugerido,
  gc.preco_medio,
  gc.preco_minimo,
  gc.preco_maximo
FROM lens_catalog.lentes l
JOIN lens_catalog.grupos_canonicos gc ON gc.id = l.grupo_canonico_id
WHERE l.ativo = true
  AND l.preco_venda_sugerido > gc.preco_medio * 2;  -- Preço > 2x média
```

### Scripts de Limpeza

```sql
-- Desativar grupos vazios
UPDATE lens_catalog.grupos_canonicos
SET ativo = false
WHERE total_lentes = 0;

-- Recalcular estatísticas de todos os grupos
SELECT lens_catalog.atualizar_estatisticas_grupo_canonico(id)
FROM lens_catalog.grupos_canonicos
WHERE ativo = true;

-- Limpar lentes inativas órfãs
UPDATE lens_catalog.lentes
SET grupo_canonico_id = NULL
WHERE ativo = false;
```

---

## 📞 Suporte

### Erros Comuns e Soluções Rápidas

| Erro | Causa | Solução |
|------|-------|---------|
| `null value in column "grupo_canonico_id"` | Trigger desabilitado | Reabilitar trigger |
| `unique violation: nome_grupo` | Concorrência | Re-canonizar |
| `marca_id não encontrado` | FK inválida | Criar marca primeiro |
| `is_premium NULL` | Marca sem definição | Definir is_premium |

### Logs

Para debug avançado:

```sql
-- Habilitar logs detalhados
SET client_min_messages TO DEBUG;

-- Executar operação
INSERT INTO lens_catalog.lentes (...) VALUES (...);

-- Ver logs no servidor PostgreSQL
```

---

## 📚 Documentação Relacionada

- **Sistema Técnico:** `CANONIZACAO_SISTEMA.md`
- **Scripts SQL:** `/povoar_banco/99*.sql`
- **Views:** `/docs/database/views/`

---

**Última atualização:** 22/01/2026  
**Versão:** 2.0  
**Responsável:** Equipe de Desenvolvimento SIS Lens
