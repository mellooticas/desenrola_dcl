'use client';

// 🏪⚙️ Configurações de Horários e Ações por Loja
// Integrado ao sistema de configurações administrativas

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
  Store, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  AlertCircle,
  CheckCircle,
  Star,
  Calendar,
  Timer,
  Target,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface Loja {
  id: string;
  nome: string;
  ativo: boolean;
}

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
  pontos_customizados?: number;
  obrigatoria: boolean;
  dias_semana: string[];
  template: {
    nome: string;
    descricao: string;
    pontos_base: number;
    categoria: string;
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

export default function HorariosAcoesPage() {
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState<string>('');
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesLoja | null>(null);
  const [acoesConfiguradas, setAcoesConfiguradas] = useState<AcaoCustomizada[]>([]);
  const [templatesDisponiveis, setTemplatesDisponiveis] = useState<any[]>([]);
  const [estatisticas, setEstatisticas] = useState<any>({});

  // Estados para interface
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ========================================
  // 🔄 CARREGAR DADOS INICIAIS
  // ========================================

  const carregarLojas = async () => {
    try {
      const response = await fetch('/api/configuracoes/lojas');
      const data = await response.json();
      
      if (data.success) {
        setLojas(data.data.filter((loja: Loja) => loja.ativo));
        if (data.data.length > 0 && !lojaSelecionada) {
          setLojaSelecionada(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      toast.error('Erro ao carregar lojas');
    }
  };

  const carregarConfiguracoes = async (lojaId: string) => {
    if (!lojaId) return;

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
    carregarLojas();
  }, []);

  useEffect(() => {
    if (lojaSelecionada) {
      carregarConfiguracoes(lojaSelecionada);
    }
  }, [lojaSelecionada]);

  // ========================================
  // 💾 SALVAR CONFIGURAÇÕES
  // ========================================

  const salvarConfiguracoes = async () => {
    if (!configuracoes || !lojaSelecionada) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/lojas/${lojaSelecionada}/configuracoes`, {
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
  // 🔄 ATUALIZAR AÇÃO
  // ========================================

  const atualizarAcao = async (acaoId: string, updates: Partial<AcaoCustomizada>) => {
    try {
      const response = await fetch(`/api/admin/lojas/${lojaSelecionada}/configuracoes/acoes/${acaoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Ação atualizada com sucesso! ✅');
        carregarConfiguracoes(lojaSelecionada);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar ação');
    }
  };

  // ========================================
  // ➕ ADICIONAR NOVA AÇÃO
  // ========================================

  const adicionarAcao = async (templateId: string) => {
    try {
      const template = templatesDisponiveis.find(t => t.id === templateId);
      if (!template) return;

      const response = await fetch(`/api/admin/lojas/${lojaSelecionada}/configuracoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: templateId,
          ativa: true,
          prioridade: 2,
          horario_especifico: template.horario_sugerido,
          dias_semana: template.dias_semana_padrao || ['seg', 'ter', 'qua', 'qui', 'sex']
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        carregarConfiguracoes(lojaSelecionada);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao adicionar ação');
    }
  };

  if (loading && !configuracoes) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Horários & Ações por Loja
          </h2>
          <p className="text-gray-600 mt-1">
            Configure horários de funcionamento e ações personalizadas para cada loja
          </p>
        </div>
      </div>

      {/* Seletor de Loja */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="loja-select">Selecione a Loja</Label>
              <select
                id="loja-select"
                value={lojaSelecionada}
                onChange={(e) => setLojaSelecionada(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma loja...</option>
                {lojas.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </div>
            
            {lojaSelecionada && estatisticas && (
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{estatisticas.total_acoes || 0}</div>
                  <div className="text-sm text-gray-600">Total Ações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{estatisticas.acoes_ativas || 0}</div>
                  <div className="text-sm text-gray-600">Ativas</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Principal */}
      {lojaSelecionada && configuracoes && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
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
              TAB: VISÃO GERAL
          ======================================== */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo de Horários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Horários de Funcionamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Abertura:</span>
                    <span className="font-medium">{configuracoes.hora_abertura}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fechamento:</span>
                    <span className="font-medium">{configuracoes.hora_fechamento}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Limite Missões:</span>
                    <span className="font-medium">{configuracoes.hora_limite_missoes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Renovação:</span>
                    <span className="font-medium">{configuracoes.hora_renovacao_sistema}</span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600 mb-2">Dias Ativos:</div>
                    <div className="flex flex-wrap gap-1">
                      {DIAS_SEMANA.map((dia) => (
                        <Badge 
                          key={dia.key}
                          variant={configuracoes[dia.key as keyof ConfiguracoesLoja] ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {dia.short}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo de Ações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Ações Configuradas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {acoesConfiguradas.filter(a => a.ativa).length}
                      </div>
                      <div className="text-sm text-gray-600">Ativas</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {acoesConfiguradas.filter(a => a.obrigatoria).length}
                      </div>
                      <div className="text-sm text-gray-600">Obrigatórias</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Ações por Categoria:</div>
                    {Array.from(new Set(acoesConfiguradas.map(a => a.template.categoria))).map(categoria => (
                      <div key={categoria} className="flex justify-between text-sm">
                        <span className="capitalize">{categoria}</span>
                        <span className="font-medium">
                          {acoesConfiguradas.filter(a => a.template.categoria === categoria).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========================================
              TAB: CONFIGURAÇÕES DE HORÁRIO
          ======================================== */}
          <TabsContent value="horarios">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Configurações de Horário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========================================
              TAB: AÇÕES CONFIGURADAS
          ======================================== */}
          <TabsContent value="acoes">
            <div className="space-y-4">
              {/* Adicionar nova ação */}
              {templatesDisponiveis.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Templates Disponíveis</h3>
                        <p className="text-sm text-gray-600">
                          {templatesDisponiveis.length} templates podem ser adicionados
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {templatesDisponiveis.slice(0, 3).map((template) => (
                          <Button
                            key={template.id}
                            onClick={() => adicionarAcao(template.id)}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            {template.nome}
                          </Button>
                        ))}
                        {templatesDisponiveis.length > 3 && (
                          <Button variant="outline" size="sm">
                            +{templatesDisponiveis.length - 3} mais
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={acao.ativa}
                            onCheckedChange={(checked) => atualizarAcao(acao.id, { ativa: checked })}
                          />
                        </div>
                      </div>
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
                      Adicione ações personalizadas para esta loja usando os templates disponíveis.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}