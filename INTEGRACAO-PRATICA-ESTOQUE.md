# 🔗 INTEGRAÇÃO PRÁTICA: SIS_Estoque + Desenrola DCL

**Data:** 17 de Janeiro de 2026  
**Foco:** Fluxos práticos e exemplos de código para integrar estoque de armações

---

## 📌 VISÃO GERAL DA INTEGRAÇÃO

```
┌─────────────────────────────────────────────────────────────────┐
│                         PDV (Loja Física)                       │
│  [Venda de óculos] → Sistema envia armação selecionada          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DESENROLA DCL                              │
│  • Recebe: armacao_sku, tipo_pedido, loja_id                   │
│  • Valida estoque contra SIS_Estoque                            │
│  • Cria pedido (completo, concerto, armação branca)             │
│  • Ao finalizar: Registra saída de armação                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SIS_ESTOQUE                                │
│  • Busca produto em: vw_estoque_completo                        │
│  • Registra saída via: registrar_saida_estoque()                │
│  • Atualiza: estoque_produto, estoque_movimentacoes             │
│  • Retorna novo saldo para Desenrola confirmar                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 CENÁRIOS DE USO

### **Cenário 1: Venda Completa (Armação + Lentes do Laboratório)**

#### Dados do Pedido

```typescript
const pedidoCompleto = {
  id: "pedido-001",
  loja_id: "loja-principal",
  tipo: "completo",
  armacao: {
    id: "prod-armacao-001",
    sku: "MELLO-CAT-EYE-PRETO",
    tamanho: "52-18-140",
  },
  cliente: "João Silva",
  laboratorio_id: "lab-mello", // Já existe em laboratorios
  lentes_especificacoes: {
    tipo: "progressiva",
    esfera_od: -2.0,
    esfera_oe: -2.5,
  },
  preco_total: 800.0,
};
```

#### Fluxo em Desenrola

```typescript
// 1. Validar armação no SIS_Estoque
const armacao = await fetch(
  "http://sis-estoque/api/produtos/sku/MELLO-CAT-EYE-PRETO"
);
// Retorna: { id: UUID, sku, quantidade_atual: 5, preco_venda: 300 }

if (armacao.quantidade_atual < 1) {
  throw new Error("Armação sem estoque");
}

// 2. Criar pedido em Desenrola
const pedidoCriado = await criarPedido({
  tipo: "completo",
  armacao_id: armacao.id,
  laboratorio_id,
  cliente_id,
  // ... resto dos dados
});

// 3. Registrar saída de armação
const saida = await fetch("http://sis-estoque/api/movimentacao/saida", {
  method: "POST",
  body: JSON.stringify({
    produto_id: armacao.id,
    loja_id: "loja-principal",
    quantidade: 1,
    tamanho: "52-18-140",
    tipo_movimentacao: "venda",
    motivo: `Pedido #${pedidoCriado.id}`,
    documento: pedidoCriado.id,
  }),
});

// 4. Atualizar pedido com referência de movimentação
await atualizarPedido(pedidoCriado.id, {
  estoque_saida_id: saida.id,
  status: "producao",
});
```

---

### **Cenário 2: Concerto (Peças de Reposição)**

#### Dados do Pedido

```typescript
const pedidoConcerto = {
  id: "pedido-concerto-001",
  loja_id: "loja-principal",
  tipo: "concerto",
  cliente: "Maria Santos",
  pecas_substituidas: [
    {
      nome: "Ponte de Metal",
      produto_id: "prod-ponte-001",
      quantidade: 1,
      preco: 25.0,
    },
    {
      nome: "Hastes Ajustáveis",
      produto_id: "prod-haste-001",
      quantidade: 2,
      preco: 15.0,
    },
  ],
  preco_total: 55.0,
  data_prometida: "2026-01-20",
};
```

#### Fluxo em Desenrola

```typescript
// 1. Validar todas as peças
for (const peca of pecas_substituidas) {
  const estoque = await produtosService.buscarPorId(peca.produto_id);

  if (!estoque || estoque.quantidade_atual < peca.quantidade) {
    throw new Error(`Peça ${peca.nome} sem estoque`);
  }
}

// 2. Criar pedido concerto
const pedidoCriado = await criarPedido({
  tipo: "concerto",
  pecas_ids: pecas_substituidas.map((p) => p.produto_id),
  cliente_id,
  // ... resto
});

