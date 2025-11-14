"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Save, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Laboratorio, ClasseLente } from '@/lib/types/database'

interface SLAConfig {
  laboratorio_id: string
  classe_lente_id: string
  sla_base_dias: number
  sla_maximo_dias?: number
  permite_urgente: boolean
  observacoes?: string
  laboratorio_nome: string
  classe_nome: string
}

export default function ConfigSLAsPage() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [classes, setClasses] = useState<ClasseLente[]>([])
  const [slas, setSlas] = useState<SLAConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSLA, setEditingSLA] = useState<SLAConfig | null>(null)
  const [formData, setFormData] = useState({
    laboratorio_id: '',
    classe_lente_id: '',
    sla_base_dias: 5,
    sla_maximo_dias: 10,
    permite_urgente: true,
    observacoes: ''
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  useEffect(() => {
    if (!userProfile) return
    carregarDados()
  }, [userProfile])

  const carregarDados = async () => {
    try {
      const [labsResult, classesResult, slasResult] = await Promise.all([
        supabase.from('laboratorios').select('*').eq('ativo', true).order('nome'),
        supabase.from('classes_lente').select('*').eq('ativa', true).order('nome'),
        supabase.from('laboratorio_sla').select(`
          *,
          laboratorio:laboratorios(nome),
          classe:classes_lente(nome)
        `).order('laboratorio_id, classe_lente_id')
      ])

      if (labsResult.error) throw labsResult.error
      if (classesResult.error) throw classesResult.error
      if (slasResult.error) throw slasResult.error

      setLaboratorios(labsResult.data || [])
      setClasses(classesResult.data || [])
      
      // Transformar dados dos SLAs
      const slasTransformados = (slasResult.data || []).map(sla => ({
        laboratorio_id: sla.laboratorio_id,
        classe_lente_id: sla.classe_lente_id,
        sla_base_dias: sla.sla_base_dias,
        sla_maximo_dias: sla.sla_maximo_dias,
        permite_urgente: sla.permite_urgente || true,
        observacoes: sla.observacoes,
        laboratorio_nome: sla.laboratorio?.nome || 'N/A',
        classe_nome: sla.classe?.nome || 'N/A'
      }))
      
      setSlas(slasTransformados)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar configurações de SLA')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.laboratorio_id || !formData.classe_lente_id) {
      toast.error('Laboratório e classe são obrigatórios')
      return
    }

    try {
      const dadosSLA = {
        laboratorio_id: formData.laboratorio_id,
        classe_lente_id: formData.classe_lente_id,
        sla_base_dias: formData.sla_base_dias,
        sla_maximo_dias: formData.sla_maximo_dias || null,
        permite_urgente: formData.permite_urgente,
        observacoes: formData.observacoes || null
      }

      if (editingSLA) {
        // Atualizar SLA existente
        const { error } = await supabase
          .from('laboratorio_sla')
          .update(dadosSLA)
          .eq('laboratorio_id', editingSLA.laboratorio_id)
          .eq('classe_lente_id', editingSLA.classe_lente_id)

        if (error) throw error
        toast.success('SLA atualizado com sucesso!')
      } else {
        // Inserir novo SLA
        const { error } = await supabase
          .from('laboratorio_sla')
          .insert([dadosSLA])

        if (error) throw error
        toast.success('SLA configurado com sucesso!')
      }

      setDialogOpen(false)
      resetForm()
      carregarDados()
    } catch (error: unknown) {
      console.error('Erro ao salvar SLA:', error)
      const hasCode = (e: unknown): e is { code: string } => {
        if (typeof e !== 'object' || e === null) return false
        const rec = e as Record<string, unknown>
        return typeof rec.code === 'string'
      }
      const code = hasCode(error) ? error.code : undefined
      if (code === '23505') {
        toast.error('SLA já existe para este laboratório e classe')
      } else {
        toast.error('Erro ao salvar configuração de SLA')
      }
    }
  }

  const handleEdit = (sla: SLAConfig) => {
    setEditingSLA(sla)
    setFormData({
      laboratorio_id: sla.laboratorio_id,
      classe_lente_id: sla.classe_lente_id,
      sla_base_dias: sla.sla_base_dias,
      sla_maximo_dias: sla.sla_maximo_dias || 0,
      permite_urgente: sla.permite_urgente,
      observacoes: sla.observacoes || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (laboratorio_id: string, classe_lente_id: string) => {
    if (!confirm('Tem certeza que deseja remover esta configuração de SLA?')) return

    try {
      const { error } = await supabase
        .from('laboratorio_sla')
        .delete()
        .eq('laboratorio_id', laboratorio_id)
        .eq('classe_lente_id', classe_lente_id)

      if (error) throw error
      toast.success('Configuração de SLA removida com sucesso!')
      carregarDados()
    } catch (error) {
      console.error('Erro ao remover SLA:', error)
      toast.error('Erro ao remover configuração')
    }
  }

  const resetForm = () => {
    setEditingSLA(null)
    setFormData({
      laboratorio_id: '',
      classe_lente_id: '',
      sla_base_dias: 5,
      sla_maximo_dias: 10,
      permite_urgente: true,
      observacoes: ''
    })
  }

  // Agrupar SLAs por laboratório
  const slasAgrupados = slas.reduce((acc, sla) => {
    if (!acc[sla.laboratorio_nome]) {
      acc[sla.laboratorio_nome] = []
    }
    acc[sla.laboratorio_nome].push(sla)
    return acc
  }, {} as Record<string, SLAConfig[]>)

  if (authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return null // Component will redirect via useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando configurações...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Configuração de SLAs</h1>
          <p className="text-muted-foreground">
            Configure prazos específicos por laboratório e classe de lente
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingSLA ? 'Editar SLA' : 'Nova Configuração de SLA'}
              </DialogTitle>
              <DialogDescription>
                Configure o prazo específico para laboratório e classe
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="laboratorio">Laboratório *</Label>
                <Select 
                  value={formData.laboratorio_id} 
                  onValueChange={(value) => setFormData({ ...formData, laboratorio_id: value })}
                  disabled={!!editingSLA}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um laboratório" />
                  </SelectTrigger>
                  <SelectContent>
                    {laboratorios.map(lab => (
                      <SelectItem key={lab.id} value={lab.id}>
                        {lab.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classe">Classe de Lente *</Label>
                <Select 
                  value={formData.classe_lente_id} 
                  onValueChange={(value) => setFormData({ ...formData, classe_lente_id: value })}
                  disabled={!!editingSLA}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map(classe => (
                      <SelectItem key={classe.id} value={classe.id}>
                        {classe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sla_base">SLA Base (dias) *</Label>
                  <Input
                    id="sla_base"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.sla_base_dias}
                    onChange={(e) => setFormData({ ...formData, sla_base_dias: parseInt(e.target.value) || 5 })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sla_max">SLA Máximo (dias)</Label>
                  <Input
                    id="sla_max"
                    type="number"
                    min="1"
                    max="60"
                    value={formData.sla_maximo_dias}
                    onChange={(e) => setFormData({ ...formData, sla_maximo_dias: parseInt(e.target.value) || 0 })}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="urgente"
                    checked={formData.permite_urgente}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, permite_urgente: checked })
                    }
                  />
                  <Label htmlFor="urgente">Permite pedidos urgentes</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações sobre este SLA específico..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingSLA ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(slasAgrupados).length === 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground dark:text-gray-600 mb-4" />
            <p className="text-muted-foreground dark:text-gray-400 mb-4">
              Nenhuma configuração de SLA personalizada
            </p>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4 text-center">
              O sistema usará os SLAs padrão dos laboratórios até que configurações específicas sejam criadas
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira configuração
            </Button>
          </CardContent>
        </Card>
      )}

      {Object.entries(slasAgrupados).map(([laboratorioNome, slasLab]) => (
        <Card key={laboratorioNome} className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl dark:text-white">{laboratorioNome}</CardTitle>
            <CardDescription className="dark:text-gray-300">
              {slasLab.length} configuração(ões) específica(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {slasLab.map((sla) => (
                <div
                  key={`${sla.laboratorio_id}-${sla.classe_lente_id}`}
                  className="border dark:border-gray-700 rounded-lg p-4 space-y-3 dark:bg-gray-700/30"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{sla.classe_nome}</h4>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(sla)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(sla.laboratorio_id, sla.classe_lente_id)}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>SLA Base:</span>
                      <Badge variant="outline">{sla.sla_base_dias} dias</Badge>
                    </div>
                    
                    {sla.sla_maximo_dias && (
                      <div className="flex justify-between">
                        <span>SLA Máximo:</span>
                        <Badge variant="secondary">{sla.sla_maximo_dias} dias</Badge>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span>Urgente:</span>
                      <Badge variant={sla.permite_urgente ? 'default' : 'destructive'}>
                        {sla.permite_urgente ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </div>
                  
                  {sla.observacoes && (
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      {sla.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))} 
    </div>
  )
}