
## Plano: Remover parcelamento da mensagem WhatsApp

### Problema
A mensagem enviada pelo WhatsApp inclui as opções de parcelamento (2x, 3x, etc.), mas o usuário quer que isso apareça apenas no preview dentro do app — no WhatsApp, basta mostrar o total à vista.

### Correção

**`src/components/os/detalhe/OrcamentoPreviewDialog.tsx`**
- Linha 32: remover a linha que adiciona `• Nx de R$ X no cartão` à mensagem do WhatsApp
- O preview visual dentro do dialog continua mostrando as opções de parcelamento normalmente (linhas 89-96 não mudam)

Uma única linha removida.
