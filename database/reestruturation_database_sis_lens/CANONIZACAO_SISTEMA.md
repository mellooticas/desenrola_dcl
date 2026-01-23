# 📚 Sistema de Canonização de Lentes

## 🎯 Visão Geral

O sistema de canonização agrupa lentes com características técnicas idênticas em **grupos canônicos**, permitindo:
- Comparação de preços entre fornecedores/marcas
- Identificação de alternativas equivalentes
- Organização lógica do catálogo
- Separação entre produtos premium e standard

## 🏗️ Estrutura

### Tabela: `grupos_canonicos`

Armazena os grupos de lentes equivalentes.

```sql
CREATE TABLE lens_catalog.grupos_canonicos (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE,
  nome_grupo TEXT UNIQUE,
  
  -- Características técnicas (16 critérios)
  tipo_lente tipo_lente,
  material material_lente,
  indice_refracao indice_refracao,
  categoria_predominante categoria_lente,
  grau_esferico_min NUMERIC,
  grau_esferico_max NUMERIC,
  grau_cilindrico_min NUMERIC,
  grau_cilindrico_max NUMERIC,
  adicao_min NUMERIC,
  adicao_max NUMERIC,
  tratamento_antirreflexo BOOLEAN,
  tratamento_antirrisco BOOLEAN,
  tratamento_uv BOOLEAN,
  tratamento_blue_light BOOLEAN,
  tratamento_fotossensiveis TEXT,
  is_premium BOOLEAN,              -- 16º CRITÉRIO (NOVO)
  
  -- Estatísticas do grupo
  preco_minimo NUMERIC,
  preco_maximo NUMERIC,
  preco_medio NUMERIC,
  total_lentes INTEGER,
  total_marcas INTEGER,
  peso INTEGER,
  ativo BOOLEAN
);
```

### Relação: `lentes → grupos_canonicos`

Cada lente ativa deve estar associada a um grupo canônico:

```sql
ALTER TABLE lens_catalog.lentes
ADD COLUMN grupo_canonico_id UUID 
REFERENCES lens_catalog.grupos_canonicos(id);
```

---

## ⚙️ Funcionamento Automático

### 1. Trigger Principal

Quando uma lente é inserida ou atualizada, o trigger executa automaticamente:

```sql
CREATE TRIGGER trg_lente_insert_update
  BEFORE INSERT OR UPDATE ON lens_catalog.lentes
  FOR EACH ROW
  EXECUTE FUNCTION lens_catalog.trigger_atualizar_grupo_canonico();
```

### 2. Função `trigger_atualizar_grupo_canonico()`

**Fluxo:**

```
┌─────────────────────────────────────┐
│ INSERT/UPDATE em lentes             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ grupo_canonico_id IS NULL?          │
└──────────────┬──────────────────────┘
               │ SIM
               ▼
┌─────────────────────────────────────┐
│ Buscar is_premium da marca          │
│ SELECT is_premium FROM marcas       │
│ WHERE id = NEW.marca_id             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Converter fotossensível TEXT→ENUM   │
│ transitions/acclimates→fotocromático│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Chamar encontrar_ou_criar_grupo()   │
│ com 16 parâmetros                   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Atribuir grupo_canonico_id          │
│ Atualizar estatísticas              │
└─────────────────────────────────────┘
```

**Código:**

