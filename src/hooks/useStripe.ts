import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface PlanoPreco {
  id: string;
  slug: string;
  intervalo: 'mensal' | 'anual';
  valor_centavos: number;
  stripe_price_id: string | null;
  ativo: boolean;
  max_funcionarios: number;
}

export function usePlanoPrecos() {
  return useQuery<PlanoPreco[]>({
    queryKey: ['plano-precos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plano_precos')
        .select('*')
        .eq('ativo', true)
        .order('valor_centavos');
      if (error) throw error;
      return (data ?? []) as unknown as PlanoPreco[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({ slug, intervalo }: { slug: string; intervalo: string }) => {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { slug, intervalo },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao iniciar pagamento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCheckSubscription() {
  return useQuery({
    queryKey: ['check-subscription'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      return data as { subscribed: boolean; plano: string; subscription_end: string | null };
    },
    staleTime: 60 * 1000, // Refresh every minute
    refetchInterval: 60 * 1000,
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { url: string };
    },
    onSuccess: (data) => {
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao abrir portal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
