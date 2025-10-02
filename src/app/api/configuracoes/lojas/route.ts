// 🏪 API de Lojas para Configurações
// Endpoint para buscar lojas no contexto administrativo

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    console.log('🔍 Verificando API de lojas...');
    console.log('URL exists:', !!supabaseUrl);
    console.log('Key exists:', !!supabaseKey);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar todas as lojas
    const { data: lojas, error } = await supabase
      .from('lojas')
      .select(`
        id,
        nome,
        ativo,
        created_at,
        updated_at
      `)
      .order('nome');

    console.log('🏪 Resultado busca lojas:', { 
      total: lojas?.length || 0, 
      error: error?.message || 'nenhum erro' 
    });

    if (error) throw error;

    // Buscar estatísticas básicas por loja
    const { data: estatisticas, error: statsError } = await supabase
      .from('loja_configuracoes_horario')
      .select('loja_id');

    const lojasComConfiguracoes = estatisticas?.map(s => s.loja_id) || [];

    // Compilar dados
    const lojasComInfo = (lojas || []).map(loja => ({
      ...loja,
      tem_configuracao: lojasComConfiguracoes.includes(loja.id),
      configuracao_status: lojasComConfiguracoes.includes(loja.id) ? 'configurada' : 'pendente'
    }));

    return NextResponse.json({
      success: true,
      data: lojasComInfo,
      estatisticas: {
        total_lojas: lojas?.length || 0,
        lojas_ativas: lojas?.filter(l => l.ativo).length || 0,
        lojas_configuradas: lojasComConfiguracoes.length,
        lojas_pendentes: (lojas?.length || 0) - lojasComConfiguracoes.length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar lojas:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar lojas'
    }, { status: 500 });
  }
}