```sql
CREATE OR REPLACE FUNCTION lens_catalog.trigger_atualizar_grupo_canonico()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_grupo_id UUID;
  v_marca_is_premium BOOLEAN;
  v_fotossensivel_enum lens_catalog.tratamento_foto;
BEGIN
  IF NEW.grupo_canonico_id IS NULL THEN
    
    -- 1. Buscar is_premium da marca
    SELECT is_premium INTO v_marca_is_premium
    FROM lens_catalog.marcas
    WHERE id = NEW.marca_id;
    
    -- 2. Converter fotossensível
    IF NEW.fotossensivel = 'fotocromático' THEN
      v_fotossensivel_enum := 'fotocromático'::lens_catalog.tratamento_foto;
    ELSIF NEW.fotossensivel IN ('transitions', 'xtractive', 'acclimates', 
                                 'sunsync', 'sensity', 'polarizado') THEN
      v_fotossensivel_enum := 'fotocromático'::lens_catalog.tratamento_foto;
    ELSE
      v_fotossensivel_enum := 'nenhum'::lens_catalog.tratamento_foto;
    END IF;
    
    -- 3. Encontrar ou criar grupo
    v_grupo_id := lens_catalog.encontrar_ou_criar_grupo_canonico(
      NEW.tipo_lente,
      NEW.material,
      NEW.indice_refracao,
      NEW.categoria,
      NEW.esferico_min,
      NEW.esferico_max,
      NEW.cilindrico_min,
      NEW.cilindrico_max,
      NEW.adicao_min,
      NEW.adicao_max,
      COALESCE(NEW.ar, false),
      COALESCE(NEW.antirrisco, false),
      COALESCE(NEW.uv400, false),
      COALESCE(NEW.blue, false),
      v_fotossensivel_enum,
      COALESCE(v_marca_is_premium, false)  -- 16º parâmetro
    );
    
    -- 4. Atribuir grupo
    NEW.grupo_canonico_id := v_grupo_id;
    
    -- 5. Atualizar estatísticas
    PERFORM lens_catalog.atualizar_estatisticas_grupo_canonico(v_grupo_id);
  END IF;
  
  RETURN NEW;
END;
$$;
```

### 3. Função `encontrar_ou_criar_grupo_canonico()`

**Responsabilidades:**
1. Buscar grupo existente com os 16 critérios
2. Se não existir, criar novo grupo
3. Retornar o ID do grupo

**Lógica de Busca:**

```sql
SELECT id INTO v_grupo_id
FROM lens_catalog.grupos_canonicos
WHERE tipo_lente = p_tipo_lente
  AND material = p_material
  AND indice_refracao = p_indice
  AND categoria_predominante = p_categoria
  AND grau_esferico_min = p_esferico_min
  AND grau_esferico_max = p_esferico_max
  AND grau_cilindrico_min = p_cilindrico_min
  AND grau_cilindrico_max = p_cilindrico_max
  AND COALESCE(adicao_min, 0) = COALESCE(p_adicao_min, 0)
  AND COALESCE(adicao_max, 0) = COALESCE(p_adicao_max, 0)
  AND tratamento_antirreflexo = p_tem_ar
  AND tratamento_antirrisco = p_tem_antirrisco
  AND tratamento_uv = p_tem_uv
  AND tratamento_blue_light = p_tem_blue
  AND COALESCE(tratamento_fotossensiveis, 'nenhum') = COALESCE(p_tratamento_foto::TEXT, 'nenhum')
  AND is_premium = p_is_premium                    -- CRITÉRIO CRUCIAL
LIMIT 1;
```

**Geração do Nome do Grupo:**

```sql
v_nome_grupo := 'Lente ' || p_material || ' ' || p_indice || ' ' || 
                REPLACE(INITCAP(p_tipo_lente::TEXT), '_', ' ');

IF p_tem_ar THEN v_nome_grupo := v_nome_grupo || ' +AR'; END IF;
IF p_tem_uv THEN v_nome_grupo := v_nome_grupo || ' +UV'; END IF;
IF p_tem_blue THEN v_nome_grupo := v_nome_grupo || ' +BlueLight'; END IF;
IF p_tratamento_foto != 'nenhum' THEN 
  v_nome_grupo := v_nome_grupo || ' +' || INITCAP(p_tratamento_foto::TEXT);
END IF;
IF p_is_premium THEN v_nome_grupo := v_nome_grupo || ' [PREMIUM]'; END IF;

v_nome_grupo := v_nome_grupo || ' [' || 
                p_esferico_min || '/' || p_esferico_max || ' | ' ||
                p_cilindrico_min || '/' || p_cilindrico_max || ']';
```

