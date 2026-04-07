

## Plano: Corrigir Edge Function + Adicionar Configuracao de Precos no Painel Admin

### Problema 1 — Edge Function falhando

O erro "Failed to send a request to the Edge Function" indica que a function `admin-create-tenant` nao esta sendo encontrada ou os headers CORS estao incompletos. O header `Access-Control-Allow-Headers` atual nao inclui todos os headers que o client Supabase envia (faltam `x-supabase-client-platform`, etc.).

**Correcao em `supabase/functions/admin-create-tenant/index.ts`:**
- Atualizar CORS headers para incluir todos os headers necessarios do Supabase client
- Tambem garantir que `supabase/config.toml` tenha a funcao configurada se necessario

```
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type,
  x-supabase-client-platform, x-supabase-client-platform-version,
  x-supabase-client-runtime, x-supabase-client-runtime-version
```

**Nota importante:** Se a function ainda nao foi deployada no Supabase, voce precisa fazer o deploy manualmente pelo dashboard do Supabase ou CLI. O arquivo existe no codigo mas precisa estar rodando no servidor.

---

### Problema 2 — Configuracao de precos no painel admin

Hoje o sistema nao tem onde configurar o valor cobrado. Voce quer poder definir:
- Valor mensal (ex: R$ 19,90)
- Opcao anual com desconto (ex: 10% de desconto)
- Poder alterar esses valores no futuro

**Nova secao "Configuracoes do Sistema" no painel admin (`AdminPanelPage.tsx`):**
- Card/secao abaixo dos resumos com:
  - Campo "Valor mensal" (input monetario, padrao R$ 19,90)
  - Toggle "Oferecer plano anual"
  - Campo "Desconto anual (%)" (padrao 10%)
  - Valor anual calculado automaticamente (ex: R$ 19,90 x 12 = R$ 238,80 - 10% = R$ 214,92)
  - Botao "Salvar"

**Armazenamento:** Esses valores ficam em `localStorage` do master por enquanto (nao precisa de tabela nova). Quando integrar pagamento Pix futuramente, migra para o banco.

**Novo componente `src/components/admin/AdminConfigPrecos.tsx`:**
- Campos editaveis com preview do valor final
- Calculo automatico do anual com desconto
- Visual escuro consistente com o painel

**Exibicao na tabela de oficinas:**
- Coluna "Valor" mostrando o valor mensal configurado (ou "Anual" se aplicavel)
- No card de resumo, adicionar "Receita estimada" = oficinas ativas x valor mensal

### Arquivos alterados
- `supabase/functions/admin-create-tenant/index.ts` — fix CORS
- `src/components/admin/AdminConfigPrecos.tsx` — novo componente de precos
- `src/pages/AdminPanelPage.tsx` — incluir secao de precos
- `src/components/admin/AdminResumoCards.tsx` — adicionar receita estimada

