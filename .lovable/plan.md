

## Plano: Corrigir emojis e texto das mensagens WhatsApp

### Problemas
1. Emojis como 💳, ✅, 🔧, 😊 aparecem como "�" em alguns dispositivos quando enviados via URL do WhatsApp
2. Texto "Responda *SIM* para confirmar!" é desnecessário — basta "Gostaria de aprovar o orçamento?"

### Correções

**`src/components/os/detalhe/OrcamentoPreviewDialog.tsx`** (mensagem de orçamento)
- Linha 31: trocar `💳 *Formas de pagamento:*` por `*Formas de pagamento:*`
- Linha 33: trocar `Gostaria de aprovar o orçamento? Responda *SIM* para confirmar! ✅` por `Gostaria de aprovar o orçamento?`

**`src/components/os/detalhe/OSDetalheHeader.tsx`** (mensagem de "pronto")
- Linha 62: remover emojis 🔧✅ e 😊 da mensagem de retirada

**`src/components/os/detalhe/OSProximoPasso.tsx`** (mensagem de "pronto" alternativa)
- Linha 61: manter texto limpo, sem emojis problemáticos

**`src/components/os/detalhe/OSAcoesMenu.tsx`** (menu de ações)
- Linhas 72-74: mesma limpeza de emojis se houver

### Preview do resultado (orçamento)
```
*Motoca*
Orçamento OS-15
Veículo: Moto

*Serviços:*
• Troca de Correia — R$ 65,00

*TOTAL: R$ 65,00*

*Formas de pagamento:*
• Pix / Dinheiro: R$ 65,00

Gostaria de aprovar o orçamento?
```

