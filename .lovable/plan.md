

## Problema

1. **"Enviar Orçamento" não abre WhatsApp**: O botão "Enviar Orçamento" no header apenas muda o status para `em_orcamento`, mas não abre o WhatsApp. O preview do WhatsApp só aparece depois, quando o status já mudou. O usuário espera que ao enviar o orçamento, o WhatsApp já abra com a mensagem formatada.

2. **"Serviço Pronto" não avisa o cliente**: Quando muda para `concluida`, não abre automaticamente o WhatsApp avisando que o veículo está pronto.

## Plano

### 1. "Enviar Orçamento" abre o preview do WhatsApp automaticamente

**Arquivo: `src/components/os/detalhe/OSDetalheHeader.tsx`**
- Após mudar o status para `em_orcamento` com sucesso, abrir automaticamente o `OrcamentoPreviewDialog` (o mesmo que já existe)
- Adicionar state para controlar o dialog e importar o componente
- Precisará receber `itens` e `nomeOficina` como props (ou buscar via hooks)

**Arquivo: `src/components/os/detalhe/OSDetalheTabs.tsx`**
- Alternativamente, fazer a lógica no `OSDetalheTabs` que já tem acesso aos itens e config: ao detectar que `onMudarStatus` foi chamado com `em_orcamento`, abrir o preview do orçamento automaticamente após a transição

**Abordagem escolhida**: Modificar `OSDetalheTabs.tsx` — ao chamar `handleStatus('em_orcamento')`, após sucesso, abrir o `OrcamentoPreviewDialog`. Importar o dialog, adicionar estado `orcamentoPreviewOpen`, e no `handleStatus` verificar se o novo status é `em_orcamento` para abrir o preview.

### 2. "Serviço Pronto" abre WhatsApp de aviso automaticamente

**Arquivo: `src/components/os/detalhe/OSDetalheTabs.tsx`**
- No `handleStatus`, quando o status muda para `concluida`, abrir automaticamente o WhatsApp com a mensagem "Seu veículo está pronto para retirada"
- Usar `window.open` com a URL do WhatsApp formatada (mesma lógica que já existe no `OSProximoPasso`)
- Só abre se o cliente tiver telefone cadastrado

### Resumo técnico

| Arquivo | Mudança |
|---------|---------|
| `src/components/os/detalhe/OSDetalheTabs.tsx` | Adicionar estado `orcamentoPreviewOpen`, importar `OrcamentoPreviewDialog`. No `handleStatus`: se status=`em_orcamento` → abrir preview; se status=`concluida` → abrir WhatsApp de aviso |
| `src/components/os/detalhe/OrcamentoPreviewDialog.tsx` | Sem mudanças |
| `src/components/os/detalhe/OSDetalheHeader.tsx` | Sem mudanças |

