

## Plano: Login de conta excluida deve mostrar erro, nao redirecionar

### Problema

Quando voce exclui uma oficina pelo painel Master, a edge function `admin-delete-tenant` deleta os dados (funcionarios, clientes, etc.) e tenta deletar o auth user. Porem, se a exclusao do auth user falha silenciosamente, o usuario continua existindo no Supabase Auth. Ao fazer login, as credenciais sao validas (auth user existe), o sistema redireciona para `/dashboard`, e como nao ha `funcionario`, mostra "Acesso nao disponivel".

O comportamento correto: apos o login, se nao existe `funcionario`, fazer logout automatico e mostrar erro na tela de login.

### Mudancas

**1. `src/components/layout/AuthProvider.tsx`**

No `onAuthStateChange`, quando `SIGNED_IN` acontece (exceto master), nao redirecionar imediatamente. Em vez disso, consultar `funcionarios` pelo `user_id`. Se nao encontrar nenhum registro, fazer `signOut()` e redirecionar para `/login` com um parametro de erro (`?erro=sem-acesso`).

Logica:
- Apos `SIGNED_IN`, chamar `supabase.from('funcionarios').select('id').eq('user_id', session.user.id).maybeSingle()`
- Se retornar `null` (sem funcionario), chamar `supabase.auth.signOut()` e `navigate('/login?erro=sem-acesso')`
- Se retornar dados, redirecionar normalmente para dashboard

**2. `src/pages/LoginPage.tsx`**

Ler o parametro `?erro=sem-acesso` da URL. Se presente, mostrar uma mensagem de erro no formulario: "Esta conta nao esta vinculada a nenhuma oficina ativa. Entre em contato com o suporte."

**3. `supabase/functions/admin-delete-tenant/index.ts`**

Adicionar tratamento de erro no loop de exclusao de auth users. Se `deleteUser` falhar, logar o erro mas nao interromper o fluxo. Tambem adicionar tabelas que possam estar faltando na lista de exclusao (ex: `vendas_pdv`, `itens_venda_pdv`, `caixa_diario`).

### Resultado

- Login com conta excluida → erro "Esta conta nao esta vinculada a nenhuma oficina" na propria tela de login
- Login com credenciais invalidas → erro "E-mail ou senha invalidos" (ja funciona)
- Login normal → dashboard (ja funciona)

### Arquivos alterados
- `src/components/layout/AuthProvider.tsx`
- `src/pages/LoginPage.tsx`
- `supabase/functions/admin-delete-tenant/index.ts`

