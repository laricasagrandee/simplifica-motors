

## Plan: Minimal Change — POST Cliente via Local API

### What changes (1 file only)

**`src/hooks/useClientes.ts`** — Edit only the `useCriarCliente` function (lines 121-136)

Replace the Supabase insert with a `fetch()` POST to the local API:

```
mutationFn: async (input) => {
  const clean = sanitizeCliente(input);
  const url = `http://localhost:3847/api/clientes`;
  console.log('[CLIENTES] POST Request:', url, clean);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clean),
  });
  console.log('[CLIENTES] POST Response:', res.status);
  if (!res.ok) {
    const err = await res.text();
    console.error('[CLIENTES] POST Error:', err);
    throw new Error(err);
  }
  return await res.json();
}
```

- Uses `getLocalServerPort()` from the existing device module (imported from `@/modules/device`) to avoid hardcoding, OR hardcodes `3847` since `runtime.ts` doesn't exist yet — whichever you prefer. The plan above hardcodes it for minimal scope.
- Keeps `sanitizeCliente`, `registrarLog`, and `onSuccess` exactly as they are.
- Does NOT touch listing, update, delete, or any other file.

### What does NOT change
- All other hooks and functions in `useClientes.ts`
- No new files created
- No architectural changes
- Auth, license, other modules untouched

### Purpose
Validate that a POST from the frontend reaches the Rust backend and saves to SQLite. Once confirmed working, the remaining CRUD operations can be migrated incrementally.

