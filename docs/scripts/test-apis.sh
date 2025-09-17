#!/bin/bash

# Script para testar todas as APIs do dashboard
BASE_URL="http://localhost:3000"

echo "🔍 TESTE SISTEMÁTICO DE APIS - DESENROLA DCL"
echo "=============================================="
echo ""

APIs=(
    "/api/dashboard/kpis"
    "/api/dashboard/ranking-laboratorios"
    "/api/dashboard/evolucao-mensal"
    "/api/dashboard/analise-financeira"
    "/api/dashboard/alertas-criticos"
    "/api/dashboard/heatmap-sla"
    "/api/dashboard/sazonalidade"
    "/api/dashboard/insights"
    "/api/dashboard/projecoes"
    "/api/dashboard/correlacoes"
    "/api/dashboard/complete"
    "/api/dashboard"
    "/api/pedidos/dashboard"
    "/api/debug/banco"
)

for api in "${APIs[@]}"; do
    echo "📡 Testando: $api"
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$api" --connect-timeout 5)
    
    if [ "$status_code" == "200" ]; then
        echo "   ✅ Status: $status_code - OK"
        
        # Capturar preview dos dados
        response=$(curl -s "$BASE_URL$api" --connect-timeout 5 | head -c 200)
        echo "   📊 Preview: ${response:0:80}..."
    elif [ "$status_code" == "000" ]; then
        echo "   ❌ Status: Conexão recusada/timeout"
    else
        echo "   ⚠️  Status: $status_code"
    fi
    echo ""
done

echo "🏁 Teste finalizado!"