import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KeyRound, Shield, Send } from 'lucide-react';
import { useConfiguracoes } from '@/hooks/useConfiguracoes';
import { useResetSenha, useAtualizarLicenca } from '@/hooks/useAdminMaster';
import { useFuncionarios } from '@/hooks/useFuncionarios';
import { formatarDataCurta } from '@/lib/formatters';

const PLANOS = [
  { value: 'basico', label: 'Básico', max: 3 },
  { value: 'profissional', label: 'Profissional', max: 10 },
  { value: 'premium', label: 'Premium', max: 50 },
  { value: 'vitalicia', label: 'Vitalícia', max: 50 },
  { value: 'enterprise', label: 'Enterprise', max: 999 },
];

export function AdminMasterTab() {
  const config = useConfiguracoes();
  const funcs = useFuncionarios();
  const resetSenha = useResetSenha();
  const atualizarLicenca = useAtualizarLicenca();

  const [resetEmail, setResetEmail] = useState('');
  const [plano, setPlano] = useState('');
  const [planoAtivo, setPlanoAtivo] = useState(true);
  const [vencimento, setVencimento] = useState('');

  const c = config.data;

  // Sync state when config loads
  const [synced, setSynced] = useState(false);
  if (c && !synced) {
    setPlano(c.plano || 'basico');
    setPlanoAtivo(c.plano_ativo ?? true);
    setVencimento(c.data_vencimento_plano || '');
    setSynced(true);
  }

  const handleResetSenha = () => {
    if (!resetEmail.trim()) return;
    resetSenha.mutate(resetEmail.trim());
  };

  const handleSalvarLicenca = () => {
    if (!c?.id) return;
    const planoInfo = PLANOS.find(p => p.value === plano);
    atualizarLicenca.mutate({
      config_id: c.id,
      plano,
      plano_ativo: planoAtivo,
      data_vencimento_plano: vencimento || null,
      max_funcionarios: planoInfo?.max || 3,
    });
  };

  const funcionariosComEmail = (funcs.data || []).filter(f => f.email);

  return (
    <div className="space-y-6 mt-4">
      {/* Licença */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Gerenciar Licença
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {c && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Status atual:</span>
              <Badge className={c.plano_ativo ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}>
                {c.plano_ativo ? 'Ativo' : 'Bloqueado'}
              </Badge>
              <span className="capitalize font-medium">{c.plano}</span>
              {c.data_vencimento_plano && (
                <span>• Vence em {formatarDataCurta(c.data_vencimento_plano)}</span>
              )}
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={plano} onValueChange={setPlano}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANOS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label} (até {p.max} func.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vencimento</Label>
              <Input type="date" value={vencimento?.split('T')[0] || ''} onChange={e => setVencimento(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={planoAtivo} onCheckedChange={setPlanoAtivo} />
            <Label>Plano ativo</Label>
          </div>

          <Button onClick={handleSalvarLicenca} disabled={atualizarLicenca.isPending} className="min-h-[44px]">
            {atualizarLicenca.isPending ? 'Salvando...' : 'Salvar Licença'}
          </Button>
        </CardContent>
      </Card>

      {/* Reset de Senha */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Reset de Senha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Digite o email do funcionário para enviar um link de redefinição de senha.
          </p>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@exemplo.com"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleResetSenha} disabled={resetSenha.isPending || !resetEmail.trim()} className="min-h-[44px]">
              <Send className="h-4 w-4 mr-2" />
              {resetSenha.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>

          {funcionariosComEmail.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Funcionários com email cadastrado:</p>
              <div className="flex flex-wrap gap-1">
                {funcionariosComEmail.map(f => (
                  <Badge
                    key={f.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent text-xs"
                    onClick={() => setResetEmail(f.email!)}
                  >
                    {f.nome} ({f.email})
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
