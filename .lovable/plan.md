

## Plano: Corrigir redirecionamento do Master e bloqueio indevido

### Problemas identificados

**Problema 1 — Master email carrega como cliente normal no primeiro acesso**
No `AuthProvider.tsx`, o redirect para `/admin` só acontece no evento `SIGNED_IN`. Quando a página recarrega (F5), o evento disparado é `INITIAL_SESSION`, não `SIGNED_IN`. Então o master fica preso dentro do `AuthProvider`, que tenta buscar um `funcionario` — como não tem, a permissão falha e mostra "Acesso Restrito".

**Problema 2 — Master email entra no AuthProvider quando não deveria**
A rota `/dashboard` está dentro do `AuthProvider` (linha 68 do App.tsx). O master email navega inicialmente para `/dashboard` antes do redirect acontecer. O `AuthProvider` busca `funcionario`, não encontra, e o `ProtectedRoute` bloqueia.

### Correções

**`src/components/layout/AuthProvider.tsx`**
1. Após setar o usuário no `onAuthStateChange`, verificar se é MASTER_EMAIL **em qualquer evento** (não só `SIGNED_IN`) e redirecionar para `/admin`
2. Se o usuário logado for MASTER_EMAIL, não renderizar os children — mostrar loading e redirecionar

```
// No onAuthStateChange, após setUsuario:
if (session?.user.email === MASTER_EMAIL) {
  navigate('/admin', { replace: true });
  return;
}
```

3. Após o `if (loading)` e `if (!usuario)`, adicionar:
```
if (usuario.email === MASTER_EMAIL) {
  // Redireciona e não renderiza o sistema da oficina
  return <AuthLoadingScreen />;
}
```

**`src/App.tsx`** — `RootRedirect`
- Verificar sessão e redirecionar master para `/admin` em vez de `/dashboard`

### Resultado
- Master email: login vai direto para `/admin`, sem piscar "Acesso Restrito"
- F5 no master: detecta e redireciona imediatamente
- Cliente normal: continua funcionando igual

### Arquivos editados
- `src/components/layout/AuthProvider.tsx`
- `src/App.tsx` (ajuste no RootRedirect)

