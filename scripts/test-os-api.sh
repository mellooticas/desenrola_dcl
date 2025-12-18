#!/bin/bash

# 🧪 TESTE DE API - OS CONTROL
# ============================
# Testa se os dados chegam do Supabase
# ============================

echo "🔍 Testando conexão com Supabase..."
echo ""

# Ler variáveis de ambiente
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Variáveis de ambiente não encontradas!"
    echo "Certifique-se de ter .env.local com:"
    echo "  NEXT_PUBLIC_SUPABASE_URL"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
    exit 1
fi

echo "✅ Supabase URL: $SUPABASE_URL"
echo ""

# 1️⃣ Testar view_os_gaps
echo "📊 Testando view_os_gaps..."
curl -s "${SUPABASE_URL}/rest/v1/view_os_gaps?select=count" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  | jq '.[0].count // "ERROR"'
echo ""

# 2️⃣ Testar view_os_gaps com filtro Suzano
echo "📊 Testando view_os_gaps (Suzano)..."
curl -s "${SUPABASE_URL}/rest/v1/view_os_gaps?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&select=count" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  | jq 'length'
echo ""

# 3️⃣ Testar view_os_estatisticas
echo "📊 Testando view_os_estatisticas..."
curl -s "${SUPABASE_URL}/rest/v1/view_os_estatisticas?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&select=*" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  | jq '.'
echo ""

# 4️⃣ Testar primeiras OSs pendentes
echo "📊 Testando primeiras 5 OSs pendentes..."
curl -s "${SUPABASE_URL}/rest/v1/view_os_gaps?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&precisa_atencao=eq.true&order=numero_os.asc&limit=5&select=numero_os,status" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  | jq '.'
echo ""

# 5️⃣ Testar contagem de pendentes
echo "📊 Testando contagem de pendentes..."
curl -s "${SUPABASE_URL}/rest/v1/view_os_gaps?loja_id=eq.e5915ba4-fdb4-4fa7-b9d5-c71d3c704c55&precisa_atencao=eq.true&select=*" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Prefer: count=exact" \
  -I | grep -i "content-range"
echo ""

echo "✅ Testes concluídos!"
echo ""
echo "📝 Se todos retornarem dados, o problema está no React Query ou nos hooks"
echo "❌ Se retornar erro 401/403, é problema de autenticação"
echo "❌ Se retornar vazio, é problema de RLS ainda"
