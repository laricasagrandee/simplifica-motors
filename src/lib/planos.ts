export const PLANOS_VALIDOS = ['teste', 'completo', 'basico', 'profissional', 'premium', 'enterprise'] as const;

export type PlanoSlug = (typeof PLANOS_VALIDOS)[number];

export const PLANO_INICIAL: PlanoSlug = 'teste';
export const PLANO_FALLBACK_UI: PlanoSlug = 'teste';

export const PLANO_LABELS: Record<PlanoSlug, string> = {
  teste: 'Teste',
  completo: 'Plano Completo',
  basico: 'Básico',
  profissional: 'Profissional',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

export function isPlanoValido(value: unknown): value is PlanoSlug {
  return typeof value === 'string' && PLANOS_VALIDOS.includes(value as PlanoSlug);
}

export function normalizarPlano(value: unknown, fallback: PlanoSlug = PLANO_FALLBACK_UI): PlanoSlug {
  return isPlanoValido(value) ? value : fallback;
}