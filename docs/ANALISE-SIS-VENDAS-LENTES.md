# 🔍 Análise: Sistema de Lentes no SIS_Vendas

**Data:** 17/01/2026  
**Objetivo:** Entender como o vendedor seleciona lentes canônicas no PDV para replicar no desenrola_dcl

---

## 📋 Estrutura Encontrada no SIS_Vendas

### Arquivos Principais:

```
src/components/vendas/
├── steps/LentesStep.tsx              # Step 4 do wizard de vendas
├── LentesSelectionSheet.tsx          # Modal lateral completo de seleção
├── GrupoCard.tsx                     # Card visual do grupo canônico
└── LentesFiltros.tsx                 # Painel lateral de filtros (⭐ PRINCIPAL)

src/components/lentes/
└── LentesFiltros.tsx                 # Mesmo componente acima

src/services/
└── lentesService.ts                  # Service para buscar grupos

src/hooks/
├── useLenses.ts
└── useLentesSelection.ts
```

---

## 🎯 Fluxo Completo de Venda de Lentes

### 1. **Entrada no Step de Lentes** (`LentesStep.tsx`)

```tsx
- Verifica se tem armação na venda (alerta se não tiver)
- Mostra botão grande: "Selecionar Lentes"
- Exibe lentes já adicionadas (pode adicionar múltiplas)
- Abre modal: <LentesSelectionSheet>
```

### 2. **Modal de Seleção** (`LentesSelectionSheet.tsx`)

```tsx
📱 Sheet lateral direita (max-width: 2xl)
├─ Header:
│  ├─ Título: "Catálogo de Lentes"
│  ├─ Contador: "461 opções encontradas"
│  └─ Busca + Botão "Filtros"
│
├─ Content:
│  └─ Grid de GrupoCard (2 colunas em md)
│
└─ Filtros (Painel lateral separado)
```

### 3. **Painel de Filtros** (`LentesFiltros.tsx`) ⭐

**O MAIS IMPORTANTE! É aqui que o vendedor escolhe!**

```tsx
🎨 Sheet lateral sobreposto (max-width: md)
│
├─ SEGMENTO (2 opcções grandes)
│  ├─ ☑️ Premium (60 grupos) - fundo amarelo/laranja
│  └─ ☑️ Standard (401 grupos) - fundo azul/cyan
│
├─ TIPO DE LENTE (3 checkboxes)
│  ├─ Visão Simples (232)
│  ├─ Multifocal (228)
│  └─ Bifocal (1)
│
├─ MATERIAL (2 checkboxes)
│  ├─ CR39 (Resina) - 349 grupos
│  └─ Policarbonato - 112 grupos
│
├─ ÍNDICE DE REFRAÇÃO (6 botões em grid 3x2)
│  ├─ 1.50  1.56  1.59
│  └─ 1.61  1.67  1.74
│
├─ TRATAMENTOS ⚡ SUPER IMPORTANTE!
│  │
│  ├─ Antirreflexo (51% têm)
│  │  └─ 3 botões: [Ambos] [Com AR] [Sem AR]
│  │
│  ├─ Blue Light (39% têm)
│  │  └─ 3 botões: [Ambos] [Com Blue] [Sem Blue]
│  │
│  └─ Fotossensíveis
│     └─ 4 botões em grid 2x2:
│        [Todos] [Sem] [Fotocromático] [Polarizado]
│
├─ FAIXA DE PREÇO
│  ├─ Input: Preço Mínimo
│  ├─ Input: Preço Máximo
│  └─ Info: "Faixa disponível: R$ 250 - R$ 9.640"
│
└─ MARCAS PREMIUM (se showPremium = true)
   ├─ Busca de marcas
   └─ Lista scrollável de marcas com checkbox
```

---

## 🎨 Interface dos Filtros de Tratamentos

### Padrão de Botões Tri-State (Ambos/Com/Sem):

