
## Plano: deixar a quantidade de parcelas digitável e calcular com taxa repassada

### O que está errado hoje
- A tela de pagamento da OS está travada em botões prontos de parcelas.
- O valor mostrado por parcela é só `total / parcelas`, sem repassar a taxa configurada.
- Isso não segue o que você definiu em Configurações > Taxas de Parcelamento.

### Como vou ajustar

**1. Trocar a escolha fixa de parcelas por entrada digitável**
- Arquivo: `src/components/os/detalhe/pagamento/PagamentoParcelado.tsx`
- Em vez dos cards 1x, 2x, 3x...
- Colocar um campo para digitar a quantidade de parcelas
- Limitar entre 1 e 12
- Continuar mostrando o valor por parcela calculado em tempo real

**2. Calcular o valor com repasse da taxa ao cliente**
- Arquivo principal: `src/components/os/detalhe/pagamento/PagamentoEntradaForm.tsx`
- Buscar as configurações com `useConfiguracoes()`
- Quando a forma for `cartao_credito`:
  - `1x` usa `taxa_cartao_credito`
  - `2x a 12x` usa `taxas_parcelamento[parcelas]`
- Calcular:
  - taxa aplicada
  - total com acréscimo
  - valor de cada parcela
- Mostrar isso na tela antes de adicionar o pagamento

### Regra de cálculo
```text
valor base da OS = 150,00
taxa da configuração para 3x = 4,9%

total com repasse = 150,00 + 4,9%
parcela = total com repasse / 3
```

### Comportamento esperado
- Você digita, por exemplo, `10`
- O sistema lê a taxa configurada para `10x`
- Mostra o novo total com acréscimo
- Mostra `10x de R$ ...`
- Ao clicar em adicionar, salva o pagamento já com o valor final cobrado do cliente

### Arquivos envolvidos
- `src/components/os/detalhe/pagamento/PagamentoParcelado.tsx`
- `src/components/os/detalhe/pagamento/PagamentoEntradaForm.tsx`
- `src/hooks/useConfiguracoes.ts` apenas para consumo do hook existente
- Opcionalmente `src/components/os/detalhe/pagamento/PagamentosLista.tsx` para deixar mais claro o valor parcelado exibido na lista

### O que não muda
- A mensagem do WhatsApp continua sem exibir a quantidade de vezes
- O preview do orçamento pode continuar como está, se a ideia for mexer só na aba de pagamento
- Não precisa mudar banco nem migration: a tabela `os_pagamentos` já salva `parcelas` e `valor`

### Detalhe técnico importante
Hoje a finalização do pagamento usa o valor salvo em `os_pagamentos` para gerar movimentação financeira. Então, para repassar a taxa corretamente ao cliente sem quebrar o fluxo atual, o ideal é:
- salvar em `os_pagamentos.valor` o valor final cobrado do cliente
- manter `parcelas` preenchido
- continuar usando as taxas configuradas apenas para calcular a cobrança no front

Se quisermos ser mais corretos financeiramente no futuro, dá para separar:
- valor base da OS
- acréscimo da taxa
- valor líquido recebido
Mas para resolver seu pedido agora, não é obrigatório.

### Resultado final
Na aba Pagamento, em cartão de crédito:
- você escolhe crédito
- digita quantas vezes quiser entre 1 e 12
- o sistema usa a taxa cadastrada para aquela quantidade
- mostra o total corrigido e o valor de cada parcela
- adiciona o pagamento com esse valor já repassado ao cliente
