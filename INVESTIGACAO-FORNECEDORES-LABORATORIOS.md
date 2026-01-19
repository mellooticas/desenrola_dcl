# 🔍 INVESTIGAÇÃO: Fornecedores/Laboratórios nos Dois Bancos

**Data:** 17 de Janeiro de 2026  
**Objetivo:** Verificar consistência de fornecedores/laboratórios entre SIS_Estoque e Desenrola DCL

---

## 📋 CHECKLIST DE INVESTIGAÇÃO

- [ ] Listar estrutura de tabelas em ambos os bancos
- [ ] Listar todos os fornecedores/laboratórios em SIS_Estoque
- [ ] Listar todos os fornecedores/laboratórios em Desenrola DCL
- [ ] Comparar dados entre os dois bancos
- [ ] Identificar divergências
- [ ] Definir estratégia de sincronização

---

## 🔧 SCRIPT 1: Investigar SIS_Estoque

Execute este script no banco **SIS_Estoque**:

```sql
-- ================================================================
-- INVESTIGAÇÃO SIS_ESTOQUE: Estrutura e Dados de Fornecedores
-- ================================================================

-- 1. Listar todas as tabelas relacionadas a fornecedores
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%fornecedor%'
ORDER BY tablename;

-- 2. Estrutura da tabela fornecedores
\d fornecedores

-- 3. Contar fornecedores
SELECT COUNT(*) as total_fornecedores FROM fornecedores;

-- 4. Listar TODOS os fornecedores com detalhes
SELECT
  id,
  nome,
  cnpj,
  tipo,
  status,
  ativo,
  created_at,
  updated_at
FROM fornecedores
ORDER BY nome;

-- 5. Verificar quais produtos estão vinculados a cada fornecedor
SELECT
  f.id,
  f.nome as fornecedor,
  COUNT(p.id) as total_produtos,
  STRING_AGG(DISTINCT p.tipo, ', ') as tipos_produto
FROM fornecedores f
LEFT JOIN produtos p ON f.id = p.fornecedor_id
GROUP BY f.id, f.nome
ORDER BY f.nome;

-- 6. Fornecedores com mais produtos
SELECT
  f.id,
  f.nome,
  COUNT(p.id) as total_produtos
FROM fornecedores f
LEFT JOIN produtos p ON f.id = p.fornecedor_id
GROUP BY f.id, f.nome
HAVING COUNT(p.id) > 0
ORDER BY COUNT(p.id) DESC;

-- 7. Verificar se há campo específico para "laboratórios"
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE '%lab%';

-- 8. Inspecionar todas as colunas da tabela fornecedores
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'fornecedores'
ORDER BY ordinal_position;

-- 9. Exportar dados em formato lista
\pset format unaligned
\pset fieldsep '|'
SELECT
  'FORNECEDOR' as tipo,
  id,
  nome,
  cnpj,
  tipo,
  status,
  ativo
FROM fornecedores
ORDER BY nome;
```

---

## 🔧 SCRIPT 2: Investigar Desenrola DCL

Execute este script no banco **Desenrola DCL**:

```sql
-- ================================================================
-- INVESTIGAÇÃO DESENROLA DCL: Estrutura e Dados de Laboratórios
-- ================================================================

-- 1. Listar tabelas relacionadas a laboratórios/fornecedores
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho
FROM pg_tables
WHERE schemaname = 'public'
  AND (tablename LIKE '%laboratorio%'
       OR tablename LIKE '%fornecedor%'
       OR tablename LIKE '%lab%')
ORDER BY tablename;

-- 2. Descrever tabela laboratorios (se existir)
\d laboratorios

-- 3. Descrever tabela fornecedores (se existir)
\d fornecedores

-- 4. Contar laboratórios
SELECT COUNT(*) as total_laboratorios FROM laboratorios;

-- 5. Listar TODOS os laboratórios com detalhes
SELECT
  id,
  nome,
  cnpj,
  tipo,
  status,
  ativo,
  created_at,
  updated_at
FROM laboratorios
ORDER BY nome;

-- 6. Verificar quais pedidos usam cada laboratório
SELECT
  l.id,
  l.nome as laboratorio,
  COUNT(pd.id) as total_pedidos,
  MAX(pd.created_at) as ultimo_pedido
FROM laboratorios l
LEFT JOIN pedidos pd ON l.id = pd.laboratorio_id
GROUP BY l.id, l.nome
ORDER BY l.nome;

-- 7. Laboratórios com mais pedidos
SELECT
  l.id,
  l.nome,
  COUNT(pd.id) as total_pedidos
FROM laboratorios l
LEFT JOIN pedidos pd ON l.id = pd.laboratorio_id
GROUP BY l.id, l.nome
HAVING COUNT(pd.id) > 0
ORDER BY COUNT(pd.id) DESC;

-- 8. Inspecionar todas as colunas da tabela laboratorios
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'laboratorios'
ORDER BY ordinal_position;

-- 9. Verificar se existe tabela fornecedores
SELECT EXISTS(
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'fornecedores'
) as existe_fornecedores;

-- 10. Exportar dados em formato lista
\pset format unaligned
\pset fieldsep '|'
SELECT
  'LABORATORIO' as tipo,
  id,
  nome,
  cnpj,
  tipo,
  status,
  ativo
FROM laboratorios
ORDER BY nome;
```