```tsx
// Antirreflexo
[Ambos]      → tratamento_antirreflexo: null
[Com AR]     → tratamento_antirreflexo: true   ✅ verde
[Sem AR]     → tratamento_antirreflexo: false  ❌ vermelho

// Blue Light
[Ambos]      → tratamento_blue_light: null
[Com Blue]   → tratamento_blue_light: true     🔵 azul
[Sem Blue]   → tratamento_blue_light: false    ⚪ cinza

// Fotossensíveis (4 opções)
[Todos]         → fotossensiveis: null
[Sem]           → fotossensiveis: 'nenhum'
[Fotocromático] → fotossensiveis: 'fotocromático'  🟣 roxo
[Polarizado]    → fotossensiveis: 'polarizado'     🟦 índigo
```

---

## 💡 Insights Importantes

### 1. **Sistema Tri-State é ESSENCIAL**

❌ **Não usar apenas checkboxes simples!**  
✅ **Usar botões: Ambos | Com | Sem**

**Por quê?**

- Cliente pode querer APENAS lentes SEM antirreflexo (mais baratas)
- Cliente pode querer VER TODAS e depois decidir
- Checkbox binário não permite "ver ambos"

### 2. **Contadores são Cruciais**

```tsx
"Visão Simples (232)"  ← Vendedor vê quantas opções tem
"Material CR39 (349)"  ← Ajuda na decisão
"Antirreflexo (51% têm)" ← Mostra percentual
```

### 3. **Filtro de Segmento (Premium vs Standard)**

```tsx
// SIS_Vendas separa CLARAMENTE:
Premium:  60 grupos  (fundo amarelo/laranja com Crown icon)
Standard: 401 grupos (fundo azul/cyan com Sparkles icon)

// Ambos podem ser desmarcados simultaneamente!
```

### 4. **Busca de Texto é Separada dos Filtros**

```tsx
<input placeholder="Buscar lente, tipo, material..." />
// Busca por: nome_grupo, tipo_lente, material
// Não abre o painel de filtros
```

### 5. **Faixa de Preço tem Referência**

```tsx
<p>"Faixa disponível: R$ 250 - R$ 9.640"</p>
// Ajuda o vendedor a não colocar valores impossíveis
```

---

## 🔄 Lógica de Filtragem (useMemo)

```tsx
const gruposFiltrados = useMemo(() => {
  let resultado = [...grupos];

  // 1. Filtrar Premium/Standard PRIMEIRO
  if (!showPremium || !showStandard) {
    resultado = resultado.filter((grupo) => {
      if (showPremium && !showStandard) return grupo.is_premium;
      if (!showPremium && showStandard) return !grupo.is_premium;
      return true;
    });
  }

  // 2. Busca de texto
  if (searchTerm) {
    resultado = resultado.filter(
      (grupo) =>
        grupo.nome_grupo.toLowerCase().includes(termo) ||
        grupo.tipo_lente.toLowerCase().includes(termo) ||
        grupo.material.toLowerCase().includes(termo)
    );
  }

  // 3. Arrays de filtros (tipos, materiais, indices, marcas)
  if (filtros.tipos.length > 0) {
    resultado = resultado.filter((g) => filtros.tipos.includes(g.tipo_lente));
  }

  // 4. Tratamentos TRI-STATE ⚡
  if (filtros.tratamentos.antirreflexo !== null) {
    resultado = resultado.filter(
      (g) => g.tratamento_antirreflexo === filtros.tratamentos.antirreflexo
    );
  }

  // 5. Fotossensíveis (4 opções)
  if (filtros.tratamentos.fotossensiveis !== null) {
    if (filtros.tratamentos.fotossensiveis === "nenhum") {
      resultado = resultado.filter(
        (g) =>
          !g.tratamento_fotossensiveis ||
          g.tratamento_fotossensiveis === "nenhum"
      );
    } else {
      resultado = resultado.filter(
        (g) =>
          g.tratamento_fotossensiveis === filtros.tratamentos.fotossensiveis
      );
    }
  }

  return resultado;
}, [grupos, filtros, searchTerm]);
```

---

## 🎯 O Que Está Faltando no desenrola_dcl