// 3. Registrar saída de CADA peça
const saidas = [];
for (const peca of pecas_substituidas) {
  const saida = await estoqueService.registrarSaida({
    produto_id: peca.produto_id,
    loja_id: "loja-principal",
    quantidade: peca.quantidade,
    tipo_movimentacao: "venda",
    motivo: `Concerto #${pedidoCriado.id}`,
    documento: pedidoCriado.id,
  });
  saidas.push(saida.id);
}

// 4. Atualizar pedido
await atualizarPedido(pedidoCriado.id, {
  estoque_saida_ids: saidas,
  status: "processamento",
});
```

---

### **Cenário 3: Armação Branca (Sem Lentes)**

#### Dados do Pedido

```typescript
const armacaoBranca = {
  id: "pedido-branca-001",
  loja_id: "loja-principal",
  tipo: "armacao_branca",
  armacao: {
    id: "prod-armacao-002",
    sku: "VOGUE-REDONDA-OURO",
    tamanho: "54-20-145",
  },
  cliente: "Pedro Oliveira",
  obs: "Cliente traz seus próprios óculos para ajuste",
  preco_total: 300.0, // Apenas armação
};
```

#### Fluxo em Desenrola

```typescript
// 1. Validar armação
const armacao = await produtosService.buscarPorId(armacaoBranca.armacao_id);

if (!armacao || armacao.quantidade_atual < 1) {
  throw new Error("Armação sem estoque");
}

// 2. Criar pedido
const pedidoCriado = await criarPedido({
  tipo: "armacao_branca",
  armacao_id: armacao.id,
  cliente_id,
  // ... resto
});

// 3. Registrar saída de armação
const saida = await estoqueService.registrarSaida({
  produto_id: armacao.id,
  loja_id: "loja-principal",
  quantidade: 1,
  tamanho: "54-20-145",
  tipo_movimentacao: "venda",
  motivo: `Armação Branca #${pedidoCriado.id}`,
  documento: pedidoCriado.id,
});

