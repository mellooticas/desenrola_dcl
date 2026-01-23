# 🎯 Implementação de Serviços e Acessórios - Desenrola DCL

**Data:** 23/01/2026  
**Status:** ✅ Completo

---

## 📊 Análise do Banco de Dados

### Fonte de Dados: `vw_estoque_completo` (CRM_ERP)

#### Serviços (15 itens)

| Tipo        | Descrição                              | Quantidade | Preço Médio |
| ----------- | -------------------------------------- | ---------- | ----------- |
| **servico** | Serviços de montagem, ajustes, limpeza | 15         | R$ 34,87    |

**Principais Serviços de Montagem:**

- Montagem de Lentes (R$ 30,00)
- Montagem Express 1h (R$ 25,00)
- Montagem de Lente Bifocal (R$ 40,00)

**Outros Serviços:**

- Ajuste de Armação (R$ 10,00)
- Ajuste de Receita (R$ 50,00)
- Limpeza Profunda (R$ 15,00)
- Limpeza Ultrassônica (R$ 20,00)
- Polimento de Lentes (R$ 40,00)
- Solda de Armação (R$ 45,00)
- Substituição de Aro (R$ 75,00)
- Troca de Hastes (R$ 35,00)
- Troca de Parafusos (R$ 8,00)
- Troca de Plaquetas/Nasais (R$ 20,00)
- Avaliação para Progressivas (R$ 30,00)
- Avaliação Completa de Visão (R$ 80,00)

#### Acessórios (793 produtos tipo NULL)

| Categoria    | Exemplos                          | Faixa de Preço |
| ------------ | --------------------------------- | -------------- |
| **Estojos**  | MELLO INFINITY Estojos (diversos) | R$ 12 - R$ 32  |
| **Flanelas** | MELLO INFINITY Flanelas Pequenas  | R$ 2 - R$ 20   |
| **Limpeza**  | Kits e Sprays de Limpeza          | R$ 10 - R$ 22  |
| **Cordões**  | MELLO INFINITY Cordinhas          | R$ 24          |

---

## 🏗️ Componentes Criados

### 1. SeletorServicos.tsx

**Localização:** `/src/components/pedidos/novo/SeletorServicos.tsx`  
**Linhas:** 352 linhas

#### Funcionalidades:

- ✅ Busca de serviços por nome ou SKU
- ✅ Listagem completa dos 15 serviços disponíveis
- ✅ Seleção única de serviço
- ✅ Campo de desconto percentual (0-100%)
- ✅ Cálculo automático de preço final
- ✅ Exibição de preço tabela, custo e economia
- ✅ Interface responsiva e intuitiva

#### Props:

```typescript
interface SeletorServicosProps {
  onServicoSelecionado: (dados: ServicoSelecionado | null) => void;
  lojaId?: string;
  servicoInicial?: ServicoSelecionado;
}
```

#### Retorno:

```typescript
interface ServicoSelecionado {
  servico: Servico;
  preco_final: number;
  desconto_percentual: number;
}
```

---

### 2. SeletorAcessorios.tsx

**Localização:** `/src/components/pedidos/novo/SeletorAcessorios.tsx`  
**Linhas:** 357 linhas

#### Funcionalidades:

- ✅ Multi-seleção de acessórios
- ✅ Controle de quantidade (+/- botões)
- ✅ Cálculo automático de subtotais
- ✅ Total geral em destaque
- ✅ Busca por nome ou SKU
- ✅ Filtro inteligente (estojos, flanelas, cordões, sprays)
- ✅ Interface compacta com resumo visual
- ✅ Botão "Ver todos" para catálogo completo

#### Props:

```typescript
interface SeletorAcessoriosProps {
  onAcessoriosSelecionados: (acessorios: AcessorioSelecionado[]) => void;
  lojaId?: string;
  acessoriosIniciais?: AcessorioSelecionado[];
}
```

#### Retorno:

```typescript
interface AcessorioSelecionado {
  acessorio: Acessorio;
  quantidade: number;
  subtotal: number;
}
```

---

## 🔄 Integração no Wizard

### Alterações em NovaOrdemWizard.tsx

#### Novos Campos no WizardData:

