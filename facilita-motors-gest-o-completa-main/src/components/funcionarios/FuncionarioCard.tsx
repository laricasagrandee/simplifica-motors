import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, UserX, UserCheck } from 'lucide-react';
import { formatarTelefone, formatarMoeda } from '@/lib/formatters';
import type { Funcionario } from '@/types/database';

interface Props { funcionario: Funcionario; onEditar: () => void; onToggleAtivo: () => void; }

const AVATAR_COLORS = ['bg-primary/20 text-primary', 'bg-accent/20 text-accent', 'bg-info-light text-info', 'bg-warning-light text-warning', 'bg-success-light text-success', 'bg-danger-light text-danger'];
const cargoLabels: Record<string, string> = { admin: 'Administrador', gerente: 'Gerente', mecanico: 'Mecânico', atendente: 'Atendente' };
const cargoStyles: Record<string, string> = { admin: 'bg-purple-light text-purple', gerente: 'bg-accent-light text-accent', mecanico: 'bg-info-light text-info', atendente: 'bg-warning-light text-warning' };

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function FuncionarioCard({ funcionario: f, onEditar, onToggleAtivo }: Props) {
  return (
    <Card className={!f.ativo ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center font-display font-bold text-sm ${avatarColor(f.nome)}`}>
              {f.nome.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-display font-semibold text-sm">{f.nome}</p>
              <Badge className={`${cargoStyles[f.cargo] || 'bg-muted'} text-xs`}>{cargoLabels[f.cargo]}</Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEditar}><Pencil className="h-4 w-4 mr-2" strokeWidth={1.75} />Editar</DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleAtivo}>
                {f.ativo ? <><UserX className="h-4 w-4 mr-2" strokeWidth={1.75} />Desativar</> : <><UserCheck className="h-4 w-4 mr-2" strokeWidth={1.75} />Ativar</>}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {f.telefone && <p className="text-xs text-muted-foreground">{formatarTelefone(f.telefone)}</p>}
        {f.email && <p className="text-xs text-muted-foreground">{f.email}</p>}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <p className="text-xs font-mono text-muted-foreground">{formatarMoeda(f.salario)}</p>
          {f.cargo === 'mecanico' && f.comissao_percentual > 0 && (
            <Badge variant="outline" className="text-xs">Comissão: {f.comissao_percentual}%</Badge>
          )}
          <Badge variant="outline" className={f.ativo ? 'text-success' : 'text-destructive'}>{f.ativo ? 'Ativo' : 'Inativo'}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
