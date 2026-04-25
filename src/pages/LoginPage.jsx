import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginPage() {
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const login  = useAuthStore((s) => s.login);
  const signup = useAuthStore((s) => s.signup);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = mode === 'login'
      ? await login(email, password)
      : await signup(email, password);
    setLoading(false);
    if (err) setError(err.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold-dim to-brand-gold shadow-glow-gold">
            <Sparkles className="h-8 w-8 text-bg-base" />
          </div>
          <h1 className="font-display text-3xl font-black text-text-primary">SSS</h1>
          <p className="mt-1 text-sm text-text-muted">Супер Система Серболина</p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="card p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-center">
            {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </h2>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="Eduard@serbolin.pro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="label">Пароль</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="rounded-xl border border-accent-red/30 bg-accent-red/10 px-4 py-2 text-sm text-accent-red">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>

          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="w-full text-center text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            {mode === 'login' ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted">
          Терпение + Дисциплина = Результат
        </p>
      </div>
    </div>
  );
}
