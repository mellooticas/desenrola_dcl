'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTE2NDc0OCwiZXhwIjoyMDYwNzQwNzQ4fQ.uQLNq8SzPYXqHmjj0sjzHjYuaLy6BsDAmIbIOvCEWlQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default function CreateFunction() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const createFunction = async () => {
    setLoading(true)
    setResult('')
    
    const sql = `
-- Função para inserir novo pedido completo
CREATE OR REPLACE FUNCTION inserir_novo_pedido(
  p_loja_id UUID,
  p_laboratorio_id UUID,
  p_classe_lente_id UUID,
  p_cliente_nome TEXT,
  p_cliente_telefone TEXT DEFAULT NULL,
  p_numero_os_fisica TEXT DEFAULT NULL,
  p_numero_pedido_laboratorio TEXT DEFAULT NULL,
  p_valor_pedido DECIMAL(10,2) DEFAULT NULL,
  p_custo_lentes DECIMAL(10,2) DEFAULT NULL,
  p_eh_garantia BOOLEAN DEFAULT FALSE,
  p_observacoes TEXT DEFAULT NULL,
  p_observacoes_garantia TEXT DEFAULT NULL,
  p_prioridade TEXT DEFAULT 'NORMAL'
) RETURNS TABLE(
  id UUID,
  numero_sequencial TEXT,
  loja_id UUID,
  laboratorio_id UUID,
  classe_lente_id UUID,
  status TEXT,
  prioridade TEXT,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  numero_os_fisica TEXT,
  numero_pedido_laboratorio TEXT,
  valor_pedido DECIMAL(10,2),
  custo_lentes DECIMAL(10,2),
  eh_garantia BOOLEAN,
  observacoes TEXT,
  observacoes_garantia TEXT,
  data_prevista_pronto DATE,
  created_at TIMESTAMPTZ,
  created_by TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pedido_id UUID;
  v_sla_dias INTEGER := 5;
  v_data_prevista DATE;
  v_numero_sequencial TEXT;
BEGIN
  -- Gerar ID para o pedido
  v_pedido_id := gen_random_uuid();
  
  -- Buscar SLA da classe de lente
  SELECT COALESCE(sla_base_dias, 5) INTO v_sla_dias
  FROM classes_lente 
  WHERE classes_lente.id = p_classe_lente_id;
  
  -- Ajustar SLA por prioridade
  CASE p_prioridade
    WHEN 'BAIXA' THEN v_sla_dias := v_sla_dias + 2;
    WHEN 'ALTA' THEN v_sla_dias := v_sla_dias - 1;
    WHEN 'URGENTE' THEN v_sla_dias := v_sla_dias - 3;
    ELSE v_sla_dias := v_sla_dias; -- NORMAL
  END CASE;
  
  -- Garantir pelo menos 1 dia
  v_sla_dias := GREATEST(v_sla_dias, 1);
  
  -- Calcular data prevista (soma dias corridos por simplicidade)
  v_data_prevista := CURRENT_DATE + INTERVAL '1 day' * v_sla_dias;
  
  -- Inserir o pedido
  INSERT INTO pedidos (
    id,
    loja_id,
    laboratorio_id,
    classe_lente_id,
    status,
    prioridade,
    cliente_nome,
    cliente_telefone,
    numero_os_fisica,
    numero_pedido_laboratorio,
    valor_pedido,
    custo_lentes,
    eh_garantia,
    observacoes,
    observacoes_garantia,
    data_prevista_pronto,
    created_by
  ) VALUES (
    v_pedido_id,
    p_loja_id,
    p_laboratorio_id,
    p_classe_lente_id,
    'REGISTRADO',
    p_prioridade,
    p_cliente_nome,
    p_cliente_telefone,
    p_numero_os_fisica,
    p_numero_pedido_laboratorio,
    p_valor_pedido,
    p_custo_lentes,
    p_eh_garantia,
    p_observacoes,
    p_observacoes_garantia,
    v_data_prevista,
    'inserir_novo_pedido_function'
  );
  
  -- Retornar o pedido criado
  RETURN QUERY
  SELECT 
    p.id,
    p.numero_sequencial,
    p.loja_id,
    p.laboratorio_id,
    p.classe_lente_id,
    p.status,
    p.prioridade,
    p.cliente_nome,
    p.cliente_telefone,
    p.numero_os_fisica,
    p.numero_pedido_laboratorio,
    p.valor_pedido,
    p.custo_lentes,
    p.eh_garantia,
    p.observacoes,
    p.observacoes_garantia,
    p.data_prevista_pronto,
    p.created_at,
    p.created_by
  FROM pedidos p
  WHERE p.id = v_pedido_id;
  
END;
$$;`

    try {
      // Executar a SQL
      const { data, error } = await supabase.rpc('query', { query: sql })
      
      if (error) {
        setResult(`❌ Erro: ${error.message}`)
      } else {
        setResult('✅ Função criada com sucesso!')
      }
    } catch (err) {
      // Tentar método direto
      try {
        const response = await fetch('/api/admin/execute-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sql })
        })
        
        const result = await response.text()
        setResult(response.ok ? '✅ Função criada via API' : `❌ Erro via API: ${result}`)
      } catch (apiErr) {
        setResult(`❌ Erro: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Criar Função SQL</h1>
      
      <button 
        onClick={createFunction}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Criando...' : 'Criar Função inserir_novo_pedido'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  )
}