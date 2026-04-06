import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload } from 'lucide-react';
import type { Configuracao } from '@/types/database';

interface Props { config: Configuracao | undefined; loading: boolean; onSalvar: (d: Partial<Configuracao> & { id: string }) => void; onUploadLogo: (file: File) => void; }

export function ConfigDadosOficina({ config, loading, onSalvar, onUploadLogo }: Props) {
  const [form, setForm] = useState<Record<string, string>>({});
  if (loading || !config) return <Skeleton className="h-60 w-full" />;

  const v = (k: string) => form[k] ?? ((config as Record<string, unknown>)[k] as string || '');
  const set = (k: string, val: string) => setForm(p => ({ ...p, [k]: val }));

  const campos: { key: keyof Configuracao | string; label: string }[] = [
    { key: 'razao_social', label: 'Razão Social' }, { key: 'nome_fantasia', label: 'Nome Fantasia' },
    { key: 'cnpj', label: 'CNPJ' }, { key: 'ie', label: 'Inscrição Estadual' },
    { key: 'telefone', label: 'Telefone' }, { key: 'email', label: 'Email' },
    { key: 'endereco_completo', label: 'Endereço Completo' },
    { key: 'garantia_dias_padrao', label: 'Dias de Garantia Padrão' },
  ];

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Dados da Oficina</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          {config.logo_url ? (
            <img src={config.logo_url} alt="Logo" className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
              <Upload className="h-5 w-5" />
            </div>
          )}
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onUploadLogo(e.target.files[0])} />
            <Button variant="outline" size="sm" asChild><span>Alterar Logo</span></Button>
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {campos.map(c => (
            <div key={c.key} className={c.key === 'endereco_completo' ? 'sm:col-span-2' : ''}>
              <Label className="text-xs">{c.label}</Label>
              <Input value={v(c.key)} onChange={e => set(c.key, e.target.value)} className="min-h-[44px]" />
            </div>
          ))}
        </div>
        <Button onClick={() => onSalvar({ id: config.id, ...form } as Partial<Configuracao> & { id: string })} className="bg-accent text-accent-foreground min-h-[44px]">
          Salvar Dados
        </Button>
      </CardContent>
    </Card>
  );
}
