import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Funcionario, CargoFuncionario } from '@/types/database';

interface Props {
  open: boolean;
  onClose: () => void;
  funcionario?: Funcionario;
  onSalvar: (data: { id?: string; nome: string; cargo: CargoFuncionario; telefone: string; email?: string; salario: number; comissao_percentual?: number }) => void;
}

const cargoOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'mecanico', label: 'Mecânico' },
  { value: 'atendente', label: 'Atendente' },
];

export function FuncionarioForm({ open, onClose, funcionario, onSalvar }: Props) {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState<CargoFuncionario>('mecanico');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [salario, setSalario] = useState('');
  const [comissao, setComissao] = useState('');

  useEffect(() => {
    if (funcionario) {
      setNome(funcionario.nome); setCargo(funcionario.cargo as CargoFuncionario); setTelefone(funcionario.telefone || '');
      setEmail(funcionario.email || ''); setSalario(String(funcionario.salario)); setComissao(String(funcionario.comissao_percentual));
    } else {
      setNome(''); setCargo('mecanico'); setTelefone(''); setEmail(''); setSalario(''); setComissao('');
    }
  }, [funcionario, open]);

  const handleSalvar = () => {
    if (!nome || !telefone) return;
    onSalvar({ id: funcionario?.id, nome, cargo, telefone, email: email || undefined, salario: parseFloat(salario) || 0, comissao_percentual: cargo === 'mecanico' ? parseFloat(comissao) || 0 : 0 });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto max-sm:h-full max-sm:max-h-full max-sm:rounded-none max-sm:border-0">
        <DialogHeader><DialogTitle>{funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nome *</Label><Input value={nome} onChange={e => setNome(e.target.value)} className="h-12" /></div>
          <div><Label>Cargo *</Label>
            <SearchableSelect value={cargo} onValueChange={v => setCargo(v as CargoFuncionario)} options={cargoOptions} placeholder="Selecione" />
          </div>
          <div><Label>Telefone *</Label><Input value={telefone} onChange={e => setTelefone(e.target.value)} className="h-12" /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-12" /></div>
          <div><Label>Salário (R$)</Label><Input type="number" step="0.01" value={salario} onChange={e => setSalario(e.target.value)} className="h-12 font-mono" /></div>
          {cargo === 'mecanico' && (
            <div><Label>Comissão (%)</Label><Input type="number" step="0.5" value={comissao} onChange={e => setComissao(e.target.value)} className="h-12 font-mono" />
              <p className="text-xs text-muted-foreground mt-1">% sobre mão de obra das OS</p></div>
          )}
          <Button onClick={handleSalvar} className="w-full h-12 bg-accent text-accent-foreground" disabled={!nome || !telefone}>
            {funcionario ? 'Salvar Alterações' : 'Cadastrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
