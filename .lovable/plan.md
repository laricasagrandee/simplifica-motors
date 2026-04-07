

## Plano: Corrigir rota /nf que redireciona pro Financeiro

### Problema
A rota `/nf` está configurada como `<Navigate to="/financeiro" replace />` (linha 82 do App.tsx). Quando o botão "Gerar Nota Fiscal" navega para `/nf?os_id=...`, o usuário cai na página de Financeiro em vez da página de Notas Fiscais.

### Correção

**`src/App.tsx`**
- Linha 82: trocar `<Navigate to="/financeiro" replace />` por `<ProtectedRoute permissao="ver_financeiro"><NFPage /></ProtectedRoute>`
- Adicionar import do `NFPage` no topo do arquivo

Uma linha alterada, um import adicionado. A página NFPage já existe e funciona — só não estava sendo usada na rota.

