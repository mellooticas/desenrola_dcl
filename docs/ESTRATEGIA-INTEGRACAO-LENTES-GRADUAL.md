# 🎯 Estratégia de Integração Gradual - Catálogo de Lentes

**Data**: 20/12/2025  
**Status**: 📋 Planejamento  
**Objetivo**: Migrar sistema de criação de pedidos para usar catálogo real de lentes

---

## 🌟 Visão Estratégica

### Modelo Futuro (6-12 meses)

```
┌─────────────────────────────────────────────────────────┐
│              SISTEMA PDV (Venda Completa)                │
│                                                          │
│  • Cliente escolhe lente no PDV                         │
│  • Sistema calcula preço final                          │
│  • Receita médica validada                              │
│  • Pagamento processado                                 │
│  • Dados completos da venda                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ API: Envia venda completa
                   ▼
┌─────────────────────────────────────────────────────────┐
│        DESENROLA DCL (Motor de Lead Time)                │
│                                                          │
│  ✅ Recebe venda pronta do PDV                          │
│  ✅ Cria card no Kanban automaticamente                 │
│  ✅ Inicia tracking de produção                         │
│  ✅ Gestão de SLA e prazos                              │
│  ✅ Dashboard de performance                            │
└─────────────────────────────────────────────────────────┘
```

### Modelo Atual (Transição)

```
┌─────────────────────────────────────────────────────────┐
│     DESENROLA DCL (Sistema Completo Temporário)         │
│                                                          │
│  1. Motor de Escolha de Lentes (NOVA FUNCIONALIDADE)   │
│     ├─ Catálogo de 1.411 lentes reais                  │
│     ├─ 461 grupos canônicos                            │
│     ├─ Busca por receita do cliente                    │
│     ├─ Segmentação por faixa de preço                  │
│     ├─ Sugestões de upselling                          │
│     └─ Validação de margem mínima                      │
│                                                          │
│  2. Gestão de Lead Time (MANTÉM)                        │
│     ├─ Kanban de produção                              │
│     ├─ Timeline de eventos                             │
│     ├─ SLA por laboratório                             │
│     └─ Dashboard de performance                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Plano de Implementação em Fases

### FASE 1: Base de Integração (1-2 semanas) 🎯 **COMEÇAR AQUI**

#### 1.1 Adicionar Campos ao Pedido

```sql
-- Migração: add-lentes-catalog-fields.sql

ALTER TABLE public.pedidos
ADD COLUMN grupo_canonico_id UUID REFERENCES lens_catalog.grupos_canonicos(id),
ADD COLUMN lente_selecionada_id UUID, -- FK externa para banco de lentes
ADD COLUMN fornecedor_lente_id UUID, -- FK externa para fornecedor escolhido
ADD COLUMN preco_lente DECIMAL(10,2),
ADD COLUMN custo_lente DECIMAL(10,2),
ADD COLUMN margem_lente_percentual DECIMAL(5,2),
ADD COLUMN nome_lente TEXT, -- Snapshot (caso lente seja desativada)
ADD COLUMN nome_grupo_canonico TEXT, -- Snapshot
ADD COLUMN tratamentos_lente JSONB DEFAULT '[]'::jsonb,
ADD COLUMN selecao_automatica BOOLEAN DEFAULT false; -- Se foi escolhida automaticamente

-- Índices
CREATE INDEX idx_pedidos_grupo_canonico ON public.pedidos(grupo_canonico_id);
CREATE INDEX idx_pedidos_lente_selecionada ON public.pedidos(lente_selecionada_id);

-- Comentários
COMMENT ON COLUMN public.pedidos.grupo_canonico_id IS 'Grupo canônico da lente escolhida';
COMMENT ON COLUMN public.pedidos.lente_selecionada_id IS 'ID da lente específica no banco best_lens';
COMMENT ON COLUMN public.pedidos.fornecedor_lente_id IS 'Fornecedor escolhido para esta lente';
COMMENT ON COLUMN public.pedidos.selecao_automatica IS 'true = Sistema escolheu melhor opção | false = Vendedor escolheu manualmente';
```

#### 1.2 Criar TypeScript Types

```typescript
// src/lib/types/lentes.ts

