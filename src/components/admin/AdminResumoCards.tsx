import { Building2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { OficinaComStatus } from '@/hooks/useAdminOficinas';

interface Props {
  oficinas: OficinaComStatus[];
}

export function AdminResumoCards({ oficinas }: Props) {
  const ativas = oficinas.filter((o) => o.status === 'ativo').length;
  const emAviso = oficinas.filter((o) => o.status === 'aviso').length;
  const bloqueadas = oficinas.filter((o) => o.status === 'bloqueado').length;

  const cards = [
    { label: 'Total de Oficinas', value: oficinas.length, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Ativas', value: ativas, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Em Aviso', value: emAviso, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Bloqueadas', value: bloqueadas, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${c.bg}`}>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{c.label}</p>
              <p className="text-xl font-bold text-white">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