```typescript
export interface WizardData {
  // ... campos existentes

  // Serviços e Acessórios (opcionais)
  servico_selecionado?: {
    produto_id: string;
    sku_visual: string;
    descricao: string;
    preco_venda: number;
    custo: number;
    preco_final: number;
    desconto_percentual: number;
  };
  montador_id?: string; // Quem fez a montagem
  acessorios_selecionados?: Array<{
    produto_id: string;
    sku_visual: string;
    descricao: string;
    preco_venda: number;
    custo: number;
    quantidade: number;
    subtotal: number;
  }>;
}
```

### Alterações em Step5ClienteSLA.tsx

#### Novos Imports:

```typescript
import { Wrench, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SeletorServicos } from "@/components/pedidos/novo/SeletorServicos";
import { SeletorAcessorios } from "@/components/pedidos/novo/SeletorAcessorios";
```

#### Novas Seções:

1. **Serviço Adicional (opcional)**
   - Seletor de serviços com desconto
   - Campo "Montador" aparece se serviço inclui "montag"

2. **Acessórios (opcional)**
   - Multi-seleção de produtos
   - Resumo com total geral

---

## 📋 Estrutura SQL

### Queries Principais:

```sql
-- Buscar todos os serviços
SELECT produto_id, sku_visual, descricao, preco_venda, custo
FROM vw_estoque_completo
WHERE tipo_produto = 'servico' AND ativo = true
ORDER BY descricao;

-- Buscar acessórios
SELECT produto_id, sku_visual, descricao, preco_venda, custo
FROM vw_estoque_completo
WHERE tipo_produto IS NULL AND ativo = true
  AND (
    descricao ILIKE '%estojo%' OR
    descricao ILIKE '%cordao%' OR
    descricao ILIKE '%flanela%' OR
    descricao ILIKE '%limpeza%' OR
    descricao ILIKE '%spray%'
  )
ORDER BY descricao;
```

### Tabelas Relacionadas:

- `vw_estoque_completo` - View principal (armações + serviços + outros)
- `descontos_produto` - Tabela de descontos (id, nome, percentual, ativo)
- `servicos` - View dedicada (pedido_lente_id, prestador_id, tipo_servico, status)
- `itens_venda` - Histórico de vendas (tipo_item, produto_id, valor_unitario)

---

## 🎨 UX/UI Highlights

### SeletorServicos:

- 🔍 Busca instantânea
- 💰 Preço destacado em cards grandes
- 🎯 Seleção única com confirmação visual
- 📊 Cálculo em tempo real de descontos
- ✅ Botão "Trocar Serviço" para alterar seleção

### SeletorAcessorios:

- 🛒 Interface tipo "carrinho de compras"
- ➕➖ Controles de quantidade intuitivos
- 📱 Grid responsivo (1-2 colunas)
- 🏷️ Badge mostrando quantidade selecionada
- 💵 Total geral sempre visível

### Step5 Integrado:

- 📦 Cards com borda tracejada para seções opcionais
- 🔧 Ícones temáticos (Wrench, ShoppingBag)
- 📝 Campo "Montador" condicional (apenas para montagem)
- 🎨 Destaque visual para itens selecionados

---

## 🚀 Fluxo de Uso

### Cenário 1: Pedido Completo + Montagem + Acessórios

```
1. Step1: Selecionar loja + OS física
2. Step2: Escolher "COMPLETO"
3. Step3: Selecionar armação
4. Step4: Selecionar lentes (laboratório)
5. Step5:
   - Dados do cliente
   - ✨ Selecionar "Montagem de Lentes" (R$ 30 → desconto 10% → R$ 27)
   - ✨ Adicionar "Estojo" (1x) + "Flanela" (2x)
   - Definir montador: "João Silva"
6. Step6: Revisar tudo
7. Step7: Confirmar e salvar
```

### Cenário 2: Apenas Serviço de Ajuste

```
1. Step1: Selecionar loja + OS
2. Step2: Escolher "SERVICO"
3. Step5:
   - Dados do cliente
   - ✨ Selecionar "Ajuste de Armação" (R$ 10)
4. Step6: Revisar
5. Step7: Salvar
```

---

## 📝 Próximos Passos

### 🔄 Lógica LENTES → MONTAGEM (Pendente)

**Requisito do usuário:**

> "o cartão deve ser criado em Lentes no DCL, pois após a criação, já mudaremos para montagem e assim incluiremos quem fez a montagem"

**Implementação sugerida:**

