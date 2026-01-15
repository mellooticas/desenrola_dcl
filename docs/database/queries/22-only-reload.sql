
-- Apenas recarregar o cache da API
-- Execute isso ISOLADAMENTE no SQL Editor

NOTIFY pgrst, 'reload config';

-- Aguarde 10 segundos e tente acessar o frontend