**Exemplo de Nome Gerado:**
```
Lente POLICARBONATO 1.59 Visao Simples +AR +UV [PREMIUM] [-6.00/4.00 | -2.00/0.00]
```

**Tratamento de Duplicatas:**

```sql
BEGIN
  INSERT INTO lens_catalog.grupos_canonicos (...) VALUES (...);
EXCEPTION WHEN unique_violation THEN
  -- Se slug ou nome_grupo já existe, buscar e reativar
  SELECT id INTO v_grupo_id
  FROM lens_catalog.grupos_canonicos
  WHERE nome_grupo = v_nome_grupo OR slug = v_slug
  LIMIT 1;
  
  UPDATE lens_catalog.grupos_canonicos
  SET ativo = true
  WHERE id = v_grupo_id AND ativo = false;
END;
```

---

## 🎨 Separação Premium/Standard

### Conceito

Lentes com **mesmas características técnicas** mas de **marcas diferentes** (premium vs standard) são agrupadas **separadamente**.

**Exemplo:**
```
Grupo Standard:
  Lente POLICARBONATO 1.59 +AR +UV [-6.00/4.00 | -2.00/0.00]
  → Marcas: GenericLens, BasicVision, EconoLens
  
Grupo Premium:
  Lente POLICARBONATO 1.59 +AR +UV [PREMIUM] [-6.00/4.00 | -2.00/0.00]
  → Marcas: Essilor, Zeiss, Hoya, Varilux
```

### Marcas Premium Definidas

As seguintes marcas estão configuradas com `is_premium = true`:

- **Essilor** e linha Varilux
- **Zeiss**
- **Hoya**
- **Transitions** (tecnologia fotocromática premium)
- **Crizal** (tratamentos premium Essilor)

### Configuração

```sql
-- Definir marcas premium
UPDATE lens_catalog.marcas 
SET is_premium = true 
WHERE UPPER(nome) SIMILAR TO '%(ESSILOR|ZEISS|HOYA|VARILUX|TRANSITIONS|CRIZAL)%';

-- Verificar
SELECT nome, is_premium, COUNT(l.id) as total_lentes
FROM lens_catalog.marcas m
LEFT JOIN lens_catalog.lentes l ON l.marca_id = m.id
GROUP BY m.nome, m.is_premium
ORDER BY total_lentes DESC;
```

---

## 📊 Estatísticas do Sistema

### Resultados Atuais

**Re-canonização executada em:** 22/01/2026

```
Total de lentes ativas:           1411
Total de grupos canônicos:        234
  ├─ Grupos Standard:             192
  └─ Grupos Premium:              42

Lentes órfãs (sem grupo):         0
Incompatibilidades fotossensíveis: 0

Taxa de sucesso:                  100%
```

### Distribuição por Tipo

```sql
SELECT 
  tipo_lente,
  is_premium,
  COUNT(*) as total_grupos,
  SUM(total_lentes) as lentes_agrupadas
FROM lens_catalog.grupos_canonicos
WHERE ativo = true
GROUP BY tipo_lente, is_premium
ORDER BY tipo_lente, is_premium DESC;
```

---

## 🔧 Manutenção

### Estatísticas dos Grupos

A função `atualizar_estatisticas_grupo_canonico()` recalcula:

```sql
UPDATE lens_catalog.grupos_canonicos gc
SET 
  total_lentes = (SELECT COUNT(*) FROM lentes WHERE grupo_canonico_id = gc.id),
  total_marcas = (SELECT COUNT(DISTINCT marca_id) FROM lentes WHERE grupo_canonico_id = gc.id),
  preco_minimo = (SELECT MIN(preco_venda_sugerido) FROM lentes WHERE grupo_canonico_id = gc.id),
  preco_maximo = (SELECT MAX(preco_venda_sugerido) FROM lentes WHERE grupo_canonico_id = gc.id),
  preco_medio = (SELECT AVG(preco_venda_sugerido) FROM lentes WHERE grupo_canonico_id = gc.id)
WHERE id = p_grupo_id;
```

