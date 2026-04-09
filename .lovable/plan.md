
# Plano de Migração — Facilita Motors Local-First

## Visão Geral

Converter o app web atual (React + Supabase) em um app desktop Electron com banco local SQLite, mantendo o PWA como cliente mobile. Supabase permanece apenas para autenticação, licença e registro de máquina.

---

## Estrutura Final de Pastas

```
src/
├── modules/
│   ├── license/
│   │   ├── components/       # LoginForm, BloqueioScreen, AvisoPre-vencimento
│   │   ├── hooks/            # useLicense, useLogin, useLogout
│   │   ├── services/         # licenseService (validação, tolerância offline)
│   │   ├── api/              # licenseApi (chamadas Supabase para licença)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── device/
│   │   ├── hooks/            # useDeviceType, useDeviceMode
│   │   ├── services/         # deviceService (detectar PC/mobile, capturar hostname)
│   │   ├── api/              # deviceApi (registrar/buscar máquina no Supabase)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── local-server/
│   │   ├── server/           # Express server (roda no processo Electron)
│   │   ├── routes/           # endpoints REST locais (clientes, OS, peças, etc.)
│   │   ├── middleware/       # auth local, cors local
│   │   ├── services/         # serverLifecycle (start/stop/status)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── local-connection/
│   │   ├── components/       # StatusConexao, ConexaoManual (fallback)
│   │   ├── hooks/            # useLocalConnection, useConnectionStatus
│   │   ├── services/         # discoveryService (hostname → IP → Supabase fallback)
│   │   ├── api/              # connectionApi (ping, retry, healthcheck)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   └── storage/
│       ├── adapters/
│       │   ├── sqliteAdapter.ts    # Banco local via better-sqlite3 (Electron)
│       │   ├── indexeddbAdapter.ts  # Banco local via IndexedDB (PWA mobile-only)
│       │   └── remoteAdapter.ts    # Acessa dados via local-server (PWA modo híbrido)
│       ├── repositories/     # clienteRepo, osRepo, pecaRepo, etc.
│       ├── migrations/       # migrações do schema SQLite
│       ├── services/         # storageService (abstração unificada)
│       ├── types.ts
│       └── index.ts
│
├── components/              # Componentes UI compartilhados (manter os atuais)
│   ├── layout/
│   ├── ui/
│   └── shared/
│
├── pages/                   # Páginas (mantém estrutura atual)
├── lib/                     # Utilitários puros (formatters, validators, etc.)
├── hooks/                   # Hooks globais (use-mobile, use-toast)
└── types/                   # Tipos globais

electron/
├── main.cjs                 # Processo principal Electron
├── preload.cjs              # Bridge segura (contextBridge)
└── server.cjs               # Servidor Express local (rodando no main process)
```

---

## O que acontece com cada arquivo atual

### MANTÉM (sem alteração)
- `src/components/ui/*` — componentes shadcn
- `src/components/layout/AppSidebar.tsx, TopBar.tsx, MobileNav.tsx, AppLayout.tsx`
- `src/pages/*` — todas as páginas
- `src/lib/formatters.ts, validators.ts, utils.ts, calculators.ts, sanitize.ts`
- `src/index.css, tailwind.config.ts, vite.config.ts`
- `public/*` (manifest, icons, sw.js)

### MOVE para módulos
| Arquivo atual | Destino |
|---|---|
| `src/hooks/useAuth.ts` | `src/modules/license/hooks/useLogin.ts` + `useLogout.ts` |
| `src/components/layout/AuthProvider.tsx` | `src/modules/license/components/LicenseProvider.tsx` |
| `src/components/layout/BloqueioProvider.tsx` | `src/modules/license/components/BloqueioProvider.tsx` |
| `src/components/layout/BloqueioScreen.tsx` | `src/modules/license/components/BloqueioScreen.tsx` |
| `src/components/layout/BloqueioAviso.tsx` | `src/modules/license/components/BloqueioAviso.tsx` |
| `src/lib/permissions.ts` | `src/modules/license/services/permissionService.ts` |
| `src/lib/planos.ts` | `src/modules/license/services/planoService.ts` |
| `src/hooks/usePlanos.ts` | `src/modules/license/hooks/usePlanos.ts` |
| `src/hooks/useTenantId.ts` | `src/modules/device/hooks/useTenantId.ts` |
| `src/lib/tenantHelper.ts` | `src/modules/storage/services/tenantHelper.ts` |
| `src/integrations/supabase/client.ts` | `src/modules/license/api/supabaseClient.ts` (usado APENAS para auth/licença) |

