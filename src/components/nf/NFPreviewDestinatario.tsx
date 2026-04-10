interface Props {
  nome?: string | null;
  cpfCnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  veiculo?: { marca: string; modelo: string; placa: string; ano?: number | null } | null;
  osNumero?: number | null;
}

export function NFPreviewDestinatario({ nome, cpfCnpj, telefone, email, veiculo, osNumero }: Props) {
  return (
    <div className="border border-border rounded-lg p-3 mb-4">
      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
        CLIENTE
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-muted-foreground text-xs">Nome: </span>
          <span className="font-medium text-foreground">{nome || '—'}</span>
        </div>
        <div>
          <span className="text-muted-foreground text-xs">CPF/CNPJ: </span>
          <span className="font-medium text-foreground">{cpfCnpj || '—'}</span>
        </div>
        {telefone && (
          <div>
            <span className="text-muted-foreground text-xs">Telefone: </span>
            <span className="font-medium text-foreground">{telefone}</span>
          </div>
        )}
        {email && (
          <div>
            <span className="text-muted-foreground text-xs">Email: </span>
            <span className="font-medium text-foreground">{email}</span>
          </div>
        )}
      </div>

      {(veiculo || osNumero) && (
        <div className="border-t border-border mt-2 pt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {osNumero && (
            <div>
              <span className="text-muted-foreground text-xs">OS: </span>
              <span className="font-mono font-semibold text-foreground">#{osNumero}</span>
            </div>
          )}
          {veiculo && (
            <>
              <div>
                <span className="text-muted-foreground text-xs">Veículo: </span>
                <span className="font-medium text-foreground">{veiculo.marca} {veiculo.modelo}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Placa: </span>
                <span className="font-mono font-semibold text-foreground">{veiculo.placa}</span>
              </div>
              {veiculo.ano && (
                <div>
                  <span className="text-muted-foreground text-xs">Ano: </span>
                  <span className="font-medium text-foreground">{veiculo.ano}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