### ❌ Problemas Atuais:

1. **Sem botões Tri-State**

   - Apenas checkboxes binários
   - Impossível escolher "ver todas as lentes SEM antirreflexo"

2. **Sem contadores**

   - Vendedor não sabe quantas opções cada filtro tem

3. **Sem separação Premium/Standard**

   - No SIS_Vendas isso é MUITO visual

4. **Falta filtro de Material**

   - CR39 vs Policarbonato

5. **Falta filtro de Índice de Refração**

   - Crítico para graus altos!

6. **Falta filtro de Fotossensíveis**

   - Fotocromático, Polarizado, Nenhum

7. **Falta filtro de Marcas**

   - Importante para lentes premium

8. **Falta faixa de preço**
   - Min/Max com referência da faixa disponível

---

## 📝 Interface Tipo TypeScript

```typescript
interface FiltrosLentesState {
  // Arrays de seleções múltiplas
  tipos: string[]; // ['visao_simples', 'multifocal']
  materiais: string[]; // ['CR39', 'POLICARBONATO']
  indices: string[]; // ['1.50', '1.56', '1.67']
  marcas: string[]; // [uuid, uuid, ...]

  // Ranges numéricos
  precoMin: number; // 0 a 10000
  precoMax: number;

  // Tratamentos TRI-STATE (null = ambos, true = com, false = sem)
  tratamentos: {
    antirreflexo: boolean | null;
    blue_light: boolean | null;
    uv: boolean | null;
    fotossensiveis: "nenhum" | "fotocromático" | "polarizado" | null;
  };

  // Segmento
  showPremium: boolean; // true
  showStandard: boolean; // true
}
```

---

## 🚀 Plano de Implementação no desenrola_dcl

### Fase 1: Atualizar Interface de Filtros ⏱️ 2h

**1.1 Atualizar FiltrosLente type:**

```typescript
// src/lib/hooks/useLentesCatalogo.ts
export interface FiltrosLente {
  // ✅ JÁ TEM:
  tipo_lente?: string;
  busca?: string;
  preco_min?: number;
  preco_max?: number;
  is_premium?: boolean;
  tratamento_antirreflexo?: boolean;
  tratamento_uv?: boolean;
  tratamento_blue_light?: boolean;

  // ⚡ ADICIONAR:
  material?: "CR39" | "POLICARBONATO";
  indice_refracao?: string;
  tratamento_fotossensiveis?: "nenhum" | "fotocromático" | "polarizado" | null;
  marca_id?: string;
  show_premium?: boolean; // Separar do is_premium
  show_standard?: boolean;
}
```

**1.2 Criar componente FiltrosPanel:**

```tsx
// src/components/lentes/FiltrosPanel.tsx
// Copiar estrutura do SIS_Vendas/LentesFiltros.tsx
// Adaptar para shadcn/ui components
```

**1.3 Adicionar botões tri-state:**

```tsx
// Componente reutilizável
<TriStateButtons
  label="Antirreflexo"
  value={filtros.tratamento_antirreflexo}
  onChange={(val) => setFiltros({ ...filtros, tratamento_antirreflexo: val })}
  labelAll="Ambos"
  labelTrue="Com AR"
  labelFalse="Sem AR"
  colorTrue="green"
  colorFalse="red"
/>
```

### Fase 2: Atualizar Query do Hook ⏱️ 1h

```typescript
// useLentesCatalogo.ts
export function useGruposCanonicos(filtros?: FiltrosLente) {
  return useQuery({
    queryKey: ["grupos-canonicos", filtros],
    queryFn: async () => {
      let query = lentesClient
        .from("grupos_canonicos")
        .select("*")
        .eq("ativo", true);

      // Filtro Premium/Standard
      if (filtros?.show_premium !== undefined && !filtros.show_premium) {
        query = query.eq("is_premium", false);
      }
      if (filtros?.show_standard !== undefined && !filtros.show_standard) {
        query = query.eq("is_premium", true);
      }

      // Material
      if (filtros?.material) {
        query = query.eq("material", filtros.material);
      }

      // Índice
      if (filtros?.indice_refracao) {
        query = query.eq("indice_refracao", filtros.indice_refracao);
      }

      // Fotossensíveis
      if (filtros?.tratamento_fotossensiveis) {
        if (filtros.tratamento_fotossensiveis === "nenhum") {
          query = query.or(
            "tratamento_fotossensiveis.is.null,tratamento_fotossensiveis.eq.nenhum"
          );
        } else {
          query = query.eq(
            "tratamento_fotossensiveis",
            filtros.tratamento_fotossensiveis
          );
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
```

