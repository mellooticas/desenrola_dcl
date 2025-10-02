// 🔧 API para Gerenciar Ações Específicas da Loja
// PATCH/DELETE para ações individuais

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface LojaAcaoCustomizada {
  id: string;
  loja_id: string;
  template_id: string;
  ativa: boolean;
  prioridade: number;
  horario_especifico?: string;
  prazo_customizado_horas?: number;
  pontos_customizados?: number;
  obrigatoria: boolean;
  dias_semana: string[];
  condicoes_especiais: Record<string, unknown>;
  permite_delegacao: boolean;
  requer_evidencia: boolean;
  requer_justificativa_se_nao_feita: boolean;
}

// interface MissaoTemplate {
//   id: string;
//   nome: string;
//   descricao: string;
//   pontos_base: number;
//   categoria: string;
//   categoria_configuracao?: string;
//   horario_sugerido?: string;
//   dias_semana_padrao?: string[];
// }

// ========================================
// 📝 ATUALIZAR AÇÃO ESPECÍFICA
// ========================================

export async function PATCH(
  request: NextRequest, 
  { params }: { params: { lojaId: string; acaoId: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { lojaId, acaoId } = params;
    const body = await request.json();

    // Verificar se a ação pertence à loja
    const { data: acaoExistente, error: verificacaoError } = await supabase
      .from('loja_acoes_customizadas')
      .select('*')
      .eq('id', acaoId)
      .eq('loja_id', lojaId)
      .single();

    if (verificacaoError || !acaoExistente) {
      return NextResponse.json({
        success: false,
        error: 'Ação não encontrada para esta loja'
      }, { status: 404 });
    }

    // Validar dados se fornecidos
    const updateData: Partial<LojaAcaoCustomizada> = {};
    
    if (body.ativa !== undefined) updateData.ativa = Boolean(body.ativa);
    if (body.prioridade !== undefined) {
      const prioridade = Number(body.prioridade);
      if (prioridade < 1 || prioridade > 5) {
        return NextResponse.json({
          success: false,
          error: 'Prioridade deve estar entre 1 e 5'
        }, { status: 400 });
      }
      updateData.prioridade = prioridade;
    }
    if (body.horario_especifico !== undefined) updateData.horario_especifico = body.horario_especifico;
    if (body.prazo_customizado_horas !== undefined) updateData.prazo_customizado_horas = Number(body.prazo_customizado_horas);
    if (body.pontos_customizados !== undefined) updateData.pontos_customizados = Number(body.pontos_customizados);
    if (body.obrigatoria !== undefined) updateData.obrigatoria = Boolean(body.obrigatoria);
    if (body.dias_semana !== undefined) {
      if (!Array.isArray(body.dias_semana)) {
        return NextResponse.json({
          success: false,
          error: 'Dias da semana deve ser um array'
        }, { status: 400 });
      }
      updateData.dias_semana = body.dias_semana;
    }
    if (body.condicoes_especiais !== undefined) updateData.condicoes_especiais = body.condicoes_especiais;
    if (body.permite_delegacao !== undefined) updateData.permite_delegacao = Boolean(body.permite_delegacao);
    if (body.requer_evidencia !== undefined) updateData.requer_evidencia = Boolean(body.requer_evidencia);
    if (body.requer_justificativa_se_nao_feita !== undefined) {
      updateData.requer_justificativa_se_nao_feita = Boolean(body.requer_justificativa_se_nao_feita);
    }

    // Atualizar ação
    const { data, error } = await supabase
      .from('loja_acoes_customizadas')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', acaoId)
      .eq('loja_id', lojaId)
      .select(`
        *,
        template:missao_templates(nome, descricao, pontos_base)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Ação atualizada com sucesso! ✅',
      data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar ação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar ação'
    }, { status: 500 });
  }
}

// ========================================
// 🗑️ REMOVER AÇÃO DA LOJA
// ========================================

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { lojaId: string; acaoId: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { lojaId, acaoId } = params;

    // Verificar se a ação pertence à loja
    const { data: acaoExistente, error: verificacaoError } = await supabase
      .from('loja_acoes_customizadas')
      .select('*, template:missao_templates(nome)')
      .eq('id', acaoId)
      .eq('loja_id', lojaId)
      .single();

    if (verificacaoError || !acaoExistente) {
      return NextResponse.json({
        success: false,
        error: 'Ação não encontrada para esta loja'
      }, { status: 404 });
    }

    // Verificar se existem missões ativas vinculadas a esta configuração
    const hoje = new Date().toISOString().split('T')[0];
    const { data: missoesAtivas, error: missoesError } = await supabase
      .from('missoes_diarias')
      .select('id')
      .eq('loja_id', lojaId)
      .eq('template_id', acaoExistente.template_id)
      .gte('data_missao', hoje)
      .eq('status', 'pendente');

    if (missoesError) throw missoesError;

    if (missoesAtivas && missoesAtivas.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Não é possível remover esta ação pois existem ${missoesAtivas.length} missões ativas. Desative a ação ao invés de removê-la.`,
        detalhes: {
          missoes_ativas: missoesAtivas.length,
          sugestao: 'Desative a ação ao invés de removê-la'
        }
      }, { status: 400 });
    }

    // Remover ação
    const { error: deleteError } = await supabase
      .from('loja_acoes_customizadas')
      .delete()
      .eq('id', acaoId)
      .eq('loja_id', lojaId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: `Ação "${(acaoExistente.template as any)?.nome}" removida com sucesso! 🗑️`
    });

  } catch (error) {
    console.error('❌ Erro ao remover ação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao remover ação'
    }, { status: 500 });
  }
}

// ========================================
// 📊 OBTER DETALHES DE UMA AÇÃO ESPECÍFICA
// ========================================

export async function GET(
  request: NextRequest, 
  { params }: { params: { lojaId: string; acaoId: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { lojaId, acaoId } = params;

    // Buscar ação com detalhes
    const { data: acao, error } = await supabase
      .from('loja_acoes_customizadas')
      .select(`
        *,
        template:missao_templates(
          id,
          nome,
          descricao,
          pontos_base,
          categoria,
          categoria_configuracao,
          horario_sugerido,
          dias_semana_padrao
        )
      `)
      .eq('id', acaoId)
      .eq('loja_id', lojaId)
      .single();

    if (error || !acao) {
      return NextResponse.json({
        success: false,
        error: 'Ação não encontrada'
      }, { status: 404 });
    }

    // Buscar estatísticas de execução dos últimos 30 dias
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);

    const { data: estatisticas, error: statsError } = await supabase
      .from('missoes_diarias')
      .select('status, data_missao, pontos_ganhos')
      .eq('loja_id', lojaId)
      .eq('template_id', acao.template_id)
      .gte('data_missao', dataInicio.toISOString().split('T')[0]);

    const stats = {
      total_execucoes: estatisticas?.length || 0,
      concluidas: estatisticas?.filter((m: any) => m.status === 'concluida').length || 0,
      pendentes: estatisticas?.filter((m: any) => m.status === 'pendente').length || 0,
      perdidas: estatisticas?.filter((m: any) => m.status === 'perdida').length || 0,
      pontos_totais: estatisticas?.reduce((acc: number, m: any) => acc + (m.pontos_ganhos || 0), 0) || 0,
      taxa_conclusao: estatisticas?.length ? 
        Math.round((estatisticas.filter((m: any) => m.status === 'concluida').length / estatisticas.length) * 100) 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        acao,
        estatisticas_30_dias: stats
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar detalhes da ação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar detalhes da ação'
    }, { status: 500 });
  }
}