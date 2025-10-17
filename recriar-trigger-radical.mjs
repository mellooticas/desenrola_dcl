import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function recriarTrigger() {
  console.log('🔧 INICIANDO SOLUÇÃO RADICAL: RECRIAR TRIGGER')
  
  try {
    // 1. Desabilitar trigger
    console.log('1. Desabilitando trigger...')
    const { error: disableError } = await supabase.rpc('execute_raw_sql', {
      sql: 'ALTER TABLE pedidos DISABLE TRIGGER trigger_atualizar_datas_pedido;'
    })
    
    if (disableError) {
      console.log('   Erro ao desabilitar:', disableError)
    } else {
      console.log('   ✅ Trigger desabilitado')
    }
    
    // 2. Dropar função
    console.log('2. Dropando função...')
    const { error: dropError } = await supabase.rpc('execute_raw_sql', {
      sql: 'DROP FUNCTION IF EXISTS trigger_atualizar_datas_pedido CASCADE;'
    })
    
    if (dropError) {
      console.log('   Erro ao dropar:', dropError)
    } else {
      console.log('   ✅ Função dropada')
    }
    
    // 3. Recriar função com SECURITY INVOKER
    console.log('3. Recriando função...')
    const newFunction = `
CREATE OR REPLACE FUNCTION trigger_atualizar_datas_pedido()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar data_entregue quando status muda para ENTREGUE
  IF NEW.status = 'ENTREGUE' AND (OLD.status IS NULL OR OLD.status != 'ENTREGUE') THEN
    NEW.data_entregue = CURRENT_DATE;
  END IF;
  
  -- Atualizar data_pagamento quando status muda para PAGO
  IF NEW.status = 'PAGO' AND (OLD.status IS NULL OR OLD.status != 'PAGO') THEN
    NEW.data_pagamento = CURRENT_DATE;
  END IF;
  
  -- Calcular data_prometida quando pedido é criado ou pago
  IF (TG_OP = 'INSERT') OR 
     (NEW.status = 'PAGO' AND (OLD.status IS NULL OR OLD.status != 'PAGO')) THEN
    
    DECLARE
      sla_dias INTEGER := 5; -- padrão
    BEGIN
      -- Tentar buscar SLA específico
      SELECT COALESCE(ls.sla_base_dias, cl.sla_base_dias, l.sla_padrao_dias, 5)
      INTO sla_dias
      FROM laboratorios l
      LEFT JOIN classes_lente cl ON cl.id = NEW.classe_lente_id
      LEFT JOIN laboratorio_sla ls ON ls.laboratorio_id = NEW.laboratorio_id 
        AND ls.classe_lente_id = NEW.classe_lente_id
      WHERE l.id = NEW.laboratorio_id;
      
      -- Ajustar por prioridade
      CASE NEW.prioridade
        WHEN 'URGENTE' THEN sla_dias := GREATEST(1, sla_dias - 3);
        WHEN 'ALTA' THEN sla_dias := GREATEST(2, sla_dias - 1);
        WHEN 'BAIXA' THEN sla_dias := sla_dias + 2;
        ELSE -- NORMAL, manter SLA base
      END CASE;
      
      -- Calcular data prometida
      NEW.data_prometida = COALESCE(NEW.data_pagamento, NEW.data_pedido) + (sla_dias || ' days')::INTERVAL;
    END;
  END IF;
  
  -- Sempre atualizar updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
`

    const { error: createError } = await supabase.rpc('execute_raw_sql', {
      sql: newFunction
    })
    
    if (createError) {
      console.log('   Erro ao criar função:', createError)
    } else {
      console.log('   ✅ Função recriada com SECURITY INVOKER')
    }
    
    // 4. Recriar trigger
    console.log('4. Recriando trigger...')
    const { error: triggerError } = await supabase.rpc('execute_raw_sql', {
      sql: `CREATE TRIGGER trigger_atualizar_datas_pedido
             BEFORE INSERT OR UPDATE ON pedidos
             FOR EACH ROW
             EXECUTE FUNCTION trigger_atualizar_datas_pedido();`
    })
    
    if (triggerError) {
      console.log('   Erro ao criar trigger:', triggerError)
    } else {
      console.log('   ✅ Trigger recriado')
    }
    
    console.log('\n🎉 SOLUÇÃO APLICADA! Vamos testar...')
    
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

recriarTrigger()