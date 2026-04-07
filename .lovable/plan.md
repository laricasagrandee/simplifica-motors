

## Plano: Multi-tenant — Separar dados por oficina

Este e o maior refactor do projeto. Cada oficina so vera seus proprios dados. O plano esta dividido em etapas claras.

---

### ETAPA 1 — Migracao SQL (voce roda manualmente no Supabase)

Gero um arquivo SQL que voce cola no SQL Editor do Supabase. Ele faz:

1. **Adiciona coluna `tenant_id` (uuid, nullable, FK para configuracoes.id)** nas tabelas:
   - clientes, motos, ordens_servico, os_itens, os_fotos, os_pagamentos, os_tempo_servico
   - pecas, movimentacoes, caixa, vendas_pdv, vendas_pdv_itens, notas_fiscais
   - estoque_movimentacoes, agendamentos, inventarios, inventario_itens
   - metas_mecanico, funcionarios

2. **Preenche dados existentes**: seta o tenant_id de todos os registros atuais com o ID da primeira configuracao existente

3. **Cria indice** em cada tabela no campo tenant_id para performance

Nao adiciona em: `configuracoes` (ela E o tenant), `audit_log` (log global)

---

### ETAPA 2 — Hook `useTenantId` + AuthContext

**Arquivo novo: `src/hooks/useTenantId.ts`**
- Exporta `useTenantId()` que le o tenant_id do funcionario logado via AuthContext

**Editar `src/types/database.ts`**
- Adiciona `tenant_id?: string | null` nos tipos: Funcionario, Cliente, Peca, OrdemServico, Movimentacao, Caixa, VendaPDV, NotaFiscal, etc.

**Editar `src/components/layout/AuthProvider.tsx`**
- Adiciona `tenantId: string | null` no AuthContextType
- Apos buscar o funcionario, extrai `funcionario.tenant_id` e expoe no contexto
- Se funcionario existe mas nao tem tenant_id, mostra tela "Aguardando liberacao"

---

### ETAPA 3 — Filtrar TODAS as queries

Crio helpers centrais:

```typescript
// src/lib/tenantHelper.ts
export function addTenantFilter(query, tenantId) {
  return tenantId ? query.eq('tenant_id', tenantId) : query;
}
```

Edito **todos os ~40 hooks** para:
- **SELECTs**: adicionar `.eq('tenant_id', tenantId)` 
- **INSERTs**: adicionar `tenant_id` no payload

Hooks afetados (agrupados):

| Grupo | Hooks |
|-------|-------|
| Clientes | useClientes, useClienteOS, useAniversariantes |
| Veiculos | useVeiculos, useMotos, useHistoricoVeiculo |
| OS | useOS, useOSDetalhe, useOSItens, useOSFotos, useOSPagamentos, useOSChecklist, useTempoServico |
| Pecas | usePecas, useEstoque, useInventario, useEtiquetas, useCategoriasPecas |
| Financeiro | useFinanceiro, useMovimentacoes, useCaixa, useCaixaStatus, useContasPagar, useContasReceber, useFinanceiroCharts |
| PDV | usePDV |
| NF | useNF, useNFCompleta |
| Funcionarios | useFuncionarios, useComissao, useMetas |
| Agendamentos | useAgendamentos |
| Dashboard | useDashboardMetrics, useDashboardCharts, useDashboardOS, useDashboardStats, useDashboardAlertas, useDashboardRanking, useDashboardExtras |
| Relatorios | useRelatorios, useRelatorioAvancado, useRelatorioRecusas, useCMV, useDRE |
| Config | useConfiguracoes (busca por tenant_id em vez de .limit(1)) |

**Padrao em cada hook:**
```typescript
const tenantId = useTenantId();
// SELECT: query.eq('tenant_id', tenantId)
// INSERT: { ...data, tenant_id: tenantId }
```

---

### ETAPA 4 — Edge Function `admin-create-tenant`

Editar `supabase/functions/admin-create-tenant/index.ts`:
- Apos criar `configuracoes` e obter `config.id`, usar esse ID como `tenant_id` no insert de `funcionarios`

```typescript
await adminClient.from("funcionarios").insert({
  ...dados,
  tenant_id: config.id  // vincula funcionario a oficina
});
```

---

### ETAPA 5 — Prompt 2 (Painel Master melhorado)

Apos multi-tenant funcionando:
- Tipo de acesso na criacao (teste gratis vs pago com periodos)
- Botoes de renovacao na edicao e na tabela
- Cores de vencimento na tabela

---

### Ordem de execucao

1. Gero o SQL da migracao — voce roda no Supabase
2. Atualizo types em `database.ts`
3. Crio `useTenantId` hook + atualizo AuthProvider
4. Crio `tenantHelper.ts`
5. Edito todos os hooks (maior volume de trabalho)
6. Atualizo Edge Function
7. Testa: cria 2 oficinas, loga em cada, confirma isolamento

### Observacao importante

Como o `tenant_id` comeca nullable, o sistema continua funcionando durante a migracao. Depois de tudo pronto e testado, pode-se tornar NOT NULL com um segundo SQL.

