# 🔍 Resolução do Gap de Graus no Banco de Dados

## 📋 Problema Identificado

### Situação
A tabela `lens_catalog.lentes` possui **dois conjuntos de campos** para armazenar informações de graus:

#### Campos Antigos (originais)
- `grau_esferico_min` / `grau_esferico_max`
- `grau_cilindrico_min` / `grau_cilindrico_max`

#### Campos Novos (padronizados)
- `esferico_min` / `esferico_max`
- `cilindrico_min` / `cilindrico_max`

### Problema na View
A view `public.v_lentes` está configurada para buscar dados **apenas dos campos novos**:

```sql
l.esferico_min as grau_esferico_min,
l.esferico_max as grau_esferico_max,
l.cilindrico_min as grau_cilindrico_min,
l.cilindrico_max as grau_cilindrico_max,
```

### Consequência
**Lentes que têm graus preenchidos apenas nos campos antigos NÃO aparecem com graus na view**, causando um "gap" de informação.

---

## 🎯 Solução Proposta

### Abordagem em 3 Etapas

#### 1️⃣ **Investigação** 
📄 Arquivo: `06_INVESTIGAR_GAP_GRAUS.sql`

Execute este arquivo para:
- ✅ Identificar quantas lentes têm o problema
- ✅ Ver quais fornecedores são afetados
- ✅ Analisar a distribuição do gap por tipo de lente e categoria
- ✅ Obter amostras de lentes com e sem gap

**Principais queries:**
- Contagem de lentes com gap
- Lista de fornecedores afetados
- Análise por tipo de lente
- Verificação de conflitos entre campos antigos e novos

---

#### 2️⃣ **Migração dos Dados**
📄 Arquivo: `07_SINCRONIZAR_GRAUS.sql`

**IMPORTANTE:** Execute estas queries em ordem:

1. **Análise ANTES da migração** - Ver estado atual
2. **UPDATE principal** - Copiar dados dos campos antigos para os novos
3. **Análise DEPOIS da migração** - Verificar resultado
4. **Testes na view** - Confirmar que as lentes aparecem corretamente

**Opções de migração:**

##### Opção A: Migração Conservadora (RECOMENDADA)
```sql
UPDATE lens_catalog.lentes
SET 
    esferico_min = COALESCE(esferico_min, grau_esferico_min),
    esferico_max = COALESCE(esferico_max, grau_esferico_max),
    cilindrico_min = COALESCE(cilindrico_min, grau_cilindrico_min),
    cilindrico_max = COALESCE(cilindrico_max, grau_cilindrico_max),
    updated_at = NOW()
WHERE ativo = true
    AND (
        (grau_esferico_min IS NOT NULL AND esferico_min IS NULL)
        OR (grau_esferico_max IS NOT NULL AND esferico_max IS NULL)
        OR (grau_cilindrico_min IS NOT NULL AND cilindrico_min IS NULL)
        OR (grau_cilindrico_max IS NOT NULL AND cilindrico_max IS NULL)
    );
```

Esta opção:
- ✅ Preserva dados existentes nos campos novos
- ✅ Copia apenas onde os campos novos estão NULL
- ✅ É segura e reversível

##### Opção B: Migração Simples
Executar separadamente para esféricos e cilíndricos (ver arquivo completo)

---

#### 3️⃣ **Atualização da View (Solução Temporária)**
📄 Arquivo: `08_ATUALIZAR_VIEW_GRAUS.sql`

**Solução Imediata:** Alterar a view para usar `COALESCE`

```sql
DROP VIEW IF EXISTS public.v_lentes;

CREATE VIEW public.v_lentes AS
SELECT
  -- ... outros campos ...
  COALESCE(l.esferico_min, l.grau_esferico_min) as grau_esferico_min,
  COALESCE(l.esferico_max, l.grau_esferico_max) as grau_esferico_max,
  COALESCE(l.cilindrico_min, l.grau_cilindrico_min) as grau_cilindrico_min,
  COALESCE(l.cilindrico_max, l.grau_cilindrico_max) as grau_cilindrico_max,
  -- ... outros campos ...
FROM lens_catalog.lentes l
-- ... resto da query ...
```

**Benefícios:**
- ✅ Funciona IMEDIATAMENTE sem precisar migrar dados
- ✅ Garante que todas as lentes apareçam com graus na view
- ✅ Prioriza campos novos, mas usa antigos como fallback
- ✅ Pode ser mantida durante o processo de migração

