'use client'

import { MontadorKPIs } from '@/components/montagens/MontadorKPIs'
import { MontadorCards } from '@/components/montagens/MontadorCards'
import { MontagemTable } from '@/components/montagens/MontagemTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { FileText, Download, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export default function MontagensPage() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await queryClient.invalidateQueries({ queryKey: ['montagens'] })
    await queryClient.invalidateQueries({ queryKey: ['kpis-montadores'] })
    await queryClient.invalidateQueries({ queryKey: ['montadores-stats'] })
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Montagens</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe a performance e produtividade dos montadores
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Relatório
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPIs Gerais */}
      <MontadorKPIs />

      {/* Tabs */}
      <Tabs defaultValue="montadores" className="space-y-4">
        <TabsList>
          <TabsTrigger value="montadores">Montadores</TabsTrigger>
          <TabsTrigger value="em-andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
        </TabsList>

        {/* Tab: Montadores */}
        <TabsContent value="montadores" className="space-y-4">
          <MontadorCards />
        </TabsContent>

        {/* Tab: Em Andamento */}
        <TabsContent value="em-andamento" className="space-y-4">
          <MontagemTable status="ENVIADO" />
        </TabsContent>

        {/* Tab: Concluídos */}
        <TabsContent value="concluidos" className="space-y-4">
          <MontagemTable status="CHEGOU" limit={50} />
        </TabsContent>

        {/* Tab: Ranking */}
        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ranking em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
