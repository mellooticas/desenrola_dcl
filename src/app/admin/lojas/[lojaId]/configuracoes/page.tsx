'use client';

// 🏪⚙️ Painel de Configurações de Loja - Horários e Ações
// Interface administrativa para configurar horários e ações por loja

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  Timer,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface ConfiguracoesLoja {
  loja_id: string;
  hora_abertura: string;
  hora_fechamento: string;
  hora_limite_missoes: string;
  hora_renovacao_sistema: string;
  prazo_padrao_horas: number;
  permite_execucao_apos_horario: boolean;
  segunda_ativa: boolean;
  terca_ativa: boolean;
  quarta_ativa: boolean;
  quinta_ativa: boolean;
  sexta_ativa: boolean;
  sabado_ativa: boolean;
  domingo_ativa: boolean;
}

interface AcaoCustomizada {
  id: string;
  template_id: string;
  ativa: boolean;
  prioridade: number;
  horario_especifico?: string;
  prazo_customizado_horas?: number;
  pontos_customizados?: number;
  obrigatoria: boolean;
  dias_semana: string[];
  permite_delegacao: boolean;
  requer_evidencia: boolean;
  requer_justificativa_se_nao_feita: boolean;
  template: {
    id: string;
    nome: string;
    descricao: string;
    pontos_base: number;
    categoria: string;
  };
}

interface TemplateDisponivel {
  id: string;
  nome: string;
  descricao: string;
  pontos_base: number;
  categoria: string;
  categoria_configuracao?: string;
  horario_sugerido?: string;
  dias_semana_padrao?: string[];
}

interface ConfiguracoesLojaPageProps {
  params: {
    lojaId: string;
  };
}

const DIAS_SEMANA = [
  { key: 'segunda_ativa', label: 'Segunda', short: 'seg' },
  { key: 'terca_ativa', label: 'Terça', short: 'ter' },
  { key: 'quarta_ativa', label: 'Quarta', short: 'qua' },
  { key: 'quinta_ativa', label: 'Quinta', short: 'qui' },
  { key: 'sexta_ativa', label: 'Sexta', short: 'sex' },
  { key: 'sabado_ativa', label: 'Sábado', short: 'sab' },
  { key: 'domingo_ativa', label: 'Domingo', short: 'dom' }
];

