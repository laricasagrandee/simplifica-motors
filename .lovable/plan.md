
## Plano: Painel Master Multi-Oficina + Tela de Bloqueio

Duas entregas: um painel administrativo completo em rota separada para o dono do sistema, e a tela de bloqueio com contato real.

---

### Parte 1 — Painel Master separado

**Constantes globais** (`src/lib/constants.ts`)
- `MASTER_EMAIL = 'smartinfoconserta@gmail.com'`
- `SUPORTE_WHATSAPP = '5548999999999'`
- `SUPORTE_NOME = 'Facilita Motors'`

**Redirecionamento no login** (`src/components/layout/AuthProvider.tsx`)
- No `onAuthStateChange` SIGNED_IN, checar se `session.user.email === MASTER_EMAIL`
- Se sim, redirecionar para `/admin` em vez de `/dashboard`
- Mesmo tratamento no `RootRedirect` do App.tsx

**Rota `/admin`** (`src/App.tsx`)
- Adicionar rota `/admin` FORA do AuthProvider (o painel master não precisa de BloqueioProvider nem de funcionario)
- A rota renderiza `AdminPanelPage` — componente protegido que verifica se o email logado é MASTER_EMAIL, senão redireciona para `/dashboard`

**Nova página** (`src/pages/AdminPanelPage.tsx`)
- Layout próprio (sem AppLayout/Sidebar da oficina)
- Header escuro com logo "Facilita Motors" + tag "PAINEL ADMINISTRATIVO" + botão logout
- Busca TODAS as linhas de `configuracoes` (sem `.limit(1)`)
- Busca contagem de funcionários ativos por oficina (select de `funcionarios` agrupado)

**Cards de resumo** (4 cards no topo)
- Total de oficinas
- Oficinas ativas (verde)
- Oficinas vencidas/bloqueadas (vermelho)
- Receita mensal estimada (soma baseada nos planos: basico=R$99, profissional=R$199, premium=R$399, etc.)

**Tabela de oficinas**
- Colunas: Nome fantasia, CNPJ, Plano, Vencimento, Status (badge calculado), Funcionários (X/Y), Ações
- Status calculado igual `useVerificarBloqueio`: ativo/tolerancia/bloqueado
- Botões: Editar, Bloquear/Liberar

**Dialog de edição** (`src/components/admin/EditarOficinaDialog.tsx`)
- Campos: nome_fantasia, cnpj, plano (dropdown), data_vencimento_plano, plano_ativo (toggle), max_funcionarios, dias_tolerancia
- Salva via update direto no supabase client (sem RLS bloqueando, tabela configuracoes não tem RLS restritivo)

**Nova oficina**
- Botão "Nova Oficina" abre dialog com nome_fantasia obrigatório
- Insere registro com defaults (plano basico, ativo, vencimento +30 dias, max 3 funcionarios)

**Bloquear/Liberar**
- Bloquear: confirm dialog, seta `plano_ativo = false`
- Liberar: seta `plano_ativo = true` e `data_vencimento_plano = hoje + 30 dias`

**Reset de senha**
- Na tabela, botão para abrir dialog de reset de senha por oficina
- Lista funcionários daquela oficina (query `funcionarios` filtrando por... )

**Problema de multi-tenancy**: Hoje o sistema é single-tenant — a tabela `funcionarios` não tem `config_id`. Todos os funcionários estão na mesma tabela sem vínculo com qual oficina pertencem. Isso significa que:
- Não é possível saber quantos funcionários cada oficina tem
- O reset de senha não consegue filtrar por oficina
- Este é um problema estrutural que precisa de uma migration para adicionar `config_id` na tabela `funcionarios`

**Migration necessária**: Adicionar coluna `config_id` (uuid, nullable, FK para configuracoes.id) na tabela `funcionarios`. Para oficinas existentes, popular com o ID da configuração existente.

---

### Parte 2 — Tela de bloqueio com contato real

**`src/components/layout/BloqueioScreen.tsx`**
- Importar `SUPORTE_WHATSAPP` e `SUPORTE_NOME` das constantes
- Montar link WhatsApp com mensagem pré-preenchida: "Ola! Preciso renovar meu plano do Facilita Motors."
- Se possível, incluir nome da oficina na mensagem (via `useConfiguracoes`)
- Formatar o número para exibição amigável

---

### Arquivos novos
- `src/pages/AdminPanelPage.tsx`
- `src/components/admin/AdminHeader.tsx`
- `src/components/admin/AdminResumoCards.tsx`
- `src/components/admin/OficinasTable.tsx`
- `src/components/admin/EditarOficinaDialog.tsx`
- `src/components/admin/NovaOficinaDialog.tsx`
- `src/hooks/useAdminOficinas.ts`

### Arquivos editados
- `src/lib/constants.ts` — adicionar constantes MASTER_EMAIL, SUPORTE_WHATSAPP, SUPORTE_NOME
- `src/App.tsx` — adicionar rota /admin
- `src/components/layout/AuthProvider.tsx` — redirecionar MASTER_EMAIL para /admin
- `src/components/layout/BloqueioScreen.tsx` — contato real
- Migration para adicionar `config_id` em `funcionarios` (necessário para multi-tenancy)

### Nota importante
Como o sistema é single-tenant hoje (uma tabela `configuracoes` com 1 registro, `funcionarios` sem vínculo a oficina), o painel master vai funcionar listando todas as configurações, mas a contagem de funcionários por oficina e o reset de senha por oficina só funcionarão corretamente após a migration que adiciona `config_id` em `funcionarios`. Se preferir, posso implementar sem essa migration — o painel mostraria a contagem total de funcionários e o reset listaria todos os funcionários.
