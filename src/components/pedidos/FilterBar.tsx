"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Calendar,
  X,
  FileText,
  Hash,
  Phone,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { StatusPedido, PrioridadeLevel } from '@/lib/types/database'

export interface FiltrosAvancados {
  // Buscas específicas
  busca_geral: string
  numero_os_loja: string
  numero_os_lab: string
  numero_pedido: string
  telefone_cliente: string
  
  // Filtros de categoria
  status: string
  loja_id: string
  laboratorio_id: string
  prioridade: string
  
  // Filtros de data
  periodo_predefinido: string // 'hoje' | 'esta_semana' | 'este_mes' | 'ultimo_mes' | 'custom'
  data_inicio: string
  data_fim: string
  
  // Filtro de SLA
  situacao_sla: string // 'todos' | 'no_prazo' | 'atencao' | 'atrasado' | 'critico'
}

interface FilterBarProps {
  filtros: FiltrosAvancados
  onChange: (filtros: FiltrosAvancados) => void
  lojas: Array<{id: string, nome: string}>
  laboratorios: Array<{id: string, nome: string}>
  statusConfig: Record<StatusPedido, { label: string }>
  prioridadeConfig: Record<PrioridadeLevel, { label: string }>
  isVisible: boolean
  totalFiltrados: number
  totalGeral: number
}

const PERIODOS_PREDEFINIDOS = [
  { value: 'todos', label: 'Todos os períodos' },
  { value: 'hoje', label: 'Hoje' },
  { value: 'esta_semana', label: 'Esta Semana' },
  { value: 'este_mes', label: 'Este Mês' },
  { value: 'ultimo_mes', label: 'Último Mês' },
  { value: 'ultimos_7_dias', label: 'Últimos 7 dias' },
  { value: 'ultimos_30_dias', label: 'Últimos 30 dias' },
  { value: 'custom', label: 'Período Customizado' }
]

const SITUACOES_SLA = [
  { value: 'todos', label: 'Todas situações', icon: Filter },
  { value: 'no_prazo', label: 'No Prazo (5+ dias)', icon: CheckCircle, color: 'text-green-600' },
  { value: 'atencao', label: 'Atenção (1-4 dias)', icon: Clock, color: 'text-yellow-600' },
  { value: 'atrasado', label: 'Atrasado (0 dias)', icon: AlertTriangle, color: 'text-orange-600' },
  { value: 'critico', label: 'Crítico (atrasados)', icon: AlertTriangle, color: 'text-red-600' }
]

