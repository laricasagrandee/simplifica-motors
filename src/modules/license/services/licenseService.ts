import { normalizarPlano } from '@/lib/planos';
import type { BloqueioInfo } from '../types';

const SEM_AVISO: BloqueioInfo = {
  bloqueado: false,
  emTolerancia: false,
  emPreAviso: false,
  nivel: null,
  diasRestantes: 999,
  mensagem: '',
};

/**
 * Calcula o status de bloqueio/aviso a partir dos dados do plano.
 * Lógica pura, sem acesso a banco — testável isoladamente.
 */
export function calcularBloqueio(dados: {
  plano: string | null;
  data_vencimento_plano: string | null;
  dias_tolerancia: number | null;
}): BloqueioInfo {
  if (!dados.data_vencimento_plano) return SEM_AVISO;

  const plano = normalizarPlano(dados.plano);
  const eTeste = plano === 'teste';

  const venc = new Date(dados.data_vencimento_plano);
  const hoje = new Date();
  const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);

  // --- PRÉ-VENCIMENTO ---
  if (diff > 0) {
    if (eTeste) {
      return {
        bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'info',
        diasRestantes: diff,
        mensagem: `Seu teste grátis acaba em ${diff} dia${diff > 1 ? 's' : ''}. Entre em contato para ativar seu plano.`,
      };
    }
    if (diff <= 3) {
      return {
        bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'urgente',
        diasRestantes: diff,
        mensagem: `Seu acesso vence em ${diff} dia${diff > 1 ? 's' : ''}! Renove agora.`,
      };
    }
    if (diff <= 7) {
      return {
        bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'forte',
        diasRestantes: diff,
        mensagem: `Seu acesso vence em ${diff} dias. Considere renovar.`,
      };
    }
    if (diff <= 10) {
      return {
        bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'info',
        diasRestantes: diff,
        mensagem: `Seu acesso vence em ${diff} dias.`,
      };
    }
    return SEM_AVISO;
  }

  // --- VENCE HOJE ---
  if (diff === 0) {
    return {
      bloqueado: false, emTolerancia: false, emPreAviso: true, nivel: 'suave',
      diasRestantes: 0,
      mensagem: eTeste
        ? 'Seu teste grátis acaba hoje! Entre em contato para ativar seu plano.'
        : 'Seu acesso vence hoje. Renove para não perder o acesso.',
    };
  }

  // --- PÓS-VENCIMENTO (tolerância 15 dias) ---
  const diasAtraso = Math.abs(diff);

  if (diasAtraso <= 5) {
    return {
      bloqueado: false, emTolerancia: true, emPreAviso: false, nivel: 'suave',
      diasRestantes: 15 - diasAtraso,
      mensagem: 'Sua assinatura venceu. Renove para continuar usando sem interrupções.',
    };
  }
  if (diasAtraso <= 10) {
    return {
      bloqueado: false, emTolerancia: true, emPreAviso: false, nivel: 'forte',
      diasRestantes: 15 - diasAtraso,
      mensagem: 'Seu acesso será bloqueado em breve. Entre em contato para renovar.',
    };
  }
  if (diasAtraso <= 15) {
    const diasParaBloqueio = 15 - diasAtraso;
    return {
      bloqueado: false, emTolerancia: true, emPreAviso: false, nivel: 'urgente',
      diasRestantes: diasParaBloqueio,
      mensagem: `Último aviso! Seu acesso será bloqueado em ${diasParaBloqueio} dia${diasParaBloqueio > 1 ? 's' : ''}.`,
    };
  }

  return {
    bloqueado: true, emTolerancia: false, emPreAviso: false, nivel: null,
    diasRestantes: 0,
    mensagem: 'Seu acesso foi suspenso por pendência financeira.',
  };
}
