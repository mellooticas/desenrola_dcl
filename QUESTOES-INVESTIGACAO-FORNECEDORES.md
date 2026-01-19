# ❓ QUESTÕES-CHAVE: Investigação Fornecedores/Laboratórios

**Objetivo:** Responder estas perguntas vai desbloquear a integração de estoque

---

## 🎯 QUESTÕES CRÍTICAS

### **Q1: QUAL É O PROBLEMA ESPECÍFICO?**

```
Você disse: "Laboratório não está sendo lançado"

Isso significa:
[ ] Laboratório não aparece na tela
[ ] Laboratório não é salvo no banco
[ ] Laboratório está vazio/NULL
[ ] Laboratório é salvo mas com dados errados
[ ] Campo laboratorio_id está NULL nos pedidos

Qual é exatamente? ___________________________________

Quando isso acontece?
[ ] Ao criar pedido
[ ] Ao editar pedido
[ ] Ao buscar pedido
[ ] Em relatórios

Qual é exatamente? ___________________________________
```

---

### **Q2: COMO ESTÃO OS DADOS NOS DOIS BANCOS?**

#### **SIS_Estoque - Tabela Fornecedores:**

```sql
SELECT COUNT(*) FROM fornecedores;
-- Quantos registros? __________

SELECT * FROM fornecedores LIMIT 5;
-- Quais os nomes?
-- 1. ________________________
-- 2. ________________________
-- 3. ________________________
-- 4. ________________________
-- 5. ________________________
```

#### **Desenrola DCL - Tabela Laboratorios:**

```sql
SELECT COUNT(*) FROM laboratorios;
-- Quantos registros? __________

SELECT * FROM laboratorios LIMIT 5;
-- Quais os nomes?
-- 1. ________________________
-- 2. ________________________
-- 3. ________________________
-- 4. ________________________
-- 5. ________________________
```

**Os nomes batem?**

- [ ] Sim, exatamente iguais
- [ ] Parcialmente iguais (ex: "Mello" vs "Mello Laboratório")
- [ ] Totalmente diferentes
- [ ] Não existem em um dos bancos

---

### **Q3: A TABELA TEM O MESMO NOME?**

```sql
-- Em SIS_Estoque, qual é o nome?
SELECT tablename FROM pg_tables
WHERE tablename LIKE '%fornecedor%' OR tablename LIKE '%lab%';

Nome encontrado: _____________________

-- Em Desenrola, qual é o nome?
SELECT tablename FROM pg_tables
WHERE tablename LIKE '%fornecedor%' OR tablename LIKE '%lab%';

Nome encontrado: _____________________
```

**São iguais?**

- [ ] Sim: `fornecedores` em ambos
- [ ] Não: `fornecedores` vs `laboratorios`
- [ ] Não existem tabelas de fornecedor

---

### **Q4: OS CAMPOS SÃO IGUAIS?**

#### **SIS_Estoque - Colunas de Fornecedores:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'fornecedores';
```

**Campos encontrados:**

- [ ] id (UUID / INT / SERIAL?)
- [ ] nome (VARCHAR)
- [ ] cnpj (VARCHAR)
- [ ] tipo (VARCHAR)
- [ ] status (VARCHAR)
- [ ] ativo (BOOLEAN)
- [ ] Outros: **********\_**********

#### **Desenrola DCL - Colunas de Laboratorios:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'laboratorios';
```

**Campos encontrados:**

- [ ] id (UUID / INT / SERIAL?)
- [ ] nome (VARCHAR)
- [ ] cnpj (VARCHAR)
- [ ] tipo (VARCHAR)
- [ ] status (VARCHAR)
- [ ] ativo (BOOLEAN)
- [ ] Outros: **********\_**********

**Campos que faltam em um ou outro:**

- SIS_Estoque tem, Desenrola não: ********\_\_\_********
- Desenrola tem, SIS_Estoque não: ********\_\_\_********

---

### **Q5: OS DADOS SÃO SINCRONIZADOS?**

#### **Comparação de Valores:**

```
SIS_Estoque (fornecedores):
Nome: "Mello Laboratório"
CNPJ: "12.345.678/0001-90"
Tipo: "laboratorio"
Ativo: true

Desenrola (laboratorios):
Nome: "Mello Laboratório" ✅ ou "Mello Lab" ❌ ou "Não existe" ❌
CNPJ: "12.345.678/0001-90" ✅ ou "99.999.999/9999-99" ❌ ou "Não existe" ❌
```

