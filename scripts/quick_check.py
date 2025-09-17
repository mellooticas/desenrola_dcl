#!/usr/bin/env python3
"""
Execução direta das funções do file_manager
"""

import os
import shutil
from pathlib import Path
from datetime import datetime

def verify_and_recreate_header():
    """Função para verificar e recriar o GlobalHeader.tsx"""
    
    project_root = Path("D:/projetos/desenrola_dcl")
    backup_dir = project_root / "backups"
    backup_dir.mkdir(exist_ok=True)
    
    file_path = project_root / "components" / "layout" / "GlobalHeader.tsx"
    
    print("🚀 Desenrola DCL - Verificação Automática")
    print("=" * 50)
    
    # Verificar se arquivo existe
    if file_path.exists():
        print(f"✅ Arquivo encontrado: {file_path}")
        
        # Criar backup
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"GlobalHeader_{timestamp}.tsx.backup"
        backup_path = backup_dir / backup_name
        shutil.copy2(file_path, backup_path)
        print(f"📦 Backup criado: {backup_path}")
        
        # Ler conteúdo atual
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificações básicas
        checks = [
            ("'use client'", "Diretiva client-side"),
            ("export function GlobalHeader", "Exportação do componente"),
            ("import { useState }", "Imports React"),
            ("from 'lucide-react'", "Imports de ícones"),
            ("const NAVIGATION_ITEMS", "Constantes de navegação"),
            ("bg-white/80 backdrop-blur-lg", "Estilo glassmorphism")
        ]
        
        print("\n🔍 Verificando integridade:")
        all_good = True
        for check, description in checks:
            if check in content:
                print(f"✅ {description}: OK")
            else:
                print(f"❌ {description}: FALTANDO")
                all_good = False
        
        print(f"\n📊 Estatísticas do arquivo:")
        print(f"   📄 Linhas: {len(content.splitlines())}")
        print(f"   💾 Tamanho: {len(content)} caracteres")
        print(f"   🎯 Componentes: {content.count('const ')}")
        print(f"   📦 Imports: {content.count('import ')}")
        
        if all_good:
            print("\n🎉 GlobalHeader.tsx está perfeito!")
            return True
        else:
            print("\n⚠️  Arquivo precisa ser recriado...")
            return False
    else:
        print("❌ Arquivo não encontrado!")
        return False

if __name__ == "__main__":
    try:
        result = verify_and_recreate_header()
        if result:
            print("\n✅ Verificação concluída - Arquivo OK!")
        else:
            print("\n🔧 Execute o file_manager.py para recriar o arquivo")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()