

## Plano: Simplificar para plano unico sem limite de funcionarios + avisos graduais

### O que muda

O modelo de negocio e mais simples do que foi implementado: nao existem planos diferentes. Toda oficina paga o mesmo valor. Nao existe limite de funcionarios. O que muda e so o vencimento e os avisos antes do bloqueio.

### Logica de avisos e bloqueio (apos vencimento)

- **Dias 1-5 apos vencimento**: Aviso suave - "Sua assinatura venceu. Renove para continuar usando sem interrupcoes."
- **Dias 6-10 apos vencimento**: Aviso forte - "Seu acesso sera bloqueado em breve. Entre em contato para renovar."
- **Dia 11-15 apos vencimento**: Aviso urgente - "Ultimo aviso! Seu acesso sera bloqueado em X dias."
- **Apos 15 dias**: Bloqueio total com tela de contato WhatsApp

### Arquivos alterados

**1. `src/hooks/useAdminOficinas.ts`**
- Remover `PLANOS_CONFIG` com multiplos planos
- Manter apenas: `{ label: 'Facilita Motors', preco: 199, maxFunc: 999 }`
- Remover `PLANOS_PRECO`
- Simplificar `calcularStatus`: ativo, aviso, bloqueado (sem teste_ativo/teste_expirado separados)

**2. `src/components/admin/NovaOficinaDialog.tsx`**
- Remover secao "Tipo de Ativacao" (teste vs pago)
- Remover dropdown de planos
- Manter: dados da oficina + dados do responsavel + campo de vencimento (padrao +30 dias)
- Criar sempre com `plano: 'padrao'`, `plano_ativo: true`, `max_funcionarios: 999`, `dias_tolerancia: 15`

**3. `src/components/admin/AtivarPlanoDialog.tsx`**
- Remover dropdown de planos
- Simplificar: so campo de nova data de vencimento + botao "Renovar"

**4. `src/components/admin/EditarOficinaDialog.tsx`**
- Remover dropdown de plano
- Remover campo max_funcionarios
- Manter: nome, cnpj, telefone, vencimento, ativo toggle

**5. `src/components/admin/OficinasTable.tsx`**
- Remover coluna "Plano" (nao tem mais variacao)
- Ajustar badges de status

**6. `src/hooks/usePlanos.ts` — `useVerificarBloqueio`**
- Reescrever logica de tolerancia com 3 niveis:
  - 1-5 dias: `{ emTolerancia: true, nivel: 'suave', mensagem: "..." }`
  - 6-10 dias: `{ emTolerancia: true, nivel: 'forte', mensagem: "..." }`
  - 11-15 dias: `{ emTolerancia: true, nivel: 'urgente', mensagem: "..." }`
  - 15+: `{ bloqueado: true }`

**7. `src/components/layout/BloqueioAviso.tsx`**
- Estilizar por nivel: suave (amarelo), forte (laranja), urgente (vermelho pulsante)
- Mensagens nao agressivas mas claras

**8. `src/components/layout/BloqueioScreen.tsx`**
- Remover logica de teste vs pago (tudo igual agora)
- Mensagem unica: "Seu acesso foi suspenso por pendencia financeira. Entre em contato para regularizar."

**9. `src/components/admin/AdminResumoCards.tsx`**
- Remover card de "Receita estimada" (nao faz sentido com plano unico sem valores vistos)
- Ou simplificar para mostrar: Total oficinas, Ativas, Em aviso, Bloqueadas

**10. `supabase/functions/admin-create-tenant/index.ts`**
- Remover parametros de plano variavel
- Sempre criar com `plano: 'padrao'`, `max_funcionarios: 999`, `dias_tolerancia: 15`

