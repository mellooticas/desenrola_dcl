# 📊 RESULTADOS DAS CONSULTAS - VERIFICAÇÃO DE MISSÕES

**Arquivo**: `docs/database/01-resultados-verificacao-missoes.md`  
**SQL Source**: `docs/sql-queries/01-verificacao-missoes.sql`  
**Data de Execução**: 18/09/2025 23:45 UTC  

---

## 📋 CONSULTA 1: CONTAGEM GERAL DE MISSÕES POR STATUS

```sql
SELECT COUNT(*) as total_missoes_diarias,
       COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
       COUNT(CASE WHEN status = 'executando' THEN 1 END) as executando,
       COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
       COUNT(CASE WHEN status = 'pausada' THEN 1 END) as pausadas
FROM missoes_diarias;
```

**RESULTADO:**
| total_missoes_diarias | pendentes | executando | concluidas | pausadas |
| --------------------- | --------- | ---------- | ---------- | -------- |
| 217                   | 216       | 0          | 1          | 0        |

---

## 📅 CONSULTA 2: MISSÕES POR DATA

```sql
SELECT data_missao, COUNT(*) as total_missoes,
       COUNT(CASE WHEN status = 'concluida' THEN 1 END) as concluidas,
       ROUND(COUNT(CASE WHEN status = 'concluida' THEN 1 END) * 100.0 / COUNT(*), 2) as percentual_conclusao
FROM missoes_diarias 
WHERE data_missao >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY data_missao ORDER BY data_missao DESC;
```

**RESULTADO:**
| data_missao | total_missoes | concluidas | percentual_conclusao |
| ----------- | ------------- | ---------- | -------------------- |
| 2025-09-18  | 217           | 1          | 0.46                 |

---

## 🏷️ CONSULTA 3: TEMPLATES POR CATEGORIA

```sql
SELECT categoria, COUNT(*) as por_categoria,
       COUNT(CASE WHEN ativo = true THEN 1 END) as templates_ativos
FROM missao_templates 
GROUP BY categoria ORDER BY por_categoria DESC;
```

**RESULTADO:**
| categoria   | por_categoria | templates_ativos |
| ----------- | ------------- | ---------------- |
| limpeza     | 9             | 9                |
| vendas      | 7             | 7                |
| atendimento | 7             | 7                |
| sistemas    | 4             | 4                |
| estoque     | 4             | 4                |
| comunicacao | 1             | 1                |

**TOTAL: 32 templates ativos**

---

## 🔗 CONSULTA 4: MISSÕES HOJE COM RELACIONAMENTOS

```sql
SELECT md.id, md.data_missao, md.status, mt.nome as nome_missao,
       mt.categoria, l.nome as loja, l.codigo as codigo_loja
FROM missoes_diarias md
JOIN missao_templates mt ON md.template_id = mt.id
JOIN lojas l ON md.loja_id = l.id
WHERE md.data_missao = CURRENT_DATE;
```

**RESULTADO:** *(Nenhum resultado - problema de fuso horário identificado)*

---

## ✅ CONSULTA 5: INTEGRIDADE DOS DADOS

```sql
SELECT 'missoes_diarias' as tabela, COUNT(*) as total_registros,
       COUNT(CASE WHEN template_id IS NULL THEN 1 END) as sem_template,
       COUNT(CASE WHEN loja_id IS NULL THEN 1 END) as sem_loja,
       COUNT(CASE WHEN data_missao IS NULL THEN 1 END) as sem_data
FROM missoes_diarias
UNION ALL
SELECT 'missao_templates', COUNT(*), 
       COUNT(CASE WHEN nome IS NULL THEN 1 END),
       COUNT(CASE WHEN categoria IS NULL THEN 1 END),
       COUNT(CASE WHEN ativo IS NULL THEN 1 END)
FROM missao_templates;
```

**RESULTADO:**
| tabela           | total_registros | sem_template | sem_loja | sem_data |
| ---------------- | --------------- | ------------ | -------- | -------- |
| missoes_diarias  | 217             | 0            | 0        | 0        |
| missao_templates | 32              | 0            | 0        | 0        |

