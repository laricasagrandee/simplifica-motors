import { useState } from 'react';
import { useListarLogs, type AuditLogEntry } from '@/hooks/useAuditLog';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { formatarDataCurta } from '@/lib/formatters';

const TABELAS = [
  { value: 'all', label: 'Todas' },
  { value: 'ordens_servico', label: 'Ordens de Serviço' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'pecas', label: 'Peças' },
  { value: 'movimentacoes', label: 'Movimentações' },
  { value: 'funcionarios', label: 'Funcionários' },
];

const ACAO_LABEL: Record<string, string> = {
  criar: 'Criou',
  editar: 'Editou',
  excluir: 'Excluiu',
  status: 'Alterou status',
};

const PER_PAGE = 20;

export function AuditLogViewer() {
  const [tabela, setTabela] = useState('all');
  const [pagina, setPagina] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useListarLogs(tabela === 'all' ? undefined : tabela, PER_PAGE, pagina);
  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={tabela} onValueChange={(v) => { setTabela(v); setPagina(1); }}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por tabela" /></SelectTrigger>
          <SelectContent>
            {TABELAS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{total} registro{total !== 1 ? 's' : ''}</span>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : !logs.length ? (
        <EmptyState icon={FileText} titulo="Nenhum log encontrado" descricao="Ainda não há registros de auditoria." />
      ) : (
        <div className="border rounded-lg divide-y divide-border overflow-hidden">
          {logs.map((log) => (
            <LogRow key={log.id} log={log} expanded={expandedId === log.id} onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">{pagina} / {totalPages}</span>
          <Button variant="outline" size="icon" disabled={pagina >= totalPages} onClick={() => setPagina((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function LogRow({ log, expanded, onToggle }: { log: AuditLogEntry; expanded: boolean; onToggle: () => void }) {
  const hasDetails = log.dados_antes || log.dados_depois;
  const Chevron = expanded ? ChevronUp : ChevronDown;

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 cursor-pointer" onClick={onToggle}>
        <span className="text-xs text-muted-foreground w-[120px] shrink-0">
          {log.criado_em ? formatarDataCurta(log.criado_em) : '—'}
        </span>
        <span className="font-medium w-[100px] shrink-0">{ACAO_LABEL[log.acao] ?? log.acao}</span>
        <span className="text-muted-foreground truncate flex-1">{log.tabela}</span>
        {hasDetails && <Chevron className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>
      {expanded && hasDetails && (
        <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {log.dados_antes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Antes</p>
              <pre className="text-xs bg-muted rounded p-2 overflow-x-auto max-h-[200px]">{JSON.stringify(log.dados_antes, null, 2)}</pre>
            </div>
          )}
          {log.dados_depois && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Depois</p>
              <pre className="text-xs bg-muted rounded p-2 overflow-x-auto max-h-[200px]">{JSON.stringify(log.dados_depois, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