---

## 🚀 Ordem de Execução Recomendada

### Cenário 1: Correção Rápida (Sem Migração)
```bash
1. Execute: 08_ATUALIZAR_VIEW_GRAUS.sql (seção 2)
2. Teste: 08_ATUALIZAR_VIEW_GRAUS.sql (seção 4)
3. ✅ Problema resolvido!
```

### Cenário 2: Correção Completa (Com Migração)
```bash
1. Execute: 06_INVESTIGAR_GAP_GRAUS.sql (todas as queries)
   → Analise os resultados

2. Execute: 08_ATUALIZAR_VIEW_GRAUS.sql (seção 2)
   → View atualizada com COALESCE

3. Execute: 07_SINCRONIZAR_GRAUS.sql (análise antes)
   → Veja quantas lentes precisam migrar

4. Execute: 07_SINCRONIZAR_GRAUS.sql (UPDATE conservador)
   → Migre os dados

5. Execute: 07_SINCRONIZAR_GRAUS.sql (análise depois)
   → Confirme o sucesso

6. Execute: 08_ATUALIZAR_VIEW_GRAUS.sql (seções 3-9)
   → Teste final completo

7. OPCIONAL: Após confirmar 100%, simplifique a view
   → Use apenas campos novos (sem COALESCE)
```

---

## 📊 Verificações Importantes

### Antes de Executar Qualquer Query
```sql
-- Fazer backup da tabela (recomendado)
CREATE TABLE lens_catalog.lentes_backup AS 
SELECT * FROM lens_catalog.lentes;

-- Verificar permissões
SELECT current_user;
```

### Após a Migração
```sql
-- 1. Verificar se há lentes com valores diferentes
SELECT COUNT(*) FROM lens_catalog.lentes
WHERE ativo = true
    AND grau_esferico_min IS NOT NULL 
    AND esferico_min IS NOT NULL 
    AND grau_esferico_min != esferico_min;

-- 2. Verificar total de lentes com graus na view
SELECT COUNT(*) FROM public.v_lentes
WHERE grau_esferico_min IS NOT NULL;

-- 3. Comparar com total na tabela
SELECT COUNT(*) FROM lens_catalog.lentes
WHERE ativo = true
    AND (esferico_min IS NOT NULL OR grau_esferico_min IS NOT NULL);
```

---

## ⚠️ Avisos Importantes

### ❌ NÃO FAÇA:
1. **Não delete** os campos antigos ainda - podem ser úteis para auditoria
2. **Não execute** o UPDATE sem antes analisar com as queries de investigação
3. **Não simplifique** a view (remover COALESCE) antes de migrar 100% dos dados

### ✅ FAÇA:
1. **Execute** as queries de investigação primeiro
2. **Teste** em ambiente de desenvolvimento se possível
3. **Faça backup** antes de qualquer UPDATE
4. **Documente** quantas lentes foram migradas
5. **Verifique** a view após cada etapa

---

## 🎯 Resultado Esperado

### Antes
- ❌ Lentes com graus apenas em `grau_esferico_min` não aparecem na view
- ❌ Gap de informação visível para usuários
- ❌ Buscas por faixa de grau incompletas

### Depois
- ✅ Todas as lentes com graus aparecem corretamente na view
- ✅ Dados consistentes entre tabela e view
- ✅ Buscar por graus funciona para todas as lentes
- ✅ Sistema pronto para usar apenas campos padronizados (novos)

---

## 📝 Histórico

- **22/01/2026** - Identificação do problema e criação das queries de resolução
- **Relacionado com:** Resolução anterior de tratamentos fotossensíveis

---

## 🔗 Arquivos Relacionados

- `06_INVESTIGAR_GAP_GRAUS.sql` - Diagnóstico completo
- `07_SINCRONIZAR_GRAUS.sql` - Migração de dados
- `08_ATUALIZAR_VIEW_GRAUS.sql` - Correção da view
- `01_SINCRONIZAR_TRATAMENTOS.sql` - Problema similar resolvido anteriormente

---

## 💡 Próximos Passos

1. ✅ Resolver gap de graus (este documento)
2. 🔄 Validar DNP (Distância Naso-Pupilar)
3. 🔄 Consolidar campos duplicados na tabela
4. 🔄 Criar triggers para manter campos sincronizados
5. 🔄 Deprecar campos antigos após confirmação
