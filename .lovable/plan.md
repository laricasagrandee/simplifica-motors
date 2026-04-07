
Problema identificado: o erro não é genérico de Edge Function; ele acontece especificamente no insert em `configuracoes` porque o campo `plano` está recebendo um valor que não bate com o `CHECK` do banco. O código atual mostrado no repo já usa `plano: "basico"` na function, então há dois cenários prováveis: a function publicada ainda está antiga, ou o projeto continua misturando o valor inválido `padrao` em outros fluxos e o modelo ficou inconsistente.

### O que eu implementaria

1. Centralizar os valores de plano permitidos
- Criar uma constante compartilhada no frontend com os slugs válidos do banco:
  - `teste`, `basico`, `profissional`, `premium`, `enterprise`
- Remover o uso de `padrao` como fallback visual ou valor salvo.

2. Corrigir a Edge Function `admin-create-tenant`
- Garantir que o insert em `configuracoes` use apenas um valor aceito pelo banco.
- Como seu fluxo comercial atual é teste grátis na criação, o ideal é usar `plano: "teste"` na criação da oficina nova.
- Adicionar validação explícita e mensagem melhor caso algum valor inválido seja enviado no futuro.

3. Corrigir outros pontos que ainda escrevem `padrao`
- `src/hooks/usePlanos.ts`: hoje o `useTrocarPlano` faz update com `plano: 'padrao'`; isso também quebrará no banco.
- `src/components/admin/AtivarPlanoDialog.tsx`: hoje a renovação também grava `plano: 'padrao'`.
- Ajustar esses fluxos para:
  - não trocar o plano ao renovar, ou
  - usar um valor válido já existente.
- Como você disse que hoje é plano único, a opção mais segura é renovar sem sobrescrever `plano`.

4. Corrigir fallbacks visuais do painel
- `src/components/admin/OficinasTable.tsx` usa fallback `padrao` para badge.
- Trocar por fallback seguro, como `teste` ou `basico`, apenas para exibição.
- Isso evita inconsistência visual e reduz risco de alguém copiar essa lógica para update/insert.

5. Alinhar telas que ainda assumem múltiplos planos
- `src/components/configuracoes/ConfigPlanoAtual.tsx`
- `src/components/planos/PlanosComparativo.tsx`
- `src/pages/PlanosPage.tsx`
- Se o produto agora é “plano único com teste + renovação”, simplificar essas telas para refletirem a regra atual ou pelo menos impedir updates com valores antigos/inválidos.

### Ordem de execução recomendada

1. Corrigir a Edge Function para `teste` ou outro valor aceito
2. Corrigir `usePlanos.ts` e `AtivarPlanoDialog.tsx` para nunca salvar `padrao`
3. Corrigir fallbacks de UI
4. Revisar as telas de plano para consistência do produto
5. Re-deploy da Edge Function e teste completo do fluxo “Nova Oficina”

### Resultado esperado
- Criar oficina deixa de falhar no insert de `configuracoes`
- Renovar oficina também deixa de correr risco de quebrar pelo mesmo motivo
- O painel master para de usar o valor inválido `padrao`
- A regra de negócio fica consistente entre banco, Edge Function e interface

### Detalhes técnicos
Arquivos mais críticos:
- `supabase/functions/admin-create-tenant/index.ts`
- `src/hooks/usePlanos.ts`
- `src/components/admin/AtivarPlanoDialog.tsx`
- `src/components/admin/OficinasTable.tsx`
- `src/components/configuracoes/ConfigPlanoAtual.tsx`
- `src/pages/PlanosPage.tsx`

Causa raiz resumida:
```text
Banco aceita apenas alguns valores em configuracoes.plano
            +
Código ainda mistura um valor legado/inválido: "padrao"
            =
INSERT/UPDATE quebra com check constraint
```

Observação importante:
mesmo que o arquivo local da Edge Function já tenha sido ajustado, o erro continuará até a versão corrigida estar publicada no Supabase. Então o plano inclui explicitamente validar o código e depois re-publicar a function.
