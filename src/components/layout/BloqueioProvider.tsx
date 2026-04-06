import { ReactNode, createContext, useContext } from 'react';
import { useVerificarBloqueio } from '@/hooks/usePlanos';
import { BloqueioScreen } from './BloqueioScreen';
import { BloqueioAviso } from './BloqueioAviso';

interface BloqueioContextType { bloqueado: boolean; emTolerancia: boolean; }

const BloqueioContext = createContext<BloqueioContextType>({ bloqueado: false, emTolerancia: false });

export function useBloqueio() { return useContext(BloqueioContext); }

export function BloqueioProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useVerificarBloqueio();

  if (isLoading) return <>{children}</>;

  const bloqueado = data?.bloqueado || false;
  const emTolerancia = data?.emTolerancia || false;

  if (bloqueado) return <BloqueioScreen />;

  return (
    <BloqueioContext.Provider value={{ bloqueado, emTolerancia }}>
      {emTolerancia && <BloqueioAviso diasRestantes={data?.diasRestantes || 0} mensagem={data?.mensagem || ''} />}
      {children}
    </BloqueioContext.Provider>
  );
}
