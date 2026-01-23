# 📚 Estrutura de Banco de Dados - VERSÃO VERDADE

> **Esta pasta contém a estrutura OFICIAL e DEFINITIVA do banco de dados do Best Lens.**
> Qualquer query ou script fora desta pasta deve ser considerado obsoleto.

---

## 📋 Sequência de Execução (Numerada)

### 🧹 Fase 1: Limpeza
- **01_LIMPEZA_SIMPLES.sql** - Remove estruturas obsoletas (CASCADE)

### 🏗️ Fase 2: Estruturas Básicas
- **02_CRIAR_CONTACT_LENS.sql** - Cria schema e tabelas para lentes de contato
- **03_DIAGNOSTICO_PUBLIC_SCHEMA.sql** - Diagnóstico de views/funções no public
- **04_LIMPAR_PUBLIC_SCHEMA.sql** - Remove views/funções antigas

### 📊 Fase 3: Views Consolidadas
- **05_CONSOLIDAR_VIEWS_GRUPOS.sql** - View única `v_grupos_canonicos`
- **06_CONSOLIDAR_VIEWS_LENTES.sql** - View única `v_lentes`
- **07_ANALISE_FINAL_VIEWS.sql** - Validação das views criadas
- **08_CONSOLIDAR_FORNECEDORES.sql** - View única `v_fornecedores`
- **09_LIMPAR_VIEWS_REDUNDANTES.sql** - Remove views duplicadas

### 🔗 Fase 4: Testes e Relacionamentos
- **10_TESTE_LIGACAO_GRUPOS_LENTES.sql** - Valida relacionamentos

### ⚙️ Fase 5: Automação (CRÍTICO)
- **11_TRIGGERS_AUTO_GRUPOS_CANONICOS.sql** - Triggers de canonização automática
  - `trigger_atualizar_grupo_canonico()` - Cria/atualiza grupos ao inserir/atualizar lentes
  - `atualizar_estatisticas_grupo_canonico()` - Recalcula estatísticas
  - `encontrar_ou_criar_grupo_canonico()` - Busca ou cria grupos

### 🔄 Fase 6: Lentes de Contato (Novo Módulo)
- **12_CREATE_LENTES_CONTATO.sql** - Estrutura separada para lentes de contato

---

## 📄 Documentação Principal

### 🛠️ GUIA_MANUTENCAO.md
**Guia completo** para operações do dia-a-dia:
- ✅ Adicionar novas lentes (processo automático via triggers)
- 🏷️ Adicionar novas marcas (premium vs standard)
- 🔍 Verificações de saúde do sistema
- 🔄 Re-canonização quando necessário
- 🐛 Troubleshooting

**Principais funcionalidades:**
- Checklist diário de verificações
- Como adicionar lentes (inserção automática canoniza)
- Como marcar marcas como premium/standard
- Scripts de validação (99X, 99Y, 99Z)

### 📚 CANONIZACAO_SISTEMA.md
**Documentação técnica** do sistema de canonização:
- 🎯 Visão geral: agrupa lentes com características idênticas
- 🏗️ Estrutura da tabela `grupos_canonicos` (16 critérios)
- ⚙️ Funcionamento automático dos triggers
- 📊 Como os grupos são criados e mantidos

**16 Critérios de Canonização:**
1. tipo_lente
2. material
3. indice_refracao
4. categoria_predominante
5-8. Graus (esférico min/max, cilíndrico min/max)
9-10. Adição (min/max)
11. tratamento_antirreflexo
12. tratamento_antirrisco
13. tratamento_uv
14. tratamento_blue_light
15. tratamento_fotossensiveis
16. **is_premium** (marca premium ou não)

### 🔧 Arquivos Auxiliares
- **CREATE-TABELA-LENTES-CONTATO.sql** - Versão alternativa de criação de lentes de contato
- **VERIFICAR_TRIGGERS_CANONIZACAO.sql** - Verifica se triggers estão ativos

---

## 📁 Pasta: melhorias_no_banco/

### Melhorias e Correções Aplicadas

#### 📍 Sincronização de Tratamentos
- **01_SINCRONIZAR_TRATAMENTOS.sql** - Sincroniza campos de tratamento
- **02_INVESTIGAR_TRATAMENTO_FOTO.sql** - Investiga tratamentos fotossensíveis
- **03_PROCURAR_TRANSITIONS.sql** - Busca por lentes Transitions
- **04_SINCRONIZAR_FOTOSSENSIVEL.sql** - Corrige campo fotossensível
- **05_VERIFICAR_PREMIUM_LENTES.sql** - Valida marcas premium

#### 📐 Gap de Graus (IMPORTANTE)
- **06_INVESTIGAR_GAP_GRAUS.sql** - Identifica problema de campos duplicados
- **07_SINCRONIZAR_GRAUS.sql** - Migra dados dos campos antigos para novos
- **README_GAP_GRAUS.md** - Documentação do problema e solução

**Problema identificado:**
- Campos antigos: `grau_esferico_min/max`, `grau_cilindrico_min/max`
- Campos novos: `esferico_min/max`, `cilindrico_min/max`
- View buscava apenas dos novos → lentes com dados apenas nos antigos não apareciam
- **Solução:** Migração com COALESCE para preservar dados existentes

#### ✅ Validação de Graus
- **09_VALIDACAO_COMPLETA_GRAUS.sql** - Validação completa pós-migração

