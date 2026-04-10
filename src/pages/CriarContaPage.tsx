import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeEmail, sanitizeInput } from '@/lib/sanitize';
import { useAppSetting } from '@/modules/license/services/useAppSettings';
import { getDeviceFingerprint } from '@/modules/license/services/deviceFingerprintService';
import { detectDeviceType } from '@/modules/device';

export default function CriarContaPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { value: downloadUrl } = useAppSetting('download_desktop_url', 'https://drive.google.com/drive/folders/PLACEHOLDER');
  const deviceType = detectDeviceType();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNome = sanitizeInput(nome, 200).trim();
    const cleanEmail = sanitizeEmail(email);

    if (cleanNome.length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('E-mail inválido.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const fingerprint = await getDeviceFingerprint();
      const { data, error: fnError } = await supabase.functions.invoke('public-signup', {
        body: { nome: cleanNome, email: cleanEmail, password: senha, fingerprint, device_type: deviceType },
      });

      if (fnError) throw new Error(fnError.message || 'Erro ao criar conta');
      if (data?.error) throw new Error(data.error);

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-baseline justify-center gap-0.5 mb-2">
          <span className="font-display font-extrabold text-2xl text-foreground">Facilita</span>
          <span className="font-display font-extrabold text-2xl text-primary">Motors</span>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6">
          30 dias grátis • Sem compromisso
        </p>

        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          {success ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-success-light flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" strokeWidth={1.75} />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground">Conta criada!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enviamos um e-mail de confirmação para <strong className="text-foreground">{email}</strong>.
                <br />Verifique sua caixa de entrada e clique no link para ativar.
              </p>
              <p className="text-xs text-muted-foreground">
                Não recebeu? Verifique a pasta de spam.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-foreground">Criar conta grátis</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Comece a organizar sua oficina agora
              </p>

              {error && (
                <div className="bg-danger-light border border-danger-border text-danger text-sm rounded-lg px-4 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Seu nome
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <Input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="João da Silva"
                      className="pl-9 h-12"
                      maxLength={200}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </Label>
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
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
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

                <Button type="submit" className="w-full h-12 font-semibold text-base" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta grátis'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">Já tem conta? </span>
                <Link to="/login" className="text-sm text-primary font-medium hover:underline">
                  Fazer login
                </Link>
              </div>

              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
              >
                <Monitor className="h-4 w-4" />
                <span>Baixe a versão para computador</span>
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