**Cada fornecedor de SIS_Estoque existe em Desenrola?**

| Fornecedor | SIS_Estoque | Desenrola | Bate?       |
| ---------- | ----------- | --------- | ----------- |
| Lab 1      | ✓           | ✓         | ☐ Sim ☐ Não |
| Lab 2      | ✓           | ✓         | ☐ Sim ☐ Não |
| Lab 3      | ✓           | ✓         | ☐ Sim ☐ Não |

---

### **Q6: HÁ PRODUTOS/PEDIDOS ÓRFÃOS?**

```sql
-- Em SIS_Estoque: Produtos com fornecedor_id que não existe?
SELECT COUNT(*) FROM produtos
WHERE fornecedor_id IS NOT NULL
  AND fornecedor_id NOT IN (SELECT id FROM fornecedores);

Resultado: __________

-- Em Desenrola: Pedidos com laboratorio_id que não existe?
SELECT COUNT(*) FROM pedidos
WHERE laboratorio_id IS NOT NULL
  AND laboratorio_id NOT IN (SELECT id FROM laboratorios);

Resultado: __________
```

**Há órfãos?**

- [ ] Não, tudo está referenciado corretamente
- [ ] Sim, há **\_** produtos/pedidos órfãos
- [ ] Não consigo rodar a query

---

### **Q7: QUAL É A MELHOR ESTRATÉGIA?**

Baseado no que você encontrou:

```
[ ] Opção A: Dados já estão sincronizados
             Ação: Prosseguir direto para integração

[ ] Opção B: Renomear tabela/campo
             Ação: ALTER TABLE laboratorios RENAME TO fornecedores

[ ] Opção C: Sincronizar dados com script SQL
             Ação: INSERT/UPDATE entre tabelas

[ ] Opção D: Criar VIEW que mapeia dados
             Ação: CREATE VIEW fornecedores_view AS SELECT ...

[ ] Opção E: Problema complexo, precisa analisar mais
             Ação: Escalar para técnico sênior
```

---

### **Q8: QUAL É O PRÓXIMO PASSO?**

Responda baseado no que descobriu:

```
O Problema: ________________________________________

A Causa:    ________________________________________

A Solução:  [ ] Sincronizar dados
            [ ] Renomear tabelas
            [ ] Criar mapeamento
            [ ] Deletar órfãos
            [ ] Outro: ______________

Tempo estimado: ________________________________________

Bloqueador? [ ] Sim (não dá integrar sem resolver)
            [ ] Não (dá prosseguir com workaround)
```

---

## 📊 TEMPLATE DE RESPOSTA

Ao terminar a investigação, forneça um resumo assim:

```
INVESTIGAÇÃO FORNECEDORES/LABORATÓRIOS - RESULTADO

Data: _______________
Investigador: _______________

DESCOBERTAS:

1. SIS_Estoque tem tabela: fornecedores
   - Total de registros: ___
   - Campos: id, nome, cnpj, tipo, status, ativo
   - Exemplo: Mello (ID: uuid123), Volk (ID: uuid456)

2. Desenrola DCL tem tabela: laboratorios
   - Total de registros: ___
   - Campos: id, nome, cnpj, tipo, status, ativo
   - Exemplo: Mello (ID: uuid123), Volk (ID: uuid456)

3. Sincronização:
   - ✅ Nomes batem
   - ✅ Quantidades batem
   - ❌ Campos diferentes: [listar]
   - ❌ Dados inconsistentes: [listar]

PROBLEMAS ENCONTRADOS:

Problema 1: _________________________________
Impacto: Bloqueador / Não-bloqueador
Solução: _________________________________

RECOMENDAÇÃO:

Status: ✅ Pronto integrar / ⚠️ Precisa sincronizar / 🚫 Problema crítico

Próximos passos:
1. _________________________________
2. _________________________________
3. _________________________________

Timeline: ________________
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Responda estas 8 questões** (30 minutos)
2. **Forneça o resumo acima** (10 minutos)
3. **Comunique os resultados** para prosseguir

**Depois vamos:**

- Analisar os dados coletados
- Definir exatamente o que fazer
- Executar sincronização (se necessário)
- Validar tudo
- Prosseguir com integração de estoque

---

**As respostas a essas perguntas vão desbloquear toda a integração! 🔑**