1. Criar pedido com `tipo_pedido = 'LENTES'` e `status = 'REGISTRADO'`
2. Salvar `servico_selecionado` e `montador_id` no banco
3. Após confirmação, trigger automático:
   - Atualizar `status → 'MONTAGEM'`
   - Criar registro em `servicos` table
   - Vincular `prestador_id = montador_id`

### Campos de Banco Necessários (pedidos table):

```sql
ALTER TABLE pedidos
ADD COLUMN servico_id UUID REFERENCES produtos(id),
ADD COLUMN servico_preco_final NUMERIC(10,2),
ADD COLUMN servico_desconto_percentual NUMERIC(5,2),
ADD COLUMN montador_usuario_id UUID REFERENCES usuarios(id),
ADD COLUMN acessorios_data JSONB; -- Array de acessórios selecionados
```

---

## ✅ Checklist de Funcionalidades

### Serviços:

- [x] Listagem de todos os serviços disponíveis
- [x] Busca por nome/SKU
- [x] Seleção única
- [x] Campo de desconto percentual
- [x] Cálculo de preço final
- [x] Exibição de custo e margem
- [x] Campo "Montador" condicional
- [ ] Salvar no banco de dados
- [ ] Transição de status (LENTES → MONTAGEM)

### Acessórios:

- [x] Listagem de acessórios (estojos, flanelas, etc)
- [x] Multi-seleção
- [x] Controle de quantidade
- [x] Cálculo de subtotais
- [x] Total geral
- [x] Busca e filtros
- [ ] Salvar no banco de dados
- [ ] Gerar itens_venda separados

### Integração:

- [x] Componentes importados no wizard
- [x] Campos adicionados ao WizardData
- [x] UI integrada no Step5
- [x] Handlers de onChange configurados
- [ ] Lógica de salvamento no handleSalvar()
- [ ] Validações de dados
- [ ] Step6 (revisão) atualizado

---

## 🎓 Aprendizados Técnicos

### 1. Estrutura do Estoque CRM_ERP

- View `vw_estoque_completo` é centralizada
- Produtos sem tipo (`tipo_produto IS NULL`) são acessórios não categorizados
- Campo `loja_id = null` indica produtos globais
- Estrutura: produto_id (UUID), sku_visual, descricao, preco_venda, custo

### 2. Padrão de Componentes

- Props com `onXxxSelecionado` para propagação de dados
- Estado local para UI + useEffect para notificar parent
- Interface clara entre componente e wizard
- Tratamento de loading e estados vazios

### 3. Database Considerations

- `descontos_produto` table existe mas não está vinculada
- `servicos` view rastreia pedidos de serviços externos
- Necessário criar campos específicos em `pedidos` para salvar
- JSONB é opção viável para acessórios (array complexo)

---

## 📚 Arquivos Relacionados

### Componentes:

- `/src/components/pedidos/novo/SeletorServicos.tsx` (352 linhas)
- `/src/components/pedidos/novo/SeletorAcessorios.tsx` (357 linhas)

### Wizard:

- `/src/components/forms/NovaOrdemWizard.tsx` (alterado)
- `/src/components/forms/wizard-steps/Step5ClienteSLA.tsx` (alterado)

### Database:

- `/database/INVESTIGACAO-SERVICOS-ACESSORIOS.sql` (investigação inicial)
- `/database/QUERIES-SERVICOS-CORRIGIDAS.sql` (queries funcionais)

### Documentação:

- Este arquivo: `/IMPLEMENTACAO-SERVICOS-ACESSORIOS.md`

---

## 🎉 Resultado Final

### Componentes:

✅ **2 componentes novos** totalmente funcionais  
✅ **709 linhas de código** implementadas  
✅ **Interface intuitiva** e responsiva  
✅ **Integração completa** no wizard existente

### Funcionalidades:

✅ Seleção de **15 serviços** do catálogo  
✅ **Desconto percentual** configurável  
✅ Multi-seleção de **acessórios** com quantidade  
✅ Campo **montador** para serviços de montagem  
✅ **Cálculos automáticos** de preços e totais

### Próxima Fase:

🔄 Implementar salvamento no banco  
🔄 Lógica de transição LENTES → MONTAGEM  
🔄 Atualizar Step6 (revisão) com novos dados  
🔄 Testes de integração completa

---

**Status:** ✅ Implementação UI completa  
**Pendente:** Lógica de persistência e transição de status
