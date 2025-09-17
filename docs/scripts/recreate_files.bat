@echo off
echo 🚀 Desenrola DCL - Recriador Automático de Arquivos
echo ====================================================
echo.

cd /d "D:\projetos\desenrola_dcl"

if exist "file_manager.py" (
    echo ✅ Executando script Python...
    python file_manager.py
) else (
    echo ❌ Script Python não encontrado!
    echo 📝 Criando GlobalHeader.tsx manualmente...
    
    echo 'use client' > components\layout\GlobalHeader_temp.tsx
    echo. >> components\layout\GlobalHeader_temp.tsx
    echo // Arquivo será recriado pelo script Python >> components\layout\GlobalHeader_temp.tsx
    
    echo ✅ Arquivo temporário criado. Execute o script Python para versão completa.
)

echo.
echo 🏁 Processo concluído!
pause