// 4. Atualizar pedido - NÃO vai para laboratório
await atualizarPedido(pedidoCriado.id, {
  estoque_saida_id: saida.id,
  status: "entregue", // Pode ser entregue imediatamente
});
```

---

## 🗂️ MUDANÇAS NA TABELA `pedidos`

### **Adicionar campos**

```sql
-- Expansão da tabela para suportar armações
ALTER TABLE pedidos ADD COLUMN (
  -- Tipo de pedido (novo campo)
  tipo_pedido VARCHAR(50) DEFAULT 'completo'
    CHECK (tipo_pedido IN ('completo', 'concerto', 'armacao_branca', 'servico')),

  -- Armação (novo campo obrigatório para tipo não 'concerto')
  armacao_id UUID REFERENCES produtos(id),

  -- Peças para concertos (array de UUIDs)
  pecas_ids UUID[] DEFAULT '{}',

  -- Referência de movimentação de estoque
  estoque_saida_ids UUID[] DEFAULT '{}',

  -- Observações específicas
  obs_armacao TEXT,

  -- Controle de alterações
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pedidos_armacao ON pedidos(armacao_id);
CREATE INDEX idx_pedidos_tipo ON pedidos(tipo_pedido);
```

### **Trigger para validar**

```sql
-- Validar que armacao_id é obrigatório para alguns tipos
CREATE OR REPLACE FUNCTION validar_pedido_armacao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tipo_pedido IN ('completo', 'armacao_branca') THEN
    IF NEW.armacao_id IS NULL THEN
      RAISE EXCEPTION 'Armação obrigatória para tipo pedido: %', NEW.tipo_pedido;
    END IF;
  END IF;

  IF NEW.tipo_pedido = 'concerto' THEN
    IF array_length(NEW.pecas_ids, 1) IS NULL OR array_length(NEW.pecas_ids, 1) = 0 THEN
      RAISE EXCEPTION 'Concerto deve ter pelo menos 1 peça';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_validar_pedido_armacao
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION validar_pedido_armacao();
```

---

## 💻 EXEMPLO COMPLETO: Hook React para Integração

### **Hook: `useArmacaoEstoque.ts`** (Desenrola DCL)

```typescript
// Dentro de: src/hooks/useArmacaoEstoque.ts

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

interface ArmacaoStatus {
  id: string;
  sku: string;
  nome: string;
  quantidade_atual: number;
  preco_venda: number;
  pode_reservar: boolean;
}

export function useArmacaoEstoque() {
  const [estoque, setEstoque] = useState<ArmacaoStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar armação no SIS_Estoque por SKU
   */
  const buscarArmacao = useCallback(
    async (sku: string): Promise<ArmacaoStatus | null> => {
      setLoading(true);
      setError(null);

      try {
        // Chamada ao SIS_Estoque (via API ou Supabase direto)
        const { data, error: err } = await supabase
          .from("vw_estoque_completo")
          .select("produto_id, sku, descricao, quantidade_atual, preco_venda")
          .eq("sku", sku)
          .eq("tipo_produto", "armacao")
          .single();

        if (err) {
          throw new Error(`Armação não encontrada: ${err.message}`);
        }

        const armacao: ArmacaoStatus = {
          id: data.produto_id,
          sku: data.sku,
          nome: data.descricao,
          quantidade_atual: data.quantidade_atual,
          preco_venda: data.preco_venda,
          pode_reservar: data.quantidade_atual > 0,
        };

        setEstoque(armacao);
        return armacao;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        toast.error(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Registrar saída de armação (venda)
   */
  const registrarSaidaArmacao = useCallback(
    async (
      armacaoId: string,
      lojaId: string,
      tamanho: string,
      pedidoId: string
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Chamar RPC de saída
        const { data, error: err } = await supabase.rpc(
          "registrar_saida_estoque",
          {
            p_produto_id: armacaoId,
            p_quantidade: 1,
            p_loja_id: lojaId,
            p_tipo: "saida_venda",
            p_motivo: `Venda - Pedido #${pedidoId}`,
            p_tamanho: tamanho,
            p_observacao: `Armação vendida para pedido ${pedidoId}`,
          }
        );

        if (err) {
          throw new Error(`Erro ao registrar saída: ${err.message}`);
        }

        toast.success(
          `Armação baixada do estoque (saldo: ${data.quantidade_atual})`
        );
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        setError(msg);
        toast.error(msg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Validar se pode criar pedido
   */
  const validarPedido = useCallback(
    (tipo: "completo" | "concerto" | "armacao_branca"): boolean => {
      if (tipo !== "concerto" && !estoque) {
        setError("Armação não carregada");
        return false;
      }

      if (tipo !== "concerto" && !estoque?.pode_reservar) {
        setError("Armação sem estoque disponível");
        return false;
      }

      return true;
    },
    [estoque]
  );

  return {
    // Estado
    estoque,
    loading,
    error,
    // Métodos
    buscarArmacao,
    registrarSaidaArmacao,
    validarPedido,
  };
}
```

### **Componente: `FormularioPedido.tsx`** (usando o hook)

```typescript
"use client";

import { useState } from "react";
import { useArmacaoEstoque } from "@/hooks/useArmacaoEstoque";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

export function FormularioPedido() {
  const { buscarArmacao, registrarSaidaArmacao, validarPedido } =
    useArmacaoEstoque();

  const [sku, setSku] = useState("");
  const [tipoPedido, setTipoPedido] = useState<
    "completo" | "concerto" | "armacao_branca"
  >("completo");
  const [loadingBusca, setLoadingBusca] = useState(false);
  const [loadingCriacao, setLoadingCriacao] = useState(false);

  // Buscar armação quando usuário digita SKU
  const handleBuscarArmacao = async () => {
    if (!sku) {
      toast.error("Informe o SKU da armação");
      return;
    }

    setLoadingBusca(true);
    const resultado = await buscarArmacao(sku);
    setLoadingBusca(false);

    if (resultado) {
      toast.success(`Armação encontrada: ${resultado.nome}`);
    }
  };

  // Criar pedido
  const handleCriarPedido = async () => {
    // Validação
    if (!validarPedido(tipoPedido)) {
      return;
    }

    setLoadingCriacao(true);

    try {
      // 1. Criar pedido em Desenrola
      const pedido = await criarPedidoEmDesenrola({
        tipo: tipoPedido,
        armacao_id: armacao?.id,
        // ... outros dados
      });

      // 2. Se armação, registrar saída
      if (tipoPedido !== "concerto" && armacao) {
        const sucesso = await registrarSaidaArmacao(
          armacao.id,
          lojaId, // de algum contexto
          tamanho, // do form
          pedido.id
        );

        if (!sucesso) {
          throw new Error("Falha ao registrar saída de estoque");
        }
      }

      toast.success(`Pedido #${pedido.id} criado com sucesso!`);
      // Redirecionar ou limpar form
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar pedido");
    } finally {
      setLoadingCriacao(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label>SKU Armação</label>
        <div className="flex gap-2">
          <Input
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="MELLO-CAT-EYE"
          />
          <Button onClick={handleBuscarArmacao} loading={loadingBusca}>
            Buscar
          </Button>
        </div>
      </div>

      {armacao && (
        <div className="bg-blue-50 p-4 rounded">
          <p className="font-semibold">{armacao.nome}</p>
          <p className="text-sm">Estoque: {armacao.quantidade_atual} un.</p>
          <p className="text-sm">Preço: R$ {armacao.preco_venda}</p>
        </div>
      )}

      <div>
        <label>Tipo de Pedido</label>
        <Select
          value={tipoPedido}
          onChange={(e) => setTipoPedido(e.target.value as any)}
        >
          <option value="completo">Completo (Armação + Lentes)</option>
          <option value="armacao_branca">Armação Branca</option>
          <option value="concerto">Concerto (Peças)</option>
        </Select>
      </div>

      <Button
        onClick={handleCriarPedido}
        loading={loadingCriacao}
        disabled={!armacao && tipoPedido !== "concerto"}
      >
        Criar Pedido
      </Button>
    </div>
  );
}
```

---

## 📊 ARQUITETURA DE DADOS: ANTES vs DEPOIS

### **ANTES (Apenas Desenrola)**

```
┌─────────────────────┐
│     pedidos         │
├─────────────────────┤
│ id                  │
│ cliente_id          │
│ laboratorio_id      │
│ status              │
│ data_criacao        │
│ data_entrega        │
│ preco_total         │
│ observacoes         │
└─────────────────────┘

❌ Sem controle de armação
❌ Sem rastreamento de estoque
```

### **DEPOIS (Com SIS_Estoque)**

```
┌──────────────────────────────────┐
│        PEDIDOS (Desenrola)       │
├──────────────────────────────────┤
│ id, cliente_id, laboratorio_id   │
│ tipo_pedido ← NOVO               │
│ armacao_id ← NOVO (FK produtos)  │
│ pecas_ids ← NOVO (array UUIDs)   │
│ estoque_saida_ids ← NOVO         │
│ status, data_entrega, preco      │
└──────────────────────────────────┘
        ↓ Vinculado a ↓
┌──────────────────────────────────┐
│   PRODUTOS (SIS_Estoque)         │
├──────────────────────────────────┤
│ id, sku, descricao, tipo         │
│ marca, modelo, tamanho, cor      │
│ preco_custo, preco_venda, markup │
│ categoria, fornecedor, ativo     │
└──────────────────────────────────┘
        ↓ Saldo em ↓
┌──────────────────────────────────┐
│   ESTOQUE_PRODUTO (SIS_Estoque)  │
├──────────────────────────────────┤
│ id, produto_id, loja_id          │
│ quantidade, quantidade_min/max    │
│ localizacao, valor_unitario      │
└──────────────────────────────────┘
        ↓ Rastreado por ↓
┌──────────────────────────────────┐
│  ESTOQUE_MOVIMENTACOES (Audit)   │
├──────────────────────────────────┤
│ id, produto_id, loja_id, tipo    │
│ quantidade, valor_total, motivo  │
│ documento_ref (pedido_id), lote  │
│ usuario_id, data_movimento       │
└──────────────────────────────────┘

✅ Rastreamento completo
✅ Auditoria integrada
✅ Multi-loja
```

---

## 🔄 SINCRONIZAÇÃO ENTRE SISTEMAS

### **Opção 1: Síncrona (Recomendado)**

```
Desenrola DCL
    ↓ (POST /api/pedido)
SIS_Estoque valida & registra saída
    ↓ (resposta JSON)
Desenrola confirma e salva
```

**Vantagem:** Consistência garantida  
**Desvantagem:** Requer conectividade simultânea

### **Opção 2: Assíncrona (Webhook)**

```
Desenrola cria pedido localmente
    ↓
Enfileira job: "registrar_saida"
    ↓
Background job executa após 5s
    ↓
Se falhar, retry automático (3x)
    ↓
Log de inconsistências para auditoria
```

**Vantagem:** Resiliente a falhas  
**Desvantagem:** Lag temporal pequeno

### **Opção 3: Event-driven (Supabase Realtime)**

```
Desenrola insere pedido
    ↓
RLS Policy dispara Insert
    ↓
Trigger chama: estoque_service.registrarSaida()
    ↓
Realtime notifica ambos os sistemas
    ↓
UIs atualizam em tempo real
```

**Vantagem:** Mais elegante e reativo  
**Desvantagem:** Mais complexo de debugar

---

## ⚠️ TRATAMENTO DE ERROS COMUNS

### **Erro: "Armação sem estoque"**

```typescript
// Causas possíveis:
1. Estoque zerado
2. SKU inválido
3. Produto deletado (soft delete)
4. Loja incorreta

// Tratamento:
try {
  const armacao = await buscarArmacao(sku)
} catch (err) {
  if (err.code === 'NOT_FOUND') {
    // Mostrar lista de armações similares
    sugestoes = await buscarArmacoesSimilares(sku)
  } else if (err.code === 'ESTOQUE_ZERO') {
    // Ofertar pre-venda ou sugerir outra cor
    similares = await buscarSimilares(armacao)
  }
}
```

### **Erro: "RPC falhou"**

```typescript
// Validar antes de chamar RPC:
const validacoes = [
  { condicao: !produto_id, msg: "Produto inválido" },
  { condicao: !loja_id, msg: "Loja não selecionada" },
  { condicao: quantidade <= 0, msg: "Quantidade inválida" },
  { condicao: quantidade > estoque_atual, msg: "Estoque insuficiente" },
];

const erro = validacoes.find((v) => v.condicao);
if (erro) throw new Error(erro.msg);

// Se mesmo assim falhar, registrar para debugging
try {
  await estoqueService.registrarSaida(dados);
} catch (err) {
  logger.error("RPC_FALHA", {
    dados,
    erro: err.message,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [ ] **Banco de Dados**

  - [ ] Adicionar campos a `pedidos`
  - [ ] Criar trigger de validação
  - [ ] Copiar views de `vw_estoque_completo`
  - [ ] Copiar RPCs de `registrar_saida_estoque`
  - [ ] Testar com dados de exemplo

- [ ] **Backend (Desenrola)**

  - [ ] Criar controller `/api/pedidos/:id/armacao`
  - [ ] Integrar service de estoque
  - [ ] Adicionar validações
  - [ ] Testar fluxo síncrono

- [ ] **Frontend (Desenrola)**

  - [ ] Hook `useArmacaoEstoque`
  - [ ] Componente `BuscadorArmacao`
  - [ ] Validações visuais
  - [ ] Toast de sucesso/erro
  - [ ] Testes E2E

- [ ] **SIS_Estoque**

  - [ ] Validar acesso CORS
  - [ ] Documentar APIs expostas
  - [ ] Testar com Postman

- [ ] **Testes**
  - [ ] Pedido completo (armação + lentes)
  - [ ] Concerto (múltiplas peças)
  - [ ] Armação branca
  - [ ] Erro: Estoque zerado
  - [ ] Erro: Produto não encontrado
  - [ ] Erro: Loja inválida

---

## 🚀 DEPLOYMENT

### **Variáveis de Ambiente Necessárias**

**Desenrola DCL (.env)**

```bash
# SIS_Estoque connection
NEXT_PUBLIC_SIS_ESTOQUE_URL=https://sis-estoque.seu-dominio.com
SIS_ESTOQUE_ANON_KEY=eyJhbGc...
SIS_ESTOQUE_SERVICE_ROLE_KEY=eyJhbGc...  # Apenas backend

# Supabase local (Desenrola)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### **Verificação Pré-Produção**

```bash
# 1. Testar conexão
curl -X GET https://sis-estoque/api/health

# 2. Validar view existe
SELECT * FROM vw_estoque_completo LIMIT 1

# 3. Testar RPC
SELECT registrar_saida_estoque(
  'uuid-produto',
  1,
  'uuid-loja',
  'saida_venda',
  'teste',
  'teste',
  null
)

# 4. Verificar permissões RLS
SELECT * FROM pg_policies WHERE tablename = 'estoque_movimentacoes'
```

---

**Documentação prática criada com sucesso! ✅**  
Agora você tem tudo para começar a integração!