---

## 📊 SCRIPT 3: Comparação Lado a Lado

Depois de coletar dados de ambos os bancos, crie um arquivo CSV/TXT com esta estrutura:

```
COMPARAÇÃO FORNECEDORES/LABORATÓRIOS

SIS_ESTOQUE (Fornecedores):
ID | NOME | CNPJ | TIPO | STATUS | ATIVO

DESENROLA DCL (Laboratórios):
ID | NOME | CNPJ | TIPO | STATUS | ATIVO

DIVERGÊNCIAS ENCONTRADAS:
- [Listar aqui]

RECOMENDAÇÕES:
- [Colocar recomendações aqui]
```

---

## 🔍 ANÁLISE ESPERADA

### **Possíveis Cenários:**

#### **Cenário A: Tabelas Diferentes**

```
SIS_Estoque: fornecedores
Desenrola:   laboratorios
→ Problema: Nomes diferentes
→ Solução: Criar VIEW ou mapeamento
```

#### **Cenário B: Dados Diferentes**

```
SIS_Estoque tem: Laboratorio A, B, C, D
Desenrola tem:   Laboratorio A, B, E, F
→ Problema: Inconsistência nos dados
→ Solução: Sincronizar dados antes de integrar
```

#### **Cenário C: Estrutura Diferente**

```
SIS_Estoque: fornecedores com (id, nome, cnpj, tipo)
Desenrola:   laboratorios com (id, nome, email, telefone)
→ Problema: Colunas diferentes
→ Solução: Fazer mapeamento de campos
```

#### **Cenário D: Falta de Dados**

```
SIS_Estoque: Tem laboratórios cadastrados
Desenrola:   Laboratorios vazio
→ Problema: Dados não foram migrados
→ Solução: Popular laboratorios com dados de SIS_Estoque
```

---

## 📝 CHECKLIST DO QUE COLETAR

Para cada banco, documente:

### **Estrutura:**

- [ ] Nome da tabela (fornecedores vs laboratorios)
- [ ] Colunas disponíveis
- [ ] Tipos de dados
- [ ] Constraints e relacionamentos

### **Dados:**

- [ ] Total de registros
- [ ] Lista completa de nomes
- [ ] CNPJs disponíveis
- [ ] Status/Ativo flag
- [ ] Campos customizados

### **Integridade:**

- [ ] Duplicatas?
- [ ] Registros com NULL?
- [ ] Fk's órfãs?
- [ ] Data de criação/atualização

---

## 🚨 PROBLEMAS CONHECIDOS EM INTEGRAÇÕES

Cuidado com:

- ❌ IDs diferentes entre bancos (UUIDs vs INT)
- ❌ Nomes de tabelas inconsistentes
- ❌ Colunas faltando
- ❌ Dados desatualizados
- ❌ Soft deletes (ativo=false)
- ❌ Typos em nomes (Laboratorio vs Laboratorio)

---

## ✅ PRÓXIMOS PASSOS

1. **Execute os scripts** em ambos os bancos
2. **Documente os resultados** em um arquivo
3. **Compare os dados** lado a lado
4. **Identifique divergências**
5. **Crie plano de sincronização**
6. **Volta para integração** com base nos dados reais

---

**Depois de investigar, vamos voltar ao plano de integração com informações reais! 🔍**
