import { useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AdminConfigPrecos } from './AdminConfigPrecos';

export function AdminHeader() {
  const navigate = useNavigate();
  const [configOpen, setConfigOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-0.5">
            <span className="font-display font-extrabold text-2xl text-white">Facilita</span>
            <span className="font-display font-extrabold text-2xl text-primary">Motors</span>
          </div>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Painel Administrativo
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setConfigOpen(true)} className="text-slate-300 hover:text-white hover:bg-slate-800">
            <Settings className="h-4 w-4 mr-2" /> Configurações
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-800">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações do Sistema</DialogTitle>
          </DialogHeader>
          <AdminConfigPrecos />
        </DialogContent>
      </Dialog>
    </>
  );
}
