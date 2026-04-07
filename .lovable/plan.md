

## Plano: Corrigir sininho que nunca limpa notificações

### Causa raiz

O `useEffect` que "limpa chaves antigas" roda quando `alertas` ainda é `[]` (antes dos dados carregarem). Isso apaga todas as chaves salvas no localStorage. Quando os dados chegam, o dismissed está vazio e tudo reaparece como novo.

### Correção

**`src/components/shared/NotificacoesBadge.tsx`**

1. Adicionar guard no useEffect de limpeza: só executar quando `alertas.length > 0` para não apagar tudo no carregamento inicial
2. Resultado: abrir o sino marca tudo como lido, e continua lido mesmo após refresh/navegação

```
useEffect(() => {
  if (alertas.length === 0) return;           // <-- guard adicionado
  const currentKeys = new Set(alertas.map(getAlertKey));
  setDismissed((prev) => {
    const next = new Set(Array.from(prev).filter((key) => currentKeys.has(key)));
    saveDismissedAlerts(next);
    return next;
  });
}, [alertas]);
```

Um único `if` adicionado. Nenhum outro arquivo alterado.

