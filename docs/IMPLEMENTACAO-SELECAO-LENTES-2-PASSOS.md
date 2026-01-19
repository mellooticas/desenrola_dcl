# 🎯 Implementação: Seleção de Lentes em 2 Passos

**Data:** 17/01/2026  
**Objetivo:** Permitir que operador DCL escolha o melhor laboratório após selecionar o grupo canônico

---

## 📊 Views Disponíveis no sis_lens

### 1. `v_lentes_cotacao_compra` (16 colunas) ✅ USAR ESTA!

```sql
SELECT
  lente_id,              -- UUID da lente
  lente_slug,
  lente_nome,            -- Nome completo
  nome_canonizado,       -- Nome padronizado
  tipo_lente,            -- visao_simples, multifocal, bifocal
  material,              -- CR39, POLICARBONATO
  indice_refracao,       -- 1.50, 1.56, etc
  fornecedor_id,         -- ← UUID do laboratório
  fornecedor_nome,       -- ← Nome do lab
  marca_id,
  marca_nome,
  preco_custo,           -- ← CUSTO para calcular margem!
  prazo_dias,            -- ← Prazo de entrega
  ativo,
  categoria,
  grupo_canonico_id      -- ← Filtrar por este campo!
FROM v_lentes_cotacao_compra
WHERE grupo_canonico_id = 'xxx'
AND ativo = true
ORDER BY preco_custo ASC  -- Melhor preço primeiro
```

### 2. `v_fornecedores_por_lente` (17 colunas)

- Tem `ranking_fornecedor` (ordenação automática)
- Inclui `cnpj` e `razao_social`
- Usa `row_number() OVER (PARTITION BY lente_id...)`

**Decisão:** Usar `v_lentes_cotacao_compra` (mais simples e tem tudo que precisamos)

---

## 🎨 Novo Fluxo no LenteSelector

### PASSO 1: Escolher Grupo Canônico (atual)

```tsx
<LenteSelector>
  ├─ Busca ├─ Filtros (tipo, material, tratamentos...) └─ Grid de GrupoCard └─
  onClick → setGrupoSelecionado(grupo) ↓ ABRE PASSO 2
</LenteSelector>
```

### PASSO 2: Escolher Laboratório (NOVO)

```tsx
<LenteDetalhesModal grupo={grupoSelecionado}>
  ├─ Header: │ └─ "Grupo: Multifocal CR39 1.56 com AR" │ ├─ Info do Grupo: │ ├─
  Faixa de preço: R$ 150 - R$ 180 │ ├─ Total de opções: 3 laboratórios │ └─
  Características: [AR] [UV] [Blue Light] │ └─ Lista de Lentes por Lab: ├─ Card
  Lab A: │ ├─ 🏭 Laboratório A │ ├─ 💰 Custo: R$ 150 │ ├─ ⏱️ Prazo: 5 dias │ ├─
  🏷️ Marca: Essilor │ └─ [Selecionar] → onSelect(lente) │ ├─ Card Lab B:
  (DESTAQUE - Melhor margem!) │ ├─ 🏭 Laboratório B │ ├─ 💰 Custo: R$ 130 ⭐ │
  ├─ ⏱️ Prazo: 7 dias │ ├─ 🏷️ Marca: Hoya │ ├─ 💵 Economia: R$ 20 vs Lab A │ └─
  [Selecionar] → onSelect(lente) │ └─ Card Lab C: ├─ 🏭 Laboratório C ├─ 💰
  Custo: R$ 160 ├─ ⏱️ Prazo: 3 dias ⚡ (Mais rápido!) ├─ 🏷️ Marca: Zeiss └─
  [Selecionar] → onSelect(lente)
</LenteDetalhesModal>
```

---

## 📋 Estrutura de Dados

### Tipo: LenteComLaboratorio

```typescript
interface LenteComLaboratorio {
  lente_id: string;
  lente_nome: string;
  lente_slug: string;

  // Grupo
  grupo_canonico_id: string;
  nome_canonizado: string;

  // Especificações
  tipo_lente: "visao_simples" | "multifocal" | "bifocal";
  material: "CR39" | "POLICARBONATO";
  indice_refracao: string;

  // Laboratório ⭐
  fornecedor_id: string; // ← Este vai para laboratorio_id no pedido!
  fornecedor_nome: string; // ← Mostrar na UI

  // Marca
  marca_id: string;
  marca_nome: string;

  // Financeiro ⭐
  preco_custo: number; // ← Salvar em custo_lentes
  prazo_dias: number; // ← Mostrar na UI

  // Status
  ativo: boolean;
  categoria: string;
}
```

