# 🔍 INVESTIGAÇÃO: Fornecedores/Laboratórios nos 2 Bancos

**Status:** 🚨 **BLOQUEADOR IDENTIFICADO**  
**Prioridade:** 🔴 ALTA  
**Data:** 17 de Janeiro de 2026

---

## 📌 SITUAÇÃO ATUAL

Você identificou que:

- ⚠️ **Laboratórios não estão sendo lançados corretamente**
- ⚠️ **Possível inconsistência entre os dois bancos**

Antes de prosseguir com integração de estoque, **precisamos garantir** que fornecedores/laboratórios estejam sincronizados.

---

## 📋 O QUE FAZER AGORA

### **Passo 1: Coletar Dados** (20 min)

#### **No banco SIS_Estoque:**

Execute o script em: `INVESTIGACAO-FORNECEDORES-LABORATORIOS.md` → **SCRIPT 1**

**Você vai descobrir:**

- ✅ Nome exato da tabela
- ✅ Quantos fornecedores existem
- ✅ Quais campos tem
- ✅ Quais produtos usam cada fornecedor

#### **No banco Desenrola DCL:**

Execute o script em: `INVESTIGACAO-FORNECEDORES-LABORATORIOS.md` → **SCRIPT 2**

**Você vai descobrir:**

- ✅ Nome exato da tabela (laboratorios ou fornecedores?)
- ✅ Quantos laboratórios existem
- ✅ Quais campos tem
- ✅ Quais pedidos usam cada laboratório

---

### **Passo 2: Documentar Resultados** (15 min)

Abra: `FORMULARIO-INVESTIGACAO-FORNECEDORES.md`

Preencha:

1. **SECTION 1:** Estrutura SIS_Estoque
2. **SECTION 2:** Estrutura Desenrola
3. **SECTION 3:** Dados de ambos
4. **SECTION 4:** Mapeamento cruzado

---

### **Passo 3: Comparar e Identificar Problemas** (15 min)

Responda:

```
❓ As tabelas têm o mesmo nome?
❓ As colunas são as mesmas?
❓ Os fornecedores são os mesmos?
❓ As quantidades batem?
❓ Há CNPJs duplicados ou NULL?
❓ Há laboratórios órfãos?
```

---

### **Passo 4: Definir Solução** (Variável)

Preencha **SECTION 6 e 7** do formulário com:

- Problemas encontrados
- Ações necessárias
- Timeline

---

## 🚨 PROBLEMAS COMUNS ESPERADOS

### **Problema 1: Nomes Diferentes**

```
SIS_Estoque:   Tabela "fornecedores"
Desenrola:     Tabela "laboratorios"

Solução:       Criar VIEW que mapeia ou renomear
```

### **Problema 2: Dados Inconsistentes**

```
SIS_Estoque:   Lab A, Lab B, Lab C
Desenrola:     Lab A, Lab X, Lab Y

Solução:       Sincronizar dados antes de integrar
```

### **Problema 3: Estrutura Diferente**

```
SIS_Estoque:   (id, nome, cnpj, tipo, status)
Desenrola:     (id, nome, email, telefone, website)

Solução:       Fazer mapeamento de campos
```

### **Problema 4: Dados Desatualizados**

```
Laboratorio deletado em SIS_Estoque mas ativo em Desenrola
ou vice-versa

Solução:       Sincronizar ativos/status
```

---

## 📊 EXEMPLO: O QUE VOCÊ VAI ENCONTRAR

### **Cenário A: Dados Sincronizados ✅**

```
SIS_Estoque Fornecedores:
├─ ID1: Mello Laboratório (CNPJ: 123)
├─ ID2: Laboratorio Volk (CNPJ: 456)
└─ ID3: Lens Vision (CNPJ: 789)

Desenrola Laboratorios:
├─ ID1: Mello Laboratório (CNPJ: 123)
├─ ID2: Laboratorio Volk (CNPJ: 456)
└─ ID3: Lens Vision (CNPJ: 789)

Status: ✅ PRONTO PARA INTEGRAR
```

### **Cenário B: Dados Desincronizados ⚠️**

