'use client'

import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLojas } from '@/lib/hooks/use-lojas'
import { Store, Trophy, Target, Star } from 'lucide-react'

interface StoreSelectorProps {
  selectedLojaId: string | null
  onLojaChange: (lojaId: string) => void
}

export function StoreSelector({ selectedLojaId, onLojaChange }: StoreSelectorProps) {
  const { data: lojas, isLoading } = useLojas()
  const [storeStats, setStoreStats] = useState<{
    totalPoints: number
    completedMissions: number
    ranking: number
    badges: string[]
  } | null>(null)

  // Buscar estatísticas da loja selecionada
  useEffect(() => {
    if (selectedLojaId) {
      // TODO: Implementar busca de estatísticas da loja
      setStoreStats({
        totalPoints: 1250,
        completedMissions: 47,
        ranking: 3,
        badges: ['🔥 Hot Streak', '⚡ Speed Demon', '🎯 Precision']
      })
    }
  }, [selectedLojaId])

  const selectedLoja = lojas?.find(loja => loja.id === selectedLojaId)

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Seletor de Loja */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Store className="h-5 w-5" />
            Selecionar Loja
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select value={selectedLojaId || ""} onValueChange={onLojaChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha uma loja para ver as missões" />
            </SelectTrigger>
            <SelectContent>
              {lojas?.map((loja) => (
                <SelectItem key={loja.id} value={loja.id}>
                  <div className="flex items-center gap-2">
                    <span>{loja.nome}</span>
                    {loja.codigo && (
                      <span className="text-sm text-gray-500">({loja.codigo})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Dashboard da Loja Selecionada */}
      {selectedLoja && storeStats && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
              <Trophy className="h-5 w-5" />
              {selectedLoja.nome}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Pontos Totais */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {storeStats.totalPoints.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Pontos Totais</div>
              </div>
              
              {/* Missões Concluídas */}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {storeStats.completedMissions}
                </div>
                <div className="text-xs text-gray-600">Missões</div>
              </div>
              
              {/* Ranking */}
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  #{storeStats.ranking}
                </div>
                <div className="text-xs text-gray-600">Ranking</div>
              </div>
            </div>

            {/* Badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                <Star className="h-4 w-4" />
                Conquistas
              </div>
              <div className="flex flex-wrap gap-1">
                {storeStats.badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Progresso da Meta */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Meta Mensal
                </div>
                <span className="font-medium">1250 / 2000 pts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(storeStats.totalPoints / 2000) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600">
                Faltam {2000 - storeStats.totalPoints} pontos para a meta
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}