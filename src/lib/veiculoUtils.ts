/** Build a display string for a vehicle, filtering out empty/undefined fields */
export function formatarVeiculo(
  veiculo?: { marca?: string; modelo?: string; placa?: string; ano?: number | string | null; cor?: string | null } | null,
  fallback = 'Veículo',
): string {
  if (!veiculo) return fallback;
  const parts = [veiculo.marca, veiculo.modelo].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : fallback;
}

export function formatarVeiculoCompleto(
  veiculo?: { marca?: string; modelo?: string; placa?: string; ano?: number | string | null } | null,
  fallback = 'Veículo',
): string {
  if (!veiculo) return fallback;
  const parts = [veiculo.marca, veiculo.modelo, veiculo.placa].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : fallback;
}
