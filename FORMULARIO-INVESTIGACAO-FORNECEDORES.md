# 📋 FORMULÁRIO: Investigação de Fornecedores/Laboratórios

**Data:** ****\_\_\_\_****  
**Investigador:** ****\_\_\_\_****  
**Status:** ☐ Em andamento ☐ Concluído

---

## 📊 SECTION 1: ESTRUTURA BANCO SIS_ESTOQUE

### **Tabela: Fornecedores**

**Nome Tabela:** `fornecedores`

**Colunas Encontradas:**

```
[ ] id (tipo: _____)
[ ] nome (tipo: _____)
[ ] cnpj (tipo: _____)
[ ] tipo (tipo: _____)
[ ] status (tipo: _____)
[ ] ativo (tipo: _____)
[ ] Outras: _____________________________
```

**Total de Registros:** ****\_\_****

**Campos Únicos:** ☐ id ☐ cnpj ☐ nome

---

## 📊 SECTION 2: ESTRUTURA BANCO DESENROLA DCL

### **Tabela: Laboratórios/Fornecedores**

**Nome Tabela Encontrada:** `_________________`

**Colunas Encontradas:**

```
[ ] id (tipo: _____)
[ ] nome (tipo: _____)
[ ] cnpj (tipo: _____)
[ ] tipo (tipo: _____)
[ ] status (tipo: _____)
[ ] ativo (tipo: _____)
[ ] Outras: _____________________________
```

**Total de Registros:** ****\_\_****

**Campos Únicos:** ☐ id ☐ cnpj ☐ nome

---

## 🔗 SECTION 3: MAPEAMENTO DE DADOS

### **Fornecedores em SIS_Estoque:**

```
Preencha com saída do SCRIPT 1, item 5:

| ID | NOME | CNPJ | TIPO | STATUS | ATIVO |
|----|------|------|------|--------|-------|
|    |      |      |      |        |       |
|    |      |      |      |        |       |
|    |      |      |      |        |       |
```

**Total:** ****\_\_****

---

### **Laboratórios em Desenrola DCL:**

```
Preencha com saída do SCRIPT 2, item 5:

| ID | NOME | CNPJ | TIPO | STATUS | ATIVO |
|----|------|------|------|--------|-------|
|    |      |      |      |        |       |
|    |      |      |      |        |       |
|    |      |      |      |        |       |
```

**Total:** ****\_\_****

---

## 🔄 SECTION 4: MAPEAMENTO CRUZADO

### **Qual laboratório do Desenrola corresponde a qual fornecedor do SIS_Estoque?**

```
SIS_Estoque → Desenrola DCL

Fornecedor A __________ → Laboratório __________
Fornecedor B __________ → Laboratório __________
Fornecedor C __________ → Laboratório __________

Não encontrados em Desenrola:
- ____________________
- ____________________

Não encontrados em SIS_Estoque:
- ____________________
- ____________________
```

---

## ⚠️ SECTION 5: DIVERGÊNCIAS ENCONTRADAS

### **Diferenças em Tabela/Estrutura:**

```
SIS_Estoque:     fornecedores (colunas: id, nome, cnpj, tipo, status, ativo)
Desenrola DCL:   laboratorios (colunas: id, nome, email, telefone, ...)

Problema:        ☐ Nomes de tabela diferentes
                 ☐ Colunas diferentes
                 ☐ Tipos de dados diferentes
                 ☐ Estrutura incompatível

Impacto:         _________________________________
```

### **Diferenças em Dados:**

```
Total SIS_Estoque:     __________ fornecedores
Total Desenrola:       __________ laboratórios

Divergências:
☐ Fornecedores duplicados
☐ Nomes com typos
☐ CNPJs inconsistentes
☐ Dados desatualizados
☐ Soft deletes (ativo=false)
☐ Registros órfãos

Lista de problemas:
1. _________________________________
2. _________________________________
3. _________________________________
```

### **Problemas com Pedidos/Produtos:**

```
Pedidos em Desenrola referenciando laboratório:
- Total de pedidos: __________
- Laboratórios referenciados: __________
- Laboratórios NÃO ENCONTRADOS: __________

Produtos em SIS_Estoque referenciando fornecedor:
- Total de produtos: __________
- Fornecedores referenciados: __________
- Fornecedores NÃO ENCONTRADOS: __________
```

---

## 🎯 SECTION 6: RECOMENDAÇÕES

### **Problema Identificado 1:**

```
O quê:      _________________________________
Causa:      _________________________________
Impacto:    _________________________________
Solução:    ☐ Sincronizar dados
            ☐ Criar view/mapeamento
            ☐ Converter nomes de tabelas
            ☐ Popular dados faltantes
            ☐ Limpar dados duplicados
```

### **Problema Identificado 2:**

```
O quê:      _________________________________
Causa:      _________________________________
Impacto:    _________________________________
Solução:    ☐ Sincronizar dados
            ☐ Criar view/mapeamento
            ☐ Converter nomes de tabelas
            ☐ Popular dados faltantes
            ☐ Limpar dados duplicados
```

### **Problema Identificado 3:**

```
O quê:      _________________________________
Causa:      _________________________________
Impacto:    _________________________________
Solução:    ☐ Sincronizar dados
            ☐ Criar view/mapeamento
            ☐ Converter nomes de tabelas
            ☐ Popular dados faltantes
            ☐ Limpar dados duplicados
```

---

## ✅ SECTION 7: PLANO DE AÇÃO

### **Antes de Integrar, é Necessário:**

- [ ] **Sincronizar Laboratórios**

  - Passo 1: ****************\_****************
  - Passo 2: ****************\_****************
  - Passo 3: ****************\_****************

- [ ] **Limpar Dados Inconsistentes**

  - Passo 1: ****************\_****************
  - Passo 2: ****************\_****************
  - Passo 3: ****************\_****************

- [ ] **Criar Mapeamento de IDs**

  - Passo 1: ****************\_****************
  - Passo 2: ****************\_****************
  - Passo 3: ****************\_****************

- [ ] **Validar Integridade Referencial**
  - Passo 1: ****************\_****************
  - Passo 2: ****************\_****************
  - Passo 3: ****************\_****************

---

## 📝 SECTION 8: CONCLUSÕES

### **Status da Investigação:**

```
☐ Dados são consistentes - Pronto para integrar
☐ Dados precisam sincronização - Ações definidas
☐ Problema crítico encontrado - Escalonamento necessário
```

### **Resumo Executivo:**

---

---

---

### **Próximos Passos:**

1. ***
2. ***
3. ***

---

## 🔐 ASSINATURA E DATA

**Investigador:** ************\_\_\_************  
**Data Conclusão:** ************\_\_\_************  
**Aprovado por:** ************\_\_\_************

---

**Após preencher este formulário, comunique os resultados para prosseguir com a integração! ✅**
