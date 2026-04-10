

## Plan: Optimize App Loading Performance

### Problem
The app is very slow to load because **all 20+ pages are eagerly imported** at the top of `App.tsx`. Every page and its dependencies (charts, forms, tables, heavy libraries) are bundled into one massive chunk that must be downloaded and parsed before anything renders.

Additionally, the `LoginForm` component calls `useAppSetting` which queries the `app_settings` table on every login page load -- this adds an unnecessary network request before the login form can render.

### Solution: Lazy-load all pages

Convert all page imports in `App.tsx` from static imports to `React.lazy()` with `Suspense`. This splits the bundle so only the code for the current page is loaded.

### Changes

**1. `src/App.tsx`** -- Replace all 20+ static page imports with `React.lazy()`
- Wrap the Routes inside `<Suspense fallback={<LoadingScreen />}>`
- Each page becomes: `const DashboardPage = lazy(() => import('./pages/DashboardPage'))`
- Add a simple loading spinner as fallback
- Keep `LoginPage` and `NotFound` as eager imports (they're small and critical path)

**2. `src/components/auth/LoginForm.tsx`** -- Remove `useAppSetting` call
- The `download_desktop_url` setting triggers a Supabase query on every login page load
- Hardcode the URL or remove the download link entirely (it's a minor UI element causing a blocking query)

### What this fixes
- **Login page**: Loads only login code (~50KB) instead of the entire app (~500KB+)
- **Dashboard**: Only fetches dashboard-specific code after authentication
- **Every page**: Loads on-demand, drastically reducing initial bundle size
- **No visual changes**: Same UI, same responsiveness, just faster loading

### Technical detail
React.lazy + dynamic `import()` tells Vite to create separate chunks per page. The browser only downloads the chunk when the user navigates to that route. Combined with the existing `staleTime` caching on queries, subsequent navigations will feel instant.

