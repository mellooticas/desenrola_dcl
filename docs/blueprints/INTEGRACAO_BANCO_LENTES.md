# 🔗 Integração Banco de Lentes - Guia Rápido

## 📋 Visão Geral

O sistema **Desenrola DCL** agora está integrado com um **segundo banco de dados** dedicado ao catálogo de lentes (Best Lens Catalog).

### Arquitetura

```
┌─────────────────────────────────────────┐
│   Desenrola DCL (Banco Principal)       │
│   - Pedidos                             │
│   - Lojas                               │
│   - Usuários                            │
│   - Mission Control                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Best Lens Catalog (Banco de Lentes)   │
│   - 1.411 lentes                        │
│   - 461 grupos canônicos                │
│   - 11 fornecedores                     │
│   - Sistema de compras JIT              │
└─────────────────────────────────────────┘
```

---

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione no seu `.env.local`:

```bash
# ========================================
# BANCO DE LENTES - Best Lens Catalog
# ========================================
NEXT_PUBLIC_LENTES_SUPABASE_URL=https://seu-projeto-lentes.supabase.co
NEXT_PUBLIC_LENTES_SUPABASE_ANON_KEY=sua-anon-key-aqui

# Backend/API (opcional - apenas para admin)
LENTES_SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### 2. Cliente Supabase

Já está configurado em `src/lib/supabase/lentes-client.ts`:

```typescript
import { lentesClient } from "@/lib/supabase/lentes-client";

// Cliente público (frontend)
const { data } = await lentesClient.from("v_grupos_canonicos").select("*");

// Cliente admin (backend) - use apenas em API routes
import { lentesAdminClient } from "@/lib/supabase/lentes-client";
```

---

## 🎯 Views Disponíveis

O banco de lentes expõe **views otimizadas** no schema `public`:

### 📊 Para PDV / Vendas

| View                           | Propósito       | Uso                                     |
| ------------------------------ | --------------- | --------------------------------------- |
| `v_grupos_por_receita_cliente` | Busca por graus | Receita do cliente → grupos compatíveis |
| `v_grupos_por_faixa_preco`     | Segmentação     | "Quanto investiu no último?" → 3 opções |
| `v_grupos_melhor_margem`       | Gamificação     | Produtos com melhor lucro → premiação   |
| `v_sugestoes_upgrade`          | Upselling       | Produto básico → sugestões premium      |
| `v_grupos_canonicos`           | Catálogo geral  | Listagem com filtros                    |

### 🛒 Para Sistema de Compras (DCL)

| View                       | Propósito         | Uso                                       |
| -------------------------- | ----------------- | ----------------------------------------- |
| `v_fornecedores_por_lente` | Decisão de compra | Lente vendida → escolher fornecedor (SLA) |
| `v_lentes_cotacao_compra`  | Cotação rápida    | Múltiplas lentes → preços e prazos        |

---

## 🚀 Hooks React Query

Use os hooks pré-configurados em `src/hooks/useLentes.ts`:

### Exemplo 1: Busca por Receita do Cliente

```typescript
import { useGruposPorReceita } from "@/hooks/useLentes";

function CatalogoPDV() {
  const { data: grupos, isLoading } = useGruposPorReceita({
    grauEsferico: -4.5,
    grauCilindrico: -1.5,
    adicao: 2.0, // Para multifocais
  });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h2>Opções compatíveis com sua receita</h2>
      {grupos?.map((grupo) => (
        <GrupoCard key={grupo.grupo_id} grupo={grupo} />
      ))}
    </div>
  );
}
```

### Exemplo 2: Sugestão de Upgrade (Upselling)

```typescript
import { useSugestoesUpgrade } from "@/hooks/useLentes";

function ModalUpgrade({ grupoSelecionado }) {
  const { data: upgrades } = useSugestoesUpgrade(grupoSelecionado.grupo_id);

  return (
    <div>
      <p>Você escolheu: {grupoSelecionado.nome_grupo}</p>
      <h3>Por apenas R$X a mais, leve:</h3>
      {upgrades?.map((upgrade) => (
        <UpgradeOption key={upgrade.grupo_upgrade_id} upgrade={upgrade} />
      ))}
    </div>
  );
}
```

### Exemplo 3: Escolher Fornecedor (Sistema DCL)

```typescript
import { useMelhorFornecedor } from "@/hooks/useLentes";

