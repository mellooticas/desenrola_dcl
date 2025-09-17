#!/usr/bin/env python3
"""
Script de execução automática para verificar e recriar GlobalHeader.tsx
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório atual ao path
sys.path.append(str(Path(__file__).parent))

try:
    from file_manager import DesenrolaFileManager
    
    print("🚀 Desenrola DCL - Execução Automática")
    print("=" * 50)
    
    # Inicializar o gerenciador
    manager = DesenrolaFileManager()
    
    # Verificar arquivo atual
    file_path = manager.project_root / "components" / "layout" / "GlobalHeader.tsx"
    print(f"\n🔍 Verificando arquivo atual: {file_path}")
    
    if file_path.exists():
        print("✅ Arquivo encontrado!")
        
        # Verificar integridade
        print("\n📊 Verificando integridade...")
        is_valid = manager.verify_file_integrity(file_path)
        
        if is_valid:
            print("\n🎉 GlobalHeader.tsx está perfeito!")
            print("✅ Todas as verificações passaram")
        else:
            print("\n⚠️  Problemas detectados. Recriando arquivo...")
            new_path = manager.create_global_header()
            print(f"✅ Arquivo recriado: {new_path}")
            
    else:
        print("❌ Arquivo não encontrado. Criando...")
        new_path = manager.create_global_header()
        print(f"✅ Arquivo criado: {new_path}")
    
    # Estatísticas finais
    print(f"\n📈 Estatísticas:")
    if file_path.exists():
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f"   📄 Linhas: {len(content.splitlines())}")
        print(f"   💾 Tamanho: {len(content)} caracteres")
        print(f"   🎯 Componentes: {content.count('const ')}")
        print(f"   📦 Imports: {content.count('import ')}")
    
    print("\n🏁 Execução concluída com sucesso!")
    
except ImportError as e:
    print(f"❌ Erro ao importar file_manager: {e}")
    print("📝 Execute o script principal: python file_manager.py")
    
except Exception as e:
    print(f"❌ Erro inesperado: {e}")
    import traceback
    traceback.print_exc()