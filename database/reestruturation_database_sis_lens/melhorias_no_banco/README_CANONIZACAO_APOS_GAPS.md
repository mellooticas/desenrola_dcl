# 🔄 Canonização de Lentes - Atualização pós GAPs

## 📋 Contexto

Após implementarmos melhorias nos ranges de graus (adicionando novos GAPs nas tabelas), é importante verificar se os **grupos canônicos** ainda estão corretos e atualizados.

## 🎯 Sistema de Canonização Atual

### Como Funciona

O sistema possui **triggers automáticos** que:

1. **`trg_lentes_associar_grupo`** (INSERT/UPDATE)
   - Associa cada lente a um grupo canônico
   - Cria novo grupo se não existir um compatível
   - Baseia-se em: tipo, material, índice, tratamentos e **ranges de graus**

2. **`trg_lentes_atualizar_estatisticas`** (INSERT/UPDATE/DELETE)
   - Atualiza estatísticas dos grupos automaticamente
   - Recalcula: total_lentes, total_marcas, preços min/max/médio

### Funções Principais

- **`fn_associar_lente_grupo_automatico()`**
  - Busca grupo compatível baseado em características técnicas
  - Valida se os ranges da lente cabem dentro do range do grupo

- **`fn_atualizar_estatisticas_grupo()`**
  - Recalcula todas as métricas do grupo
  - Desativa grupos que ficaram sem lentes

- **`encontrar_ou_criar_grupo_canonico()`**
  - Busca grupo existente com mesmas características
  - Se não encontrar, cria automaticamente com nome descritivo

## ⚙️ Mudanças que Podem Afetar a Canonização

### O que mudamos recentemente:
- ✅ Adicionados novos GAPs nas tabelas de graus
- ✅ Ajustados ranges esféricos, cilíndricos e adições
- ✅ Reorganizada estrutura de categorias

### Impacto potencial:
- 🤔 Lentes podem ter sido associadas a grupos com ranges antigos
- 🤔 Novos ranges podem exigir novos grupos canônicos
- 🤔 Estatísticas dos grupos podem estar desatualizadas

## 🔍 Processo de Investigação

### Passo 1: Diagnóstico

Execute o script de investigação:
```bash
povoar_banco/99_INVESTIGAR_CANONIZACAO_POS_MUDANCAS.sql
```

**Verificações realizadas:**
1. ✅ Triggers estão ativos?
2. ✅ Existem lentes órfãs (sem grupo)?
3. ✅ Estatísticas sincronizadas (registrado = real)?
4. ✅ Lentes dentro dos ranges dos grupos?
5. ✅ Novos ranges criaram novos grupos?

### Passo 2: Análise dos Resultados

#### ✅ Cenário Ideal (Tudo OK)
```sql
-- Resultado esperado:
Lentes órfãs: 0
Grupos com estatísticas desatualizadas: 0
Lentes fora dos ranges: 0
```
➡️ **Não precisa fazer nada!** Os triggers já cuidaram de tudo.

#### ⚠️ Cenário com Problemas
```sql
-- Possíveis problemas:
Lentes órfãs: > 0
Estatísticas desatualizadas: > 0
Lentes com ranges incompatíveis: > 0
```
➡️ **Precisa re-canonizar!** Vá para o Passo 3.

### Passo 3: Re-canonização (Se Necessário)

Execute o script de re-canonização:
```bash
povoar_banco/99B_RE_CANONIZAR_LENTES.sql
```

**Opções disponíveis:**

#### 🔄 Opção 1: Re-canonização COMPLETA (Recomendado)
- Deleta todos os grupos existentes
- Re-processa todas as lentes
- Cria grupos do zero com as novas regras
- **Mais seguro e completo**

```sql
-- Limpa tudo e recria
BEGIN;
  -- Desativa triggers
  -- Limpa associações
  -- Deleta grupos
  -- Reativa triggers
  -- Força UPDATE em todas as lentes
COMMIT;
```

#### ⚡ Opção 2: Re-canonização PARCIAL (Mais Rápida)
- Mantém os grupos existentes
- Apenas atualiza as estatísticas
- **Use se os grupos estão corretos**

```sql
-- Atualiza apenas estatísticas
SELECT lens_catalog.atualizar_estatisticas_grupo_canonico(id)
FROM lens_catalog.grupos_canonicos;
```