---

## 🛠️ Implementação

### 1. Hook: useLentesDoGrupo (ATUALIZAR)

```typescript
// src/lib/hooks/useLentesCatalogo.ts

export function useLentesDoGrupo(grupoCanonicoId: string | null) {
  return useQuery({
    queryKey: ["lentes-por-grupo", grupoCanonicoId],
    queryFn: async () => {
      if (!grupoCanonicoId) return [];

      const { data, error } = await lentesClient
        .from("v_lentes_cotacao_compra")
        .select("*")
        .eq("grupo_canonico_id", grupoCanonicoId)
        .eq("ativo", true)
        .order("preco_custo", { ascending: true }); // Mais barato primeiro

      if (error) throw error;
      return data as LenteComLaboratorio[];
    },
    enabled: !!grupoCanonicoId,
    staleTime: 5 * 60 * 1000,
  });
}
```

### 2. Componente: LenteDetalhesModal (NOVO)

```typescript
// src/components/lentes/LenteDetalhesModal.tsx

interface LenteDetalhesModalProps {
  grupo: GrupoCanonicoCompleto | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lente: LenteComLaboratorio) => void;
}

export function LenteDetalhesModal({
  grupo,
  isOpen,
  onClose,
  onSelect,
}: Props) {
  const { data: lentes = [], isLoading } = useLentesDoGrupo(grupo?.id);

  // Calcular melhor opção (menor custo)
  const melhorCusto =
    lentes.length > 0 ? Math.min(...lentes.map((l) => l.preco_custo)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        {/* Header com info do grupo */}
        <DialogHeader>
          <DialogTitle>{grupo?.nome_grupo}</DialogTitle>
          <DialogDescription>
            {lentes.length} laboratórios disponíveis
          </DialogDescription>
        </DialogHeader>

        {/* Lista de lentes */}
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {lentes.map((lente) => (
              <LenteCard
                key={lente.lente_id}
                lente={lente}
                isMelhorCusto={lente.preco_custo === melhorCusto}
                onSelect={() => onSelect(lente)}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Componente: LenteCard (NOVO)

```typescript
// src/components/lentes/LenteCard.tsx

interface LenteCardProps {
  lente: LenteComLaboratorio;
  isMelhorCusto: boolean;
  onSelect: () => void;
}

