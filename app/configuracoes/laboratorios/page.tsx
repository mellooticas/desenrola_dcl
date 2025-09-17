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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Edit, Phone, Mail, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Laboratorio } from '@/lib/types/database'

export default function ConfigLaboratoriosPage() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLab, setEditingLab] = useState<Laboratorio | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    sla_padrao_dias: 5,
    trabalha_sabado: false,
    contato: {
      email: '',
      telefone: '',
      endereco: ''
    }
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  useEffect(() => {
    if (!userProfile) return
    carregarLaboratorios()
  }, [userProfile])

  const carregarLaboratorios = async () => {
    try {
      const { data, error } = await supabase
        .from('laboratorios')
        .select('*')
        .order('nome')

      if (error) throw error
      setLaboratorios(data || [])
    } catch (error) {
      console.error('Erro ao carregar laboratórios:', error)
      toast.error('Erro ao carregar laboratórios')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const dadosParaSalvar = {
        ...formData,
        contato: formData.contato
      }

      if (editingLab) {
        const { error } = await supabase
          .from('laboratorios')
          .update(dadosParaSalvar)
          .eq('id', editingLab.id)

        if (error) throw error
        toast.success('Laboratório atualizado com sucesso!')
      } else {
        const { error } = await supabase
          .from('laboratorios')
          .insert([{ ...dadosParaSalvar, ativo: true }])

        if (error) throw error
        toast.success('Laboratório criado com sucesso!')
      }

      setDialogOpen(false)
      resetForm()
      carregarLaboratorios()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar laboratório')
    }
  }

  const handleEdit = (lab: Laboratorio) => {
    setEditingLab(lab)
    setFormData({
      nome: lab.nome,
      codigo: lab.codigo || '',
      sla_padrao_dias: lab.sla_padrao_dias,
      trabalha_sabado: lab.trabalha_sabado,
      contato: {
        email: lab.contato?.email || '',
        telefone: lab.contato?.telefone || '',
        endereco: lab.contato?.endereco || ''
      }
    })
    setDialogOpen(true)
  }

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('laboratorios')
        .update({ ativo })
        .eq('id', id)

      if (error) throw error
      toast.success(`Laboratório ${ativo ? 'ativado' : 'desativado'} com sucesso!`)
      carregarLaboratorios()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do laboratório')
    }
  }

  const resetForm = () => {
    setEditingLab(null)
    setFormData({
      nome: '',
      codigo: '',
      sla_padrao_dias: 5,
      trabalha_sabado: false,
      contato: {
        email: '',
        telefone: '',
        endereco: ''
      }
    })
  }

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
          <div className="text-lg">Carregando laboratórios...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Laboratórios</h1>
          <p className="text-muted-foreground">
            Gerencie os laboratórios parceiros e suas configurações
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Laboratório
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingLab ? 'Editar Laboratório' : 'Novo Laboratório'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do laboratório parceiro
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Essilor do Brasil"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: ESSILOR"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sla">SLA Padrão (dias) *</Label>
                  <Input
                    id="sla"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.sla_padrao_dias}
                    onChange={(e) => setFormData({ ...formData, sla_padrao_dias: parseInt(e.target.value) || 5 })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sabado">Trabalha aos sábados</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="sabado"
                      checked={formData.trabalha_sabado}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, trabalha_sabado: checked })
                      }
                    />
                    <Label htmlFor="sabado" className="text-sm">
                      {formData.trabalha_sabado ? 'Sim' : 'Não'}
                    </Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Informações de Contato</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contato.email}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contato: { ...formData.contato, email: e.target.value }
                    })}
                    placeholder="contato@laboratorio.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.contato.telefone}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contato: { ...formData.contato, telefone: e.target.value }
                    })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    value={formData.contato.endereco}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contato: { ...formData.contato, endereco: e.target.value }
                    })}
                    placeholder="Rua, número, bairro, cidade - CEP"
                    rows={2}
                  />
                </div>
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
                  {editingLab ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {laboratorios.map((lab) => (
          <Card key={lab.id} className={!lab.ativo ? 'opacity-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lab.nome}</CardTitle>
                  {lab.codigo && (
                    <CardDescription>Código: {lab.codigo}</CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={lab.ativo}
                    onCheckedChange={(checked) => handleToggleAtivo(lab.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(lab)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={lab.ativo ? 'default' : 'secondary'}>
                  {lab.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge variant="outline">
                  SLA: {lab.sla_padrao_dias} dias
                </Badge>
                {lab.trabalha_sabado && (
                  <Badge variant="outline">Trabalha sábados</Badge>
                )}
              </div>
              
              {lab.contato && (
                <div className="space-y-2 text-sm">
                  {lab.contato.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{lab.contato.email}</span>
                    </div>
                  )}
                  {lab.contato.telefone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{lab.contato.telefone}</span>
                    </div>
                  )}
                  {lab.contato.endereco && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="flex-1">{lab.contato.endereco}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {laboratorios.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhum laboratório cadastrado
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeiro laboratório
            </Button>
          </CardContent>
        </Card>
      )} 
    </div>
  )
}