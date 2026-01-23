# 📊 Análise: Lentes de Contato - Investigação

## ✅ Descobertas

### 1. View existe e está acessível

- **View**: `public.v_lentes_contato` ✅
- **Owner**: postgres
- **Status**: Criada e funcional

### 2. Estrutura da View (Colunas Disponíveis)

#### 🔑 Identificação

- `id` (uuid)
- `slug` (text)
- `sku` (varchar)
- `codigo_fornecedor` (varchar)
- `nome_produto` (text)
- `nome_canonizado` (text)

#### 🏷️ Marca

- `marca_id` (uuid)
- `marca_nome` (varchar)
- `marca_slug` (varchar)
- `marca_premium` (boolean)
- `pais_origem` (varchar)

#### 🏭 Fornecedor

- `fornecedor_id` (uuid) ⭐
- `fornecedor_nome` (text) ⭐
- `fornecedor_razao_social` (text)

#### 📦 Tipo e Material

- `tipo_lente_contato` (text) - diaria, mensal, etc ⭐
- `material_contato` (text) - **NÃO É `material`** ⚠️
- `finalidade` (text)

#### 📏 Especificações Técnicas

- `diametro_mm` (numeric)
- `curvatura_base` (numeric)
- `dk_t` (integer) - oxigenação
- `teor_agua_percentual` (integer)
- `espessura_central` (numeric)

#### 👁️ Graus Disponíveis

- `esferico_min` / `esferico_max` (numeric)
- `cilindrico_min` / `cilindrico_max` (numeric)
- `eixo_min` / `eixo_max` (integer)
- `adicao_min` / `adicao_max` (numeric)

#### ✨ Características

- `tem_protecao_uv` (boolean)
- `eh_colorida` (boolean)
- `cor_disponivel` (varchar)
- `resistente_depositos` (boolean)
- `hidratacao_prolongada` (boolean)

#### ⏰ Uso

- `dias_uso` (integer)
- `horas_uso_diario` (integer)
- `pode_dormir_com_lente` (boolean)
- `solucao_recomendada` (text)

#### 📦 Embalagem e Preços

- `qtd_por_caixa` (integer)
- `preco_custo` (numeric) ⭐ **NÃO É `preco_custo_caixa`**
- `preco_tabela` (numeric) ⭐ **NÃO É `preco_venda_sugerido_caixa`**
- `preco_fabricante` (numeric)

#### 🚚 Logística

- `prazo_entrega_dias` (integer)
- `estoque_disponivel` (integer)
- `disponivel` (boolean)
- `ativo` (boolean)

#### 📝 Informações Adicionais

- `descricao_curta` / `descricao_completa` (text)
- `beneficios` (array)
- `indicacoes` (array)
- `contraindicacoes` (text)

## ❌ Problemas Encontrados

### 1. **Banco Vazio**

- Total de lentes: **0**
- Nenhum fornecedor cadastrado
- Nenhuma marca cadastrada

### 2. **Colunas com Nomes Diferentes**

| ❌ Nome Esperado (doc)       | ✅ Nome Real (view) |
| ---------------------------- | ------------------- |
| `design_lente`               | **NÃO EXISTE**      |
| `material`                   | `material_contato`  |
| `preco_custo_caixa`          | `preco_custo`       |
| `preco_venda_sugerido_caixa` | `preco_tabela`      |
| `tem_filtro_azul`            | **NÃO EXISTE**      |
| `eh_multifocal`              | **NÃO EXISTE**      |
| `eh_torica`                  | **NÃO EXISTE**      |
| `eh_cosmetica`               | **NÃO EXISTE**      |

### 3. **Coluna `design_lente` não existe**

A view não tem a coluna `design_lente` que estava na documentação.
Provavelmente o design é determinado por:

- `finalidade` (ex: "multifocal", "astigmatismo")
- Ou inferido dos graus disponíveis (cilíndrico = tórica, adição = multifocal)

## 🎯 Decisão: Estrutura Real vs Documentação

**A view real (`v_lentes_contato`) tem estrutura DIFERENTE da documentação (`12_CREATE_LENTES_CONTATO.sql`).**

### Campos-Chave para Implementação:

```typescript
interface LenteContato {
  // Identificação
  id: string;
  sku: string;
  nome_produto: string;

  // Marca
  marca_id: string;
  marca_nome: string;
  marca_premium: boolean;

  // Fornecedor ⭐
  fornecedor_id: string;
  fornecedor_nome: string;

  // Tipo ⭐
  tipo_lente_contato: string; // 'diaria' | 'mensal' | etc
  material_contato: string;
  finalidade: string;

  // Especificações
  diametro_mm: number;
  curvatura_base: number;

  // Graus
  esferico_min: number;
  esferico_max: number;
  cilindrico_min: number;
  cilindrico_max: number;
  adicao_min: number;
  adicao_max: number;

  // Características
  tem_protecao_uv: boolean;
  eh_colorida: boolean;
  cor_disponivel: string;

  // Uso
  dias_uso: number;
  qtd_por_caixa: number;

  // Preços ⭐
  preco_custo: number;
  preco_tabela: number;

  // Logística
  prazo_entrega_dias: number;
  ativo: boolean;
}
```

## 📋 Próximos Passos

### Opção 1: Usar Dados Mock (Desenvolvimento)

Criar dados de exemplo para desenvolver a interface enquanto aguarda cadastro real.

### Opção 2: Aguardar Cadastro Real

Esperar fornecedores cadastrarem as lentes de contato no sistema.

### Opção 3: Importar Dados

Se houver planilha/CSV com dados de lentes de contato, fazer importação em massa.

## 💡 Recomendação

**Implementar a interface usando a estrutura REAL da view**, mas com:

1. Dados mock para testes visuais
2. Queries prontas para quando houver dados reais
3. Mesma arquitetura do seletor de lentes reais (escolher fornecedor → listar produtos)

## 🔄 Comparação: Lentes Reais vs Lentes de Contato

| Aspecto             | Lentes Reais           | Lentes de Contato    |
| ------------------- | ---------------------- | -------------------- |
| **View**            | `v_lentes`             | `v_lentes_contato`   |
| **Preço Custo**     | `preco_custo`          | `preco_custo`        |
| **Preço Venda**     | `preco_venda_sugerido` | `preco_tabela`       |
| **Fornecedor**      | `fornecedor_id` ✅     | `fornecedor_id` ✅   |
| **Total Registros** | 1.339 lentes           | 0 lentes ❌          |
| **Material**        | `material`             | `material_contato`   |
| **Tipo**            | `tipo_lente`           | `tipo_lente_contato` |

---

**Conclusão**: A estrutura está pronta, mas o banco está vazio. Podemos implementar a interface agora e ela funcionará quando os dados forem cadastrados.