export function LenteCard({ lente, isMelhorCusto, onSelect }: Props) {
  return (
    <Card
      className={cn(
        "p-4 hover:shadow-lg transition-all cursor-pointer",
        isMelhorCusto && "border-2 border-green-500 bg-green-50/50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          {/* Lab */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-lg">
              {lente.fornecedor_nome}
            </span>
            {isMelhorCusto && (
              <Badge variant="success">
                <TrendingDown className="h-3 w-3 mr-1" />
                Melhor Custo
              </Badge>
            )}
          </div>

          {/* Marca */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="h-3 w-3" />
            <span>Marca: {lente.marca_nome}</span>
          </div>

          {/* Prazo */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Prazo: {lente.prazo_dias} dias</span>
          </div>
        </div>

        {/* Custo */}
        <div className="text-right space-y-2">
          <div className="text-2xl font-bold text-gray-900">
            R$ {lente.preco_custo.toFixed(2)}
          </div>
          <Button onClick={onSelect} size="sm">
            Selecionar
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### 4. Atualizar LenteSelector (MODIFICAR)

```typescript
// src/components/lentes/LenteSelector.tsx

export function LenteSelector({ onSelect, ... }: Props) {
  const [grupoSelecionado, setGrupoSelecionado] = useState<GrupoCanonicoCompleto | null>(null)

  const handleSelectGrupo = (grupo: GrupoCanonicoCompleto) => {
    setGrupoSelecionado(grupo) // Abre modal do Passo 2
  }

  const handleSelectLente = (lente: LenteComLaboratorio) => {
    // Retorna TUDO para o formulário
    onSelect({
      grupo_canonico_id: lente.grupo_canonico_id,
      lente_id: lente.lente_id,
      nome_lente: lente.lente_nome,
      slug: lente.lente_slug,
      fornecedor_id: lente.fornecedor_id,      // ← laboratorio_id
      fornecedor_nome: lente.fornecedor_nome,  // ← lab name
      preco_custo: lente.preco_custo,          // ← custo_lentes
      tipo_lente: lente.tipo_lente
    })
    setGrupoSelecionado(null) // Fecha modal
  }

  return (
    <>
      {/* PASSO 1: Grid de grupos */}
      <div className="grid gap-2">
        {grupos.map(g => (
          <GrupoCard
            grupo={g}
            onSelect={() => handleSelectGrupo(g)}
          />
        ))}
      </div>

      {/* PASSO 2: Modal de lentes do grupo */}
      <LenteDetalhesModal
        grupo={grupoSelecionado}
        isOpen={!!grupoSelecionado}
        onClose={() => setGrupoSelecionado(null)}
        onSelect={handleSelectLente}
      />
    </>
  )
}
```

### 5. Atualizar NovaOrdemForm (MODIFICAR)

```typescript
// src/components/forms/NovaOrdemForm.tsx

<LenteSelector
  onSelect={(data) => {
    setFormData((prev) => ({
      ...prev,
      grupo_canonico_id: data.grupo_canonico_id,
      lente_id: data.lente_id,
      nome_lente_selecionada: data.nome_lente,
      lente_slug_snapshot: data.slug,
      laboratorio_id: data.fornecedor_id, // ← Salva lab escolhido
      custo_lentes: data.preco_custo.toString(), // ← Salva custo
    }));
  }}
/>
```

---

## 📊 Dados Salvos no Pedido

```typescript
pedido = {
  // Campos existentes:
  loja_id: "...",
  laboratorio_id: "lab-Y", // ← Fornecedor escolhido manualmente
  classe_lente_id: "...", // ← Auto-preenchido pelo tipo

  // Integração com lentes:
  grupo_canonico_id: "abc-123", // ← Grupo escolhido (Passo 1)
  lente_id: "xyz-789", // ← Lente específica (Passo 2)
  nome_lente_selecionada: "Multifocal CR39 1.56 AR",
  lente_slug_snapshot: "multifocal-cr39-156-ar",

  // Custos:
  custo_lentes: 130.0, // ← Do fornecedor escolhido
  valor_pedido: 350.0, // ← Valor de venda (do PDV)

  // Controle:
  origem: "manual" | "pdv", // ← Saber de onde veio
};
```

---

## 🎯 Benefícios

### 1. **Controle Total**

- Operador vê TODAS as opções de labs
- Pode escolher com base em:
  - 💰 Melhor custo (maior margem)
  - ⚡ Prazo mais rápido
  - 🏷️ Marca preferida
  - 📦 Disponibilidade

### 2. **Transparência**

- Sistema mostra claramente:
  - "Lab B economiza R$ 20 vs Lab A"
  - "Lab C entrega 4 dias mais rápido"
  - Badge "Melhor Custo" destacado

### 3. **Rastreabilidade**

- Salva `lente_id` + `laboratorio_id`
- Pode auditar: "Quem escolheu? Por que esse lab?"
- Relatórios: "Qual lab dá melhor margem?"

### 4. **Flexibilidade Futura**

- Quando vier do PDV: já tem `grupo_canonico_id`
- Sistema busca automaticamente as opções
- Operador continua escolhendo manualmente

---

## ✅ Checklist de Implementação

### Backend/API:

- [ ] Verificar se view `v_lentes_cotacao_compra` está acessível via `lentesClient`
- [ ] Testar query: `SELECT * FROM v_lentes_cotacao_compra WHERE grupo_canonico_id = 'xxx'`
- [ ] Confirmar que `fornecedor_id` corresponde aos labs em `desenrola_dcl.laboratorios`

### Hooks:

- [ ] Atualizar `useLentesDoGrupo` para usar `v_lentes_cotacao_compra`
- [ ] Adicionar tipo `LenteComLaboratorio`
- [ ] Ordenar por `preco_custo ASC`

### Componentes:

- [ ] Criar `LenteDetalhesModal.tsx`
- [ ] Criar `LenteCard.tsx` com badge "Melhor Custo"
- [ ] Atualizar `LenteSelector.tsx` para abrir modal no click
- [ ] Atualizar `NovaOrdemForm.tsx` para receber dados completos

### UX:

- [ ] Destacar visualmente a lente com melhor custo (borda verde)
- [ ] Mostrar comparação: "Economiza R$ X vs mais caro"
- [ ] Mostrar ícones: 🏭 Lab, 💰 Custo, ⏱️ Prazo, 🏷️ Marca
- [ ] Loading state no modal enquanto busca lentes

### Validações:

- [ ] Se grupo não tem lentes: mostrar mensagem "Nenhuma opção disponível"
- [ ] Se só tem 1 lente: auto-selecionar? Ou sempre mostrar modal?
- [ ] Confirmar que `laboratorio_id` da lente existe em `desenrola_dcl.laboratorios`

---

**Próximo Passo:** Implementar hook `useLentesDoGrupo` atualizado! 🚀
