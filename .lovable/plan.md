

## Plano: Ajustar parcela mínima no pagamento

### Problema
Com `PARCELA_MINIMA = 50`, um serviço de R$ 65 só mostra 1x. Na prática, oficinas aceitam parcelas menores.

### Correção

**`src/components/os/detalhe/pagamento/PagamentoParcelado.tsx`**
- Linha 11: alterar `PARCELA_MINIMA` de `50` para `20`
- Isso permite que R$ 65 mostre até 3x (R$ 21,67)

Mesma lógica, um único número mudado.

