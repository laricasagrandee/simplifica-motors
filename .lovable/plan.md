

## Plano: Corrigir exclusao de oficina (erro RLS/FK)

### Problema

O delete falha porque o client-side usa o token anon/autenticado, que nao tem permissao DELETE na tabela `configuracoes` (RLS). Alem disso, pode haver FKs de outras tabelas (funcionarios, clientes, OS, etc.) que impedem o cascade.

### Solucao

Criar uma Edge Function `admin-delete-tenant` que usa `service_role` para deletar, similar ao `admin-create-tenant`. Isso garante permissao total e permite limpar dados vinculados.

### Mudancas

**1. `supabase/functions/admin-delete-tenant/index.ts` — nova Edge Function**

- Valida que o caller e MASTER_EMAIL (mesma logica do create)
- Recebe `{ config_id }` no body
- Usa adminClient (service_role) para:
  1. Deletar funcionarios do tenant (`DELETE FROM funcionarios WHERE tenant_id = config_id`)
  2. Deletar a configuracao (`DELETE FROM configuracoes WHERE id = config_id`)
  3. Opcionalmente deletar o auth user vinculado
- Retorna sucesso ou erro

**2. `src/hooks/useAdminOficinas.ts` — alterar `useAdminExcluirOficina`**

Trocar o `supabase.from('configuracoes').delete()` por uma chamada `supabase.functions.invoke('admin-delete-tenant', { body: { config_id } })`.

### Arquivos alterados
- `supabase/functions/admin-delete-tenant/index.ts` (novo)
- `src/hooks/useAdminOficinas.ts`

