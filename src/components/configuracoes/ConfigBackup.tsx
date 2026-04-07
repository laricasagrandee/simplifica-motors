import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Download, Upload, HardDrive, Info, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenantId } from '@/hooks/useTenantId';
import { toast } from 'sonner';

const BACKUP_TABLES = [
  { key: 'configuracoes', label: 'Configurações', tenantField: 'id' },
  { key: 'funcionarios', label: 'Funcionários', tenantField: 'tenant_id' },
  { key: 'clientes', label: 'Clientes', tenantField: 'tenant_id' },
  { key: 'motos', label: 'Veículos', tenantField: 'tenant_id' },
  { key: 'pecas', label: 'Peças', tenantField: 'tenant_id' },
  { key: 'ordens_servico', label: 'Ordens de Serviço', tenantField: 'tenant_id' },
  { key: 'os_itens', label: 'Itens da OS', tenantField: 'tenant_id' },
  { key: 'os_fotos', label: 'Fotos da OS', tenantField: 'tenant_id' },
  { key: 'os_pagamentos', label: 'Pagamentos da OS', tenantField: 'tenant_id' },
  { key: 'movimentacoes', label: 'Movimentações', tenantField: 'tenant_id' },
  { key: 'caixa_diario', label: 'Caixa Diário', tenantField: 'tenant_id' },
  { key: 'agendamentos', label: 'Agendamentos', tenantField: 'tenant_id' },
  { key: 'vendas_pdv', label: 'Vendas PDV', tenantField: 'tenant_id' },
  { key: 'itens_venda_pdv', label: 'Itens Venda PDV', tenantField: 'tenant_id' },
  { key: 'notas_fiscais', label: 'Notas Fiscais', tenantField: 'tenant_id' },
  { key: 'estoque_movimentacoes', label: 'Movimentações de Estoque', tenantField: 'tenant_id' },
] as const;

const LS_KEY = 'ultimo-backup';

export function ConfigBackup() {
  const tenantId = useTenantId();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const ultimoBackup = localStorage.getItem(LS_KEY);

  // ── EXPORT ──
  const handleExport = async () => {
    if (!tenantId) return;
    setExporting(true);
    setProgress(0);

    try {
      const backup: Record<string, unknown[]> = {};
      for (let i = 0; i < BACKUP_TABLES.length; i++) {
        const t = BACKUP_TABLES[i];
        setProgressLabel(`Exportando ${t.label}...`);
        setProgress(Math.round(((i + 1) / BACKUP_TABLES.length) * 100));

        const { data, error } = await (supabase.from(t.key as any).select('*') as any)
          .eq(t.tenantField, tenantId);
        if (error) throw new Error(`Erro ao exportar ${t.label}: ${error.message}`);
        backup[t.key] = data ?? [];
      }

      backup._meta = [{
        exportedAt: new Date().toISOString(),
        tenantId,
        version: 1,
      }];

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const nomeOficina = ((backup.configuracoes as any)?.[0]?.nome_fantasia || 'oficina')
        .replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const dataStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `backup_${nomeOficina}_${dataStr}.json`;
      a.click();
      URL.revokeObjectURL(url);

      localStorage.setItem(LS_KEY, new Date().toISOString());
      toast.success('Backup exportado com sucesso! Salve este arquivo em local seguro.');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao exportar backup');
    } finally {
      setExporting(false);
      setProgress(0);
      setProgressLabel('');
    }
  };

  // ── IMPORT ──
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleImportConfirm = async () => {
    if (!pendingFile || !tenantId) return;
    setConfirmOpen(false);
    setImporting(true);
    setProgress(0);

    try {
      const text = await pendingFile.text();
      const backup = JSON.parse(text) as Record<string, unknown[]>;

      // Import order matters for FK — delete in reverse, insert in order
      const importOrder = BACKUP_TABLES.filter(t => t.key !== 'configuracoes');

      // 1. Delete existing data (reverse order for FK)
      for (let i = importOrder.length - 1; i >= 0; i--) {
        const t = importOrder[i];
        setProgressLabel(`Limpando ${t.label}...`);
        setProgress(Math.round(((importOrder.length - i) / (importOrder.length * 2)) * 100));
        await (supabase.from(t.key as any).delete() as any).eq(t.tenantField, tenantId);
      }

      // 2. Insert new data
      for (let i = 0; i < importOrder.length; i++) {
        const t = importOrder[i];
        const rows = backup[t.key];
        if (!rows || rows.length === 0) continue;

        setProgressLabel(`Importando ${t.label}...`);
        setProgress(50 + Math.round(((i + 1) / importOrder.length) * 50));

        // Overwrite tenant_id to current tenant
        const mapped = (rows as Record<string, unknown>[]).map(r => ({
          ...r,
          [t.tenantField]: tenantId,
        }));

        // Insert in batches of 500
        for (let b = 0; b < mapped.length; b += 500) {
          const batch = mapped.slice(b, b + 500);
          const { error } = await (supabase.from(t.key as any) as any).upsert(batch, { onConflict: 'id' });
          if (error) throw new Error(`Erro ao importar ${t.label}: ${error.message}`);
        }
      }

      // 3. Update configuracoes
      const cfgRows = backup.configuracoes;
      if (cfgRows && cfgRows.length > 0) {
        const cfg = cfgRows[0] as Record<string, unknown>;
        const { id: _id, ...cfgData } = cfg;
        setProgressLabel('Atualizando configurações...');
        await (supabase.from('configuracoes' as any).update(cfgData) as any).eq('id', tenantId);
      }

      toast.success('Backup restaurado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao importar backup');
    } finally {
      setImporting(false);
      setProgress(0);
      setProgressLabel('');
      setPendingFile(null);
    }
  };

  const busy = exporting || importing;

  return (
    <div className="space-y-6">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exportar Backup
          </CardTitle>
          <CardDescription>Baixe todos os dados da oficina em um arquivo JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={handleExport} disabled={busy} className="w-full sm:w-auto gap-2">
            <Download className="h-4 w-4" />
            {exporting ? 'Exportando...' : 'Exportar Backup'}
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Importar Backup
          </CardTitle>
          <CardDescription>Restaure dados a partir de um arquivo de backup</CardDescription>
        </CardHeader>
        <CardContent>
          <input ref={inputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
          <Button size="lg" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy} className="w-full sm:w-auto gap-2">
            <Upload className="h-4 w-4" />
            {importing ? 'Importando...' : 'Importar Backup'}
          </Button>
        </CardContent>
      </Card>

      {/* Progress */}
      {busy && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">{progressLabel}</p>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          {ultimoBackup && (
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Último backup: {new Date(ultimoBackup).toLocaleDateString('pt-BR')} às {new Date(ultimoBackup).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <div className="flex items-start gap-2">
            <HardDrive className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p>Recomendamos fazer backup pelo menos 1 vez por semana.</p>
              <p>Salve o arquivo em um pen drive ou na nuvem por segurança.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        titulo="Importar Backup"
        descricao="ATENÇÃO: Importar um backup vai SUBSTITUIR todos os dados atuais desta oficina. Tem certeza?"
        onConfirm={handleImportConfirm}
        confirmLabel="Sim, importar"
        variant="destructive"
      />
    </div>
  );
}
