import { Link } from 'react-router-dom';

export function LoginHeroPanel() {
  return (
    <>
      <div className="text-center mb-auto mt-auto">
        <div className="flex items-baseline justify-center gap-1 mb-3">
          <span className="font-display font-extrabold text-4xl text-foreground">Facilita</span>
          <span className="font-display font-extrabold text-4xl text-primary">Motors</span>
        </div>
        <p className="text-lg text-muted-foreground mb-4">Sua oficina, simplificada.</p>
        <Link
          to="/criar-conta"
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
        >
          ✨ 30 dias grátis para testar
        </Link>
      </div>

      {/* Testimonial */}
      <div className="absolute bottom-12 left-12 right-12">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-5">
          <p className="text-sm text-foreground italic leading-relaxed">
            "Desde que uso o Facilita Motors, minha oficina ficou 10x mais organizada."
          </p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
              JS
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">João Silva</p>
              <p className="text-xs text-muted-foreground">Oficina JS Motos</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
