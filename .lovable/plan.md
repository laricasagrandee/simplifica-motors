

## Plano: Corrigir fluxo de login com conta excluida

### Problema

Dois bugs:

1. **ProtectedRoute bloqueia antes de AppLayout**: Quando o usuario loga mas nao tem `funcionario`, `cargo` e `undefined`, `temPermissao()` retorna `false`, e ProtectedRoute mostra "Acesso Restrito". Mas deveria deixar passar para o AppLayout mostrar "Acesso nao disponivel" (com botao WhatsApp + Voltar ao Login).

2. **Auth users podem nao estar sendo deletados**: A edge function `admin-delete-tenant` deleta auth users no final, mas se algum erro silencioso ocorre, o usuario continua conseguindo logar.

### Mudancas

**1. `src/components/shared/ProtectedRoute.tsx`**

Adicionar check: se `funcionario` e `null` (nao apenas loading), nao bloquear — deixar children renderizar. O AppLayout vai capturar esse caso e mostrar a tela correta.

```typescript
const { temPermissao, funcionarioLoading, funcionario } = useAuthContext();

if (funcionarioLoading) return <>{children}</>;

// Se nao tem funcionario, deixa AppLayout lidar (mostra AguardandoAprovacao)
if (!funcionario) return <>{children}</>;

if (!temPermissao(permissao)) {
  return <AccessDenied />;
}
```

**2. `src/components/layout/AuthProvider.tsx`** — expor `funcionario` no contexto (ja expoe, ok)

### Resultado

- Login com conta excluida (se auth user ainda existe) → tela "Acesso nao disponivel" com botao WhatsApp
- Login com credenciais invalidas → erro "E-mail ou senha invalidos" (ja funciona)
- Login normal com funcionario → dashboard (ja funciona)
- Funcionario sem permissao para rota → "Acesso Restrito" (ja funciona)

### Arquivo alterado
- `src/components/shared/ProtectedRoute.tsx`

