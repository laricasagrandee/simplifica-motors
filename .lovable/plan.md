

## Plano: Melhorar tela de usuario sem acesso

### Problema

Quando o usuario faz login com credenciais corretas mas nao tem registro de `funcionario` (ex: oficina foi excluida), ele cai na tela "Aguardando liberacao" que e confusa — parece um erro.

### Solucao

Melhorar a pagina `AguardandoAprovacaoPage` para ser mais clara e ter um botao "Voltar ao Login" em vez de so "Sair". Tambem mudar o texto para distinguir entre "conta nao vinculada" e dar instrucoes claras.

### Mudancas

**`src/pages/AguardandoAprovacaoPage.tsx`**

- Titulo: "Acesso nao disponivel"
- Texto: "Sua conta nao esta vinculada a nenhuma oficina ativa. Se voce acredita que isso e um erro, entre em contato com o suporte."
- Botao "Sair" renomeado para "Voltar ao Login"
- Manter botao WhatsApp

### Arquivo alterado
- `src/pages/AguardandoAprovacaoPage.tsx`

