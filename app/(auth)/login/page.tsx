'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Check role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 30% 40%, rgba(16,185,129,0.1) 0%, transparent 60%), #0a0f0a`,
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Back */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 40 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⛳</div>
          <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>GreenDraw</span>
        </div>

        <div className="glass-card" style={{ padding: '40px 36px' }}>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>Sign in to your account</p>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#f87171', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Your password"
                  required
                  style={{ paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', fontSize: '1rem', padding: '14px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: 24, padding: '16px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 10 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Credentials</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text-secondary)' }}>User:</strong> user@greendraw.com / GreenDraw123!<br />
              <strong style={{ color: 'var(--text-secondary)' }}>Admin:</strong> admin@greendraw.com / AdminGreen123!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
