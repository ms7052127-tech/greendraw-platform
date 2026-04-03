'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Profile is created automatically via Supabase trigger
      router.push('/subscribe');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 70% 40%, rgba(74,222,128,0.08) 0%, transparent 60%), #0a0f0a`,
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 40 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⛳</div>
          <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>GreenDraw</span>
        </div>

        <div className="glass-card" style={{ padding: '40px 36px' }}>
          <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.95rem' }}>
            Join thousands of golfers making an impact
          </p>

          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, color: '#f87171', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="John Smith" required />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min. 8 characters" required style={{ paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password strength */}
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: password.length >= i * 4 ? (i === 1 ? '#f87171' : i === 2 ? '#fbbf24' : '#4ade80') : 'rgba(255,255,255,0.08)', transition: 'all 0.2s' }} />
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
              {['Monthly prize draws', 'Charity contribution from day 1', 'Full score & win tracking'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 2 ? 8 : 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Check size={14} color="var(--accent-green)" />{b}
                </div>
              ))}
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', fontSize: '1rem', padding: '14px', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : 'Create Account & Continue'}
            </button>
          </form>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