export function FilterBar({ 
  filtros, 
  onChange, 
  lojas, 
  laboratorios, 
  statusConfig,
  prioridadeConfig,
  isVisible,
  totalFiltrados,
  totalGeral
}: FilterBarProps) {
  const [modoAvancado, setModoAvancado] = useState(false)

  const handleChange = (campo: keyof FiltrosAvancados, valor: string) => {
    // Se mudar período predefinido para custom, não alterar as datas
    if (campo === 'periodo_predefinido' && valor !== 'custom') {
      const novosFiltros = { ...filtros, [campo]: valor }
      
      // Calcular datas baseado no período
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      let dataInicio = ''
      let dataFim = ''
      
      if (valor !== 'todos') {
        dataFim = hoje.toISOString().split('T')[0]
        
        switch (valor) {
          case 'hoje':
            dataInicio = dataFim
            break
          case 'esta_semana':
            const inicioSemana = new Date(hoje)
            inicioSemana.setDate(hoje.getDate() - hoje.getDay())
            dataInicio = inicioSemana.toISOString().split('T')[0]
            break
          case 'este_mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0]
            break
          case 'ultimo_mes':
            const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
            const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
            dataInicio = mesPassado.toISOString().split('T')[0]
            dataFim = ultimoDiaMesPassado.toISOString().split('T')[0]
            break
          case 'ultimos_7_dias':
            const seteDiasAtras = new Date(hoje)
            seteDiasAtras.setDate(hoje.getDate() - 7)
            dataInicio = seteDiasAtras.toISOString().split('T')[0]
            break
          case 'ultimos_30_dias':
            const trintaDiasAtras = new Date(hoje)
            trintaDiasAtras.setDate(hoje.getDate() - 30)
            dataInicio = trintaDiasAtras.toISOString().split('T')[0]
            break
        }
        
        novosFiltros.data_inicio = dataInicio
        novosFiltros.data_fim = dataFim
      } else {
        novosFiltros.data_inicio = ''
        novosFiltros.data_fim = ''
      }
      
      onChange(novosFiltros)
    } else {
      onChange({ ...filtros, [campo]: valor })
    }
  }

  const limparFiltros = () => {
    onChange({
      busca_geral: '',
      numero_os_loja: '',
      numero_os_lab: '',
      numero_pedido: '',
      telefone_cliente: '',
      status: 'all',
      loja_id: 'all',
      laboratorio_id: 'all',
      prioridade: 'all',
      periodo_predefinido: 'todos',
      data_inicio: '',
      data_fim: '',
      situacao_sla: 'todos'
    })
  }

  const removerFiltro = (campo: keyof FiltrosAvancados) => {
    // Para os selects, voltar para 'all' ou 'todos'
    if (campo === 'status' || campo === 'loja_id' || campo === 'laboratorio_id' || campo === 'prioridade') {
      handleChange(campo, 'all')
    } else if (campo === 'periodo_predefinido' || campo === 'situacao_sla') {
      handleChange(campo, 'todos')
    } else {
      handleChange(campo, '')
    }
  }

  // Contar filtros ativos
  const filtrosAtivos = Object.entries(filtros).filter(([key, value]) => {
    if (key === 'periodo_predefinido') return value !== 'todos'
    if (key === 'situacao_sla') return value !== 'todos'
    return value !== '' && value !== 'all'
  })

  if (!isVisible) return null

  return (
    <Card className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border-white/20 dark:border-gray-700/20 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-slate-800 dark:text-white">
            <Filter className="w-5 h-5 mr-2" />
            Filtros Avançados
            {filtrosAtivos.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filtrosAtivos.length} ativo{filtrosAtivos.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModoAvancado(!modoAvancado)}
              className="text-xs"
            >
              {modoAvancado ? 'Modo Simples' : 'Modo Avançado'}
            </Button>
            {filtrosAtivos.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar Tudo
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Barra de Busca Rápida - Sempre visível */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700 dark:text-gray-200">🔍 Busca Rápida</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Busca Geral */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Cliente, Lab, Loja..."
                value={filtros.busca_geral}
                onChange={(e) => handleChange('busca_geral', e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              {filtros.busca_geral && (
                <button
                  onClick={() => removerFiltro('busca_geral')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* OS da Loja */}
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-blue-500 dark:text-blue-400" />
              <Input
                placeholder="OS da Loja"
                value={filtros.numero_os_loja}
                onChange={(e) => handleChange('numero_os_loja', e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
              {filtros.numero_os_loja && (
                <button
                  onClick={() => removerFiltro('numero_os_loja')}
                  className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Número do Pedido */}
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-4 w-4 text-purple-500 dark:text-purple-400" />
              <Input
                placeholder="Nº Pedido"
                value={filtros.numero_pedido}
                onChange={(e) => handleChange('numero_pedido', e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                type="number"
              />
              {filtros.numero_pedido && (
                <button
                  onClick={() => removerFiltro('numero_pedido')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Telefone */}
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-green-500" />
              <Input
                placeholder="Telefone do Cliente"
                value={filtros.telefone_cliente}
                onChange={(e) => handleChange('telefone_cliente', e.target.value)}
                className="pl-10 bg-white/50"
              />
              {filtros.telefone_cliente && (
                <button
                  onClick={() => removerFiltro('telefone_cliente')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros Principais */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">📊 Filtros Principais</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Status */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Status</Label>
              <Select value={filtros.status || 'all'} onValueChange={(value) => handleChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Prioridade</Label>
              <Select value={filtros.prioridade || 'all'} onValueChange={(value) => handleChange('prioridade', value === 'all' ? '' : value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas prioridades</SelectItem>
                  {Object.entries(prioridadeConfig).map(([prio, config]) => (
                    <SelectItem key={prio} value={prio}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Situação SLA */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Situação SLA</Label>
              <Select value={filtros.situacao_sla} onValueChange={(value) => handleChange('situacao_sla', value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  {SITUACOES_SLA.map(({ value, label, icon: Icon, color }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color || ''}`} />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Período</Label>
              <Select value={filtros.periodo_predefinido} onValueChange={(value) => handleChange('periodo_predefinido', value)}>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS_PREDEFINIDOS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Modo Avançado - Filtros Adicionais */}
        {modoAvancado && (
          <>
            {/* Lojas e Laboratórios */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">🏪 Loja & Laboratório</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Loja */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Loja</Label>
                  <Select value={filtros.loja_id || 'all'} onValueChange={(value) => handleChange('loja_id', value === 'all' ? '' : value)}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as lojas</SelectItem>
                      {lojas.map(loja => (
                        <SelectItem key={loja.id} value={loja.id}>{loja.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Laboratório */}
                <div className="space-y-1">
                  <Label className="text-xs text-slate-600">Laboratório</Label>
                  <Select value={filtros.laboratorio_id || 'all'} onValueChange={(value) => handleChange('laboratorio_id', value === 'all' ? '' : value)}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os laboratórios</SelectItem>
                      {laboratorios.map(lab => (
                        <SelectItem key={lab.id} value={lab.id}>{lab.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Período Customizado */}
            {filtros.periodo_predefinido === 'custom' && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">📅 Período Customizado</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Data Início</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        value={filtros.data_inicio}
                        onChange={(e) => handleChange('data_inicio', e.target.value)}
                        className="pl-10 bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-600">Data Fim</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        type="date"
                        value={filtros.data_fim}
                        onChange={(e) => handleChange('data_fim', e.target.value)}
                        className="pl-10 bg-white/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* OS do Laboratório (modo avançado) */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">🔬 Busca Laboratório</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                <Input
                  placeholder="OS do Laboratório"
                  value={filtros.numero_os_lab}
                  onChange={(e) => handleChange('numero_os_lab', e.target.value)}
                  className="pl-10 bg-white/50"
                />
                {filtros.numero_os_lab && (
                  <button
                    onClick={() => removerFiltro('numero_os_lab')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Chips de Filtros Ativos */}
        {filtrosAtivos.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
            {filtrosAtivos.map(([key, value]) => (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1 py-1 px-3 bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                <span className="text-xs font-medium">
                  {key === 'busca_geral' && `Busca: ${value}`}
                  {key === 'numero_os_loja' && `OS Loja: ${value}`}
                  {key === 'numero_os_lab' && `OS Lab: ${value}`}
                  {key === 'numero_pedido' && `Pedido #${value}`}
                  {key === 'telefone_cliente' && `Tel: ${value}`}
                  {key === 'status' && statusConfig[value as StatusPedido]?.label}
                  {key === 'prioridade' && prioridadeConfig[value as PrioridadeLevel]?.label}
                  {key === 'loja_id' && lojas.find(l => l.id === value)?.nome}
                  {key === 'laboratorio_id' && laboratorios.find(l => l.id === value)?.nome}
                  {key === 'periodo_predefinido' && PERIODOS_PREDEFINIDOS.find(p => p.value === value)?.label}
                  {key === 'situacao_sla' && SITUACOES_SLA.find(s => s.value === value)?.label}
                </span>
                <button
                  onClick={() => removerFiltro(key as keyof FiltrosAvancados)}
                  className="hover:bg-blue-300 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Contador de Resultados */}
        <div className="text-center text-sm text-slate-600 pt-2 border-t border-slate-200">
          Mostrando <strong className="text-blue-600">{totalFiltrados}</strong> de <strong>{totalGeral}</strong> pedidos
        </div>
      </CardContent>
    </Card>
  )
}
