'use client'

import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useOSControl } from '@/hooks/useOSControl'
import { useAuth } from '@/components/providers/AuthProvider'
import { TIPOS_JUSTIFICATIVA_LABELS, TipoJustificativaOS } from '@/lib/types/os-control'
import { Loader2, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface OSNaoLancadaModalProps {
    open: boolean
    onClose: () => void
    autoShowNext?: boolean
    initialOsNumber?: number | null
}

export function OSNaoLancadaModal({ open, onClose, autoShowNext = false, initialOsNumber }: OSNaoLancadaModalProps) {
    const { userProfile } = useAuth()
    const { osGaps, justificarOS, isJustificando } = useOSControl()

    // Filtra OSs que precisam de atenção
    const osPendentes = osGaps?.filter(os => os.precisa_atencao) || []

    const [currentIndex, setCurrentIndex] = useState(0)
    const currentOS = osPendentes[currentIndex]

    const [tipoJustificativa, setTipoJustificativa] = useState<TipoJustificativaOS | ''>('')
    const [justificativa, setJustificativa] = useState('')

    // Reset form when OS changes or modal opens
    useEffect(() => {
        if (open) {
            setTipoJustificativa('')
            setJustificativa('')

            if (initialOsNumber) {
                const index = osPendentes.findIndex(os => os.numero_os === initialOsNumber)
                if (index !== -1) {
                    setCurrentIndex(index)
                } else {
                    setCurrentIndex(0)
                }
            } else {
                setCurrentIndex(0) // Começa da primeira se não houver inicial
            }
        }
    }, [open, initialOsNumber])

    // Reset form quando troca de OS
    useEffect(() => {
        setTipoJustificativa('')
        setJustificativa('')
    }, [currentOS?.numero_os])

    const handleSave = async () => {
        if (!currentOS || !userProfile?.id || !tipoJustificativa || !justificativa) return

        try {
            await justificarOS({
                numero_os: currentOS.numero_os,
                loja_id: currentOS.loja_id,
                justificativa,
                tipo_justificativa: tipoJustificativa as TipoJustificativaOS,
                usuario_id: userProfile.id
            })

            // Após salvar com sucesso, avança para a próxima ou fecha
            if (autoShowNext && currentIndex < osPendentes.length - 1) {
                setCurrentIndex(currentIndex + 1)
            } else if (currentIndex >= osPendentes.length - 1) {
                // Era a última, fecha o modal
                setTimeout(() => onClose(), 500)
            } else {
                // Não avança automático, apenas limpa o form
                setTipoJustificativa('')
                setJustificativa('')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleNext = () => {
        if (currentIndex < osPendentes.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handleSkip = () => {
        handleNext()
    }

    // Se não estiver aberto, não renderiza nada
    if (!open) return null

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>Resolver OS Pendente</DialogTitle>
                        {osPendentes.length > 0 && (
                            <Badge variant="outline" className="ml-2">
                                {currentIndex + 1} de {osPendentes.length}
                            </Badge>
                        )}
                    </div>
                    <DialogDescription>
                        {currentOS ? (
                            <>Resolvendo pendência da OS <strong className="text-primary">#{currentOS.numero_os}</strong> da data {new Date(currentOS.data_esperada).toLocaleDateString('pt-BR')}</>
                        ) : (
                            'Nenhuma OS pendente encontrada.'
                        )}
                    </DialogDescription>
                </DialogHeader>

                {currentOS ? (
                    <div className="grid gap-4 py-4">
                        {/* Informações da OS */}
                        <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Número:</span>
                                <span className="font-medium">#{currentOS.numero_os}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Data Esperada:</span>
                                <span className="font-medium">{new Date(currentOS.data_esperada).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                    {currentOS.status === 'nao_lancada' ? 'Não Lançada' : currentOS.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Motivo da Pendência</Label>
                            <Select
                                value={tipoJustificativa}
                                onValueChange={(val) => setTipoJustificativa(val as TipoJustificativaOS)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o motivo..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(TIPOS_JUSTIFICATIVA_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Justificativa Detalhada</Label>
                            <Textarea
                                placeholder="Descreva o que aconteceu com esta OS..."
                                value={justificativa}
                                onChange={(e) => setJustificativa(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <span className="text-4xl">🎉</span>
                        <p>Tudo certo! Não há mais OSs pendentes para resolver.</p>
                    </div>
                )}

                <DialogFooter>
                    <div className="flex w-full justify-between items-center">
                        {/* Navegação Esquerda */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0 || isJustificando}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSkip}
                                disabled={currentIndex >= osPendentes.length - 1 || isJustificando}
                            >
                                <SkipForward className="h-4 w-4 mr-1" />
                                Pular
                            </Button>
                        </div>

                        {/* Ações Principais */}
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={onClose} disabled={isJustificando}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSave} disabled={!tipoJustificativa || !justificativa || isJustificando}>
                                {isJustificando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Resolver {osPendentes.length > 1 && autoShowNext && currentIndex < osPendentes.length - 1 && '& Avançar'}
                            </Button>
                            {!autoShowNext && currentIndex < osPendentes.length - 1 && (
                                <Button
                                    variant="outline"
                                    onClick={handleNext}
                                    disabled={isJustificando}
                                >
                                    Próxima
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