```
SIS_Estoque Fornecedores:
├─ ID1: Mello Laboratório (CNPJ: 123)
├─ ID2: Laboratorio Volk (CNPJ: 456)
└─ ID3: Lens Vision (CNPJ: 789)

Desenrola Laboratorios:
├─ ID1: Mello Laboratório (CNPJ: 999) ← CNPJ DIFERENTE!
├─ ID2: Laboratorio Volk (CNPJ: 456)
└─ ID4: Novo Lab (CNPJ: 111) ← NÃO EXISTE EM SIS_ESTOQUE

Status: ⚠️ PRECISA SINCRONIZAR
```

---

## ⏱️ TIMELINE

```
HOJE:       Executar scripts de investigação
AMANHÃ:     Documentar resultados
DIA 3:      Definir e executar sincronização
DIA 4:      Validar integridade
DIA 5+:     Voltar para integração de estoque
```

---

## ✅ CHECKLIST RÁPIDO

```
ANTES DE INVESTIGAR:

[ ] Tenho acesso ao banco SIS_Estoque
[ ] Tenho acesso ao banco Desenrola DCL
[ ] Tenho permissão para executar SELECT (no mínimo)
[ ] Tenho ferramenta SQL (DBeaver, pgAdmin, psql, etc)

DURANTE INVESTIGAÇÃO:

[ ] Execute SCRIPT 1 em SIS_Estoque
[ ] Copie e salve os resultados
[ ] Execute SCRIPT 2 em Desenrola DCL
[ ] Copie e salve os resultados
[ ] Abra FORMULARIO-INVESTIGACAO-FORNECEDORES.md
[ ] Preencha todos os campos

APÓS INVESTIGAÇÃO:

[ ] Identifiquei o problema
[ ] Documentei a solução
[ ] Defini a sequência de ações
[ ] Estou pronto para sincronizar
```

---

## 📞 PRÓXIMAS AÇÕES

### **Você Fará:**

1. Executar scripts de investigação (30 min)
2. Documentar resultados (15 min)
3. Comunicar os problemas encontrados (5 min)

### **Depois Faremos:**

1. Analisar dados coletados
2. Definir estratégia de sincronização
3. Executar sincronização (se necessário)
4. Validar integridade
5. Voltar para integração de estoque

---

## 🎯 OBJETIVO FINAL

```
┌─────────────────────────────────┐
│   SIS_ESTOQUE Fornecedores      │
│   =============================  │
│   - Mello Lab (ID: X)           │
│   - Volk Lab (ID: Y)            │
│   - Lens Vision (ID: Z)         │
└────────────────┬────────────────┘
                 │ Sincronizados?
                 ↓
┌─────────────────────────────────┐
│  Desenrola Laboratorios         │
│  =============================  │
│   - Mello Lab (ID: X)           │
│   - Volk Lab (ID: Y)            │
│   - Lens Vision (ID: Z)         │
└─────────────────────────────────┘

✅ = Dados Consistentes
    = Pronto para integração!
```

---

## 📁 ARQUIVOS QUE VOCÊ PRECISA

```
INVESTIGACAO-FORNECEDORES-LABORATORIOS.md
└─ SCRIPT 1: SIS_Estoque
└─ SCRIPT 2: Desenrola DCL
└─ SCRIPT 3: Comparação

FORMULARIO-INVESTIGACAO-FORNECEDORES.md
└─ Preencha com seus dados

PROBLEMAS-ENCONTRADOS-FORNECEDORES.md
└─ Documente aqui o que encontrou
```

---

## 🚀 COMECE AGORA

1. Abra `INVESTIGACAO-FORNECEDORES-LABORATORIOS.md`
2. Execute **SCRIPT 1** no banco SIS_Estoque
3. Execute **SCRIPT 2** no banco Desenrola DCL
4. Preencha `FORMULARIO-INVESTIGACAO-FORNECEDORES.md`
5. Comunique os resultados

**Depois faremos a sincronização e integração! ✅**

---

**Essa investigação é CRÍTICA para o sucesso da integração! 🔍**

Não prossiga com estoque até ter certeza que fornecedores/laboratórios estão sincronizados.