### Fase 3: Atualizar LenteSelector UI ⏱️ 1h

```tsx
// src/components/lentes/LenteSelector.tsx
// Substituir painel de filtros simples por FiltrosPanel completo
// Adicionar separação visual Premium/Standard nos cards
// Adicionar contadores nos filtros
```

---

## ✅ Checklist de Implementação

### Backend/Hook:

- [ ] Adicionar campo `material` em FiltrosLente
- [ ] Adicionar campo `indice_refracao` em FiltrosLente
- [ ] Adicionar campo `tratamento_fotossensiveis` em FiltrosLente
- [ ] Adicionar campos `show_premium/show_standard` em FiltrosLente
- [ ] Atualizar query para filtrar por material
- [ ] Atualizar query para filtrar por índice
- [ ] Atualizar query para filtrar fotossensíveis (lógica especial)
- [ ] Implementar filtro de marcas (JOIN)

### Frontend/UI:

- [ ] Criar componente `TriStateButtons`
- [ ] Criar componente `FiltrosPanel` (painel lateral)
- [ ] Adicionar seção "Segmento" (Premium/Standard) com cards grandes
- [ ] Adicionar filtro "Tipo de Lente" com contadores
- [ ] Adicionar filtro "Material" (CR39/Policarbonato)
- [ ] Adicionar filtro "Índice de Refração" (grid 3x2)
- [ ] Atualizar filtro "Antirreflexo" para tri-state
- [ ] Atualizar filtro "Blue Light" para tri-state
- [ ] Adicionar filtro "Fotossensíveis" (4 opções)
- [ ] Adicionar filtro "Faixa de Preço" com range display
- [ ] Adicionar filtro "Marcas" com busca
- [ ] Adicionar contador de filtros ativos no botão
- [ ] Adicionar botão "Limpar todos os filtros"

### Visual/UX:

- [ ] Adicionar ícones: Crown (premium), Sparkles (standard), Shield (material), Zap (índice)
- [ ] Adicionar cores nos botões tri-state (verde/vermelho para AR, azul/cinza para Blue)
- [ ] Adicionar gradientes nos cards de segmento (amarelo/laranja para premium, azul/cyan para standard)
- [ ] Adicionar animações (framer-motion) para abrir/fechar painel
- [ ] Adicionar badges com contadores "(232 opções)"

---

## 🎯 Resumo Executivo

### O SIS_Vendas usa:

1. **Painel lateral** completo de filtros (não inline)
2. **Botões tri-state** para tratamentos (Ambos/Com/Sem)
3. **Separação visual forte** entre Premium e Standard
4. **Contadores em todos os filtros** para transparência
5. **Grid de botões** para índices de refração (não dropdown)
6. **4 opções** para fotossensíveis (não 2)
7. **Busca de marcas** dentro do filtro de marcas
8. **Faixa de preço** com display de range disponível

### Diferença-chave:

❌ **desenrola_dcl atual:** Filtros simples inline, apenas 4 checkboxes binários  
✅ **SIS_Vendas:** Painel lateral completo, 8 seções de filtros, tri-state

**Impacto:** Vendedor do SIS_Vendas consegue encontrar a lente exata em segundos.  
**Objetivo:** Replicar essa experiência no desenrola_dcl para decisão híbrida.

---

**Próxima Ação:** Implementar FiltrosPanel completo no desenrola_dcl com sistema tri-state.
