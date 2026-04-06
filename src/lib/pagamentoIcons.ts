import { Banknote, Smartphone, CreditCard, FileText, Wallet } from 'lucide-react';
import type { FormaPagamento } from '@/types/database';

export const ICONES_PAGAMENTO: Record<FormaPagamento, typeof Banknote> = {
  dinheiro: Banknote,
  pix: Smartphone,
  cartao_debito: CreditCard,
  cartao_credito: CreditCard,
  boleto: FileText,
  multiplo: Wallet,
};
