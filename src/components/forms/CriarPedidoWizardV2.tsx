'use client'

/**
 * 🎯 WIZARD DE CRIAÇÃO DE PEDIDOS - VERSÃO SIMPLIFICADA
 * 
 * Fluxo otimizado para lançamento manual de pedidos (transição PDV):
 * 
 * Step 1: BUSCAR LENTE (busca + filtros rápidos)
 * Step 2: ESCOLHER LABORATÓRIO (comparação de fornecedores)
 * Step 3: DADOS DO PEDIDO (cliente + valor + observações)
 * 
 * Foco: Velocidade e usabilidade para vendedores digitarem pedidos do PDV offline
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { 
  Search, Filter, Building2, User, Check, 
  ChevronRight, ChevronLeft, Loader2, X,
  Package, DollarSign, Clock, Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { lentesClient } from '@/lib/supabase/lentes-client'
import type { GrupoCanonicoView } from '@/lib/supabase/lentes-client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLojas } from '@/lib/hooks/use-lojas'

interface CriarPedidoWizardV2Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FiltrosLentes {
  material: string
  tipo: string
  tratamentos: string[]
}

interface LenteFornecedor {
  id: string // lente_id (chave primária da lente física)
  slug: string
  nome_lente: string
  fornecedor_id: string
  fornecedor_nome: string
  fornecedor_prazo_visao_simples: number | null
  fornecedor_prazo_multifocal: number | null
  marca_id: string | null
  marca_nome: string | null
  marca_premium: boolean | null
  tipo_lente: string
  preco_custo: number
  preco_venda_sugerido: number
  estoque_disponivel: number
}

const MATERIAIS = [
  { value: 'CR39', label: 'CR39', icon: '💎' },
  { value: 'POLICARBONATO', label: 'Policarbonato', icon: '🛡️' },
  { value: 'TRIVEX', label: 'Trivex', icon: '✨' },
  { value: 'HIGH_INDEX', label: 'High Index', icon: '🔬' }
]

const TIPOS = [
  { value: 'visao_simples', label: 'Visão Simples', icon: '👁️' },
  { value: 'multifocal', label: 'Multifocal', icon: '👓' },
  { value: 'bifocal', label: 'Bifocal', icon: '🔀' }
]

const TRATAMENTOS = [
  { value: 'antirreflexo', label: 'Antirreflexo', icon: '✨' },
  { value: 'blue_light', label: 'Blue Light', icon: '🔵' },
  { value: 'fotossensiveis', label: 'Fotossensível', icon: '🌓' }
]

export function CriarPedidoWizardV2({ open, onClose, onSuccess }: CriarPedidoWizardV2Props) {
  const { userProfile } = useAuth() // ✅ Usar auth do contexto
  const { data: lojas = [] } = useLojas() // ✅ Buscar lojas disponíveis
  const [step, setStep] = useState(1)
  
  // Step 1: Buscar Lentes (grupos canônicos)
  const [buscaLente, setBuscaLente] = useState('')
  const [filtros, setFiltros] = useState<FiltrosLentes>({
    material: '',
    tipo: '',
    tratamentos: []
  })
  const [lentesEncontradas, setLentesEncontradas] = useState<GrupoCanonicoView[]>([])
  const [loadingLentes, setLoadingLentes] = useState(false)
  const [grupoCanonicoEscolhido, setGrupoCanonicoEscolhido] = useState<GrupoCanonicoView | null>(null)
  
  // Step 2: Fornecedores (lentes físicas do grupo canônico)
  const [lentes, setLentes] = useState<LenteFornecedor[]>([])
  const [loadingFornecedores, setLoadingFornecedores] = useState(false)
  const [lenteEscolhida, setLenteEscolhida] = useState<LenteFornecedor | null>(null)
  
  // Step 3: Dados do Pedido
  const [nomeCliente, setNomeCliente] = useState('')
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [osFisica, setOsFisica] = useState('')
  const [osLaboratorio, setOsLaboratorio] = useState('')
  const dataVenda = new Date().toISOString().split('T')[0] // Sempre hoje
  const [previsaoEntrega, setPrevisaoEntrega] = useState('')
  const [modoAutomatico, setModoAutomatico] = useState(true) // Cálculo automático ativado por padrão
  const [classeLente, setClasseLente] = useState<'bronze' | 'prata' | 'ouro' | 'platinum'>('prata')
  const [lojaId, setLojaId] = useState(userProfile?.loja_id || '') // ✅ Loja selecionada (padrão: loja do usuário)
  
  // Auto-preencher valor e previsão quando lente for escolhida no Step 2
  useEffect(() => {
    if (lenteEscolhida && step === 3) {
      setValorTotal(lenteEscolhida.preco_venda_sugerido.toFixed(2))
      
      // Calcular previsão automática
      if (modoAutomatico) {
        const prazoLab = lenteEscolhida.tipo_lente === 'visao_simples' 
          ? lenteEscolhida.fornecedor_prazo_visao_simples 
          : lenteEscolhida.fornecedor_prazo_multifocal
        
        const dataPrevisao = new Date()
        dataPrevisao.setDate(dataPrevisao.getDate() + (prazoLab || 7))
        setPrevisaoEntrega(dataPrevisao.toISOString().split('T')[0])
      }
    }
  }, [lenteEscolhida, step, modoAutomatico])

  // ✅ Definir loja padrão quando perfil carregar
  useEffect(() => {
    if (userProfile?.loja_id && !lojaId) {
      setLojaId(userProfile.loja_id)
    }
  }, [userProfile?.loja_id])
  
  // Buscar lentes com filtros
  const handleBuscarLentes = async () => {
    setLoadingLentes(true)
    try {
      let query = lentesClient
        .from('v_grupos_canonicos')
        .select('*')
      
      // Busca textual
      if (buscaLente.length >= 2) {
        query = query.ilike('nome_grupo', `%${buscaLente}%`)
      }
      
      // Filtros específicos
      if (filtros.material) {
        query = query.eq('material', filtros.material)
      }
      if (filtros.tipo) {
        query = query.eq('tipo_lente', filtros.tipo)
      }
      
      // TODO: Filtros de tratamentos desabilitados temporariamente
      // até confirmarmos os nomes corretos das colunas na view
      // if (filtros.tratamentos.includes('antirreflexo')) {
      //   query = query.eq('antirreflexo', true)
      // }
      
      query = query.order('preco_medio', { ascending: true }).limit(20)
      
      const { data, error } = await query
      
      if (error) throw error
      
      setLentesEncontradas(data || [])
    } catch (error) {
      console.error('Erro ao buscar lentes:', error)
      toast.error('Erro ao buscar lentes')
    } finally {
      setLoadingLentes(false)
    }
  }
  
  // Selecionar grupo canônico e buscar todas as lentes físicas disponíveis
  const handleSelecionarLente = async (grupo: GrupoCanonicoView) => {
    setGrupoCanonicoEscolhido(grupo)
    setLoadingFornecedores(true)
    
    try {
      // Buscar TODAS as lentes físicas deste grupo canônico na v_lentes_catalogo
      const { data, error } = await lentesClient
        .from('v_lentes_catalogo')
        .select(`
          id,
          slug,
          nome_lente,
          fornecedor_id,
          fornecedor_nome,
          prazo_visao_simples,
          prazo_multifocal,
          prazo_surfacada,
          prazo_free_form,
          marca_id,
          marca_nome,
          marca_premium,
          tipo_lente,
          preco_custo,
          preco_venda_sugerido,
          estoque_disponivel
        `)
        .eq('grupo_id', grupo.id)
        .eq('ativo', true)
        .order('preco_venda_sugerido', { ascending: true })
        .limit(20)
      
      if (error) throw error
      
      // Mapear para estrutura LenteFornecedor
      const lentesFormatadas: LenteFornecedor[] = (data || []).map(lente => ({
        id: lente.id,
        slug: lente.slug,
        nome_lente: lente.nome_lente,
        fornecedor_id: lente.fornecedor_id,
        fornecedor_nome: lente.fornecedor_nome || 'Fornecedor não informado', // Fallback
        fornecedor_prazo_visao_simples: lente.prazo_visao_simples,
        fornecedor_prazo_multifocal: lente.prazo_multifocal,
        marca_id: lente.marca_id,
        marca_nome: lente.marca_nome,
        marca_premium: lente.marca_premium,
        tipo_lente: lente.tipo_lente,
        preco_custo: lente.preco_custo,
        preco_venda_sugerido: lente.preco_venda_sugerido,
        estoque_disponivel: lente.estoque_disponivel
      }))
      
      setLentes(lentesFormatadas)
      
      console.log('🔍 Lentes carregadas:', lentesFormatadas.map(l => ({
        nome: l.nome_lente,
        fornecedor: l.fornecedor_nome,
        fornecedor_id: l.fornecedor_id
      })))
      
      if (lentesFormatadas.length === 0) {
        toast.warning('Nenhuma lente disponível para este grupo')
        return
      }
      
      setStep(2)
    } catch (error) {
      console.error('Erro ao buscar lentes do fornecedor:', error)
      toast.error('Erro ao carregar opções de fornecedores')
    } finally {
      setLoadingFornecedores(false)
    }
  }
  
  // Toggle tratamento
  const toggleTratamento = (tratamento: string) => {
    setFiltros(prev => ({
      ...prev,
      tratamentos: prev.tratamentos.includes(tratamento)
        ? prev.tratamentos.filter(t => t !== tratamento)
        : [...prev.tratamentos, tratamento]
    }))
  }
  
  // Criar pedido
  const handleCriarPedido = async () => {
    // Validações
    if (!nomeCliente || !telefoneCliente || !valorTotal) {
      toast.error('Preencha todos os campos do cliente')
      return
    }

    if (!osFisica || !osLaboratorio) {
      toast.error('Preencha os números das OS (Física e Laboratório)')
      return
    }

    if (!lenteEscolhida || !grupoCanonicoEscolhido) {
      toast.error('Selecione uma lente completa')
      return
    }

    try {
      // ✅ Verificar autenticação via contexto
      if (!userProfile) {
        setTimeout(() => {
          toast.error('Você precisa estar logado para criar pedidos')
        }, 0)
        return
      }

      // ✅ Verificar se loja foi selecionada
      if (!lojaId) {
        setTimeout(() => {
          toast.error('Selecione uma loja para o pedido')
        }, 0)
        return
      }

      // Calcular data de previsão de entrega (usar o campo editável)
      const prazoLab = lenteEscolhida.tipo_lente === 'visao_simples' 
        ? lenteEscolhida.fornecedor_prazo_visao_simples 
        : lenteEscolhida.fornecedor_prazo_multifocal

      // Calcular margem
      const valorVenda = parseFloat(valorTotal)
      const margemValor = valorVenda - lenteEscolhida.preco_custo
      const margemPercentual = (margemValor / lenteEscolhida.preco_custo * 100).toFixed(1)

      // Criar pedido
      const { error } = await supabase
        .from('pedidos')
        .insert({
          loja_id: lojaId, // ✅ Usar loja selecionada manualmente
          cliente_nome: nomeCliente, // ✅ Corrigido: cliente_nome (não nome_cliente)
          cliente_telefone: telefoneCliente, // ✅ Corrigido: cliente_telefone (não telefone_cliente)
          classe_lente: classeLente,
          os_fisica: osFisica,
          os_laboratorio: osLaboratorio,
          data_os: dataVenda,
          data_previsao_entrega: previsaoEntrega,
          lente_catalogo_id: lenteEscolhida.id,
          fornecedor_nome: lenteEscolhida.fornecedor_nome, // ✅ Nome do fornecedor
          fornecedor_catalogo_id: lenteEscolhida.fornecedor_id, // ✅ ID do fornecedor no catálogo
          // ❌ NÃO enviar laboratorio_id - IDs do catálogo não existem na tabela laboratorios
          preco_custo: lenteEscolhida.preco_custo,
          valor_pedido: valorVenda, // ✅ Corrigido: valor_pedido (não valor_total)
          observacoes: [
            `📦 Grupo: ${grupoCanonicoEscolhido.nome_grupo}`,
            `🏭 Fornecedor: ${lenteEscolhida.fornecedor_nome}`,
            lenteEscolhida.marca_nome ? `🏷️ Marca: ${lenteEscolhida.marca_nome}` : '',
            `💰 Custo: R$ ${lenteEscolhida.preco_custo.toFixed(2)}`,
            `💵 Venda: R$ ${valorVenda.toFixed(2)}`,
            `📊 Margem: ${margemPercentual}% (R$ ${margemValor.toFixed(2)})`,
            `⚡ Prazo: ${prazoLab} dias úteis`,
            `📅 Previsão: ${new Date(previsaoEntrega).toLocaleDateString('pt-BR')}`,
            observacoes ? `📝 Obs: ${observacoes}` : ''
          ].filter(Boolean).join('\n'),
          status: 'REGISTRADO',
          prioridade: 'NORMAL' // ✅ Maiúsculas para constraint
        })

      if (error) {
        console.error('Erro no insert:', error)
        throw error
      }

      toast.success('Pedido criado com sucesso!')
      onSuccess()
      handleClose()
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error)
      toast.error(error.message || 'Erro ao criar pedido')
    }
  }
  
  // Fechar e resetar
  const handleClose = () => {
    setStep(1)
    setBuscaLente('')
    setFiltros({ material: '', tipo: '', tratamentos: [] })
    setLentesEncontradas([])
    setGrupoCanonicoEscolhido(null)
    setLentes([])
    setLenteEscolhida(null)
    setNomeCliente('')
    setTelefoneCliente('')
    setObservacoes('')
    setValorTotal('')
    setOsFisica('')
    setOsLaboratorio('')
    setPrevisaoEntrega('')
    setModoAutomatico(true)
    setClasseLente('prata')
    setLojaId(userProfile?.loja_id || '') // ✅ Resetar para loja do usuário
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Novo Pedido - Lançamento Manual</span>
            <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <Badge variant={step === 1 ? 'default' : step > 1 ? 'secondary' : 'outline'}>
                1. Lente
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={step === 2 ? 'default' : step > 2 ? 'secondary' : 'outline'}>
                2. Laboratório
              </Badge>
              <ChevronRight className="h-4 w-4" />
              <Badge variant={step === 3 ? 'default' : 'outline'}>
                3. Dados
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: BUSCAR LENTE */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Busca Textual */}
            <div>
              <Label>🔍 Buscar Lente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Digite: policarbonato, multifocal, blue light..."
                  value={buscaLente}
                  onChange={(e) => setBuscaLente(e.target.value)}
                />
              </div>
            </div>

            {/* Filtros Rápidos - Material */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4" />
                Material
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filtros.material === '' ? 'default' : 'outline'}
                  onClick={() => setFiltros(prev => ({ ...prev, material: '' }))}
                >
                  Todos
                </Button>
                {MATERIAIS.map(mat => (
                  <Button
                    key={mat.value}
                    size="sm"
                    variant={filtros.material === mat.value ? 'default' : 'outline'}
                    onClick={() => setFiltros(prev => ({ ...prev, material: mat.value }))}
                  >
                    {mat.icon} {mat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros Rápidos - Tipo */}
            <div>
              <Label className="mb-2">Tipo de Lente</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={filtros.tipo === '' ? 'default' : 'outline'}
                  onClick={() => setFiltros(prev => ({ ...prev, tipo: '' }))}
                >
                  Todos
                </Button>
                {TIPOS.map(tipo => (
                  <Button
                    key={tipo.value}
                    size="sm"
                    variant={filtros.tipo === tipo.value ? 'default' : 'outline'}
                    onClick={() => setFiltros(prev => ({ ...prev, tipo: tipo.value }))}
                  >
                    {tipo.icon} {tipo.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtros Rápidos - Tratamentos */}
            <div>
              <Label className="mb-2">Tratamentos</Label>
              <div className="flex flex-wrap gap-2">
                {TRATAMENTOS.map(trat => (
                  <Button
                    key={trat.value}
                    size="sm"
                    variant={filtros.tratamentos.includes(trat.value) ? 'default' : 'outline'}
                    onClick={() => toggleTratamento(trat.value)}
                  >
                    {trat.icon} {trat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Botão Buscar */}
            <div className="flex justify-end">
              <Button onClick={handleBuscarLentes} disabled={loadingLentes}>
                {loadingLentes ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Lentes
                  </>
                )}
              </Button>
            </div>

            {/* Resultados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>{lentesEncontradas.length} lentes encontradas</Label>
              </div>

              {lentesEncontradas.length === 0 && !loadingLentes && (
                <Alert>
                  <AlertDescription>
                    Use a busca e os filtros para encontrar lentes
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {lentesEncontradas.map(lente => (
                  <Card 
                    key={lente.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => handleSelecionarLente(lente)}
                  >
                    <CardHeader className="pb-3">
                      <div className="font-semibold text-sm">{lente.nome_grupo}</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lente.tratamento_antirreflexo && <Badge variant="secondary" className="text-xs">✨ AR</Badge>}
                        {lente.tratamento_blue_light && <Badge variant="secondary" className="text-xs">🔵 Blue</Badge>}
                        {lente.tratamento_fotossensiveis && lente.tratamento_fotossensiveis !== 'nenhum' && (
                          <Badge variant="secondary" className="text-xs">🌓 Foto</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>📊 {lente.material} {lente.indice_refracao}</div>
                        <div>💰 R$ {lente.preco_medio?.toFixed(2) || '---'}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ESCOLHER LABORATÓRIO */}
        {step === 2 && grupoCanonicoEscolhido && (
          <div className="space-y-6">
            {/* Lente Selecionada */}
            <Alert>
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>Grupo selecionado:</strong> {grupoCanonicoEscolhido.nome_grupo}
                <div className="text-xs text-muted-foreground mt-1">
                  {grupoCanonicoEscolhido.material} {grupoCanonicoEscolhido.indice_refracao} • 
                  Preço médio: R$ {grupoCanonicoEscolhido.preco_medio?.toFixed(2) || '---'}
                </div>
              </AlertDescription>
            </Alert>

            {/* Lista de Lentes/Fornecedores */}
            <div>
              <Label className="flex items-center justify-between mb-3">
                <span>Escolha a Lente/Laboratório ({lentes.length} opções)</span>
                {loadingFornecedores && <Loader2 className="h-4 w-4 animate-spin" />}
              </Label>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lentes.map(lente => {
                  const prazoAtual = lente.tipo_lente === 'visao_simples' 
                    ? lente.fornecedor_prazo_visao_simples 
                    : lente.fornecedor_prazo_multifocal
                  
                  return (
                    <Card 
                      key={lente.id}
                      className={`cursor-pointer transition-all ${
                        lenteEscolhida?.id === lente.id 
                          ? 'border-primary ring-2 ring-primary' 
                          : 'hover:border-primary'
                      }`}
                      onClick={() => setLenteEscolhida(lente)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="h-4 w-4" />
                              <strong>{lente.fornecedor_nome}</strong>
                              {lente.marca_premium && (
                                <Badge variant="warning" className="text-xs">⭐ Premium</Badge>
                              )}
                              {lente.estoque_disponivel > 0 && (
                                <Badge variant="success" className="text-xs">
                                  📦 {lente.estoque_disponivel} em estoque
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {lente.marca_nome && (
                                <div className="flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  {lente.marca_nome}
                                </div>
                              )}
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                                    💰 Custo: R$ {lente.preco_custo.toFixed(2)}
                                  </span>
                                  <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
                                    <DollarSign className="h-3 w-3" />
                                    Venda: R$ {lente.preco_venda_sugerido.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {prazoAtual || 7} dias úteis
                                  </span>
                                  <span className="text-xs text-green-600 dark:text-green-400">
                                    Margem: {((lente.preco_venda_sugerido - lente.preco_custo) / lente.preco_custo * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {lenteEscolhida?.id === lente.id && (
                            <Check className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!lenteEscolhida}
                className="flex-1"
              >
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: DADOS DO PEDIDO */}
        {step === 3 && lenteEscolhida && grupoCanonicoEscolhido && (
          <div className="space-y-4">
            {/* Resumo */}
            <Alert>
              <AlertDescription className="space-y-1 text-sm">
                <div><strong>Grupo:</strong> {grupoCanonicoEscolhido.nome_grupo}</div>
                <div><strong>Fornecedor:</strong> {lenteEscolhida.fornecedor_nome || 'Não informado'}</div>
                {lenteEscolhida.marca_nome && <div><strong>Marca:</strong> {lenteEscolhida.marca_nome}</div>}
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 dark:text-orange-400">
                    💰 Custo: R$ {lenteEscolhida.preco_custo.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">
                    💵 Sugerido: R$ {lenteEscolhida.preco_venda_sugerido.toFixed(2)}
                  </span>
                </div>
                <div><strong>Prazo:</strong> {
                  lenteEscolhida.tipo_lente === 'visao_simples' 
                    ? lenteEscolhida.fornecedor_prazo_visao_simples 
                    : lenteEscolhida.fornecedor_prazo_multifocal
                } dias úteis</div>
              </AlertDescription>
            </Alert>

            {/* Seleção de Loja */}
            <div>
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Loja do Pedido *
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={lojaId}
                onChange={(e) => setLojaId(e.target.value)}
              >
                <option value="">Selecione uma loja</option>
                {lojas.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome} {loja.codigo ? `- ${loja.codigo}` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {userProfile?.loja_id 
                  ? '💡 Sua loja está pré-selecionada, mas você pode mudar'
                  : '⚠️ Selecione a loja para este pedido'
                }
              </p>
            </div>

            {/* Dados do Cliente */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Cliente *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Nome completo"
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Telefone *</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={telefoneCliente}
                  onChange={(e) => setTelefoneCliente(e.target.value)}
                />
              </div>
            </div>

            {/* Ordem de Serviço e Datas */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>OS Física *</Label>
                  <Input
                    placeholder="Ex: 12345"
                    value={osFisica}
                    onChange={(e) => setOsFisica(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Número da OS da loja</p>
                </div>

                <div>
                  <Label>OS Laboratório *</Label>
                  <Input
                    placeholder="Ex: LAB-001"
                    value={osLaboratorio}
                    onChange={(e) => setOsLaboratorio(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Número da OS do lab</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data da Venda</Label>
                  <Input
                    type="date"
                    value={dataVenda}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Sempre a data de hoje</p>
                </div>

                <div>
                  <Label className="flex items-center justify-between">
                    <span>Previsão de Entrega *</span>
                    <button
                      type="button"
                      onClick={() => setModoAutomatico(!modoAutomatico)}
                      className="text-xs text-primary hover:underline"
                    >
                      {modoAutomatico ? '✅ Automático' : '✏️ Manual'}
                    </button>
                  </Label>
                  <Input
                    type="date"
                    value={previsaoEntrega}
                    onChange={(e) => setPrevisaoEntrega(e.target.value)}
                    disabled={modoAutomatico}
                    className={modoAutomatico ? 'bg-muted' : ''}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {modoAutomatico 
                      ? `Calculado automaticamente (${
                          lenteEscolhida?.tipo_lente === 'visao_simples' 
                            ? lenteEscolhida?.fornecedor_prazo_visao_simples 
                            : lenteEscolhida?.fornecedor_prazo_multifocal
                        } dias úteis)` 
                      : 'Clique em "✅ Automático" para calcular ou edite manualmente'}
                  </p>
                </div>
              </div>
            </div>

            {/* Classe de Lente */}
            <div>
              <Label>Classe de Lente *</Label>
              <div className="flex gap-2 mt-2">
                {(['bronze', 'prata', 'ouro', 'platinum'] as const).map((classe) => (
                  <Button
                    key={classe}
                    type="button"
                    size="sm"
                    variant={classeLente === classe ? 'default' : 'outline'}
                    onClick={() => setClasseLente(classe)}
                    className="flex-1"
                  >
                    {classe === 'bronze' && '🥉'}
                    {classe === 'prata' && '🥈'}
                    {classe === 'ouro' && '🥇'}
                    {classe === 'platinum' && '💎'}
                    {' '}
                    {classe.charAt(0).toUpperCase() + classe.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Valor Total */}
            <div>
              <Label className="flex items-center justify-between">
                <span>Valor Total de Venda *</span>
                {valorTotal && lenteEscolhida && (
                  <span className="text-xs font-normal">
                    {parseFloat(valorTotal) >= lenteEscolhida.preco_custo ? (
                      <span className="text-green-600 dark:text-green-400">
                        Margem: {((parseFloat(valorTotal) - lenteEscolhida.preco_custo) / lenteEscolhida.preco_custo * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">
                        ⚠️ Abaixo do custo!
                      </span>
                    )}
                  </span>
                )}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Informações adicionais sobre o pedido..."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button onClick={handleCriarPedido} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                Criar Pedido
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
