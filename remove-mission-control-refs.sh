#!/bin/bash

# Script para remover todas as refer√™ncias ao mission-control do app

echo "Ì∑ëÔ∏è  Removendo pastas do mission-control..."

# Remover p√°ginas e APIs
rm -rf src/app/mission-control
rm -rf src/app/api/mission-control
rm -rf src/app/api/gamificacao
rm -rf src/app/api/gamification  
rm -rf src/app/api/renovacao-diaria

# Remover componentes
rm -rf src/components/gamification
rm -f src/components/kanban/MissionKanban*

# Remover hooks e utils
rm -f src/lib/hooks/use-mission-control.ts
rm -f src/lib/hooks/use-gamification.ts
rm -f src/hooks/useGamificacao.ts
rm -f src/lib/utils/gamificacao.ts

echo "‚úÖ Pastas e arquivos mission-control removidos"
