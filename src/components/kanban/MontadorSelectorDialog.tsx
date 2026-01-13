'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserCog, Building2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useMontadores, type Montador } from '@/hooks/use-montadores'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

interface MontadorSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (montadorId: string) => void
  pedidoNumero?: string
}

export function MontadorSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  pedidoNumero
}: MontadorSelectorDialogProps) {
  const queryClient = useQueryClient()
  const { data: montadores, isLoading, error } = useMontadores()
  const [selectedMontador, setSelectedMontador] = useState<string | null>(null)

  // DEBUG: Log para verificar dados
  useEffect(() => {
    console.log('🔍 MontadorSelectorDialog - Estado:', {
      open,
      isLoading,
      error: error?.message,
      montadores: montadores?.length,
      montadoresData: montadores
    })
    
    // Se abriu o modal e não tem montadores, forçar reload
    if (open && !isLoading && !montadores?.length) {
      console.log('⚠️ Modal aberto sem montadores - invalidando cache...')
      queryClient.invalidateQueries({ queryKey: ['montadores'] })
    }
  }, [open, isLoading, error, montadores, queryClient])

  // Auto-selecionar se houver apenas 1 montador
  useEffect(() => {
    if (montadores && montadores.length === 1 && !selectedMontador) {
      setSelectedMontador(montadores[0].id)
    }
  }, [montadores, selectedMontador])

  const handleConfirm = () => {
    if (selectedMontador) {
      onSelect(selectedMontador)
      setSelectedMontador(null)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setSelectedMontador(null)
    onOpenChange(false)
  }

  // Atalho: Enter confirma, Esc cancela
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if (e.key === 'Enter' && selectedMontador) {
        e.preventDefault()
        handleConfirm()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, selectedMontador])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Selecionar Montador
          </DialogTitle>
          <DialogDescription>
            {pedidoNumero 
              ? `Pedido #${pedidoNumero} - Escolha o montador responsável`
              : 'Escolha o montador responsável por este pedido'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar montadores: {error.message}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && montadores && montadores.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum montador ativo cadastrado no sistema.
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && montadores && montadores.length > 0 && (
            <div className="space-y-2">
              {montadores.length === 1 && (
                <Alert className="mb-3 bg-blue-50 border-blue-200">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    ✨ <strong>Montador selecionado automaticamente!</strong> Clique em Confirmar ou pressione Enter.
                  </AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground mb-3">
                {montadores.length === 1 ? 'Montador disponível:' : 'Selecione um montador da lista:'}
              </p>
              
              <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2">
                {montadores.map((montador) => (
                  <button
                    key={montador.id}
                    onClick={() => setSelectedMontador(montador.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 transition-all text-left',
                      'hover:bg-accent hover:border-primary/50 hover:shadow-md',
                      selectedMontador === montador.id
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-lg'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base">{montador.nome}</span>
                          <Badge 
                            variant={montador.tipo === 'INTERNO' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {montador.tipo === 'INTERNO' ? (
                              <>
                                <UserCog className="h-3 w-3 mr-1" />
                                Interno
                              </>
                            ) : (
                              <>
                                <Building2 className="h-3 w-3 mr-1" />
                                Laboratório
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {selectedMontador === montador.id && (
                        <div className="ml-2">
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancelar <span className="ml-1 text-xs text-muted-foreground">(Esc)</span>
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedMontador}
            className="min-w-[140px]"
          >
            {selectedMontador ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar
              </>
            ) : (
              'Selecione um montador'
            )}
            {selectedMontador && <span className="ml-2 text-xs opacity-70">(Enter)</span>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
