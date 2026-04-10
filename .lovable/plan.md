

## Plan: Fix Logout Not Working

### Root Cause
The logout button triggers `supabase.auth.signOut()`, which fires `onAuthStateChange` with `SIGNED_OUT`. The AuthProvider then sets `usuario = null`, which causes it to return `null` (line 114), unmounting everything. The navigation to `/login` from multiple places creates a race condition where none of them reliably complete.

### Fix (2 files)

**1. `src/hooks/useAuth.ts` — Simplify `useLogout`**
- Remove `navigate('/login')` from useLogout — let AuthProvider handle navigation
- Remove `useNavigate` dependency (avoids unmounted component navigation)
- Just call `signOut()` and `queryClient.clear()`

**2. `src/components/layout/AuthProvider.tsx` — Reliable logout redirect**
- Replace `navigate('/login')` on SIGNED_OUT with `window.location.href = '/login'` — this is a hard redirect that bypasses React Router entirely and guarantees the page loads fresh
- Remove the second `useEffect` that redundantly navigates on `!usuario` (it's handled by onAuthStateChange)

### Why this works
- `window.location.href` is a full page reload — no React state issues, no unmounted components, no race conditions
- The query cache gets cleared naturally on page reload
- Only one place handles the redirect (AuthProvider's onAuthStateChange)

### No visual changes
Same UI, same responsiveness. Just a reliable logout.

