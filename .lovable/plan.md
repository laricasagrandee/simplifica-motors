

# Plano: Página de Vendas Pública (Landing Page)

## Objetivo
Criar uma landing page pública acessível em `/vendas` (ou `/`) que apresente o FacilitaMotors, seus benefícios, planos e preços, e permita que visitantes (sem login) iniciem o checkout do Stripe diretamente ou criem uma conta com teste grátis.

## O que será construído

### 1. Nova página `src/pages/VendasPage.tsx`
Landing page completa com as seguintes seções:
- **Hero**: Logo FacilitaMotors + headline + CTA (criar conta grátis / ver planos)
- **Benefícios**: Cards com ícones mostrando as funcionalidades (OS, PDV, Financeiro, Relatórios, Estoque, Agendamentos)
- **Planos e Preços**: Reutiliza a lógica de `usePlanoPrecos` para buscar preços dinâmicos da tabela `plano_precos`. Toggle mensal/anual. Botão "Assinar" redireciona para o Stripe Checkout
- **Depoimentos**: Seção com depoimentos de clientes
- **FAQ**: Perguntas frequentes (reutiliza `PlanosFAQ` ou similar)
- **Footer**: Links, WhatsApp de suporte

### 2. Checkout sem autenticação
O `create-checkout` atual exige autenticação. Para visitantes da landing page, dois caminhos:
- **Opção A (recomendada)**: Botão "Assinar" redireciona para `/criar-conta` com parâmetro do plano selecionado (`/criar-conta?plano=profissional&intervalo=mensal`). Após criar conta, o sistema abre o checkout automaticamente.
- **Opção B**: Botão "Começar grátis" redireciona direto para `/criar-conta`.

### 3. Rota pública no `App.tsx`
Adicionar rota `/vendas` fora do `AuthProvider` (pública, sem login). Opcionalmente redirecionar `/` para `/vendas` quando não autenticado.

### 4. Ajuste no fluxo pós-criação de conta
Modificar `CriarContaPage` para ler query params `plano` e `intervalo`. Se presentes, após criar conta e logar, chamar `create-checkout` automaticamente para levar o usuário ao pagamento.

## Detalhes Técnicos

**Arquivos a criar:**
- `src/pages/VendasPage.tsx` — Landing page completa com hero, benefícios, planos, FAQ

**Arquivos a modificar:**
- `src/App.tsx` — Adicionar rota `/vendas` (pública)
- `src/pages/CriarContaPage.tsx` — Ler params de plano e disparar checkout pós-registro

**Sem alterações no banco de dados** — os preços já estão na tabela `plano_precos` e são lidos pelo hook `usePlanoPrecos`.

**Sem alterações nas Edge Functions** — o checkout continua sendo feito após autenticação.