### REFATORA (lógica migra de Supabase → storage local)
Todos os 51 hooks de dados (`useClientes, useOS, usePecas, useFuncionarios, useFinanceiro, usePDV, etc.`) serão refatorados para usar `storageService` em vez de `supabase.from(...)` direto.

Isso será feito gradualmente — cada hook passa a chamar o repository correspondente do módulo storage.

---

## Plano de Migração por Etapas

### ETAPA 1 — Estrutura base + módulo device (sem quebrar nada)
- Criar pastas `src/modules/*`
- Criar `modules/device` com detecção PC/mobile e hook `useDeviceMode`
- Criar tabela `machine_registry` no Supabase (email, tenant_id, machine_name, porta, ip, modo)
- **Nada quebra** — o app continua funcionando como antes

### ETAPA 2 — Módulo license (mover auth)
- Mover auth/bloqueio para `modules/license`
- Criar re-exports nos caminhos antigos para não quebrar imports
- Adicionar tolerância offline (salvar licença em localStorage/IndexedDB)
- **Nada quebra** — apenas reorganização com aliases

### ETAPA 3 — Módulo storage (abstração do banco)
- Criar `storageService` com interface unificada (CRUD genérico)
- Criar `sqliteAdapter` para Electron e `indexeddbAdapter` para PWA
- Criar repositories: `clienteRepo, osRepo, pecaRepo`, etc.
- Migrar 1 hook de teste (ex: `useClientes`) para usar o repository
- **Nada quebra** — adapter inicial pode apontar para Supabase como fallback

### ETAPA 4 — Electron (app desktop)
- Configurar `electron/main.cjs` + `electron/preload.cjs`
- Integrar `better-sqlite3` no processo principal
- Criar schema SQLite espelhando as tabelas do Supabase
- Expor operações via `contextBridge` (IPC)
- Empacotar com `@electron/packager`

### ETAPA 5 — Módulo local-server
- Criar servidor Express dentro do Electron (porta fixa 3847)
- Endpoints REST: `/api/clientes`, `/api/os`, `/api/pecas`, etc.
- Cada endpoint usa o `sqliteAdapter` para ler/gravar
- Endpoint `/api/ping` para healthcheck

### ETAPA 6 — Módulo local-connection
- No PWA mobile: tentar conectar por `hostname.local:3847`
- Fallback: IP salvo localmente
- Fallback: buscar IP no Supabase (tabela `machine_registry`)
- `remoteAdapter` no storage que faz fetch para o servidor local
- Retry automático + reconexão

### ETAPA 7 — Migração dos hooks restantes
- Migrar todos os 51 hooks para usar repositories do storage
- Remover dependência direta do Supabase nos hooks de dados
- Supabase permanece apenas em `modules/license/api/`

### ETAPA 8 — Registro automático da máquina
- No Electron: capturar `os.hostname()` e registrar no Supabase após login
- No PWA: buscar dados da máquina registrada para o tenant
- Atualizar IP automaticamente quando mudar

---

## Fluxo final por modo

### Desktop-only
```
UI → Hook → Repository → sqliteAdapter → SQLite local
```

### Mobile-only
```
UI → Hook → Repository → indexeddbAdapter → IndexedDB local
```

### Desktop + Mobile (híbrido)
```
[PC]  UI → Hook → Repository → sqliteAdapter → SQLite
[Cel] UI → Hook → Repository → remoteAdapter → fetch → PC:3847 → SQLite
```

---

## Riscos e mitigações

1. **better-sqlite3 requer rebuild nativo no Electron** → usar `electron-rebuild`
2. **IndexedDB tem limite de storage** → avisar usuário se dados > 500MB
3. **hostname.local nem sempre resolve** → fallback IP automático
4. **Migração gradual pode ter estado misto** → manter Supabase como fallback até etapa 7 completa

---

## Começar por: ETAPA 1

Criar a estrutura de pastas + módulo device + tabela machine_registry.