#### 🔄 Re-canonização
- **EXECUCAO_RE_CANONIZACAO.md** - Plano de re-canonização completa
- **README_CANONIZACAO_APOS_GAPS.md** - Canonização após ajuste de GAPs

**Problema resolvido:**
- 219 lentes em grupos incompatíveis (tratamento fotossensível)
- Triggers com lógicas diferentes
- Solução: Desabilitar trigger antigo, manter apenas o correto

#### 🔍 Arquivos de Investigação
- **investigar_tratamentos.sql** - Investigação de tratamentos
- **investigar_tratamentos_tabela.sql** - Investigação na estrutura
- **investigacao-sis-lens.sql** - Investigação geral do SIS_LENS
- **detalhes_lentes.sql** - Detalhes de lentes específicas
- **view.lentes.sql** - View de lentes

---

## 🎯 Sistema de Canonização

### Como Funciona

1. **Inserção de Lente:**
   ```sql
   INSERT INTO lens_catalog.lentes (nome_lente, marca_id, tipo_lente, ...)
   VALUES ('Lente Nova', 'uuid-marca', 'visao_simples', ...);
   ```

2. **Trigger Automático Dispara:**
   - Busca `is_premium` da marca
   - Converte `fotossensivel` se necessário
   - Procura grupo existente com os 16 critérios
   - Se não existir, **cria novo grupo**
   - Atribui `grupo_canonico_id` à lente
   - Atualiza estatísticas do grupo

3. **Resultado:**
   - Lente automaticamente agrupada
   - Comparação de preços entre fornecedores
   - Identificação de alternativas equivalentes

### Estatísticas dos Grupos

Cada grupo canônico mantém:
- `preco_minimo`, `preco_maximo`, `preco_medio`
- `total_lentes` - quantas lentes no grupo
- `total_marcas` - quantas marcas diferentes
- `peso` - para ordenação/relevância

---

## ⚠️ IMPORTANTE: O que NÃO Fazer

### ❌ Não executar queries antigas de:
- `database/migrations/` (usar apenas se for criar estrutura do zero)
- `database/seeds/` (dados de exemplo antigos)
- Scripts soltos no root de `database/`

### ✅ SEMPRE usar:
- Esta pasta `reestruturacao_verdade/` como referência
- Seguir a sequência numerada (01 a 12)
- Ler os READMEs para entender o contexto
- Validar com scripts de verificação

---

## 🔄 Fluxo de População de Novos Laboratórios

Quando for popular novos laboratórios/fornecedores:

1. **Preparar dados:**
   ```sql
   -- Inserir fornecedor
   INSERT INTO core.fornecedores (nome, razao_social, cnpj, ...)
   VALUES ('Laboratório Novo', 'Lab Ltda', '00.000.000/0001-00', ...);
   ```

2. **Inserir lentes:**
   ```sql
   -- Lentes serão canonizadas AUTOMATICAMENTE
   INSERT INTO lens_catalog.lentes (
     nome_lente, marca_id, fornecedor_id, tipo_lente, material, ...
   ) VALUES (...);
   ```

3. **Verificar resultado:**
   ```sql
   -- Ver lentes do fornecedor e seus grupos
   SELECT l.nome_lente, gc.nome_grupo, gc.total_lentes
   FROM lens_catalog.lentes l
   JOIN lens_catalog.grupos_canonicos gc ON gc.id = l.grupo_canonico_id
   WHERE l.fornecedor_id = 'uuid-fornecedor-novo';
   ```

---

## 📊 Estrutura de Views

### Views Consolidadas (Substituem antigas)

#### `public.v_lentes`
View única que consolida TODAS as informações de lentes:
- Dados da lente
- Marca (nome, slug, is_premium)
- Fornecedor
- Grupo canônico
- Tratamentos
- Graus
- Preços

**Substitui:** 6 views antigas fragmentadas

#### `public.v_grupos_canonicos`
View completa dos grupos canônicos:
- Características técnicas
- Estatísticas (preços, totais)
- Lista de fornecedores (JSON)
- Lista de marcas (JSON)

**Substitui:** 6 views antigas de grupos

#### `public.v_fornecedores`
View consolidada de fornecedores:
- Dados básicos
- Prazos de entrega
- Estatísticas de lentes
- Contagens por tipo/tratamento
- Configuração de frete (JSON)

**Substitui:** 2 views antigas

---

## 🚀 Próximos Passos

1. ✅ **Limpar arquivos obsoletos** da pasta `database/` principal
2. ✅ **Popular próximos laboratórios** usando a estrutura correta
3. ✅ **Validar canonização** após cada importação
4. ✅ **Manter documentação** atualizada conforme mudanças

---

## 📝 Notas Técnicas

### Schemas Utilizados
- `lens_catalog.*` - Catálogo de lentes e grupos
- `core.*` - Fornecedores e dados básicos
- `contact_lens.*` - Lentes de contato (separado)
- `public.*` - Views de acesso

### Permissões
Todas as views públicas têm:
```sql
GRANT SELECT ON public.v_* TO anon, authenticated;
```

### Performance
- Índices automáticos nas PKs e FKs
- Views otimizadas com JOIN eficiente
- Triggers executam BEFORE INSERT/UPDATE (rápido)

---

**Última atualização:** 22 de janeiro de 2026
**Versão:** 1.0 - Estrutura Definitiva
