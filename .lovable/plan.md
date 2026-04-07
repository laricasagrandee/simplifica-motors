

## Plano: Painel Master para Licenças e Reset de Senha

### Escopo real

O que você pediu requer backend (Edge Functions do Supabase) porque as operações de criar usuários e resetar senhas precisam de chaves administrativas que não podem ficar no navegador.

### O que será criado

**1. Duas Edge Functions no Supabase**

- `admin-reset-password` — recebe email do usuário, envia link de reset via `auth.admin.generateLink()`
- `admin-manage-license` — recebe config_id + dados do plano, atualiza a tabela `configuracoes`

Ambas verificam se quem chamou é um funcionário com cargo `admin`.

**2. Nova página `/admin-master`**

Uma aba dentro de Configurações (visível apenas para `admin`) com duas seções:

- **Licenças**: lista as configurações existentes, permite ativar/desativar plano, trocar plano, alterar vencimento
- **Reset de Senha**: campo para digitar o email do funcionário, botão que chama a Edge Function para enviar o link de redefinição

**3. Permissão nova**

- Adicionar `'admin_master'` ao tipo `Acao` em `permissions.ts`
- Apenas cargo `admin` terá acesso

### Arquivos envolvidos

- `supabase/functions/admin-reset-password/index.ts` (novo)
- `supabase/functions/admin-manage-license/index.ts` (novo)
- `src/components/configuracoes/AdminMasterTab.tsx` (novo)
- `src/hooks/useAdminMaster.ts` (novo)
- `src/pages/ConfiguracoesPage.tsx` (adicionar aba)
- `src/lib/permissions.ts` (adicionar permissão)

### Limitação importante

Hoje o sistema é **single-tenant** (uma oficina). O painel master vai gerenciar a licença **desta** oficina e resetar senhas dos funcionários **desta** oficina. Para gerenciar múltiplas oficinas separadas, seria necessário uma reestruturação multi-tenant que é muito mais complexa.

### Resultado

- Na aba "Master" em Configurações, o admin pode:
  - Ver e alterar o plano/licença (tipo, vencimento, ativo/inativo)
  - Digitar o email de um funcionário e enviar link de reset de senha
- Tudo protegido por verificação de cargo `admin` tanto no frontend quanto nas Edge Functions

