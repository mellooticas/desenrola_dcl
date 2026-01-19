# ✅ Implementação Concluída: Seleção de Lentes em 2 Passos

## 📋 Resumo

Sistema de seleção de lentes implementado com **fluxo em 2 passos** conforme análise do SIS_Vendas.

### Fluxo Implementado

```
┌─────────────────────────────────────────────────────────────┐
│ PASSO 1: Escolher Grupo Canônico                          │
│ - Filtros: tipo, preço, premium, tratamentos               │
│ - Mostra 461 grupos canônicos                              │
│ - Click no card → abre modal                               │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ PASSO 2: Modal - Escolher Laboratório                      │
│ - Lista todos os labs que fornecem aquela lente            │
│ - Ordenado por custo (mais barato primeiro)                │
│ - Destaca "Melhor Custo" e labs "Rápidos"                  │
│ - Mostra: lab, marca, prazo, custo REAL                    │
│ - Operador escolhe melhor opção manualmente                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ RESULTADO: Dados Completos                                 │
│ - lente_id: ID da lente específica                         │
│ - grupo_canonico_id: Grupo canônico escolhido              │
│ - fornecedor_id → laboratorio_id: Lab escolhido            │
│ - preco_custo: Custo REAL do lab (não preço médio)         │
│ - prazo_dias: Prazo de entrega                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 "Pulo do Gato" - Diferencial Competitivo

O **desenrola_dcl** permite que o operador veja TODOS os laboratórios que fornecem uma mesma lente canônica e escolha o melhor considerando:

- 💰 **Custo Real**: Não é preço médio, é o custo exato daquele lab
- ⏱️ **Prazo**: Labs com entrega rápida (≤3 dias) têm badge especial
- 🏷️ **Marca**: Pode haver diferença de marca entre labs
- 📊 **Margem**: Operador pode otimizar margem escolhendo lab mais barato

### Exemplo Real

```
Grupo: "KODAK TRANSITIONS VII CINZA CR39 1.50"

Lab A: R$ 150,00 | 5 dias  | Marca: Kodak
Lab B: R$ 130,00 | 7 dias  | Marca: Kodak ← Melhor Custo
Lab C: R$ 160,00 | 2 dias  | Marca: Kodak ← Rápido

→ Operador decide: Lab B (melhor margem) ou Lab C (cliente com pressa)?
```

## 🗄️ Estrutura de Dados

### View Usada: `v_lentes_cotacao_compra`

```sql
-- 16 colunas com TUDO que precisamos
SELECT
  l.lente_id,           -- ID único da lente
  l.lente_nome,         -- Nome completo
  l.lente_slug,         -- Para URLs
  l.nome_canonizado,    -- Nome padronizado
  l.grupo_canonico_id,  -- Link com grupo ← FILTRO
  l.tipo_lente,         -- visao_simples, multifocal...
  l.material,           -- CR39, Policarbonato...
  l.indice_refracao,    -- 1.50, 1.56...
  f.fornecedor_id,      -- ← ID DO LABORATÓRIO
  f.fornecedor_nome,    -- ← NOME DO LABORATÓRIO
  m.marca_id,
  m.marca_nome,
  COALESCE(l.preco_custo, 0) as preco_custo,  -- ← CUSTO REAL
  COALESCE(l.prazo_dias, 7) as prazo_dias,    -- ← PRAZO ENTREGA
  l.ativo,
  l.categoria
FROM lens_catalog.lentes l
LEFT JOIN core.fornecedores f ON l.fornecedor_id = f.fornecedor_id
LEFT JOIN lens_catalog.marcas m ON l.marca_id = m.marca_id
WHERE l.grupo_canonico_id = $1 AND l.ativo = true
ORDER BY preco_custo ASC  -- Mais barato primeiro!
```

## 📁 Arquivos Criados/Modificados

### ✅ Criados

1. **src/components/lentes/LenteCard.tsx** (120 linhas)

   - Card individual de cada laboratório
   - Badge "Melhor Custo" (verde) para mais barato
   - Badge "⚡ Rápido" para prazo ≤3 dias
   - Mostra: lab, marca, prazo, custo em destaque
   - Botão "Selecionar"

2. **src/components/lentes/LenteDetalhesModal.tsx** (150 linhas)
   - Dialog com header mostrando info do grupo
   - ScrollArea com lista de LenteCard
   - Alert com dica para o operador
   - Calcula e mostra range de preços
   - onSelect retorna LenteComLaboratorio completo

### ✅ Modificados

3. **src/lib/hooks/useLentesCatalogo.ts**

   - Adicionado tipo `LenteComLaboratorio` (16 campos)
   - Hook `useLentesDoGrupo` agora:
     - Usa `v_lentes_cotacao_compra` (era `lentes`)
     - Filtra por `grupo_canonico_id`
     - Ordena por `preco_custo` ASC
     - Retorna array de labs com todos os dados

4. **src/components/lentes/LenteSelector.tsx**

   - Adicionado estado `grupoSelecionado`
   - `handleClickGrupo`: abre modal ao clicar no grupo
   - `handleSelectLente`: processa seleção final do modal
   - Renderiza `<LenteDetalhesModal>` no final
   - onSelect agora retorna 10 campos (era 7)

5. **src/components/forms/NovaOrdemForm.tsx**
   - Atualizado onSelect do LenteSelector:
     - Salva `lente_id` (ID específico do lab)
     - `laboratorio_id = fornecedor_id`
     - `custo_lentes = preco_custo` (custo REAL)
     - `nome_lente_selecionada = nome_lente` (nome completo)
   - Feedback atualizado: "Custo Real confirmado ✅"

## 🧪 Como Testar

```bash
# 1. Iniciar servidor
npm run dev

