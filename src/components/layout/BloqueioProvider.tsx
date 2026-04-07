import { ReactNode, createContext, useContext } from 'react';
import { useVerificarBloqueio } from '@/hooks/usePlanos';
import { BloqueioScreen } from './BloqueioScreen';
import { BloqueioAviso } from './BloqueioAviso';

interface BloqueioContextType { bloqueado: boolean; emTolerancia: boolean; emPreAviso: boolean; }

const BloqueioContext = createContext<BloqueioContextType>({ bloqueado: false, emTolerancia: false, emPreAviso: false });

export function useBloqueio() { return useContext(BloqueioContext); }

export function BloqueioProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useVerificarBloqueio();

  if (isLoading) return <>{children}</>;

  const bloqueado = data?.bloqueado || false;
  const emTolerancia = data?.emTolerancia || false;
  const emPreAviso = data?.emPreAviso || false;
  const mostrarAviso = emTolerancia || emPreAviso;

  if (bloqueado) return <BloqueioScreen />;

  return (
    <BloqueioContext.Provider value={{ bloqueado, emTolerancia, emPreAviso }}>
      {mostrarAviso && <BloqueioAviso diasRestantes={data?.diasRestantes || 0} mensagem={data?.mensagem || ''} nivel={data?.nivel} />}
      {children}
    </BloqueioContext.Provider>
  );
}