#### 🎯 Opção 3: Re-canonização SELETIVA (Específica)
- Re-processa apenas lentes com problemas
- Limpa grupos órfãos
- **Use se poucos casos problemáticos**

```sql
-- Re-processa apenas lentes problemáticas
UPDATE lens_catalog.lentes
SET grupo_canonico_id = NULL
WHERE <condições de problema>;
```

## 📊 Validação Final

Após qualquer re-canonização, execute:

```sql
-- 1. Verificar integridade
SELECT * FROM lens_catalog.validar_integridade_grupos();

-- 2. Conferir estatísticas gerais
SELECT
  COUNT(*) as total_lentes,
  COUNT(DISTINCT grupo_canonico_id) as total_grupos,
  COUNT(*) FILTER (WHERE grupo_canonico_id IS NULL) as lentes_orfas
FROM lens_catalog.lentes
WHERE ativo = true;

-- 3. Ver distribuição por tipo
SELECT
  tipo_lente,
  COUNT(DISTINCT grupo_canonico_id) as grupos,
  COUNT(*) as lentes
FROM lens_catalog.lentes
WHERE ativo = true
GROUP BY tipo_lente;
```

## 🎓 Quando Re-canonizar?

### ✅ DEVE re-canonizar se:
- Mudou ranges de graus nas tabelas base
- Alterou lógica de agrupamento (tratamentos, materiais, etc)
- Encontrou inconsistências nas estatísticas
- Adicionou muitas lentes novas sem grupo

### ❌ NÃO precisa re-canonizar se:
- Apenas mudou preços das lentes
- Atualizou informações de fornecedores
- Mudou campos não relacionados a canonização (estoque, etc)
- Os triggers estão funcionando corretamente

## 📝 Arquivos Relacionados

### Scripts de Diagnóstico:
- `povoar_banco/99_INVESTIGAR_CANONIZACAO_POS_MUDANCAS.sql` - Investigação completa
- `docs/database/VERIFICAR_TRIGGERS_CANONIZACAO.sql` - Verificar triggers ativos

### Scripts de Re-canonização:
- `povoar_banco/99B_RE_CANONIZAR_LENTES.sql` - Re-processar grupos
- `docs/database/reestruturation_database_sis_lens/11_TRIGGERS_AUTO_GRUPOS_CANONICOS.sql` - Código dos triggers

### Documentação:
- `docs/database/ARQUITETURA_CANONIZACAO.md` - Arquitetura completa
- `docs/database/reestruturation_database_sis_lens/melhorias_no_banco/README_GAP_GRAUS.md` - Mudanças nos GAPs

## 🚀 Recomendação Atual

**Para o nosso caso (após mudanças nos GAPs):**

1. ✅ **Execute primeiro**: `99_INVESTIGAR_CANONIZACAO_POS_MUDANCAS.sql`
2. 🔍 **Analise os resultados**
3. ⚠️ **Se houver problemas**: Execute `99B_RE_CANONIZAR_LENTES.sql` (Opção 1 - Completa)
4. ✅ **Valide o resultado final**

### Por que?
- Adicionamos novos ranges de graus (GAPs)
- Queremos garantir que as lentes estão nos grupos corretos
- Melhor ter certeza de que tudo está sincronizado

## 📌 Notas Importantes

- ⏱️ A re-canonização completa pode levar alguns minutos
- 🔒 Sempre execute dentro de uma transação (`BEGIN...COMMIT`)
- 🧪 Teste primeiro em ambiente de desenvolvimento
- 📊 Mantenha backup antes de mudanças grandes
- 📝 Os triggers garantem que novas lentes serão canonizadas automaticamente

## ❓ FAQ

**P: Os triggers sempre funcionam?**
R: Sim, a menos que sejam desabilitados manualmente. Eles processam automaticamente cada INSERT/UPDATE.

**P: Preciso rodar isso toda vez que adiciono lentes?**
R: Não! Os triggers fazem isso automaticamente. Re-canonize apenas após mudanças estruturais.

**P: Posso perder dados?**
R: Não. A re-canonização apenas reorganiza grupos e associações. As lentes permanecem intactas.

**P: Quanto tempo leva?**
R: Depende do volume. Para ~1500 lentes: 1-3 minutos na re-canonização completa.

---

**Última atualização:** 22/01/2026
**Status:** ⏳ Aguardando investigação inicial
