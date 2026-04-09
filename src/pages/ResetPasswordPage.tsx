import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event from the auth callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoveryToken(true);
      }
      setChecking(false);
    });

    // Also check if we already have a session (user clicked link, already processed)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setHasRecoveryToken(true);
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setError('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: senha });
      if (updateError) throw updateError;
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

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
              <h2 className="font-display text-xl font-bold text-foreground">Senha redefinida!</h2>
              <p className="text-sm text-muted-foreground">
                Você será redirecionado para o login em instantes.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Ir para o login
              </Link>
            </div>
          ) : !hasRecoveryToken ? (
            <div className="text-center space-y-4">
              <h2 className="font-display text-xl font-bold text-foreground">Link inválido</h2>
              <p className="text-sm text-muted-foreground">
                Este link de recuperação expirou ou é inválido. Solicite um novo.
              </p>
              <Link to="/recuperar-senha" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Solicitar novo link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-foreground">Nova senha</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Defina sua nova senha abaixo.
              </p>

              {error && (
                <div className="bg-danger-light border border-danger-border text-danger text-sm rounded-lg px-4 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nova senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 pr-10 h-12"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmar senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 h-12"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redefinir senha'}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
