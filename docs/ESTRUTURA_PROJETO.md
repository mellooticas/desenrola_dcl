
# 🗂️ Estrutura e Organização de Pastas do Projeto

Este documento explica como o projeto foi organizado para facilitar a manutenção e escalabilidade.

## 📁 `docs/` - A Base de Conhecimento

Aqui fica toda a documentação não-código do sistema. Foi dividida logicamente para separar "O que deve ser feito" (Blueprints), "Como o banco evoluiu" (Migrations) e "Ferramentas" (Scripts).

### 📐 `docs/blueprints/`
Contém a documentação técnica e estratégica do sistema. Comece sempre por aqui.
*   `00-INDEX-MASTER.md`: O ponto de partida. Lista todos os outros módulos.
*   `01-CORE...` a `08-ALERTA...`: Especificações funcionais de cada parte do sistema.
*   `LEGACY...`: Arquivos históricos (compras, especificações antigas) que não devem ser jogados fora, mas não são mais "lei".

### 🗄️ `docs/database/`
Tudo relacionado ao PostgreSQL (SQL).
*   **`migrations/`**: Histórico evolutivo do banco.
    *   Arquivos numerados (`01-xyz.sql`, `02-abc.sql`).
    *   A ideia é que, se você rodar esses scripts em ordem num banco novo, ele ficará igual ao de produção.
*   **`queries/`**: Scripts úteis para o desenvolvedor.
    *   Scripts de diagnóstico (ex: `diagnostico-lentes.sql`).
    *   Scripts de limpeza (ex: `LIMPEZA-FINAL.sql`).
    *   Scripts de "um uso só" que não alteram estrutura (ex: `check_labs.sql`).

### 🛠️ `docs/scripts/`
Scripts de automação (Node.js) para tarefas administrativas.
*   Scripts para testar conexões (`test-connection.js`).
*   Scripts para analisar dados externos (`analise-completa-lentes.js`).
*   Scripts para aplicar mudanças complexas (`apply-migration.js`).
*   *Nota: Eles ficam aqui para não poluir a raiz do projeto.*

---

## 💻 `src/` - O Código Fonte (Next.js)

A organização padrão do Next.js App Router, mas com algumas convenções DCL.

*   `app/`: Roteamento e Páginas.
*   `components/`: UI Reutilizável.
    *   `ui/`: Shadcn components (Button, Input...).
    *   `forms/`: Formulários de negócio (`NovaOrdemForm`).
    *   `kanban/`: Componentes específicos do Kanban.
    *   `lentes/`: Componentes específicos do Catálogo (`LenteSelector`).
*   `lib/`: Lógica Pura e Configuração.
    *   `supabase/`: Clientes de banco (incluindo o cliente isolado para Best Lens).
    *   `hooks/`: React Query (data fetching).
    *   `types/`: Definições TypeScript globais (`database.ts`).

---

## 🎯 Por que essa estrutura?
1.  **Clareza:** Separamos "Documentação de Arquitetura" de "Scripts de Banco".
2.  **Limpeza:** A raiz do projeto tem apenas arquivos de configuração essenciais (`package.json`, `.env`).
3.  **Segurança:** Scripts de debug e limpeza ficam isolados, evitando execução acidental.
4.  **Histórico:** Migrations numeradas permitem reconstruir o banco do zero.
