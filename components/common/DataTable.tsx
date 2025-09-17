'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  Search,
  SortAsc,
  SortDesc,
  Download,
  RefreshCw,
  Eye,
  Trash,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

// ========== INTERFACES ==========
interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  title?: string
  description?: string
  searchable?: boolean
  filterable?: boolean
  exportable?: boolean
  refreshable?: boolean
  selectable?: boolean
  actions?: (row: T) => React.ReactNode
  onRowClick?: (row: T) => void
  loading?: boolean
  error?: string
  emptyMessage?: string
  pageSize?: number
  className?: string
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

// ========== COMPONENTE PRINCIPAL ==========
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  description,
  searchable = true,
  filterable = true,
  exportable = true,
  refreshable = true,
  selectable = false,
  actions,
  onRowClick,
  loading = false,
  error,
  emptyMessage = 'Nenhum dado encontrado',
  pageSize = 10,
  className
}: DataTableProps<T>) {
  
  // ========== ESTADOS ==========
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})

  // ========== DADOS PROCESSADOS ==========
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Aplicar busca
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Aplicar filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          row[key]?.toString().toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    // Aplicar ordenação
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key]
        const bValue = b[sortConfig.key]
        
        if (aValue == null) return 1
        if (bValue == null) return -1
        
        if (String(aValue) < String(bValue)) return sortConfig.direction === 'asc' ? -1 : 1
        if (String(aValue) > String(bValue)) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sortConfig, filters, columns])

  // ========== PAGINAÇÃO ==========
  const totalPages = Math.ceil(processedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentData = processedData.slice(startIndex, endIndex)

  // ========== FUNÇÕES ==========
  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = () => {
    if (selectedRows.size === currentData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(currentData.map((_, index) => startIndex + index)))
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }

  const exportToCSV = () => {
    const headers = columns.map(col => col.label).join(',')
    const rows = processedData.map(row => 
      columns.map(col => row[col.key] || '').join(',')
    ).join('\n')
    
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title || 'data'}.csv`
    link.click()
  }

  // ========== RENDER ==========
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Trash className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Erro ao carregar dados</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg", className)}>
      {/* Header */}
      {(title || description) && (
        <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <CardTitle className="text-xl font-bold text-gray-900">
                  {title}
                </CardTitle>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {refreshable && (
                <Button variant="outline" size="sm" className="hover:bg-blue-50">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              {exportable && (
                <Button variant="outline" size="sm" onClick={exportToCSV} className="hover:bg-green-50">
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-6">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Busca */}
          {searchable && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 border-gray-200/80 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
              />
            </div>
          )}

          {/* Filtros */}
          {filterable && (
            <div className="flex gap-2">
              {columns.filter(col => col.filterable).map(column => (
                <Select
                  key={column.key}
                  value={filters[column.key] || ''}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, [column.key]: value }))}
                >
                  <SelectTrigger className="w-40 bg-white/70 border-gray-200/80">
                    <SelectValue placeholder={`Filtrar ${column.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {Array.from(new Set(data.map(row => row[column.key]))).map(value => (
                      <SelectItem key={String(value)} value={String(value)}>
                        {String(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Mostrando {currentData.length} de {processedData.length} registros
            {selectedRows.size > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedRows.size} selecionados
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-xl border border-gray-200/50 overflow-hidden bg-white/50 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150">
                {selectable && (
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === currentData.length && currentData.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "font-semibold text-gray-700",
                      column.sortable && "cursor-pointer hover:text-gray-900 transition-colors",
                      column.className
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {column.sortable && (
                        <div className="w-4 h-4">
                          {sortConfig?.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <SortAsc className="w-4 h-4" />
                            ) : (
                              <SortDesc className="w-4 h-4" />
                            )
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </TableHead>
                ))}
                {actions && <TableHead className="w-24">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="h-24">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="h-24">
                    <div className="text-center text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{emptyMessage}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((row, index) => {
                  const actualIndex = startIndex + index
                  return (
                    <TableRow
                      key={actualIndex}
                      className={cn(
                        "hover:bg-gray-50/80 transition-colors duration-200",
                        onRowClick && "cursor-pointer",
                        selectedRows.has(actualIndex) && "bg-blue-50/80"
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(actualIndex)}
                            onChange={() => handleSelectRow(actualIndex)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key} className={column.className}>
                          {column.render 
                            ? column.render(row[column.key], row)
                            : String(row[column.key] || '')
                          }
                        </TableCell>
                      ))}
                      {actions && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {actions(row)}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, processedData.length)} de {processedData.length}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hover:bg-gray-50"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hover:bg-gray-50"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