export interface GrupoCanonicoSelecionado {
  id: string;
  nome_grupo: string;
  tipo_lente: "visao_simples" | "multifocal" | "bifocal";
  material: string;
  indice_refracao: string;
  preco_minimo: number;
  preco_medio: number;
  preco_maximo: number;
  total_fornecedores: number;
  total_marcas: number;
  tratamentos: {
    antirreflexo: boolean;
    antirrisco: boolean;
    uv: boolean;
    blue_light: boolean;
    fotossensiveis: "nenhum" | "fotocromático" | "polarizado";
  };
}

export interface LenteDetalhada {
  id: string;
  nome_lente: string;
  fornecedor_id: string;
  fornecedor_nome: string;
  marca_nome: string;
  preco_custo: number;
  preco_venda_sugerido: number;
  prazo_dias: number;
  estoque_disponivel?: number;
}

export interface PedidoComLente extends Pedido {
  grupo_canonico_id?: string | null;
  lente_selecionada_id?: string | null;
  fornecedor_lente_id?: string | null;
  preco_lente?: number | null;
  custo_lente?: number | null;
  margem_lente_percentual?: number | null;
  nome_lente?: string | null;
  nome_grupo_canonico?: string | null;
  tratamentos_lente?: any[];
  selecao_automatica?: boolean;
}
```

#### 1.3 Atualizar View Kanban

```sql
-- Migração: update-view-kanban-lentes.sql

CREATE OR REPLACE VIEW public.v_pedidos_kanban AS
SELECT
  p.id,
  p.numero_os,
  p.loja_id,
  l.nome as loja_nome,
  p.laboratorio_id,
  lab.nome as laboratorio_nome,
  p.classe_lente_id,
  cl.nome as classe_lente_nome,
  p.cliente_nome,
  p.cliente_telefone,
  p.status,
  p.prioridade,

  -- 🆕 CAMPOS DE LENTES
  p.grupo_canonico_id,
  p.lente_selecionada_id,
  p.fornecedor_lente_id,
  p.preco_lente,
  p.custo_lente,
  p.margem_lente_percentual,
  p.nome_lente,
  p.nome_grupo_canonico,
  p.tratamentos_lente,
  p.selecao_automatica,

  -- Campos existentes
  p.valor_pedido,
  p.custo_lentes,
  p.created_at,
  p.updated_at,

  -- SLA
  p.dias_sla_lab,
  p.dias_promessa_cliente,
  p.data_sla_lab,
  p.data_promessa_cliente,

  -- Indicadores de atraso
  CASE
    WHEN p.status NOT IN ('finalizado', 'entregue', 'cancelado')
      AND p.data_sla_lab < CURRENT_DATE
    THEN true
    ELSE false
  END as atrasado_lab,

  CASE
    WHEN p.status NOT IN ('finalizado', 'entregue', 'cancelado')
      AND p.data_promessa_cliente < CURRENT_DATE
    THEN true
    ELSE false
  END as atrasado_cliente

FROM public.pedidos p
LEFT JOIN public.lojas l ON p.loja_id = l.id
LEFT JOIN public.laboratorios lab ON p.laboratorio_id = lab.id
LEFT JOIN public.classes_lente cl ON p.classe_lente_id = cl.id
WHERE p.loja_id IN (
  SELECT unnest(lojas_visiveis)
  FROM obter_lojas_visiveis_usuario()
)
ORDER BY
  CASE p.prioridade
    WHEN 'URGENTE' THEN 1
    WHEN 'ALTA' THEN 2
    WHEN 'NORMAL' THEN 3
    WHEN 'BAIXA' THEN 4
  END,
  p.created_at DESC;
```

---

### FASE 2: Motor de Escolha de Lentes (2-3 semanas)

#### 2.1 Componente de Seleção de Lentes

```typescript
// src/components/lentes/SeletorLentesReceita.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  DollarSign,
  Clock,
} from "lucide-react";
import { lentesClient } from "@/lib/supabase/lentes-client";
import { GrupoCanonicoSelecionado } from "@/lib/types/lentes";