const PRIORIDADES = [
  { value: 1, label: 'Baixa', color: 'bg-gray-100 text-gray-800' },
  { value: 2, label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 3, label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
  { value: 4, label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 5, label: 'Crítica', color: 'bg-red-100 text-red-800' }
];

export default function ConfiguracoesLojaPage({ params }: ConfiguracoesLojaPageProps) {
  const { lojaId } = params;
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesLoja | null>(null);
  const [acoesConfiguradas, setAcoesConfiguradas] = useState<AcaoCustomizada[]>([]);
  const [templatesDisponiveis, setTemplatesDisponiveis] = useState<TemplateDisponivel[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>({});

  // Estados para edição
  const [editandoAcao, setEditandoAcao] = useState<string | null>(null);
  const [adicionandoAcao, setAdicionandoAcao] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('');

  // ========================================
  // 🔄 CARREGAR CONFIGURAÇÕES
  // ========================================

  const carregarConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/lojas/${lojaId}/configuracoes`);
      const data = await response.json();

      if (data.success) {
        setConfiguracoes(data.data.configuracoes);
        setAcoesConfiguradas(data.data.acoes_configuradas);
        setTemplatesDisponiveis(data.data.templates_disponiveis);
        setEstatisticas(data.data.estatisticas);
      } else {
        toast.error('Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfiguracoes();
  }, [lojaId]);

  // ========================================
  // 💾 SALVAR CONFIGURAÇÕES DE HORÁRIO
  // ========================================

  const salvarConfiguracoes = async () => {
    if (!configuracoes) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/lojas/${lojaId}/configuracoes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracoes)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Configurações salvas com sucesso! ✅');
      } else {
        toast.error(data.error || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // ➕ ADICIONAR NOVA AÇÃO
  // ========================================

  const adicionarAcao = async (templateId: string) => {
    try {
      const template = templatesDisponiveis.find(t => t.id === templateId);
      if (!template) return;

      const response = await fetch(`/api/admin/lojas/${lojaId}/configuracoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          ativa: true,
          prioridade: 2,
          horario_especifico: template.horario_sugerido,
          dias_semana: template.dias_semana_padrao || ['seg', 'ter', 'qua', 'qui', 'sex'],
          obrigatoria: false,
          permite_delegacao: true,
          requer_evidencia: false,
          requer_justificativa_se_nao_feita: false
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        carregarConfiguracoes(); // Recarregar dados
        setAdicionandoAcao(false);
        setTemplateSelecionado('');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao adicionar ação');
    }
  };

  // ========================================
  // 📝 ATUALIZAR AÇÃO
  // ========================================

  const atualizarAcao = async (acaoId: string, updates: Partial<AcaoCustomizada>) => {
    try {
      const response = await fetch(`/api/admin/lojas/${lojaId}/configuracoes/acoes/${acaoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Ação atualizada com sucesso! ✅');
        carregarConfiguracoes();
        setEditandoAcao(null);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar ação');
    }
  };

  // ========================================
  // 🗑️ REMOVER AÇÃO
  // ========================================

  const removerAcao = async (acaoId: string) => {
    if (!confirm('Tem certeza que deseja remover esta ação?')) return;

    try {
      const response = await fetch(`/api/admin/lojas/${lojaId}/configuracoes/acoes/${acaoId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        carregarConfiguracoes();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao remover ação');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Configurações da Loja
          </h1>
          <p className="text-gray-600 mt-1">
            Configure horários de funcionamento e ações personalizadas
          </p>
        </div>
        
        {/* Estatísticas resumidas */}
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-gray-600">Total de Ações</div>
            <div className="text-xl font-bold text-blue-600">{estatisticas.total_acoes || 0}</div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-sm text-gray-600">Ativas</div>
            <div className="text-xl font-bold text-green-600">{estatisticas.acoes_ativas || 0}</div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="horarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="horarios" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horários
          </TabsTrigger>
          <TabsTrigger value="acoes" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Ações ({acoesConfiguradas.length})
          </TabsTrigger>
        </TabsList>

        {/* ========================================
            TAB: CONFIGURAÇÕES DE HORÁRIO
        ======================================== */}
        <TabsContent value="horarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {configuracoes && (
                <>
                  {/* Horários principais */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="hora_abertura">Abertura</Label>
                      <Input
                        id="hora_abertura"
                        type="time"
                        value={configuracoes.hora_abertura}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          hora_abertura: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hora_fechamento">Fechamento</Label>
                      <Input
                        id="hora_fechamento"
                        type="time"
                        value={configuracoes.hora_fechamento}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          hora_fechamento: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hora_limite_missoes">Limite para Missões</Label>
                      <Input
                        id="hora_limite_missoes"
                        type="time"
                        value={configuracoes.hora_limite_missoes}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          hora_limite_missoes: e.target.value
                        })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hora_renovacao_sistema">Renovação do Sistema</Label>
                      <Input
                        id="hora_renovacao_sistema"
                        type="time"
                        value={configuracoes.hora_renovacao_sistema}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          hora_renovacao_sistema: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  {/* Configurações gerais */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prazo_padrao_horas">Prazo Padrão (horas)</Label>
                      <Input
                        id="prazo_padrao_horas"
                        type="number"
                        min="1"
                        max="24"
                        value={configuracoes.prazo_padrao_horas}
                        onChange={(e) => setConfiguracoes({
                          ...configuracoes,
                          prazo_padrao_horas: Number(e.target.value)
                        })}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-6">
                      <Switch
                        id="permite_execucao_apos_horario"
                        checked={configuracoes.permite_execucao_apos_horario}
                        onCheckedChange={(checked) => setConfiguracoes({
                          ...configuracoes,
                          permite_execucao_apos_horario: checked
                        })}
                      />
                      <Label htmlFor="permite_execucao_apos_horario">
                        Permitir execução após horário
                      </Label>
                    </div>
                  </div>

                  {/* Dias da semana */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Dias de Funcionamento</Label>
                    <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                      {DIAS_SEMANA.map((dia) => (
                        <div key={dia.key} className="flex items-center space-x-2">
                          <Switch
                            id={dia.key}
                            checked={configuracoes[dia.key as keyof ConfiguracoesLoja] as boolean}
                            onCheckedChange={(checked) => setConfiguracoes({
                              ...configuracoes,
                              [dia.key]: checked
                            })}
                          />
                          <Label htmlFor={dia.key} className="text-sm">
                            {dia.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botão salvar */}
                  <div className="flex justify-end">
                    <Button 
                      onClick={salvarConfiguracoes}
                      disabled={saving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================
            TAB: AÇÕES CONFIGURADAS
        ======================================== */}
        <TabsContent value="acoes">
          <div className="space-y-4">
            {/* Botão adicionar nova ação */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Adicionar Nova Ação</h3>
                    <p className="text-sm text-gray-600">
                      {templatesDisponiveis.length} templates disponíveis
                    </p>
                  </div>
                  
                  {!adicionandoAcao ? (
                    <Button 
                      onClick={() => setAdicionandoAcao(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Ação
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select
                        value={templateSelecionado}
                        onChange={(e) => setTemplateSelecionado(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="">Selecione um template...</option>
                        {templatesDisponiveis.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.nome} ({template.pontos_base} pts)
                          </option>
                        ))}
                      </select>
                      
                      <Button
                        onClick={() => templateSelecionado && adicionarAcao(templateSelecionado)}
                        disabled={!templateSelecionado}
                        size="sm"
                      >
                        Adicionar
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setAdicionandoAcao(false);
                          setTemplateSelecionado('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de ações configuradas */}
            <div className="space-y-3">
              {acoesConfiguradas.map((acao) => (
                <Card key={acao.id} className={`${!acao.ativa ? 'opacity-60' : ''}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{acao.template.nome}</h4>
                          
                          <Badge className={
                            PRIORIDADES.find(p => p.value === acao.prioridade)?.color || 'bg-gray-100'
                          }>
                            {PRIORIDADES.find(p => p.value === acao.prioridade)?.label}
                          </Badge>
                          
                          {acao.obrigatoria && (
                            <Badge variant="destructive">Obrigatória</Badge>
                          )}
                          
                          {!acao.ativa && (
                            <Badge variant="secondary">Inativa</Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {acao.template.descricao}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {acao.horario_especifico || 'Horário padrão'}
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {acao.pontos_customizados || acao.template.pontos_base} pts
                          </span>
                          
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {acao.dias_semana.join(', ')}
                          </span>
                          
                          {acao.prazo_customizado_horas && (
                            <span className="flex items-center gap-1">
                              <Timer className="h-3 w-3" />
                              {acao.prazo_customizado_horas}h
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={acao.ativa}
                          onCheckedChange={(checked) => atualizarAcao(acao.id, { ativa: checked })}
                        />
                        
                        <Button
                          onClick={() => setEditandoAcao(editandoAcao === acao.id ? null : acao.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          onClick={() => removerAcao(acao.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Painel de edição expandido */}
                    {editandoAcao === acao.id && (
                      <div className="mt-4 pt-4 border-t space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Prioridade</Label>
                            <select
                              value={acao.prioridade}
                              onChange={(e) => atualizarAcao(acao.id, { prioridade: Number(e.target.value) })}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              {PRIORIDADES.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <Label>Horário Específico</Label>
                            <Input
                              type="time"
                              value={acao.horario_especifico || ''}
                              onChange={(e) => atualizarAcao(acao.id, { horario_especifico: e.target.value })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label>Pontos</Label>
                            <Input
                              type="number"
                              value={acao.pontos_customizados || acao.template.pontos_base}
                              onChange={(e) => atualizarAcao(acao.id, { pontos_customizados: Number(e.target.value) })}
                              className="text-sm"
                            />
                          </div>
                          
                          <div>
                            <Label>Prazo (horas)</Label>
                            <Input
                              type="number"
                              value={acao.prazo_customizado_horas || ''}
                              placeholder="Usar padrão"
                              onChange={(e) => atualizarAcao(acao.id, {
                                prazo_customizado_horas: e.target.value ? Number(e.target.value) : undefined
                              })}
                              className="text-sm"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={acao.obrigatoria}
                              onCheckedChange={(checked) => atualizarAcao(acao.id, { obrigatoria: checked })}
                            />
                            <Label className="text-sm">Obrigatória</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={acao.requer_evidencia}
                              onCheckedChange={(checked) => atualizarAcao(acao.id, { requer_evidencia: checked })}
                            />
                            <Label className="text-sm">Requer evidência</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={acao.permite_delegacao}
                              onCheckedChange={(checked) => atualizarAcao(acao.id, { permite_delegacao: checked })}
                            />
                            <Label className="text-sm">Permite delegação</Label>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {acoesConfiguradas.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma ação configurada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Adicione ações personalizadas para esta loja usando o botão acima.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}