

## Plano: Adicionar botao de excluir oficina no painel Master

### Mudancas

**1. `src/hooks/useAdminOficinas.ts` — novo hook `useAdminExcluirOficina`**

Mutation que deleta o registro de `configuracoes` pelo id. O cascade do banco cuida de deletar funcionarios vinculados. Invalida query `admin-oficinas` no sucesso.

**2. `src/components/admin/OficinasTable.tsx` — botao de excluir + confirmacao**

- Adicionar icone `Trash2` na coluna Acoes (vermelho, ao lado do cadeado)
- Reutilizar o AlertDialog existente para confirmar: "Tem certeza que deseja EXCLUIR a oficina X? Esta acao e irreversivel. Todos os dados serao perdidos."
- Botao de confirmacao vermelho "Excluir permanentemente"

### Arquivos alterados
- `src/hooks/useAdminOficinas.ts`
- `src/components/admin/OficinasTable.tsx`