# 2. Navegar
http://localhost:3001/dashboard
→ Clicar em "Nova Ordem"

# 3. Preencher wizard até lentes
- Selecionar Loja
- Selecionar Laboratório (pode ser qualquer um, será sobrescrito)

# 4. Testar fluxo de 2 passos
PASSO 1:
- Filtrar por tipo: "Visão Simples"
- Clicar em qualquer card de grupo
- ✅ Verificar: modal abre

PASSO 2:
- Verificar: lista de laboratórios aparece
- Verificar: ordenado por custo (mais barato primeiro)
- Verificar: badge "Melhor Custo" no mais barato
- Verificar: mostra prazo, marca, custo
- Clicar em "Selecionar" em qualquer card
- ✅ Verificar: modal fecha

# 5. Verificar dados salvos
- Console do navegador: procurar log "👓 Lente selecionada (2 passos)"
- Deve ter: lente_id, grupo_canonico_id, fornecedor_id, preco_custo
- Card verde deve mostrar nome da lente e custo real

# 6. Continuar wizard e salvar
- Preencher restante dos campos
- Salvar pedido
- ✅ Verificar no Supabase: pedidos.lente_id, pedidos.laboratorio_id, pedidos.custo_lentes
```

## 🎨 Componentes Visuais

### LenteCard

```
┌─────────────────────────────────────────────────────┐
│ 🏢 Laboratório XYZ      [Melhor Custo]              │
│ 🏷️ Marca: Kodak                                     │
│ ⏰ Prazo: 5 dias úteis                              │
│ Lente Transitions VII...                            │
│                                     R$ 130,00       │
│                                    [Selecionar]     │
└─────────────────────────────────────────────────────┘
```

### Modal

```
┌────────────────────────────────────────────────────────────┐
│ KODAK TRANSITIONS VII CINZA CR39 1.50               [X]   │
│ Escolha o laboratório ideal considerando custo e prazo     │
│                                                             │
│ [Visão Simples] [CR39] [Índice 1.50] [Premium]            │
│ 💹 Faixa de custo: R$ 130,00 a R$ 160,00                  │
│ 3 laboratórios disponíveis                                 │
│──────────────────────────────────────────────────────────│
│ 💡 Dica: As opções estão ordenadas por custo...           │
│                                                             │
│ [Card Lab B - R$ 130] ← Melhor Custo                      │
│ [Card Lab A - R$ 150]                                      │
│ [Card Lab C - R$ 160] ← ⚡ Rápido                         │
└────────────────────────────────────────────────────────────┘
```

## 🚀 Próximos Passos (Opcionais)

### Melhorias de UX

- [ ] Implementar tri-state buttons (Ambos/Com/Sem) para tratamentos
- [ ] Adicionar contadores "(232 opções)" em cada filtro
- [ ] Criar painel lateral deslizante para filtros (como SIS_Vendas)
- [ ] Adicionar filtros: Material, Índice (grid 3x2), Fotossensíveis

### Otimizações

- [ ] Cache de consultas por grupo (já tem TanStack Query)
- [ ] Paginação para grupos (se lista ficar grande)
- [ ] Favoritar labs (salvar preferências do operador)

### Integrações

- [ ] Integrar ArmacaoSelector no wizard
- [ ] Adicionar campos de acessórios e serviços
- [ ] Sincronizar com PDV (receber grupo_canonico_id via API)

## 📊 Métricas de Sucesso

✅ **Implementado:**

- 2 passos funcionais (grupo → labs)
- Custo real do laboratório (não preço médio)
- Ordenação por melhor margem
- Destaque visual para melhor opção
- 10 campos retornados (vs 7 anteriores)
- Zero erros TypeScript

✅ **Diferencial atingido:**

- Operador vê TODAS as opções de labs
- Pode escolher manualmente baseado em custo/prazo
- Sistema otimiza margem mostrando mais barato primeiro
- Transparência total de preços por laboratório

## 🎯 Resultado Final

O sistema agora implementa o **"pulo do gato"** do desenrola_dcl:

> **Enquanto o PDV mostra apenas o grupo canônico, o DCL mostra TODOS os laboratórios que fornecem aquela lente, permitindo escolher o melhor custo/prazo e maximizar a margem de lucro.**

---

**Status:** ✅ **PRONTO PARA TESTE**  
**Data:** 2024  
**Versão:** 1.0  
**Arquivos:** 5 criados/modificados  
**Linhas:** ~500 linhas de código novo
