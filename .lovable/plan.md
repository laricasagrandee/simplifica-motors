

## Plano: Painel Master Multi-Oficina + Tela de Bloqueio

Duas entregas em sequencia.

---

### Parte 1 — Painel Master separado em /admin

**Constantes** (`src/lib/constants.ts`)
- `MASTER_EMAIL = 'smartinfoconserta@gmail.com'`
- `SUPORTE_WHATSAPP = '5548999999999'`
- `SUPORTE_NOME = 'Facilita Motors'`

**Login redirecionado** (`src/components/layout/AuthProvider.tsx`)
- No SIGNED_IN, se email === MASTER_EMAIL, redireciona para `/admin`
- Mesmo ajuste no `RootRedirect` de App.tsx

**Rota /admin** (`src/App.tsx`)
- Rota separada, fora do AuthProvider/BloqueioProvider
- Verifica session e email; se nao for MASTER_EMAIL, manda pro /dashboard

**Pagina AdminPanelPage** (`src/pages/AdminPanelPage.tsx`)
- Layout proprio sem sidebar (header escuro com logo + "PAINEL ADMINISTRATIVO" + logout)
- Busca TODAS as linhas de `configuracoes`
- Busca contagem de funcionarios agrupada (a tabela `funcionarios` nao tem `config_id` hoje, entao por enquanto mostra contagem total do sistema)

**4 cards de resumo no topo**
- Total de oficinas
- Ativas (verde)
- Bloqueadas/vencidas (vermelho)
- Receita estimada (soma por plano: basico=99, profissional=199, premium=399, etc)

**Tabela de oficinas**
- Nome fantasia, CNPJ, Plano, Vencimento, Status (badge ativo/tolerancia/bloqueado), Funcionarios, acoes
- Botao Editar: abre dialog com todos os campos editaveis (nome, cnpj, plano dropdown, vencimento, plano_ativo toggle, max_funcionarios, dias_tolerancia)
- Botao Bloquear/Liberar com confirmacao

**Nova oficina**: dialog com nome_fantasia obrigatorio, cria registro com defaults (basico, ativo, +30 dias, max 3)

**Multi-tenancy**: Hoje `funcionarios` nao tem `config_id`. Vou adicionar uma migration para incluir essa coluna. Isso permite contar funcionarios por oficina e filtrar no reset de senha. Para dados existentes, popula com o primeiro config_id encontrado.

---

### Parte 2 — Tela de bloqueio com contato real

**`src/components/layout/BloqueioScreen.tsx`**
- Usa as constantes SUPORTE_WHATSAPP e SUPORTE_NOME
- Link WhatsApp com mensagem: "Ola! Preciso renovar meu plano do Facilita Motors. Oficina: [nome]"
- Busca nome da oficina via useConfiguracoes

---

### Arquivos novos
- `src/pages/AdminPanelPage.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/AdminResumoCards.tsx`
- `src/components/admin/OficinasTable.tsx`
- `src/components/admin/EditarOficinaDialog.tsx`
- `src/components/admin/NovaOficinaDialog.tsx`
- `src/hooks/useAdminOficinas.ts`
- Migration: adicionar `config_id` em `funcionarios`

### Arquivos editados
- `src/lib/constants.ts`
- `src/App.tsx`
- `src/components/layout/AuthProvider.tsx`
- `src/components/layout/BloqueioScreen.tsx`

### Visual do painel
- Header bg-slate-900 com texto branco
- Cards com cores distintas (verde ativas, vermelho bloqueadas, azul total, amarelo receita)
- Tabela clean com hover, badges coloridos por status
- Design premium diferenciado do sistema normal da oficina

