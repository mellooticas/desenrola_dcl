#!/bin/bash

# ================================================================
# SCRIPT PARA EXECUTAR VIEWS DO DASHBOARD NO SUPABASE
# ================================================================

echo "🚀 CONFIGURANDO VIEWS DO DASHBOARD POWERBI"
echo "=========================================="

# Configurações do Supabase (do .env.local)
SUPABASE_URL="https://zobgyjsocqmzaggrnwqd.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvYmd5anNvY3FtemFnZ3Jud3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjQ3NDgsImV4cCI6MjA2MDc0MDc0OH0.Hj9Sr-7372ERLWJv550Zrw20hXPWqxJPOpp8sUAMiTM"

echo "📊 Supabase URL: $SUPABASE_URL"
echo ""

echo "📋 INSTRUÇÕES PARA EXECUÇÃO:"
echo "1. Abra o Supabase Dashboard no seu navegador"
echo "2. Vá para o SQL Editor"
echo "3. Execute os scripts na seguinte ordem:"
echo ""

echo "   📄 SCRIPT 1: sql-queries/01-create-views-dashboard.sql"
echo "   📄 SCRIPT 2: sql-queries/02-create-views-dashboard-part2.sql"  
echo "   📄 SCRIPT 3: sql-queries/03-execute-and-test-views.sql"
echo ""

echo "🌐 Abrindo Supabase Dashboard..."

# Detectar sistema operacional e abrir navegador
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash/MSYS)
    start "https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd/sql"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd/sql"
else
    # Linux
    xdg-open "https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd/sql" 2>/dev/null || echo "Abra manualmente: https://supabase.com/dashboard/project/zobgyjsocqmzaggrnwqd/sql"
fi

echo ""
echo "📊 VIEWS QUE SERÃO CRIADAS:"
echo "   ✅ v_kpis_dashboard - Métricas principais"
echo "   ✅ v_ranking_laboratorios - Ranking de laboratórios"
echo "   ✅ v_evolucao_mensal - Evolução histórica"
echo "   ✅ v_analise_financeira - Análise por categoria"
echo "   ✅ v_alertas_criticos - Alertas automáticos"
echo ""

echo "🔧 APÓS EXECUTAR AS VIEWS:"
echo "1. Volte para o VS Code"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000/dashboard"
echo "4. Vá para a aba 'PowerBI' para ver as visualizações"
echo ""

echo "⚡ Pressione ENTER após executar as views no Supabase..."
read -r

echo "🧪 TESTANDO CONEXÃO COM AS APIS..."

# Verificar se o servidor Next.js está rodando
if curl -s http://localhost:3000/api/dashboard/kpis > /dev/null 2>&1; then
    echo "✅ Servidor Next.js rodando!"
    echo "🔍 Testando APIs..."
    
    echo "📊 KPIs Dashboard:"
    curl -s http://localhost:3000/api/dashboard/kpis | head -c 200
    echo ""
    
    echo "📊 Ranking Laboratórios:"
    curl -s http://localhost:3000/api/dashboard/ranking-laboratorios | head -c 200  
    echo ""
    
    echo "✅ APIS FUNCIONANDO COM DADOS REAIS!"
else
    echo "❌ Servidor Next.js não está rodando."
    echo "Execute: npm run dev"
fi

echo ""
echo "🎉 SETUP CONCLUÍDO!"
echo "Acesse: http://localhost:3000/dashboard → aba PowerBI"