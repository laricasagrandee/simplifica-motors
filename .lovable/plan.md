

# Gerar HTML do Template de E-mail de Recuperacao de Senha

## O que sera feito

Gerar um arquivo HTML pronto para colar no Supabase Dashboard (Authentication > Email Templates > Reset Password), com a identidade visual do Facilita Motors.

## Identidade visual extraida

- **Cor primaria (botao):** `hsl(160, 40%, 30%)` (verde escuro)
- **Cor do texto:** `hsl(228, 45%, 16%)` (azul escuro)
- **Cor texto secundario:** `hsl(228, 14%, 45%)`
- **Fundo:** branco `#ffffff`
- **Border radius:** `0.75rem` (12px)
- **Fontes:** Plus Jakarta Sans (titulos), Nunito Sans (corpo)

## Template incluira

1. Logo "Facilita Motors" em texto estilizado (verde + escuro)
2. Titulo "Redefinir sua senha"
3. Texto explicativo em portugues
4. Botao com a variavel `{{ .ConfirmationURL }}`
5. Texto de fallback com link direto
6. Rodape com "Facilita Motors - Sistema de Gestao"
7. Design responsivo, clean, profissional

## Entrega

- Arquivo HTML salvo em `/mnt/documents/template-recuperar-senha.html`
- Instrucoes de onde colar no Supabase

