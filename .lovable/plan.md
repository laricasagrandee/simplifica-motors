

## Dois problemas encontrados

### 1. Veículo aparece vazio na mensagem do WhatsApp

**Causa**: A mensagem monta `[veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' ')`. Na OS rápida, marca/modelo/placa são strings vazias `''`, que passam pelo `filter(Boolean)` e somem. Resultado: "Veículo: " sem nada.

**Correção**: Adicionar fallback para `tipo_veiculo` (`Moto` ou `Carro`) quando marca/modelo/placa estão vazios.

**Arquivo**: `src/components/os/detalhe/OrcamentoPreviewDialog.tsx`
- Linha 24: trocar o trecho de montagem do veículo para usar fallback:
  ```
  const veiculoLabel = [veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean).join(' ')
    || (veiculo.tipo_veiculo === 'carro' ? 'Carro' : 'Moto');
  ```
- Aplicar o mesmo fallback na linha 52 (preview visual)

### 2. Sininho de notificações sempre mostra alertas (nunca "limpa")

**Causa**: As mensagens de alerta contêm texto dinâmico como "há **4** dias", "há **5** dias". A chave de dismiss é `tipo:mensagem`. Quando o dia muda ou os dados refrescam, a mensagem muda (ex: "há 3 dias" vira "há 4 dias"), a chave antiga não bate mais, e o alerta reaparece como novo. Isso faz o badge mostrar notificações perpetuamente.

**Correção**: Usar uma chave estável que não dependa do texto da mensagem. Adicionar um campo `id` ao tipo `Alerta` baseado em dados fixos (ex: `estoque:id-da-peca`, `os_atrasada:numero-da-os`).

**Arquivos**:

`src/hooks/useDashboardAlertas.ts`
- Adicionar campo `id` ao tipo `Alerta`
- Em cada push de alerta, gerar um id estável:
  - Estoque: `estoque:${p.nome}`
  - OS atrasada: `os_atrasada:${os.numero}`
  - Execução longa: `execucao_longa:${os.numero}`
  - Orçamento pendente: `orcamento_pendente:${os.numero}`
  - Aguardando retirada: `aguardando_retirada:${os.numero}`
  - Pagamento: `pagamento:${m.descricao}`
  - Aniversário: `aniversario:${c.nome}`
  - Garantia: `garantia:${g.numero}`

`src/components/shared/NotificacoesBadge.tsx`
- Trocar `getAlertKey` para usar `alerta.id` em vez de `${alerta.tipo}:${alerta.mensagem}`
- Resto da lógica (localStorage, dismiss, sync) continua igual

### Resultado
- Mensagem do WhatsApp mostra "Moto" ou "Carro" quando o veículo não tem dados detalhados
- Notificações marcadas como lidas não reaparecem no dia seguinte só porque o texto "há X dias" mudou

