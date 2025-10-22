# 📦 Archive - SQLs Históricos

Esta pasta contém arquivos SQL que já foram aplicados ou são versões antigas, mas preservados para referência.

## 📁 Conteúdo

### Configurações de Loja

- **configuracoes_loja_basico.sql** - Versão inicial/básica (substituída por configuracoes_loja_setup.sql)

### Correções Aplicadas (2024/2025)

- **diagnostico-permissoes.sql** - Diagnóstico de permissões RLS
- **fix-function-security.sql** - Correção de SECURITY DEFINER em functions
- **fix-permissions-security-definer.sql** - Correção de permissões em functions
- **fix-permissions-timeline.sql** - Correção de permissões na timeline

## ⚠️ Importante

**Não executar estes arquivos novamente!**

Eles estão aqui apenas para:

- ✅ Referência histórica
- ✅ Documentação de correções aplicadas
- ✅ Rollback em caso de emergência (com cuidado!)

## 📚 Arquivos Ativos

Para setup/migrations atuais, veja:

- `../configuracoes_loja_setup.sql` - Setup atual de configurações
- `../migrations/` - Migrations ativas
- `../functions/` - Functions em produção

---

Criado em: 22/10/2025
Motivo: Organização do projeto - Limpeza de arquivos temporários
