#!/bin/bash
# ============================================================
# Script de Limpeza - Database SQL Files
# ============================================================
# Remove arquivos temporários de debug, diagnóstico e correções obsoletas
# Mantém apenas arquivos essenciais e produtivos

cd "$(dirname "$0")"

echo "🧹 Iniciando limpeza do diretório database/"
echo ""

# Criar diretório de arquivo se não existir
mkdir -p archive/debug-21-01-2026

# Contar arquivos antes
TOTAL_ANTES=$(find . -maxdepth 1 -name "*.sql" | wc -l)
echo "📊 Total de arquivos SQL antes: $TOTAL_ANTES"
echo ""

# ============================================================
# MOVER para archive (preservar histórico importante)
# ============================================================
echo "📦 Movendo arquivos históricos importantes para archive/..."

# Correções que levaram à solução final
mv CORRECAO-DEFINITIVA-STATUS.sql archive/debug-21-01-2026/ 2>/dev/null
mv CORRECAO-DEFINITIVA-V2.sql archive/debug-21-01-2026/ 2>/dev/null
mv CORRECAO-DEFINITIVA-V3-SEM-TRIGGERS.sql archive/debug-21-01-2026/ 2>/dev/null
mv VERIFICACAO-POS-CORRECAO.sql archive/debug-21-01-2026/ 2>/dev/null

# Investigações importantes
mv INVESTIGACAO-SABADO-COMPLETA.sql archive/debug-21-01-2026/ 2>/dev/null
mv DEBUG-TIMELINE-1049.sql archive/debug-21-01-2026/ 2>/dev/null
mv INVESTIGAR-BLOQUEIO-UPDATE.sql archive/debug-21-01-2026/ 2>/dev/null
mv DIAGNOSTICO-TIMEZONE-SP.sql archive/debug-21-01-2026/ 2>/dev/null
mv DIAGNOSTICO-EMERGENCIA-HOJE.sql archive/debug-21-01-2026/ 2>/dev/null

echo "✓ Arquivos históricos arquivados"
echo ""

# ============================================================
# DELETAR arquivos temporários de debug
# ============================================================
echo "🗑️  Deletando arquivos temporários de debug..."

# Debug
rm -f DEBUG-*.sql 2>/dev/null
rm -f debug-*.sql 2>/dev/null

# Diagnósticos (exceto os já movidos)
rm -f DIAGNOSTICO-*.sql 2>/dev/null
rm -f diagnostico-*.sql 2>/dev/null

# Reversões obsoletas
rm -f REVERSAO-*.sql 2>/dev/null

# Verificações temporárias
rm -f VER-*.sql 2>/dev/null
rm -f verificar-*.sql 2>/dev/null
rm -f VERIFICAR-*.sql 2>/dev/null

# Descobertas
rm -f DESCOBRIR-*.sql 2>/dev/null
rm -f descobrir-*.sql 2>/dev/null

# Investigações (exceto as já arquivadas)
rm -f INVESTIGACAO-*.sql 2>/dev/null
rm -f investigacao-*.sql 2>/dev/null
rm -f INVESTIGAR-*.sql 2>/dev/null

# Correções antigas
rm -f CORRIGIR-*.sql 2>/dev/null

# Desabilitar temporários
rm -f DESABILITAR-*.sql 2>/dev/null
rm -f desativar-*.sql 2>/dev/null
rm -f HABILITAR-*.sql 2>/dev/null

# Executar agora (pontuais)
rm -f EXECUTAR-AGORA-*.sql 2>/dev/null

# Testes
rm -f teste-*.sql 2>/dev/null
rm -f test-*.sql 2>/dev/null

echo "✓ Arquivos temporários deletados"
echo ""

# ============================================================
# CONSOLIDAR fixes RLS obsoletos
# ============================================================
echo "📝 Limpando múltiplos fixes RLS obsoletos..."

# Mover alguns importantes para archive
mv fix-rls-definitivo.sql archive/ 2>/dev/null
mv FIX-RLS-EMERGENCIAL.sql archive/ 2>/dev/null

# Deletar tentativas antigas (já consolidado em FIX-RLS-UPDATE-DEFINITIVO.sql)
rm -f fix-rls-*.sql 2>/dev/null
rm -f FIX-RLS-UPDATE-TEMP.sql 2>/dev/null
rm -f FIX-RLS-UPDATE-PRODUCTION.sql 2>/dev/null

# Grants já consolidados
rm -f fix-grant-*.sql 2>/dev/null
rm -f FIX-GRANT-*.sql 2>/dev/null

echo "✓ Fixes RLS consolidados"
echo ""

# ============================================================
# LIMPAR fixes emergenciais obsoletos
# ============================================================
echo "🚨 Removendo fixes emergenciais obsoletos..."

rm -f FIX-EMERGENCIAL-*.sql 2>/dev/null
rm -f FIX-FINAL-*.sql 2>/dev/null
rm -f REVERSAO-*.sql 2>/dev/null
rm -f REMOCAO-*.sql 2>/dev/null

echo "✓ Fixes emergenciais removidos"
echo ""

# ============================================================
# LIMPAR arquivos de status obsoletos
# ============================================================
echo "📊 Removendo verificações de status antigas..."

rm -f FIX-STATUS-*.sql 2>/dev/null
rm -f DIAGNOSTICO-STATUS-*.sql 2>/dev/null

echo "✓ Verificações de status limpas"
echo ""

# ============================================================
# RESULTADO FINAL
# ============================================================
TOTAL_DEPOIS=$(find . -maxdepth 1 -name "*.sql" | wc -l)

echo ""
echo "╔════════════════════════════════════════╗"
echo "║      LIMPEZA CONCLUÍDA COM SUCESSO     ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "📊 Arquivos antes:  $TOTAL_ANTES"
echo "📊 Arquivos depois: $TOTAL_DEPOIS"
echo "🗑️  Removidos:      $((TOTAL_ANTES - TOTAL_DEPOIS))"
echo ""
echo "✅ Arquivos essenciais mantidos:"
echo "   - criar-estruturas-basicas.sql"
echo "   - CORRECAO-FORCA-BRUTA-DEFINITIVA.sql (ÚLTIMA CORREÇÃO)"
echo "   - FIX-ALL-TABLES-DEFINITIVO.sql"
echo "   - FIX-RLS-UPDATE-DEFINITIVO.sql"
echo "   - controle-os-final.sql"
echo "   - setup-modulo-montagens.sql"
echo ""
echo "📦 Histórico preservado em: archive/debug-21-01-2026/"
echo ""
echo "🚀 Pronto para desenvolvimento!"
