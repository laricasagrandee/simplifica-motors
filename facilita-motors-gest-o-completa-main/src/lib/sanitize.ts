const HTML_TAG_REGEX = /<[^>]*>/g;
const SPECIAL_CHARS: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#x27;',
};

function escapeHtml(text: string): string {
  return text.replace(/[<>&"']/g, (char) => SPECIAL_CHARS[char] || char);
}

export function sanitizeInput(text: string, maxLength = 2000): string {
  if (!text) return '';
  const stripped = text.replace(HTML_TAG_REGEX, '');
  const escaped = escapeHtml(stripped.trim());
  return escaped.slice(0, maxLength);
}

export function sanitizeEmail(email: string): string {
  return email.replace(/[^a-zA-Z0-9@._+-]/g, '').trim().slice(0, 200).toLowerCase();
}

export function sanitizeNumeric(value: string): string {
  return value.replace(/\D/g, '');
}

export function sanitizeMonetary(value: number): number {
  const n = Math.abs(value);
  return Math.min(Math.round(n * 100) / 100, 999999.99);
}

export function sanitizeQuantity(value: number): number {
  return Math.min(Math.max(Math.floor(Math.abs(value)), 0), 9999);
}

export const FIELD_LIMITS = {
  nome: 200,
  email: 200,
  telefone: 20,
  cpf_cnpj: 18,
  placa: 8,
  texto_livre: 2000,
  codigo: 50,
  modelo: 100,
  cor: 50,
} as const;
