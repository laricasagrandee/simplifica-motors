

## Plano: Avisos pre-vencimento + tenant filter

### Arquivos alterados
- `src/hooks/usePlanos.ts`
- `src/components/layout/BloqueioAviso.tsx`
- `src/components/layout/BloqueioProvider.tsx`

### Logica de avisos pre-vencimento em `usePlanos.ts`

Adicionar `useTenantId()` para filtrar por tenant. Na query, usar `.eq('tenant_id', tenantId)` quando tenantId existe.

Buscar tambem o campo `plano` para saber se e teste.

Nova logica antes do retorno "sem aviso" quando `diff >= 0`:

**Plano teste** — aviso TODOS os dias:
- `diff >= 1`: info azul — "Seu teste gratis acaba em X dias. Entre em contato para ativar seu plano."
- `diff === 0`: suave amarelo — "Seu teste gratis acaba hoje! Entre em contato para ativar seu plano."

**Plano pago** — aviso so nos ultimos 7 dias:
- `diff <= 7 && diff >= 1`: info azul — "Seu acesso vence em X dias. Considere renovar."
- `diff === 0`: suave amarelo — "Seu acesso vence hoje. Renove para nao perder o acesso."

Pos-vencimento continua igual (tolerancia 1-5, 6-10, 11-15, 16+ bloqueio).

Adicionar campo `emPreAviso: boolean` no retorno de `BloqueioInfo`.

### BloqueioAviso.tsx

Adicionar nivel `info`:
- Fundo azul claro (`bg-blue-50 border-blue-200`)
- Icone azul (`text-blue-500`)
- Texto azul (`text-blue-700`)
- Sem animate-pulse

### BloqueioProvider.tsx

Mostrar `BloqueioAviso` quando `emTolerancia || emPreAviso`. Passar o nivel e mensagem vindos do hook.

### Resultado

| Situacao | Banner |
|----------|--------|
| Teste, faltam 29 dias | Azul: "Seu teste gratis acaba em 29 dias..." |
| Teste, faltam 1 dia | Azul: "Seu teste gratis acaba em 1 dia..." |
| Teste, vence hoje | Amarelo: "Seu teste gratis acaba hoje!" |
| Pago, faltam 7 dias | Azul: "Seu acesso vence em 7 dias" |
| Pago, vence hoje | Amarelo: "Seu acesso vence hoje" |
| Venceu 1-5 dias | Amarelo (existente) |
| Venceu 6-10 dias | Laranja (existente) |
| Venceu 11-15 dias | Vermelho pulsante (existente) |
| Venceu 16+ dias | Tela bloqueio (existente) |

