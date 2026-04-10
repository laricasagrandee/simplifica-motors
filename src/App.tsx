import { useEffect, useState, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { MASTER_EMAIL } from "@/lib/constants";

const CriarContaPage = lazy(() => import("./pages/CriarContaPage"));
const VendasPage = lazy(() => import("./pages/VendasPage"));
const VeiculosPage = lazy(() => import("./pages/VeiculosPage"));
const RecuperarSenhaPage = lazy(() => import("./pages/RecuperarSenhaPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ClientesPage = lazy(() => import("./pages/ClientesPage"));
const ClienteDetalhePage = lazy(() => import("./pages/ClienteDetalhePage"));
const PecasPage = lazy(() => import("./pages/PecasPage"));
const OSPage = lazy(() => import("./pages/OSPage"));
const NovaOSPage = lazy(() => import("./pages/NovaOSPage"));
const OSRapidaPage = lazy(() => import("./pages/OSRapidaPage"));
const OSDetalhePage = lazy(() => import("./pages/OSDetalhePage"));
const PDVPage = lazy(() => import("./pages/PDVPage"));
const FinanceiroPage = lazy(() => import("./pages/FinanceiroPage"));
const RelatoriosPage = lazy(() => import("./pages/RelatoriosPage"));
const FuncionariosPage = lazy(() => import("./pages/FuncionariosPage"));
const ConfiguracoesPage = lazy(() => import("./pages/ConfiguracoesPage"));
const PlanosPage = lazy(() => import("./pages/PlanosPage"));
const AgendamentosPage = lazy(() => import("./pages/AgendamentosPage"));
const NFPage = lazy(() => import("./pages/NFPage"));
const AdminPanelPage = lazy(() => import("./pages/AdminPanelPage"));
const EscolhaModoPage = lazy(() => import("./pages/EscolhaModoPage"));

const queryClient = new QueryClient();
const LAST_ROUTE_KEY = "fm:last-route";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function RoutePersistence() {
  const location = useLocation();

  useEffect(() => {
    if (!["/login", "/recuperar-senha", "/reset-password", "/escolha-modo", "/"].includes(location.pathname)) {
      localStorage.setItem(LAST_ROUTE_KEY, `${location.pathname}${location.search}${location.hash}`);
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function RootRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      if (data.session?.user.email === MASTER_EMAIL) {
        setTarget("/admin");
        return;
      }

      const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
      setTarget(
        lastRoute && !["/login", "/recuperar-senha", "/", "/admin"].includes(lastRoute)
          ? lastRoute
          : "/dashboard",
      );
    });

    return () => {
      active = false;
    };
  }, []);

  if (!target) return null;

  return <Navigate to={target} replace />;
}

function AdminRoute() {
  const [target, setTarget] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      const user = data.session?.user;

      if (!user) {
        setTarget("/login");
        return;
      }

      if (user.email !== MASTER_EMAIL) {
        setTarget("/dashboard");
        return;
      }

      setAuthorized(true);
    });

    return () => {
      active = false;
    };
  }, []);

  if (authorized) return <Suspense fallback={<LoadingScreen />}><AdminPanelPage /></Suspense>;
  if (!target) return null;

  return <Navigate to={target} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoutePersistence />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/vendas" element={<VendasPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/criar-conta" element={<CriarContaPage />} />
            <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/escolha-modo" element={<EscolhaModoPage />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/*" element={
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  <Route path="/dashboard" element={<ProtectedRoute permissao="ver_dashboard"><DashboardPage /></ProtectedRoute>} />
                  <Route path="/clientes" element={<ProtectedRoute permissao="gerenciar_clientes"><ClientesPage /></ProtectedRoute>} />
                  <Route path="/clientes/:id" element={<ProtectedRoute permissao="gerenciar_clientes"><ClienteDetalhePage /></ProtectedRoute>} />
                  <Route path="/pecas" element={<ProtectedRoute permissao="gerenciar_pecas"><PecasPage /></ProtectedRoute>} />
                  <Route path="/veiculos" element={<ProtectedRoute permissao="gerenciar_clientes"><VeiculosPage /></ProtectedRoute>} />
                  <Route path="/os" element={<ProtectedRoute permissao="gerenciar_os"><OSPage /></ProtectedRoute>} />
                  <Route path="/os/nova" element={<ProtectedRoute permissao="gerenciar_os"><NovaOSPage /></ProtectedRoute>} />
                  <Route path="/os/rapida" element={<ProtectedRoute permissao="gerenciar_os"><OSRapidaPage /></ProtectedRoute>} />
                  <Route path="/os/:id" element={<ProtectedRoute permissao="gerenciar_os"><OSDetalhePage /></ProtectedRoute>} />
                  <Route path="/agendamentos" element={<ProtectedRoute permissao="gerenciar_os"><AgendamentosPage /></ProtectedRoute>} />
                  <Route path="/pdv" element={<ProtectedRoute permissao="usar_pdv"><PDVPage /></ProtectedRoute>} />
                  <Route path="/financeiro" element={<ProtectedRoute permissao="ver_financeiro"><FinanceiroPage /></ProtectedRoute>} />
                  <Route path="/cmv" element={<Navigate to="/relatorios" replace />} />
                  <Route path="/dre" element={<Navigate to="/relatorios" replace />} />
                  <Route path="/nf" element={<ProtectedRoute permissao="emitir_nf"><NFPage /></ProtectedRoute>} />
                  <Route path="/relatorios" element={<ProtectedRoute permissao="ver_relatorios"><RelatoriosPage /></ProtectedRoute>} />
                  <Route path="/funcionarios" element={<ProtectedRoute permissao="gerenciar_equipe"><FuncionariosPage /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute permissao="ver_configuracoes"><ConfiguracoesPage /></ProtectedRoute>} />
                  <Route path="/planos" element={<ProtectedRoute permissao="gerenciar_planos"><PlanosPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
