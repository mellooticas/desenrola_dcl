// 📊 Painel Administrativo de Controle de OSs

'use client'

import { useState } from 'react'
import { useOSControl } from '@/hooks/useOSControl'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Download,
  Upload,
  Search,
  Plus,
  MessageSquarePlus,
} from 'lucide-react'
import Link from 'next/link'
import { TIPOS_JUSTIFICATIVA_LABELS } from '@/lib/types/os-control'
import { OSNaoLancadaModal } from './OSNaoLancadaModal'

// Badge de status
const StatusBadge = ({ status }: { status: string }) => {
  const configs = {
    lancada: { label: 'Lançada', className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
    nao_lancada: { label: 'Não Lançada', className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
    justificada: { label: 'Justificada', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
    pendente_justificativa: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  }
  const config = configs[status as keyof typeof configs] || configs.nao_lancada
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

export function OSControlPanel() {
  const { userProfile } = useAuth()
  const {
    osGaps,
    isLoading,
    estatisticas,
    popularSequencia,
    isPopulando,
  } = useOSControl()

  const [filtro, setFiltro] = useState('')
  const [numeroInicial, setNumeroInicial] = useState('')
  const [numeroFinal, setNumeroFinal] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOsNumber, setSelectedOsNumber] = useState<number | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(50)

  // Filtrar OSs
  const osFiltradas = osGaps?.filter(os => {
    if (!filtro) return true
    return os.numero_os.toString().includes(filtro)
  }) || []

  // Paginação
  const totalItens = osFiltradas.length
  const totalPaginas = Math.ceil(totalItens / itensPorPagina)
  const inicio = (paginaAtual - 1) * itensPorPagina
  const fim = inicio + itensPorPagina
  const osPaginadas = osFiltradas.slice(inicio, fim)

  // Handler para popular sequência
  const handlePopularSequencia = () => {
    if (!userProfile?.loja_id || !numeroInicial || !numeroFinal) return

    const inicial = parseInt(numeroInicial)
    const final = parseInt(numeroFinal)

    if (isNaN(inicial) || isNaN(final) || inicial > final) {
      alert('Números inválidos!')
      return
    }

    popularSequencia({
      loja_id: userProfile.loja_id,
      numero_inicial: inicial,
      numero_final: final,
      origem: 'manual',
    })

    setNumeroInicial('')
    setNumeroFinal('')
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Esperadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estatisticas?.total_os_esperadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              OSs cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lançadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {estatisticas?.total_lancadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas?.percentual_lancamento.toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lançadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {estatisticas?.total_nao_lancadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam de atenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Justificadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {estatisticas?.total_justificadas || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Explicadas e resolvidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Popular Sequência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Popular Sequência de OSs</CardTitle>
            <CardDescription>
              Adicione um range de números de OS ao controle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="inicial">OS Inicial</Label>
                <Input
                  id="inicial"
                  type="number"
                  placeholder="Ex: 10000"
                  value={numeroInicial}
                  onChange={(e) => setNumeroInicial(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="final">OS Final</Label>
                <Input
                  id="final"
                  type="number"
                  placeholder="Ex: 10100"
                  value={numeroFinal}
                  onChange={(e) => setNumeroFinal(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handlePopularSequencia}
              disabled={!numeroInicial || !numeroFinal || isPopulando}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isPopulando ? 'Adicionando...' : 'Adicionar à Sequência'}
            </Button>
          </CardContent>
        </Card>

        {/* Resolver Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolver OSs Pendentes</CardTitle>
            <CardDescription>
              Navegue pelas OSs não lançadas e resolva uma por uma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-sm text-yellow-900 dark:text-yellow-300">
                <strong>{estatisticas?.total_precisa_atencao || 0}</strong> OSs precisam de atenção
              </div>
            </div>
            <Button
              onClick={() => setModalOpen(true)}
              variant="outline"
              className="w-full border-yellow-300 dark:border-yellow-700"
              disabled={!estatisticas?.total_precisa_atencao}
            >
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
              Resolver Agora
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de OSs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OSs Não Lançadas</CardTitle>
              <CardDescription>
                Lista completa de gaps detectados
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar OS..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {osFiltradas.length > 0 ? (
            <>
              {/* Controles de Paginação */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Mostrar:</Label>
                    <Select
                      value={itensPorPagina.toString()}
                      onValueChange={(value) => {
                        setItensPorPagina(Number(value))
                        setPaginaAtual(1)
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">por página</span>
                  </div>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando <span className="font-medium">{inicio + 1}</span> a{' '}
                    <span className="font-medium">{Math.min(fim, totalItens)}</span> de{' '}
                    <span className="font-medium">{totalItens}</span> resultados
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(1)}
                    disabled={paginaAtual === 1}
                    className="px-2"
                  >
                    Primeira
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="px-2"
                  >
                    Anterior
                  </Button>
                  <span className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded border border-blue-200 dark:border-blue-800">
                    {paginaAtual} / {totalPaginas}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    className="px-2"
                  >
                    Próxima
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaginaAtual(totalPaginas)}
                    disabled={paginaAtual === totalPaginas}
                    className="px-2"
                  >
                    Última
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número OS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Esperada</TableHead>
                    <TableHead>Tipo Justificativa</TableHead>
                    <TableHead>Justificativa</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {osPaginadas.map((os) => (
                    <TableRow key={os.numero_os}>
                      <TableCell className="font-medium">
                        {os.numero_os}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={os.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(os.data_esperada).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {os.tipo_justificativa && (
                          <span className="text-sm">
                            {TIPOS_JUSTIFICATIVA_LABELS[os.tipo_justificativa]}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {os.justificativa}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8"
                          >
                            <Link href={`/pedidos/novo?os=${os.numero_os}`}>
                              <Plus className="mr-2 h-3 w-3" />
                              Novo Pedido
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => {
                              setSelectedOsNumber(os.numero_os)
                              setModalOpen(true)
                            }}
                          >
                            <MessageSquarePlus className="mr-2 h-3 w-3" />
                            Justificar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma OS não lançada encontrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Resolução */}
      <OSNaoLancadaModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedOsNumber(null)
        }}
        autoShowNext={true}
        initialOsNumber={selectedOsNumber}
      />
    </div>
  )
}
