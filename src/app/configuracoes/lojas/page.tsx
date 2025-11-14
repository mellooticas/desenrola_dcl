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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Loja {
  id: string
  nome: string
  codigo: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  email: string
  gerente: string
  ativa: boolean
  created_at: string
  updated_at: string
}

export default function ConfigLojasPage() {
  const router = useRouter()
  const { userProfile, loading: authLoading } = useAuth()
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    gerente: '',
    ativa: true
  })

  // Estados brasileiros
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/login')
    }
  }, [authLoading, userProfile, router])

  useEffect(() => {
    if (!userProfile) return
    carregarLojas()
  }, [userProfile])

  const carregarLojas = async () => {
    try {
      const { data, error } = await supabase
        .from('lojas')
        .select('*')
        .order('nome')

      if (error) throw error
      setLojas(data || [])
    } catch (error) {
      console.error('Erro ao carregar lojas:', error)
      toast.error('Erro ao carregar lojas')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      telefone: '',
      email: '',
      gerente: '',
      ativa: true
    })
    setEditingLoja(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingLoja) {
        // Atualizar loja existente
        const { error } = await supabase
          .from('lojas')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLoja.id)

        if (error) throw error
        toast.success('Loja atualizada com sucesso!')
      } else {
        // Criar nova loja
        const { error } = await supabase
          .from('lojas')
          .insert([{
            ...formData,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
        toast.success('Loja criada com sucesso!')
      }

      setDialogOpen(false)
      resetForm()
      carregarLojas()
    } catch (error) {
      console.error('Erro ao salvar loja:', error)
      toast.error('Erro ao salvar loja')
    }
  }

  const handleEdit = (loja: Loja) => {
    setEditingLoja(loja)
    setFormData({
      nome: loja.nome,
      codigo: loja.codigo,
      endereco: loja.endereco,
      cidade: loja.cidade,
      estado: loja.estado,
      cep: loja.cep,
      telefone: loja.telefone,
      email: loja.email,
      gerente: loja.gerente,
      ativa: loja.ativa
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta loja?')) return

    try {
      const { error } = await supabase
        .from('lojas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Loja excluída com sucesso!')
      carregarLojas()
    } catch (error) {
      console.error('Erro ao excluir loja:', error)
      toast.error('Erro ao excluir loja')
    }
  }

  const toggleStatus = async (loja: Loja) => {
    try {
      const { error } = await supabase
        .from('lojas')
        .update({ 
          ativa: !loja.ativa,
          updated_at: new Date().toISOString()
        })
        .eq('id', loja.id)

      if (error) throw error
      
      toast.success(`Loja ${!loja.ativa ? 'ativada' : 'desativada'} com sucesso!`)
      carregarLojas()
    } catch (error) {
      console.error('Erro ao alterar status da loja:', error)
      toast.error('Erro ao alterar status da loja')
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
          <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-600">Gerencie as lojas parceiras do sistema</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLoja ? 'Editar Loja' : 'Nova Loja'}
              </DialogTitle>
              <DialogDescription>
                {editingLoja 
                  ? 'Atualize as informações da loja' 
                  : 'Adicione uma nova loja ao sistema'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome da Loja</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo da loja"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData(prev => ({ ...prev, codigo: e.target.value }))}
                    placeholder="Código único da loja"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Endereço completo"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                    placeholder="Cidade"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select value={formData.estado} onValueChange={(value) => setFormData(prev => ({ ...prev, estado: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map(estado => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                    placeholder="00000-000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@loja.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="gerente">Gerente</Label>
                <Input
                  id="gerente"
                  value={formData.gerente}
                  onChange={(e) => setFormData(prev => ({ ...prev, gerente: e.target.value }))}
                  placeholder="Nome do gerente"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLoja ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Lojas */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Building2 className="w-5 h-5" />
            Lojas Cadastradas
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            {lojas.length} {lojas.length === 1 ? 'loja cadastrada' : 'lojas cadastradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : lojas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Nenhuma loja cadastrada</p>
              <p className="text-sm">Clique em &quot;Nova Loja&quot; para começar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Gerente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lojas.map((loja) => (
                    <TableRow key={loja.id}>
                      <TableCell className="font-mono font-medium">
                        {loja.codigo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {loja.nome}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3" />
                          {loja.cidade}, {loja.estado}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {loja.telefone && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="w-3 h-3" />
                              {loja.telefone}
                            </div>
                          )}
                          {loja.email && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail className="w-3 h-3" />
                              {loja.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {loja.gerente || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={loja.ativa ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(loja)}
                        >
                          {loja.ativa ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(loja)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(loja.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}