// 🏪⚙️ API para Configurações de Loja - Horários e Ações
// Interface administrativa para configurar horários e ações por loja

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ========================================
// 🕐 CONFIGURAÇÕES DE HORÁRIO POR LOJA
// ========================================

export async function GET(request: NextRequest, { params }: { params: { lojaId: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { lojaId } = params;
    console.log('🔍 Buscando configurações para loja:', lojaId);

    // Buscar configurações da loja
    const { data: configuracoes, error: configError } = await supabase
      .from('loja_configuracoes_horario')
      .select('*')
      .eq('loja_id', lojaId)
      .single();

    console.log('⚙️ Configurações encontradas:', !!configuracoes, configError?.code);

    if (configError && configError.code !== 'PGRST116') {
      throw configError;
    }

    // Buscar ações customizadas da loja
    const { data: acoes, error: acoesError } = await supabase
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
      .eq('loja_id', lojaId);

    if (acoesError) throw acoesError;

    // Buscar templates disponíveis para adicionar
    const { data: templatesDisponiveis, error: templatesError } = await supabase
      .from('missao_templates')
      .select('*')
      .eq('ativo', true)
      .eq('permite_customizacao_loja', true);

    if (templatesError) throw templatesError;

    // Filtrar templates que ainda não foram configurados para esta loja
    const templatesJaConfigurados = acoes?.map(a => a.template_id) || [];
    const templatesNovos = templatesDisponiveis?.filter(t => 
      !templatesJaConfigurados.includes(t.id)
    ) || [];

    return NextResponse.json({
      success: true,
      data: {
        configuracoes: configuracoes || {
          loja_id: lojaId,
          hora_abertura: '08:00',
          hora_fechamento: '18:00',
          hora_limite_missoes: '17:00',
          hora_renovacao_sistema: '20:00',
          prazo_padrao_horas: 8,
          permite_execucao_apos_horario: false,
          segunda_ativa: true,
          terca_ativa: true,
          quarta_ativa: true,
          quinta_ativa: true,
          sexta_ativa: true,
          sabado_ativa: false,
          domingo_ativa: false
        },
        acoes_configuradas: acoes || [],
        templates_disponiveis: templatesNovos,
        estatisticas: {
          total_acoes: acoes?.length || 0,
          acoes_ativas: acoes?.filter(a => a.ativa).length || 0,
          acoes_obrigatorias: acoes?.filter(a => a.obrigatoria).length || 0,
          templates_novos: templatesNovos.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar configurações da loja:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar configurações'
    }, { status: 500 });
  }
}

// ========================================
// 💾 SALVAR CONFIGURAÇÕES DE HORÁRIO
// ========================================

export async function PUT(request: NextRequest, { params }: { params: { lojaId: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { lojaId } = params;
    const body = await request.json();

    const {
      hora_abertura,
      hora_fechamento,
      hora_limite_missoes,
      hora_renovacao_sistema,
      prazo_padrao_horas,
      permite_execucao_apos_horario,
      segunda_ativa,
      terca_ativa,
      quarta_ativa,
      quinta_ativa,
      sexta_ativa,
      sabado_ativa,
      domingo_ativa
    } = body;

    // Validações básicas
    if (hora_abertura >= hora_fechamento) {
      return NextResponse.json({
        success: false,
        error: 'Horário de abertura deve ser menor que o de fechamento'
      }, { status: 400 });
    }

    if (hora_limite_missoes > hora_fechamento) {
      return NextResponse.json({
        success: false,
        error: 'Horário limite das missões não pode ser após o fechamento'
      }, { status: 400 });
    }

    // Salvar ou atualizar configurações
    const { data, error } = await supabase
      .from('loja_configuracoes_horario')
      .upsert({
        loja_id: lojaId,
        hora_abertura,
        hora_fechamento,
        hora_limite_missoes,
        hora_renovacao_sistema,
        prazo_padrao_horas,
        permite_execucao_apos_horario,
        segunda_ativa,
        terca_ativa,
        quarta_ativa,
        quinta_ativa,
        sexta_ativa,
        sabado_ativa,
        domingo_ativa,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Configurações de horário salvas com sucesso! ✅',
      data
    });

  } catch (error) {
    console.error('❌ Erro ao salvar configurações:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar configurações'
    }, { status: 500 });
  }
}

// ========================================
// ➕ ADICIONAR NOVA AÇÃO À LOJA
// ========================================

export async function POST(request: NextRequest, { params }: { params: { lojaId: string } }) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { lojaId } = params;
    const body = await request.json();

    const {
      template_id,
      ativa = true,
      prioridade = 1,
      horario_especifico,
      prazo_customizado_horas,
      pontos_customizados,
      obrigatoria = false,
      dias_semana = ['seg', 'ter', 'qua', 'qui', 'sex'],
      condicoes_especiais = {},
      permite_delegacao = true,
      requer_evidencia = false,
      requer_justificativa_se_nao_feita = false,
      configurada_por
    } = body;

    // Verificar se o template existe e permite customização
    const { data: template, error: templateError } = await supabase
      .from('missao_templates')
      .select('*')
      .eq('id', template_id)
      .eq('ativo', true)
      .eq('permite_customizacao_loja', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json({
        success: false,
        error: 'Template não encontrado ou não permite customização'
      }, { status: 400 });
    }

    // Adicionar ação personalizada para a loja
    const { data, error } = await supabase
      .from('loja_acoes_customizadas')
      .insert({
        loja_id: lojaId,
        template_id,
        ativa,
        prioridade,
        horario_especifico,
        prazo_customizado_horas,
        pontos_customizados,
        obrigatoria,
        dias_semana,
        condicoes_especiais,
        permite_delegacao,
        requer_evidencia,
        requer_justificativa_se_nao_feita,
        configurada_por
      })
      .select(`
        *,
        template:missao_templates(nome, descricao, pontos_base)
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Constraint de unicidade
        return NextResponse.json({
          success: false,
          error: 'Esta ação já está configurada para esta loja'
        }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Ação "${template.nome}" adicionada com sucesso! ✅`,
      data
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar ação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao adicionar ação'
    }, { status: 500 });
  }
}