interface SeletorLentesReceitaProps {
  onSelecionar: (grupo: GrupoCanonicoSelecionado) => void;
  tipoLente?: "visao_simples" | "multifocal";
}

export function SeletorLentesReceita({
  onSelecionar,
  tipoLente = "visao_simples",
}: SeletorLentesReceitaProps) {
  const [receita, setReceita] = useState({
    esferico_od: "",
    cilindrico_od: "",
    esferico_oe: "",
    cilindrico_oe: "",
    adicao: "",
  });

  const [opcoes, setOpcoes] = useState<{
    economica: GrupoCanonicoSelecionado | null;
    intermediaria: GrupoCanonicoSelecionado | null;
    premium: GrupoCanonicoSelecionado | null;
  }>({
    economica: null,
    intermediaria: null,
    premium: null,
  });

  const [loading, setLoading] = useState(false);

  const buscarOpcoes = async () => {
    setLoading(true);
    try {
      // Converter graus para números
      const grauEsferico = Math.max(
        Math.abs(parseFloat(receita.esferico_od) || 0),
        Math.abs(parseFloat(receita.esferico_oe) || 0)
      );

      const grauCilindrico = Math.max(
        Math.abs(parseFloat(receita.cilindrico_od) || 0),
        Math.abs(parseFloat(receita.cilindrico_oe) || 0)
      );

      const adicao = parseFloat(receita.adicao) || 0;

      // Buscar grupos compatíveis por receita
      const { data, error } = await lentesClient
        .from("v_grupos_por_receita_cliente")
        .select("*")
        .eq("tipo_lente", tipoLente)
        .gte("grau_esferico_min", -grauEsferico)
        .lte("grau_esferico_max", grauEsferico)
        .gte("grau_cilindrico_min", -grauCilindrico)
        .lte("grau_cilindrico_max", grauCilindrico)
        .order("preco_medio");

      if (error) throw error;

      if (data && data.length > 0) {
        // Segmentar em 3 faixas
        const total = data.length;
        const economica = data[0]; // Mais barata
        const intermediaria = data[Math.floor(total / 2)]; // Meio
        const premium = data[total - 1]; // Mais cara

        setOpcoes({ economica, intermediaria, premium });
      }
    } catch (error) {
      console.error("Erro ao buscar opções:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Receita */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Dados da Receita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="esf_od">Esférico OD</Label>
              <Input
                id="esf_od"
                type="number"
                step="0.25"
                placeholder="-3.00"
                value={receita.esferico_od}
                onChange={(e) =>
                  setReceita((prev) => ({
                    ...prev,
                    esferico_od: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="cil_od">Cilíndrico OD</Label>
              <Input
                id="cil_od"
                type="number"
                step="0.25"
                placeholder="-1.00"
                value={receita.cilindrico_od}
                onChange={(e) =>
                  setReceita((prev) => ({
                    ...prev,
                    cilindrico_od: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="esf_oe">Esférico OE</Label>
              <Input
                id="esf_oe"
                type="number"
                step="0.25"
                placeholder="-3.00"
                value={receita.esferico_oe}
                onChange={(e) =>
                  setReceita((prev) => ({
                    ...prev,
                    esferico_oe: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="cil_oe">Cilíndrico OE</Label>
              <Input
                id="cil_oe"
                type="number"
                step="0.25"
                placeholder="-1.00"
                value={receita.cilindrico_oe}
                onChange={(e) =>
                  setReceita((prev) => ({
                    ...prev,
                    cilindrico_oe: e.target.value,
                  }))
                }
              />
            </div>
            {tipoLente === "multifocal" && (
              <div className="col-span-2 md:col-span-4">
                <Label htmlFor="adicao">Adição</Label>
                <Input
                  id="adicao"
                  type="number"
                  step="0.25"
                  placeholder="2.00"
                  value={receita.adicao}
                  onChange={(e) =>
                    setReceita((prev) => ({
                      ...prev,
                      adicao: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>
          <Button
            onClick={buscarOpcoes}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? "Buscando..." : "Buscar Opções Compatíveis"}
          </Button>
        </CardContent>
      </Card>

      {/* Cards de Opções */}
      {!loading &&
        (opcoes.economica || opcoes.intermediaria || opcoes.premium) && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Opção Econômica */}
            {opcoes.economica && (
              <OpcoesCard
                titulo="💰 Econômica"
                grupo={opcoes.economica}
                cor="blue"
                onSelecionar={() => onSelecionar(opcoes.economica!)}
              />
            )}

            {/* Opção Intermediária */}
            {opcoes.intermediaria && (
              <OpcoesCard
                titulo="⭐ Intermediária"
                grupo={opcoes.intermediaria}
                cor="purple"
                destaque
                onSelecionar={() => onSelecionar(opcoes.intermediaria!)}
              />
            )}

            {/* Opção Premium */}
            {opcoes.premium && (
              <OpcoesCard
                titulo="✨ Premium"
                grupo={opcoes.premium}
                cor="amber"
                onSelecionar={() => onSelecionar(opcoes.premium!)}
              />
            )}
          </div>
        )}
    </div>
  );
}

// Componente auxiliar para cards de opções
interface OpcoesCardProps {
  titulo: string;
  grupo: GrupoCanonicoSelecionado;
  cor: "blue" | "purple" | "amber";
  destaque?: boolean;
  onSelecionar: () => void;
}

function OpcoesCard({
  titulo,
  grupo,
  cor,
  destaque = false,
  onSelecionar,
}: OpcoesCardProps) {
  const cores = {
    blue: "border-blue-500 bg-blue-50/50",
    purple: "border-purple-500 bg-purple-50/50",
    amber: "border-amber-500 bg-amber-50/50",
  };

  return (
    <Card
      className={`${cores[cor]} ${
        destaque ? "ring-2 ring-purple-500" : ""
      } cursor-pointer hover:shadow-lg transition-all`}
      onClick={onSelecionar}
    >
      <CardHeader>
        <CardTitle className="text-lg">{titulo}</CardTitle>
        {destaque && (
          <Badge variant="secondary" className="w-fit">
            ⭐ Recomendado
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{grupo.nome_grupo}</p>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">
            R$ {grupo.preco_medio.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">
            de R${grupo.preco_minimo.toFixed(2)} a R$
            {grupo.preco_maximo.toFixed(2)}
          </span>
        </div>

        <div className="space-y-1 text-sm">
          <p>
            <strong>{grupo.total_fornecedores}</strong> fornecedores disponíveis
          </p>
          <p>
            <strong>{grupo.total_marcas}</strong> marcas para escolher
          </p>
        </div>

        {/* Tratamentos */}
        <div className="flex flex-wrap gap-1">
          {grupo.tratamentos.antirreflexo && (
            <Badge variant="outline" className="text-xs">
              ✨ AR
            </Badge>
          )}
          {grupo.tratamentos.uv && (
            <Badge variant="outline" className="text-xs">
              ☀️ UV
            </Badge>
          )}
          {grupo.tratamentos.blue_light && (
            <Badge variant="outline" className="text-xs">
              💙 Blue
            </Badge>
          )}
          {grupo.tratamentos.fotossensiveis !== "nenhum" && (
            <Badge variant="outline" className="text-xs">
              🌓 {grupo.tratamentos.fotossensiveis}
            </Badge>
          )}
        </div>

        <Button variant="outline" className="w-full" onClick={onSelecionar}>
          Selecionar <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
```

#### 2.2 Integrar no NovaOrdemForm

```typescript
// Adicionar ao NovaOrdemForm.tsx

import { SeletorLentesReceita } from "@/components/lentes/SeletorLentesReceita";
import { GrupoCanonicoSelecionado } from "@/lib/types/lentes";

// Adicionar ao estado
const [grupoSelecionado, setGrupoSelecionado] =
  useState<GrupoCanonicoSelecionado | null>(null);
const [usarSeletorLentes, setUsarSeletorLentes] = useState(false);

// Adicionar step no wizard
const STEPS = {
  1: "Dados Básicos",
  2: "Seleção de Lentes", // NOVO
  3: "Cliente e OS",
  4: "Valores e Confirmação",
};

// No render, adicionar:
{
  step === 2 && usarSeletorLentes && (
    <SeletorLentesReceita
      tipoLente={formData.classe_lente?.tipo_lente || "visao_simples"}
      onSelecionar={(grupo) => {
        setGrupoSelecionado(grupo);
        setFormData((prev) => ({
          ...prev,
          grupo_canonico_id: grupo.id,
          nome_grupo_canonico: grupo.nome_grupo,
          preco_lente: grupo.preco_medio,
          tratamentos_lente: grupo.tratamentos,
        }));
        setStep(3); // Avançar para próximo step
      }}
    />
  );
}

{
  step === 2 && !usarSeletorLentes && (
    <Card>
      <CardContent className="py-8 text-center space-y-4">
        <p className="text-muted-foreground">
          Deseja usar o novo sistema de seleção de lentes?
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setStep(3)}>
            Pular (usar sistema antigo)
          </Button>
          <Button onClick={() => setUsarSeletorLentes(true)}>
            ✨ Usar Catálogo de Lentes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### FASE 3: Sistema de Compras Automáticas (3-4 semanas)

#### 3.1 Escolha Inteligente de Fornecedor

```typescript
// src/lib/lentes/escolher-fornecedor.ts

import { lentesClient } from "@/lib/supabase/lentes-client";

export interface FornecedorEscolhido {
  fornecedor_id: string;
  fornecedor_nome: string;
  lente_id: string;
  lente_nome: string;
  preco_custo: number;
  prazo_dias: number;
  motivo_escolha: string;
}

export async function escolherMelhorFornecedor(
  grupoCanonicoId: string,
  prioridade: "preco" | "prazo" | "equilibrado" = "equilibrado"
): Promise<FornecedorEscolhido | null> {
  try {
    // Buscar todas as lentes do grupo com fornecedores
    const { data: lentes, error } = await lentesClient
      .from("v_fornecedores_por_lente")
      .select("*")
      .eq("grupo_canonico_id", grupoCanonicoId)
      .order("prazo_entrega_dias", { ascending: true });

    if (error || !lentes || lentes.length === 0) {
      return null;
    }

    let escolhida: FornecedorEscolhido;

    switch (prioridade) {
      case "preco":
        // Escolher mais barato
        const maisBarata = lentes.reduce((prev, curr) =>
          curr.preco_custo < prev.preco_custo ? curr : prev
        );
        escolhida = {
          fornecedor_id: maisBarata.fornecedor_id,
          fornecedor_nome: maisBarata.fornecedor_nome,
          lente_id: maisBarata.lente_id,
          lente_nome: maisBarata.lente_nome,
          preco_custo: maisBarata.preco_custo,
          prazo_dias: maisBarata.prazo_entrega_dias,
          motivo_escolha: `Menor custo: R$ ${maisBarata.preco_custo.toFixed(
            2
          )}`,
        };
        break;

      case "prazo":
        // Escolher mais rápido
        const maisRapida = lentes[0]; // Já ordenado por prazo
        escolhida = {
          fornecedor_id: maisRapida.fornecedor_id,
          fornecedor_nome: maisRapida.fornecedor_nome,
          lente_id: maisRapida.lente_id,
          lente_nome: maisRapida.lente_nome,
          preco_custo: maisRapida.preco_custo,
          prazo_dias: maisRapida.prazo_entrega_dias,
          motivo_escolha: `Menor prazo: ${maisRapida.prazo_entrega_dias} dias`,
        };
        break;

      case "equilibrado":
      default:
        // Fórmula: (preço normalizado * 0.6) + (prazo normalizado * 0.4)
        const precosNormalizados = normalizarValores(
          lentes.map((l) => l.preco_custo)
        );
        const prazosNormalizados = normalizarValores(
          lentes.map((l) => l.prazo_entrega_dias)
        );

        const scores = lentes.map((lente, idx) => ({
          lente,
          score: precosNormalizados[idx] * 0.6 + prazosNormalizados[idx] * 0.4,
        }));

        const melhorScore = scores.reduce((prev, curr) =>
          curr.score < prev.score ? curr : prev
        );

        escolhida = {
          fornecedor_id: melhorScore.lente.fornecedor_id,
          fornecedor_nome: melhorScore.lente.fornecedor_nome,
          lente_id: melhorScore.lente.lente_id,
          lente_nome: melhorScore.lente.lente_nome,
          preco_custo: melhorScore.lente.preco_custo,
          prazo_dias: melhorScore.lente.prazo_entrega_dias,
          motivo_escolha: `Melhor custo-benefício (score: ${melhorScore.score.toFixed(
            2
          )})`,
        };
        break;
    }

    return escolhida;
  } catch (error) {
    console.error("Erro ao escolher fornecedor:", error);
    return null;
  }
}

function normalizarValores(valores: number[]): number[] {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min;

  if (range === 0) return valores.map(() => 0);

  return valores.map((v) => (v - min) / range);
}
```

#### 3.2 Integrar Escolha Automática

```typescript
// No NovaOrdemForm.tsx - ao criar pedido

const handleSubmit = async () => {
  setLoading(true);
  try {
    // 1. Se tem grupo selecionado, escolher fornecedor
    if (grupoSelecionado) {
      const fornecedor = await escolherMelhorFornecedor(
        grupoSelecionado.id,
        "equilibrado"
      );

      if (fornecedor) {
        formData.fornecedor_lente_id = fornecedor.fornecedor_id;
        formData.lente_selecionada_id = fornecedor.lente_id;
        formData.custo_lente = fornecedor.preco_custo;
        formData.selecao_automatica = true;
      }
    }

    // 2. Criar pedido normalmente
    const resultado = await supabaseHelpers.criarPedidoCompleto(formData);

    // 3. Registrar evento de escolha de lente
    if (resultado.sucesso && fornecedor) {
      await registrarEventoTimeline(resultado.pedido.id, {
        tipo: "lente_selecionada",
        descricao: `Lente selecionada: ${fornecedor.lente_nome}`,
        detalhes: {
          fornecedor: fornecedor.fornecedor_nome,
          preco_custo: fornecedor.preco_custo,
          prazo_dias: fornecedor.prazo_dias,
          motivo: fornecedor.motivo_escolha,
        },
      });
    }

    // Sucesso
    onSuccess?.();
    setShowSuccessModal(true);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
  } finally {
    setLoading(false);
  }
};
```

---

### FASE 4: Melhorias e Otimização (2-3 semanas)

#### 4.1 Dashboard de Lentes

- **Lentes mais vendidas** (por grupo canônico)
- **Fornecedores mais usados**
- **Margem média por tipo de lente**
- **Performance de SLA por fornecedor**

#### 4.2 Gamificação de Vendas

- **Ranking de vendedores** por margem
- **Metas mensais** de venda de grupos premium
- **Comissão extra** para produtos com margem > 4x

#### 4.3 Sistema de Upselling

- Sugestões automáticas de upgrade
- Comparação lado a lado
- Calculadora de diferença de investimento

---

## 🔄 Fluxo Completo de Venda

```
VENDEDOR CRIA NOVO PEDIDO
         ↓
┌────────────────────────────┐
│  Step 1: Dados Básicos     │
│  • Loja                    │
│  • Cliente                 │
│  • Prioridade              │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│  Step 2: Seleção de Lentes │ 🆕 NOVO
│  • Informar receita        │
│  • Sistema busca compatív. │
│  • Mostra 3 opções:        │
│    - Econômica             │
│    - Intermediária ⭐      │
│    - Premium               │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│  Cliente escolhe opção     │
│  (Vendedor pode fazer      │
│   upselling aqui)          │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│  Sistema escolhe fornecedor│ 🤖 AUTOMÁTICO
│  • Busca v_fornecedores... │
│  • Calcula score           │
│  • Seleciona melhor        │
│  • Registra decisão        │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│  Step 3: Confirmação       │
│  • Valor final             │
│  • Margem                  │
│  • SLA calculado           │
│  • Observações             │
└────────┬───────────────────┘
         ↓
┌────────────────────────────┐
│  Pedido Criado ✅          │
│  • Card no Kanban          │
│  • Timeline iniciada       │
│  • Compra agendada (JIT)   │
└────────────────────────────┘
```

---

## 📊 Métricas de Sucesso

### Fase 1 (Base)

- ✅ Campos adicionados na tabela pedidos
- ✅ View kanban atualizada
- ✅ Types TypeScript criados
- ✅ 0 erros de migração

### Fase 2 (Motor de Escolha)

- ✅ Componente de seleção funcional
- ✅ Busca por receita retorna resultados
- ✅ Segmentação em 3 opções funcionando
- ✅ 50% dos novos pedidos usando seletor

### Fase 3 (Compras Automáticas)

- ✅ Escolha automática de fornecedor
- ✅ Registro correto de lente/fornecedor
- ✅ Timeline com eventos de lente
- ✅ 80% das vendas com fornecedor auto-escolhido

### Fase 4 (Otimização)

- ✅ Dashboard de lentes implementado
- ✅ Sistema de upselling ativo
- ✅ Gamificação gerando engajamento
- ✅ 30% de conversão em upselling

---

## ⚠️ Pontos de Atenção

### Migração Gradual

- ✅ **Manter sistema antigo funcionando** durante transição
- ✅ **Não quebrar pedidos existentes** - campos novos nullable
- ✅ **Permitir pular seletor** - adoção gradual pelos vendedores
- ✅ **Validação de dados** - receita pode vir incompleta

### Performance

- ✅ **Cache de grupos** - evitar busca repetida
- ✅ **Índices no banco** - busca por receita rápida
- ✅ **Lazy loading** - carregar detalhes sob demanda

### UX

- ✅ **Feedback visual** - loading states
- ✅ **Validação de receita** - graus inválidos
- ✅ **Mensagens de erro** - claras e acionáveis
- ✅ **Tutorial inicial** - onboarding para vendedores

---

## 🎯 Próximos Passos Imediatos

### Esta Semana

1. ✅ **Criar migração** `add-lentes-catalog-fields.sql`
2. ✅ **Atualizar types** TypeScript
3. ✅ **Atualizar view** `v_pedidos_kanban`
4. ⏳ **Testar** migração em desenvolvimento

### Próxima Semana

1. ⏳ **Criar componente** `SeletorLentesReceita`
2. ⏳ **Integrar** no `NovaOrdemForm`
3. ⏳ **Testes** com vendedores
4. ⏳ **Ajustes** baseados em feedback

### Próximo Mês

1. ⏳ **Sistema de escolha** automática de fornecedor
2. ⏳ **Dashboard** de lentes
3. ⏳ **Upselling** inteligente
4. ⏳ **Gamificação** básica

---

## 📝 Notas Técnicas

### Conexão com Banco de Lentes

```typescript
// .env.local
NEXT_PUBLIC_LENTES_SUPABASE_URL=https://jrhevexrzaoeyhmpwvgs.supabase.co
NEXT_PUBLIC_LENTES_SUPABASE_ANON_KEY=eyJhbGci...
```

### Views Disponíveis

- `v_grupos_por_receita_cliente` - Busca principal
- `v_grupos_por_faixa_preco` - Segmentação
- `v_sugestoes_upgrade` - Upselling
- `v_fornecedores_por_lente` - Escolha fornecedor
- `v_lentes_cotacao_compra` - Sistema compras

### Permissões

- Role `anon` tem SELECT em todas as views públicas
- Sem RLS (segurança via views + role)
- Dados sensíveis (CNPJ, preços) filtrados nas views

---

**Documento vivo - atualizar conforme implementação**  
**Última atualização**: 20/12/2025
