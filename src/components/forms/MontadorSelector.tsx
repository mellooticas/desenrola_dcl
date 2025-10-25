import React, { useState, useEffect } from 'react'
import { Montador } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, MapPin, Phone, DollarSign, CheckCircle } from 'lucide-react'

interface MontadorSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (montador: Montador) => void
  selectedMontadorId?: string | null
}

// DADOS MOCKADOS DOS MONTADORES (posteriormente virão do banco)
const MONTADORES_MOCK: Montador[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    nome: 'Douglas',
    local: 'DCL Matriz - SP',
    contato: '(11) 9999-1111',
    preco_base: 45.00,
    ativo: true,
    especialidades: ['Multifocal', 'Progressive', 'Transitions']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    nome: 'Thiago',
    local: 'DCL Vila Madalena - SP',
    contato: '(11) 9999-2222',
    preco_base: 42.00,
    ativo: true,
    especialidades: ['Bifocal', 'Antirreflexo', 'Blue Block']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    nome: '2K',
    local: 'DCL Campinas - SP',
    contato: '(19) 9999-3333',
    preco_base: 40.00,
    ativo: true,
    especialidades: ['Monofocal', 'Fotocromático', 'Polarizado']
  }
]

export function MontadorSelector({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedMontadorId 
}: MontadorSelectorProps) {
  const [montadores, setMontadores] = useState<Montador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Substituir por chamada real da API
    const fetchMontadores = async () => {
      setLoading(true)
      try {
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 500))
        setMontadores(MONTADORES_MOCK)
      } catch (error) {
        console.error('Erro ao buscar montadores:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) {
      fetchMontadores()
    }
  }, [isOpen])

  const handleSelect = (montador: Montador) => {
    onSelect(montador)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Selecionar Montador DCL
          </DialogTitle>
          <DialogDescription>
            Escolha o montador responsável pela montagem deste pedido
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando montadores...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {montadores.map((montador) => (
              <Card 
                key={montador.id}
                className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                  selectedMontadorId === montador.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleSelect(montador)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {montador.nome.charAt(0).toUpperCase()}
                      </div>
                      {montador.nome}
                    </CardTitle>
                    {selectedMontadorId === montador.id && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{montador.local}</span>
                  </div>
                  
                  {montador.contato && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{montador.contato}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                    <DollarSign className="w-4 h-4" />
                    <span>R$ {montador.preco_base.toFixed(2)}</span>
                  </div>
                  
                  {montador.especialidades && montador.especialidades.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">Especialidades:</div>
                      <div className="flex flex-wrap gap-1">
                        {montador.especialidades.map((esp, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-xs px-2 py-1"
                          >
                            {esp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              onSelect(null as any) // Remove seleção
              onClose()
            }}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Remover Montador
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}