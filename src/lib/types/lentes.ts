// ============================================================
// TYPES: Integração com Catálogo de Lentes
// Data: 20/12/2025
// Descrição: Tipos TypeScript para integração com banco de lentes
// ============================================================

/**
 * Grupo Canônico de Lentes
 * Agrupa lentes similares por características técnicas e tratamentos
 */
export interface GrupoCanonicoSelecionado {
  id: string
  nome_grupo: string
  slug: string
  
  // Características técnicas
  tipo_lente: 'visao_simples' | 'multifocal' | 'bifocal'
  material: string
  indice_refracao: string
  
  // Ranges de graus compatíveis
  grau_esferico_min: number
  grau_esferico_max: number
  grau_cilindrico_min: number
  grau_cilindrico_max: number
  adicao_min?: number | null
  adicao_max?: number | null
  
  // Tratamentos do grupo
  tratamentos: {
    antirreflexo: boolean
    antirrisco: boolean
    uv: boolean
    blue_light: boolean
    fotossensiveis: 'nenhum' | 'fotocromático' | 'polarizado'
  }
  
  // Preços e estatísticas
  preco_minimo: number
  preco_medio: number
  preco_maximo: number
  margem_media?: number
  
  // Opções disponíveis
  total_fornecedores: number
  total_marcas: number
  total_lentes: number
  
  // Classificação
  is_premium: boolean
  categoria_sugerida?: 'economica' | 'intermediaria' | 'premium'
}

/**
 * Lente Detalhada (com fornecedor específico)
 * Usada para escolha final do fornecedor
 */
export interface LenteDetalhada {
  id: string
  nome_lente: string
  slug: string
  
  // Fornecedor
  fornecedor_id: string
  fornecedor_nome: string
  prazo_entrega_dias: number
  
  // Marca
  marca_id: string
  marca_nome: string
  marca_premium: boolean
  
  // Grupo canônico
  grupo_canonico_id: string
  
  // Preços
  preco_custo: number
  preco_venda_sugerido: number
  margem_percentual: number
  
  // Estoque (futuro)
  estoque_disponivel?: number | null
  estoque_minimo?: number | null
  
  // Status
  ativo: boolean
  status?: 'ativo' | 'inativo' | 'descontinuado'
}

/**
 * Dados da receita do cliente
 * Para busca de lentes compatíveis
 */
export interface ReceitaCliente {
  // Olho direito (OD)
  esferico_od: number
  cilindrico_od: number
  eixo_od?: number
  
  // Olho esquerdo (OE)
  esferico_oe: number
  cilindrico_oe: number
  eixo_oe?: number
  
  // Multifocal
  adicao?: number | null
  
  // Distância pupilar
  dp_od?: number
  dp_oe?: number
  dp_total?: number
}

/**
 * Resultado de escolha de fornecedor
 * Retornado pela função de escolha automática
 */
export interface FornecedorEscolhido {
  fornecedor_id: string
  fornecedor_nome: string
  lente_id: string
  lente_nome: string
  preco_custo: number
  preco_venda_sugerido: number
  prazo_dias: number
  motivo_escolha: string
  score?: number
}

/**
 * Opções de seleção de lentes
 * 3 opções: econômica, intermediária, premium
 */
export interface OpcoesLentes {
  economica: GrupoCanonicoSelecionado | null
  intermediaria: GrupoCanonicoSelecionado | null
  premium: GrupoCanonicoSelecionado | null
}

/**
 * Sugestão de upselling
 * Para oferecer opção melhor ao cliente
 */
export interface SugestaoUpgrade {
  grupo_base_id: string
  grupo_base_nome: string
  grupo_base_preco: number
  
  grupo_upgrade_id: string
  grupo_upgrade_nome: string
  grupo_upgrade_preco: number
  
  diferenca_preco: number
  diferenca_percentual: number
  
  tratamentos_adicionais: string[]
  beneficios: string
}

/**
 * Pedido COM dados de lentes
 * Estende o tipo Pedido existente
 */
export interface PedidoComLente {
  // Campos originais do pedido
  id: string
  numero_os: string
  loja_id: string
  laboratorio_id: string | null
  classe_lente_id: string | null
  cliente_nome: string
  cliente_telefone?: string | null
  status: string
  prioridade: string
  valor_pedido?: number | null
  created_at: string
  updated_at: string
  
