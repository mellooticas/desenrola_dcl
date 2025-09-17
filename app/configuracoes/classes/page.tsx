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
import { Plus, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ClasseLente } from '@/lib/types/database'

export default function ConfigClassesPage() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [classes, setClasses] = useState<ClasseLente[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingClasse, setEditingClasse] = useState<ClasseLente | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    sla_base_dias: 3,
    cor_badge: '#6B7280'
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  useEffect(() => {
    if (!userProfile) return
    carregarClasses()
  }, [userProfile])

  const carregarClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes_lente')
        .select('*')
        .order('nome')

      if (error) throw error
      setClasses(data || [])
    } catch (error) {
      console.error('Erro ao carregar classes:', error)
      toast.error('Erro ao carregar classes de lente')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingClasse) {
        // Atualizar
        const { error } = await supabase
          .from('classes_lente')
          .update(formData)
          .eq('id', editingClasse.id)

        if (error) throw error
        toast.success('Classe atualizada com sucesso!')
      } else {
        // Criar nova
        const { error } = await supabase
          .from('classes_lente')
          .insert([{ ...formData, ativa: true }])

        if (error) throw error
        toast.success('Classe criada com sucesso!')
      }

      setDialogOpen(false)
      resetForm()
      carregarClasses()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar classe')
    }
  }

  const handleEdit = (classe: ClasseLente) => {
    setEditingClasse(classe)
    setFormData({
      nome: classe.nome,
      codigo: classe.codigo || '',
      categoria: classe.categoria || '',
      sla_base_dias: classe.sla_base_dias,
      cor_badge: classe.cor_badge
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta classe?')) return

    try {
      const { error } = await supabase
        .from('classes_lente')
        .update({ ativa: false })
        .eq('id', id)

      if (error) throw error
      toast.success('Classe desativada com sucesso!')
      carregarClasses()
    } catch (error) {
      console.error('Erro ao desativar:', error)
      toast.error('Erro ao desativar classe')
    }
  }

  const resetForm = () => {
    setEditingClasse(null)
    setFormData({
      nome: '',
      codigo: '',
      categoria: '',
      sla_base_dias: 3,
      cor_badge: '#6B7280'
    })
  }

  const categorias = [
    'monofocal',
    'multifocal',
    'transitions',
    'antirreflexo',
    'policarbonato',
    'trivex'
  ]

  const coresPredefinidas = [
    { cor: '#10B981', nome: 'Verde' },
    { cor: '#3B82F6', nome: 'Azul' },
    { cor: '#F59E0B', nome: 'Amarelo' },
    { cor: '#EF4444', nome: 'Vermelho' },
    { cor: '#8B5CF6', nome: 'Roxo' },
    { cor: '#6B7280', nome: 'Cinza' }
  ]

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
          <div className="text-lg">Carregando classes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes de Lente</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos de lentes e seus SLAs
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Classe
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingClasse ? 'Editar Classe' : 'Nova Classe de Lente'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da classe de lente
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Monofocal CR-39"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: MONO_CR39"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sla">SLA Base (dias) *</Label>
                <Input
                  id="sla"
                  type="number"
                  min="1"
                  max="30"
                  value={formData.sla_base_dias}
                  onChange={(e) => setFormData({ ...formData, sla_base_dias: parseInt(e.target.value) || 3 })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor do Badge</Label>
                <div className="flex flex-wrap gap-2">
                  {coresPredefinidas.map(({ cor, nome }) => (
                    <button
                      key={cor}
                      type="button"
                      className={`w-8 h-8 rounded border-2 ${
                        formData.cor_badge === cor ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: cor }}
                      onClick={() => setFormData({ ...formData, cor_badge: cor })}
                      title={nome}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={formData.cor_badge}
                  onChange={(e) => setFormData({ ...formData, cor_badge: e.target.value })}
                  className="w-20 h-8"
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
                  {editingClasse ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classe) => (
          <Card key={classe.id} className={!classe.ativa ? 'opacity-50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{classe.nome}</CardTitle>
                  {classe.codigo && (
                    <CardDescription>{classe.codigo}</CardDescription>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(classe)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {classe.ativa && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(classe.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {classe.categoria && (
                <Badge variant="outline">
                  {classe.categoria.charAt(0).toUpperCase() + classe.categoria.slice(1)}
                </Badge>
              )}
              <div className="flex justify-between text-sm">
                <span>SLA Base:</span>
                <span className="font-medium">{classe.sla_base_dias} dias</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cor Badge:</span>
                <div 
                  className="w-6 h-4 rounded border"
                  style={{ backgroundColor: classe.cor_badge }}
                />
              </div>
              {!classe.ativa && (
                <Badge variant="destructive">Inativa</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma classe de lente cadastrada
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira classe
            </Button>
          </CardContent>
        </Card>
      )} 
    </div>
  )
}