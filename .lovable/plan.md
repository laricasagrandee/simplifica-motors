
## Plano: Evolução de UX — Login, Licença, Mobile e Onboarding

### Escopo

Melhorar a experiência do usuário em 8 áreas, sem alterar a arquitetura local-first (Electron/Tauri, SQLite, servidor local). Supabase continua apenas para auth, licença e registro.

---

### 1. Login Mobile — Corrigir teclado e layout

**Problema**: Teclado cobre campo de senha, inputs difíceis de clicar no mobile.

**Solução** (`src/pages/LoginPage.tsx` + `src/components/auth/LoginForm.tsx`):
- Adicionar `min-h-[100dvh]` em vez de `min-h-screen` (respeita viewport dinâmico do mobile)
- Inputs com `h-12` (48px — touch target mínimo)
- Formulário com `pb-safe` e scroll automático via CSS `scroll-margin`
- Botão de login sempre visível com `sticky bottom-0`
- Meta viewport já existe, garantir `interactive-widget=resizes-content`

### 2. Login Desktop — Painel hero + teste grátis

**Arquivo**: `src/pages/LoginPage.tsx`, `src/components/auth/LoginHeroPanel.tsx`

- Manter layout split (hero esquerda, form direita) no desktop
- No mobile: esconder hero, mostrar só o form
- Adicionar badge "30 dias grátis" abaixo do logo no mobile
- Adicionar link "Criar conta" no form (aponta para registro futuro ou WhatsApp)
- Texto "Teste grátis por 30 dias" visível em ambos

### 3. Botão "Baixar versão para computador" no mobile

**Arquivo**: `src/components/auth/LoginForm.tsx`

- Detectar mobile via `useDeviceType()` do módulo device
- Mostrar link: "💻 Baixar versão para computador"
- Redireciona para Google Drive (URL configurável em constants)
- Instrução: "Instale no computador e use o mesmo e-mail"

### 4. Recuperação de senha — Já existe!

**Já implementado**: `src/pages/RecuperarSenhaPage.tsx` + `useRecuperarSenha()` + link "Esqueci minha senha" no `LoginForm.tsx`.

**Falta apenas**: Criar a página `/reset-password` para o usuário definir a nova senha após clicar no link do e-mail.

**Arquivo novo**: `src/pages/ResetPasswordPage.tsx`
- Detectar token de recovery na URL
- Form com nova senha + confirmação
- Chamar `supabase.auth.updateUser({ password })`
- Redirecionar para `/login` com mensagem de sucesso

**Rota**: Adicionar em `App.tsx`: `<Route path="/reset-password" element={<ResetPasswordPage />} />`

### 5. Avisos de vencimento — Já implementados!

**Já funciona** em `usePlanos.ts` + `BloqueioAviso.tsx` + `BloqueioProvider.tsx`:
- Teste: aviso todos os dias com countdown
- Pago: aviso nos últimos 7 dias
- Tolerância de 15 dias pós-vencimento (suave → forte → urgente)
- Bloqueio total após 15 dias

**Melhoria**: Adicionar marcos específicos solicitados (10, 7, 3, 1 dia):
- Ajustar `usePlanos.ts` para usar níveis: `info` (10+ dias), `suave` (7 dias), `forte` (3 dias), `urgente` (1 dia/hoje)
- Já está parcialmente assim, ajustar thresholds para plano pago

### 6. Tela de bloqueio — Já existe!

`BloqueioScreen.tsx` já mostra:
- Mensagem "Acesso suspenso"
- Botão WhatsApp com número correto (5548999385829)

**Melhoria**: Adicionar espaço para "botão de pagamento futuro" (placeholder desabilitado ou seção visual).

### 7. Conta deletada — Já tratada!

AuthProvider já faz logout silencioso com erro genérico "E-mail ou senha inválidos" para contas órfãs. Não mostra "Acesso não disponível" para contas deletadas. ✅

### 8. Escolha de modo de uso (pós-login)

**Arquivo novo**: `src/pages/EscolhaModoPage.tsx`

Tela simples pós-login (primeira vez):
- "Só celular" → salva modo, vai pro dashboard
- "Só computador" → salva modo, vai pro dashboard  
- "Computador + Celular" → explica conexão Wi-Fi, salva modo

Usa `useDeviceMode()` do módulo device.
Modo salvo em `localStorage` (já implementado em `deviceService.ts`).
Se já escolheu antes, pula direto.

**Rota**: `/escolha-modo` — mostrar após primeiro login quando `getDeviceMode() === null`

---

### Arquivos alterados/criados

| Arquivo | Ação |
|---------|------|
| `src/pages/LoginPage.tsx` | Alterar — mobile-first, badge teste grátis |
| `src/components/auth/LoginForm.tsx` | Alterar — inputs maiores, link download desktop |
| `src/components/auth/LoginHeroPanel.tsx` | Alterar — adicionar texto teste grátis |
| `src/pages/ResetPasswordPage.tsx` | **Criar** — redefinir senha |
| `src/pages/EscolhaModoPage.tsx` | **Criar** — escolha de modo |
| `src/App.tsx` | Alterar — adicionar rotas |
| `src/hooks/usePlanos.ts` | Alterar — thresholds de aviso para plano pago |
| `src/components/layout/BloqueioScreen.tsx` | Alterar — placeholder pagamento futuro |
| `src/components/layout/AuthProvider.tsx` | Alterar — redirecionar para escolha de modo na 1ª vez |
| `src/lib/constants.ts` | Alterar — adicionar URL download desktop |
| `index.html` | Alterar — meta viewport com interactive-widget |

### Resultado

- Login mobile com teclado funcionando corretamente
- Teste grátis visível e claro
- Recuperação de senha completa (faltava só a página de reset)
- Botão de download do desktop no mobile
- Escolha de modo de uso após primeiro login
- Avisos de vencimento com marcos em 10/7/3/1 dias
- Tela de bloqueio com placeholder para pagamento futuro
- Tudo sem quebrar arquitetura local-first
