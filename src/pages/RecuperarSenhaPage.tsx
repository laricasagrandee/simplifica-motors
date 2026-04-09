import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRecuperarSenha } from '@/hooks/useAuth';

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const { recuperar, loading, error, success } = useRecuperarSenha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await recuperar(email); } catch { /* handled */ }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline justify-center gap-0.5 mb-8">
          <span className="font-display font-extrabold text-2xl text-foreground">Facilita</span>
          <span className="font-display font-extrabold text-2xl text-primary">Motors</span>
        </div>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Link enviado!</h2>
              <p className="text-sm text-muted-foreground">
                Verifique seu e-mail para redefinir sua senha.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-foreground">Recuperar senha</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Informe seu e-mail e enviaremos um link para redefinir sua senha.
              </p>

              {error && (
                <div className="bg-danger-light border border-danger-border text-danger text-sm rounded-lg px-4 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-9 h-12"
                      maxLength={200}
                      required
                    />
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar link de recuperação'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
