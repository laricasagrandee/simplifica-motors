import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

interface PDVLayoutProps {
  produtosPanel: ReactNode;
  carrinhoPanel: ReactNode;
  historicoPanel: ReactNode;
  carrinhoCount: number;
}

export function PDVLayout({ produtosPanel, carrinhoPanel, historicoPanel, carrinhoCount }: PDVLayoutProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-secondary))]">
      <div className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>
        <h1 className="font-display font-bold text-lg text-foreground">Ponto de Venda</h1>
      </div>

      {isMobile ? (
        <MobileLayout
          produtosPanel={produtosPanel}
          carrinhoPanel={carrinhoPanel}
          historicoPanel={historicoPanel}
          carrinhoCount={carrinhoCount}
        />
      ) : (
        <DesktopLayout
          produtosPanel={produtosPanel}
          carrinhoPanel={carrinhoPanel}
          historicoPanel={historicoPanel}
        />
      )}
    </div>
  );
}

function DesktopLayout({ produtosPanel, carrinhoPanel, historicoPanel }: Omit<PDVLayoutProps, 'carrinhoCount'>) {
  return (
    <div className="flex h-[calc(100vh-57px)]">
      <div className="w-[60%] border-r border-border overflow-y-auto">
        <Tabs defaultValue="produtos" className="h-full flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="produtos" className="flex-1 p-4 pt-2">{produtosPanel}</TabsContent>
          <TabsContent value="historico" className="flex-1 p-4 pt-2">{historicoPanel}</TabsContent>
        </Tabs>
      </div>
      <div className="w-[40%] overflow-y-auto bg-card">{carrinhoPanel}</div>
    </div>
  );
}

function MobileLayout({ produtosPanel, carrinhoPanel, historicoPanel, carrinhoCount }: PDVLayoutProps) {
  return (
    <Tabs defaultValue="produtos" className="h-[calc(100vh-57px)] flex flex-col">
      <TabsList className="mx-4 mt-3 w-full">
        <TabsTrigger value="produtos" className="flex-1">Produtos</TabsTrigger>
        <TabsTrigger value="carrinho" className="flex-1 gap-1.5">
          <ShoppingCart className="h-4 w-4" />
          Carrinho
          {carrinhoCount > 0 && (
            <Badge variant="destructive" className="h-5 min-w-[20px] px-1 text-xs">{carrinhoCount}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="historico" className="flex-1">Histórico</TabsTrigger>
      </TabsList>
      <TabsContent value="produtos" className="flex-1 overflow-y-auto p-4">{produtosPanel}</TabsContent>
      <TabsContent value="carrinho" className="flex-1 overflow-y-auto bg-card">{carrinhoPanel}</TabsContent>
      <TabsContent value="historico" className="flex-1 overflow-y-auto p-4">{historicoPanel}</TabsContent>
    </Tabs>
  );
}