  // 🆕 CAMPOS DE LENTES
  grupo_canonico_id?: string | null
  lente_selecionada_id?: string | null
  fornecedor_lente_id?: string | null
  preco_lente?: number | null
  custo_lente?: number | null
  margem_lente_percentual?: number | null
  nome_lente?: string | null
  nome_grupo_canonico?: string | null
  tratamentos_lente?: TratamentoLente[]
  selecao_automatica?: boolean
  lente_metadata?: Record<string, any>
}

/**
 * Tratamento de lente
 * Para array JSON no banco
 */
export interface TratamentoLente {
  tipo: 'antirreflexo' | 'antirrisco' | 'uv' | 'blue_light' | 'fotocromático' | 'polarizado'
  ativo: boolean
  custo_adicional?: number
  tempo_adicional_dias?: number
}

/**
 * Filtros para busca de lentes
 * Usado em componentes de pesquisa
 */
export interface FiltrosLentes {
  tipo_lente?: 'visao_simples' | 'multifocal' | 'bifocal'
  material?: string
  indice_refracao?: string
  preco_min?: number
  preco_max?: number
  tem_antirreflexo?: boolean
  tem_blue_light?: boolean
  fotossensiveis?: 'nenhum' | 'fotocromático' | 'polarizado'
  is_premium?: boolean
  fornecedor_id?: string
  marca_id?: string
}

/**
 * Estatísticas de lentes vendidas
 * Para dashboard e análises
 */
export interface EstatisticasLentesVendidas {
  total_vendas: number
  total_com_lentes_novo_sistema: number
  percentual_adocao: number
  
  selecao_automatica: number
  selecao_manual: number
  percentual_automatica: number
  
  margem_media: number
  margem_minima: number
  margem_maxima: number
  
  grupos_mais_vendidos: {
    grupo_id: string
    nome_grupo: string
    total_vendas: number
    margem_media: number
  }[]
  
  fornecedores_mais_usados: {
    fornecedor_id: string
    fornecedor_nome: string
    total_vendas: number
    prazo_medio: number
  }[]
}

/**
 * Configuração de prioridade para escolha de fornecedor
 */
export type PrioridadeEscolha = 'preco' | 'prazo' | 'equilibrado'

/**
 * Metadata da escolha de lente
 * Armazenado no campo lente_metadata
 */
export interface LenteMetadata {
  motivo_escolha?: string
  alternativas_consideradas?: number
  score_escolhido?: number
  prioridade_usada?: PrioridadeEscolha
  tempo_decisao_ms?: number
  vendedor_id?: string
  receita_cliente?: Partial<ReceitaCliente>
  observacoes?: string
}

/**
 * Response da view v_analise_lentes_vendidas
 */
export interface AnaliseLenteVendida {
  pedido_id: string
  numero_os: string
  data_venda: string
  loja_id: string
  loja_nome: string
  
  grupo_canonico_id: string | null
  nome_grupo_canonico: string | null
  lente_selecionada_id: string | null
  nome_lente: string | null
  fornecedor_lente_id: string | null
  
  preco_lente: number | null
  custo_lente: number | null
  margem_lente_percentual: number | null
  
  selecao_automatica: boolean | null
  tipo_selecao: '🤖 Automática' | '👤 Manual'
  
  classificacao_margem: '⚪ Sem dados' | '🔴 Baixa (<3x)' | '🟡 Normal (3-4x)' | '🟢 Alta (>4x)'
  
  tratamentos_lente: TratamentoLente[]
  qtd_tratamentos: number
  
  status: string
  prioridade: string
}

/**
 * Props para componente de seleção de lentes
 */
export interface SeletorLentesProps {
  onSelecionar: (grupo: GrupoCanonicoSelecionado) => void
  tipoLente?: 'visao_simples' | 'multifocal'
  receita?: Partial<ReceitaCliente>
  filtros?: FiltrosLentes
}

/**
 * Props para card de opção de lente
 */
export interface OpcaoLenteCardProps {
  titulo: string
  grupo: GrupoCanonicoSelecionado
  cor: 'blue' | 'purple' | 'amber'
  destaque?: boolean
  onSelecionar: () => void
}

/**
 * Estado do seletor de lentes
 */
export interface SeletorLentesState {
  loading: boolean
  error: string | null
  receita: ReceitaCliente
  opcoes: OpcoesLentes
  grupoSelecionado: GrupoCanonicoSelecionado | null
  fornecedorEscolhido: FornecedorEscolhido | null
}
