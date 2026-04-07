import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import VeiculosPage from "./pages/VeiculosPage";
import RecuperarSenhaPage from "./pages/RecuperarSenhaPage";
import DashboardPage from "./pages/DashboardPage";
import ClientesPage from "./pages/ClientesPage";
import ClienteDetalhePage from "./pages/ClienteDetalhePage";
import PecasPage from "./pages/PecasPage";
import OSPage from "./pages/OSPage";
import NovaOSPage from "./pages/NovaOSPage";
import OSRapidaPage from "./pages/OSRapidaPage";
import OSDetalhePage from "./pages/OSDetalhePage";
import PDVPage from "./pages/PDVPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import FuncionariosPage from "./pages/FuncionariosPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import PlanosPage from "./pages/PlanosPage";
import AgendamentosPage from "./pages/AgendamentosPage";
import NFPage from "./pages/NFPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import NotFound from "./pages/NotFound";
import { MASTER_EMAIL } from "@/lib/constants";

const queryClient = new QueryClient();
const LAST_ROUTE_KEY = "fm:last-route";

function RoutePersistence() {
  const location = useLocation();

  useEffect(() => {
    if (!["/login", "/recuperar-senha", "/"].includes(location.pathname)) {
      localStorage.setItem(LAST_ROUTE_KEY, `${location.pathname}${location.search}${location.hash}`);
    }
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function RootRedirect() {
  const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
  const target = lastRoute && !["/login", "/recuperar-senha", "/", "/admin"].includes(lastRoute)
    ? lastRoute
    : "/dashboard";

  return <Navigate to={target} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoutePersistence />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
