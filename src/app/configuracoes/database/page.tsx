"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  HardDrive, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface StatusBanco {
  conexao: 'online' | 'offline' | 'lenta'
  ultimoBackup: string
  tamanhoBase: string
  numeroTabelas: number
  registrosTotais: number
  performanceMedia: number
  alertas: string[]
}

export default function ConfigDatabasePage() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [status, setStatus] = useState<StatusBanco | null>(null)
  const [loading, setLoading] = useState(true)
  const [executandoBackup, setExecutandoBackup] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  useEffect(() => {
    if (!userProfile) return
    carregarStatusBanco()
  }, [userProfile])

  const carregarStatusBanco = async () => {
    try {
      // Simular dados do status do banco
      // Em um ambiente real, estes dados viriam de uma API específica
      setStatus({
        conexao: 'online',
        ultimoBackup: '2024-01-15 14:30:00',
        tamanhoBase: '2.4 GB',
        numeroTabelas: 15,
        registrosTotais: 45672,
        performanceMedia: 85,
        alertas: [
          'Tabela pedidos_historico crescendo rapidamente',
          'Índice missing na tabela logs_sistema'
        ]
      })
    } catch (error) {
      console.error('Erro ao carregar status do banco:', error)
      toast.error('Erro ao carregar status do banco de dados')
    } finally {
      setLoading(false)
    }
  }

  const executarBackup = async () => {
    setExecutandoBackup(true)
    try {
      // Simular processo de backup
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Backup realizado com sucesso!')
      
      // Atualizar data do último backup
      if (status) {
        setStatus({
          ...status,
          ultimoBackup: new Date().toLocaleString('pt-BR')
        })
      }
    } catch (error) {
      console.error('Erro ao executar backup:', error)
      toast.error('Erro ao executar backup')
    } finally {
      setExecutandoBackup(false)
    }
  }

  const otimizarBanco = async () => {
    try {
      toast.info('Iniciando otimização do banco de dados...')
      
      // Simular processo de otimização
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Otimização concluída com sucesso!')
      carregarStatusBanco()
    } catch (error) {
      console.error('Erro ao otimizar banco:', error)
      toast.error('Erro ao otimizar banco de dados')
    }
  }

  const getStatusColor = (conexao: string) => {
    switch (conexao) {
      case 'online': return 'bg-green-100 text-green-800'
      case 'lenta': return 'bg-yellow-100 text-yellow-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (conexao: string) => {
    switch (conexao) {
      case 'online': return <CheckCircle className="w-4 h-4" />
      case 'lenta': return <AlertTriangle className="w-4 h-4" />
      case 'offline': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  // Gate de autenticação
  if (authLoading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!userProfile) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banco de Dados</h1>
          <p className="text-gray-600">Monitoramento, backup e manutenção do banco de dados</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={carregarStatusBanco}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={executarBackup}
            disabled={executandoBackup}
          >
            {executandoBackup ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Backup
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Status Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Status Conexão</p>
                    <Badge className={getStatusColor(status?.conexao || 'offline')}>
                      {getStatusIcon(status?.conexao || 'offline')}
                      <span className="ml-1">
                        {status?.conexao === 'online' ? 'Online' : 
                         status?.conexao === 'lenta' ? 'Lenta' : 'Offline'}
                      </span>
                    </Badge>
                  </div>
                  <Database className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tamanho Base</p>
                    <p className="text-lg font-semibold dark:text-white">{status?.tamanhoBase}</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tabelas</p>
                    <p className="text-lg font-semibold dark:text-white">{status?.numeroTabelas}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Registros</p>
                    <p className="text-lg font-semibold dark:text-white">
                      {status?.registrosTotais.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Activity className="w-5 h-5" />
                Performance
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Monitoramento do desempenho do banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium dark:text-gray-200">Performance Geral</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{status?.performanceMedia}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all" 
                      style={{ width: `${status?.performanceMedia}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 border dark:border-gray-700 dark:bg-gray-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">98.5%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Uptime</p>
                  </div>
                  <div className="text-center p-4 border dark:border-gray-700 dark:bg-gray-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">45ms</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Latência Média</p>
                  </div>
                  <div className="text-center p-4 border dark:border-gray-700 dark:bg-gray-700/30 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.2k</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Queries/min</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <Download className="w-5 h-5" />
                Backup e Restauração
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Gerencie backups automáticos e manuais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border dark:border-gray-700 dark:bg-gray-700/30 rounded-lg">
                  <div>
                    <p className="font-medium dark:text-white">Último Backup</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{status?.ultimoBackup}</p>
                  </div>
                  <Badge variant="outline">Automático</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="w-6 h-6 mb-2" />
                    <span>Backup Manual</span>
                    <span className="text-xs text-gray-500">Criar backup agora</span>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col">
                    <Upload className="w-6 h-6 mb-2" />
                    <span>Restaurar</span>
                    <span className="text-xs text-gray-500">De arquivo de backup</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manutenção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Manutenção
              </CardTitle>
              <CardDescription>
                Ferramentas de otimização e limpeza do banco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={otimizarBanco} className="h-16 flex-col">
                    <RefreshCw className="w-5 h-5 mb-1" />
                    <span>Otimizar Banco</span>
                  </Button>
                  
                  <Button variant="outline" className="h-16 flex-col">
                    <HardDrive className="w-5 h-5 mb-1" />
                    <span>Limpar Logs</span>
                  </Button>
                </div>

                {/* Alertas */}
                {status?.alertas && status.alertas.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      Alertas
                    </h4>
                    {status.alertas.map((alerta, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{alerta}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}