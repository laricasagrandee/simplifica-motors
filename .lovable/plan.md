

## Plano: Resolver erro "Failed to send a request to the Edge Function"

### Problema

O erro "Failed to send a request to the Edge Function" significa que a function `admin-create-tenant` **nao foi deployada** no Supabase. O codigo existe no repositorio, mas precisa estar rodando no servidor Supabase para funcionar.

### O que precisa ser feito

**Voce precisa fazer o deploy da Edge Function manualmente.** Existem duas formas:

---

#### Opcao A — Via Supabase CLI (recomendado)

1. Instale o Supabase CLI se ainda nao tem:
   ```
   npm install -g supabase
   ```

2. Faca login:
   ```
   supabase login
   ```

3. Linke o projeto:
   ```
   supabase link --project-ref ryphwhchdbkktbdoevga
   ```

4. Deploy da function:
   ```
   supabase functions deploy admin-create-tenant --no-verify-jwt
   ```

O `--no-verify-jwt` e necessario porque a validacao do JWT e feita no codigo da function (verificando o MASTER_EMAIL).

---

#### Opcao B — Via Dashboard do Supabase

1. Acesse https://supabase.com/dashboard/project/ryphwhchdbkktbdoevga/functions
2. Clique em "Create a new function"
3. Nome: `admin-create-tenant`
4. Cole o conteudo do arquivo `supabase/functions/admin-create-tenant/index.ts`
5. Desative "Verify JWT" nas configuracoes da function
6. Salve

---

### Nenhuma mudanca de codigo necessaria

O codigo da Edge Function e do dialog `NovaOficinaDialog` estao corretos. O problema e exclusivamente de deploy — a function precisa estar publicada no Supabase para ser chamada.

### Apos o deploy

Tente criar a oficina novamente. Se der outro erro diferente de "Failed to send", ai sim sera um problema de codigo que podemos resolver.

