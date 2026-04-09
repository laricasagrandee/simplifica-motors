import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { detectDeviceType } from '@/modules/device';
import { DOWNLOAD_DESKTOP_URL } from '@/lib/constants';

interface LoginFormProps {
  email: string;
  senha: string;
  onEmailChange: (v: string) => void;
  onSenhaChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  lockedUntil: number | null;
}

export function LoginForm({
  email, senha, onEmailChange, onSenhaChange,
  onSubmit, loading, error, lockedUntil,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const isMobile = detectDeviceType() === 'mobile';

  useEffect(() => {
    if (!lockedUntil) { setCountdown(0); return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdown(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = countdown > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="bg-danger-light border border-danger-border text-danger text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {isLocked && (
        <div className="bg-warning-light border border-warning-border text-warning text-sm rounded-lg px-4 py-2.5">
          Muitas tentativas. Aguarde <span className="font-mono font-semibold">{countdown}s</span>.
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">E-mail</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="seu@email.com"
            className="pl-9 h-12"
            maxLength={200}
            required
            disabled={isLocked}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
          <Input
            type={showPassword ? 'text' : 'password'}
            value={senha}
            onChange={(e) => onSenhaChange(e.target.value)}
            placeholder="••••••••"
            className="pl-9 pr-10 h-12"
            minLength={6}
            required
            disabled={isLocked}
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Lembrar de mim</label>
        </div>
        <Link to="/recuperar-senha" className="text-sm text-primary hover:underline">
          Esqueci minha senha
        </Link>
      </div>

      <Button type="submit" className="w-full h-12 font-semibold text-base" disabled={loading || isLocked}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Entrar'}
      </Button>

      <div className="text-center">
        <Link
          to="/criar-conta"
          className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary/20 transition-colors"
        >
          ✨ Teste grátis por 30 dias
        </Link>
      </div>

      <a
        href={DOWNLOAD_DESKTOP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
      >
        <Monitor className="h-4 w-4" />
        <span>Baixe a versão para computador</span>
      </a>
    </form>
  );
}