**✅ INTEGRIDADE: 100% dos dados consistentes**

---

## 📊 CONSULTA 6: CONTAGEM GERAL DE TABELAS

```sql
SELECT (SELECT COUNT(*) FROM missoes_diarias) as missoes_diarias,
       (SELECT COUNT(*) FROM missao_templates) as templates,
       (SELECT COUNT(*) FROM lojas) as lojas,
       (SELECT COUNT(*) FROM usuarios) as usuarios;
```

**RESULTADO:**
| missoes_diarias | templates | lojas | usuarios |
| --------------- | --------- | ----- | -------- |
| 217             | 32        | 7     | 6        |

---

## 📝 CONSULTA 8: AMOSTRA DE DADOS

```sql
SELECT 'Exemplo de Missão Diária' as tipo, id, status, 
       data_missao, template_id, loja_id
FROM missoes_diarias LIMIT 3;
```

**RESULTADO:**
| tipo                     | id                                   | status   | data_missao | template_id                          | loja_id                              |
| ------------------------ | ------------------------------------ | -------- | ----------- | ------------------------------------ | ------------------------------------ |
| Exemplo de Missão Diária | 6167cc5c-eead-432c-acff-134a2dc5bbaa | pendente | 2025-09-18  | 7863b1fe-4cd7-497a-84fd-24edeaf4cc73 | e974fc5d-ed39-4831-9e5e-4a5544489de6 |
| Exemplo de Missão Diária | ada27b79-0ca1-49e4-b53f-c0fffe05b83a | pendente | 2025-09-18  | 95162530-1dc1-458a-bb35-2832e313d739 | e974fc5d-ed39-4831-9e5e-4a5544489de6 |
| Exemplo de Missão Diária | 0a9d23cc-dc4e-482e-861b-ad10b1a7e094 | pendente | 2025-09-18  | fe0964cc-3236-4a74-ab7e-5a00be1d4bfd | e974fc5d-ed39-4831-9e5e-4a5544489de6 |

---

## 📈 CONSULTA 9: ESTATÍSTICAS AVANÇADAS

```sql
SELECT COUNT(DISTINCT md.loja_id) as lojas_com_missoes,
       COUNT(DISTINCT md.template_id) as templates_em_uso,
       MIN(md.data_missao) as primeira_missao,
       MAX(md.data_missao) as ultima_missao,
       AVG(md.pontos_total) as media_pontos
FROM missoes_diarias md;
```

**RESULTADO:**
| lojas_com_missoes | templates_em_uso | primeira_missao | ultima_missao | media_pontos        |
| ----------------- | ---------------- | --------------- | ------------- | ------------------- |
| 7                 | 31               | 2025-09-18      | 2025-09-18    | 19.3133640552995392 |

---

## 🔍 CONSULTA 10: VERIFICAÇÃO DE FOREIGN KEYS

```sql
SELECT COUNT(*) as missoes_com_fk_invalida
FROM missoes_diarias md
WHERE md.template_id NOT IN (SELECT id FROM missao_templates)
   OR md.loja_id NOT IN (SELECT id FROM lojas);
```

**RESULTADO:**
| missoes_com_fk_invalida |
| ----------------------- |
| 0                       |

**✅ TODAS AS FOREIGN KEYS VÁLIDAS**

---

## 🎯 RESUMO EXECUTIVO

### ✅ DADOS CONFIRMADOS:
- **217 missões** no banco (216 pendentes, 1 concluída)
- **32 templates** ativos distribuídos em 6 categorias
- **7 lojas** com missões ativas
- **6 usuários** cadastrados no sistema

### 🔍 PROBLEMAS IDENTIFICADOS:
- Nenhuma missão retornada para `CURRENT_DATE` (problema de fuso horário)
- Todas as missões estão na data `2025-09-18`
- Servidor em UTC mostra `2025-09-19`

### ⚡ AÇÕES NECESSÁRIAS:
1. Corrigir consulta para usar data específica `'2025-09-18'`
2. Ajustar INNER JOIN para LEFT JOIN
3. Implementar aliases para relacionamentos múltiplos de usuários

**Status**: ✅ Dados íntegros, problema de consulta identificado