function ProcessarCompra({ lenteVendida }) {
  const { data: fornecedor } = useMelhorFornecedor(lenteVendida.lente_id);

  useEffect(() => {
    if (fornecedor) {
      // Criar pedido automático
      criarPedidoCompra({
        lente_id: lenteVendida.lente_id,
        fornecedor_id: fornecedor.fornecedor_id,
        preco_custo: fornecedor.preco_custo,
        prazo_dias: fornecedor.prazo_entrega_dias,
      });
    }
  }, [fornecedor]);

  return <div>Pedido enviado para {fornecedor?.fornecedor_nome}</div>;
}
```

---

## 📦 Estrutura de Dados

### GrupoCanonicoView

```typescript
{
  grupo_id: string
  nome_grupo: string // "Lente CR39 1.50 Visão Simples +AR +UV"
  slug: string
  tipo_lente: 'visao_simples' | 'multifocal' | 'bifocal'
  material: 'CR39' | 'POLICARBONATO' | 'TRIVEX' | ...
  indice_refracao: '1.50' | '1.56' | '1.59' | '1.61' | '1.67' | '1.74'

  // Preços
  preco_minimo: number   // R$ 75.00
  preco_medio: number    // R$ 89.90 ⭐ Use este no PDV
  preco_maximo: number   // R$ 120.00

  // Estatísticas
  total_lentes: number         // 15 opções disponíveis
  total_fornecedores: number   // 3 fornecedores
  total_marcas: number         // 5 marcas

  // Tratamentos
  antirreflexo: boolean
  blue_light: boolean
  fotossensiveis: 'nenhum' | 'fotocromático' | 'polarizado'

  // Classificação
  is_premium: boolean
  categoria: 'economica' | 'intermediaria' | 'premium'
}
```

### FornecedorPorLenteView

```typescript
{
  lente_id: string;
  lente_nome: string;
  fornecedor_id: string;
  fornecedor_nome: string;
  preco_custo: number; // R$ 21.50
  prazo_entrega_dias: number; // 7 dias
  ranking_fornecedor: number; // 1 = melhor (menor prazo + menor custo)
}
```

---

## 🎯 Fluxo Completo de Venda

```typescript
// 1️⃣ Cliente informa receita
const receita = {
  grauEsferico: -5.0,
  grauCilindrico: -2.0,
};

// 2️⃣ Buscar grupos compatíveis
const { data: grupos } = useGruposPorReceita(receita);

// 3️⃣ Mostrar 3 opções (econômica, intermediária, premium)
const economica = grupos?.filter((g) => g.preco_medio < 150)[0];
const intermediaria = grupos?.filter(
  (g) => g.preco_medio >= 150 && g.preco_medio < 400
)[0];
const premium = grupos?.filter((g) => g.preco_medio >= 400)[0];

// 4️⃣ Cliente escolhe → sugerir upgrade
const { data: upgrades } = useSugestoesUpgrade(economica.grupo_id);

// 5️⃣ Calcular preço final com desconto
const { data: precificacao } = useCalcularPrecoComDesconto(
  economica.grupo_id,
  "vendedor",
  8 // 8% desconto
);

// 6️⃣ Venda confirmada → Sistema DCL escolhe fornecedor
const { data: fornecedor } = useMelhorFornecedor(lenteEscolhida.lente_id);

// 7️⃣ Criar pedido de compra automático
await criarPedidoCompra(fornecedor);
```

---

## ⚡ Performance

### Cache (React Query)

Já configurado nos hooks:

- **Grupos canônicos**: 10 min
- **Receita/filtros**: 5 min
- **Fornecedores**: 5 min
- **Cotações**: 3 min (mais frequente)
- **Cálculo de preço**: 1 min

### Otimização

- Views no banco já possuem JOINs pré-calculados
- Índices otimizados para ranges de graus
- GIN index para buscas JSONB

---

## 🔐 Segurança

### Row Level Security (RLS)

O banco de lentes possui RLS configurado:

- ✅ Frontend acessa apenas views do schema `public`
- ✅ Views expõem apenas dados necessários
- ✅ Service role key só para backend (compras)
- ❌ Nunca expor `LENTES_SUPABASE_SERVICE_ROLE_KEY` no frontend

### Permissões

```sql
-- Anon pode ler views
GRANT SELECT ON public.v_grupos_canonicos TO anon;
GRANT SELECT ON public.v_grupos_por_receita_cliente TO anon;
-- ... outras views

-- Service role tem acesso total (apenas backend)
```

---

## 🧪 Testes

### Testar Conexão

```typescript
import { testLentesConnection } from "@/lib/supabase/lentes-client";

// Em um useEffect ou API route
const testar = async () => {
  const ok = await testLentesConnection();
  console.log(ok ? "✅ Conectado" : "❌ Falhou");
};
```

### Query Manual

```typescript
import { lentesClient } from "@/lib/supabase/lentes-client";

// Buscar grupos multifocais
const { data, error } = await lentesClient
  .from("v_grupos_canonicos")
  .select("*")
  .eq("tipo_lente", "multifocal")
  .order("preco_medio")
  .limit(10);

console.log(data);
```

---

## 📚 Próximos Passos

1. ✅ **Configurar .env** com credenciais do banco de lentes
2. ⏳ **Criar página de catálogo** (`/catalogo`) usando os hooks
3. ⏳ **Integrar PDV** com busca por receita
4. ⏳ **Implementar sistema de compras** (DCL automático)
5. ⏳ **Dashboard de margem** para gamificação de vendedores

---

## 🆘 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"

**Solução**: Configure `NEXT_PUBLIC_LENTES_SUPABASE_URL` e `NEXT_PUBLIC_LENTES_SUPABASE_ANON_KEY` no `.env.local`

### Erro: "relation 'v_grupos_canonicos' does not exist"

**Solução**: As views precisam ser criadas no banco. Execute os scripts SQL do blueprint.

### Erro: "permission denied for table"

**Solução**: Verifique se a anon key tem permissão de SELECT nas views públicas.

---

## 📖 Documentação Completa

- [Blueprint Completo do Banco](./BLUEPRINT_COMPLETO_BANCO.md)
- [Blueprint Sistema de Compras](./BLUEPRINT_DCL_COMPRAS.md)
- [Schemas e Views](../database/)

---

**Última atualização**: 20/12/2025  
**Status**: ✅ Cliente configurado e pronto para uso