### Re-canonização Completa

Quando necessário (mudanças estruturais):

```sql
-- 1. Atualizar funções (se houve mudanças)
\i 99V_INCLUIR_PREMIUM_CANONIZACAO.sql

-- 2. Re-processar todas as lentes
\i 99W_RE_CANONIZAR_COM_PREMIUM.sql
```

---

## 🚨 Problemas Comuns

### 1. Lentes sem grupo (órfãs)

**Diagnóstico:**
```sql
SELECT COUNT(*) 
FROM lens_catalog.lentes 
WHERE ativo = true AND grupo_canonico_id IS NULL;
```

**Solução:**
```sql
-- Forçar re-processamento
UPDATE lens_catalog.lentes
SET updated_at = NOW()
WHERE ativo = true AND grupo_canonico_id IS NULL;
```

### 2. Incompatibilidades Fotossensíveis

**Verificar:**
```sql
SELECT 
  gc.nome_grupo,
  gc.tratamento_fotossensiveis as grupo_foto,
  COUNT(DISTINCT l.fotossensivel) as variacao_foto,
  STRING_AGG(DISTINCT l.fotossensivel, ', ') as valores_lentes
FROM lens_catalog.grupos_canonicos gc
JOIN lens_catalog.lentes l ON l.grupo_canonico_id = gc.id
WHERE l.ativo = true
GROUP BY gc.id, gc.nome_grupo, gc.tratamento_fotossensiveis
HAVING COUNT(DISTINCT l.fotossensivel) > 1;
```

**Status Atual:** ✅ 0 incompatibilidades

### 3. Duplicatas de Grupos

Causado por concorrência ou problemas no unique_violation handler.

**Diagnosticar:**
```sql
SELECT 
  tipo_lente, material, indice_refracao, is_premium,
  COUNT(*) as duplicatas
FROM lens_catalog.grupos_canonicos
WHERE ativo = true
GROUP BY tipo_lente, material, indice_refracao, categoria_predominante,
         grau_esferico_min, grau_esferico_max, grau_cilindrico_min, 
         grau_cilindrico_max, tratamento_antirreflexo, tratamento_antirrisco,
         tratamento_uv, tratamento_blue_light, tratamento_fotossensiveis, is_premium
HAVING COUNT(*) > 1;
```

---

## 📈 Métricas de Performance

### Velocidade

- Inserção de lente: ~50-100ms (incluindo canonização)
- Busca de grupo existente: ~5-10ms
- Criação de novo grupo: ~20-30ms
- Re-canonização completa (1411 lentes): ~15-20 segundos

### Índices Recomendados

```sql
-- Índice composto para busca rápida de grupos
CREATE INDEX idx_grupos_busca ON lens_catalog.grupos_canonicos (
  tipo_lente, material, indice_refracao, is_premium, ativo
);

-- Índice para lentes por grupo
CREATE INDEX idx_lentes_grupo ON lens_catalog.lentes (grupo_canonico_id)
WHERE ativo = true;
```

---

## 🔗 Referências

- **Scripts:** `/povoar_banco/99V_*.sql` e `/povoar_banco/99W_*.sql`
- **Views:** `v_grupos_canonicos`, `v_lentes`
- **Funções:** `encontrar_ou_criar_grupo_canonico()`, `trigger_atualizar_grupo_canonico()`
- **Guia de Manutenção:** `GUIA_MANUTENCAO.md`

---

**Última atualização:** 22/01/2026  
**Versão:** 2.0 (com separação premium/standard)
