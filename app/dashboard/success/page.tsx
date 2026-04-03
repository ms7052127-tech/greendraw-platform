'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSuccess = searchParams.get('subscription') === 'success';

  useEffect(() => {
    if (!isSuccess) return;
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => router.push('/dashboard'), 5000);
    return () => clearTimeout(timer);
  }, [isSuccess, router]);

  if (!isSuccess) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          <CheckCircle size={40} color="#4ade80" />
        </div>

        <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
          Welcome to GreenDraw!
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: 32 }}>
          Your subscription is active. You can now enter your golf scores, participate in monthly draws, and support your chosen charity.
        </p>

        <div style={{ display: 'grid', gap: 12, marginBottom: 40 }}>
          {[
            { icon: '⛳', text: 'Add your first Stableford scores' },
            { icon: '🏆', text: 'Participate in the next monthly draw' },
            { icon: '💚', text: 'Your charity contribution is active' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(74,222,128,0.06)', borderRadius: 10, textAlign: 'left' }}>
              <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.text}</span>
            </div>
          ))}
        </div>

        <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', fontSize: '1rem' }}>
          Go to Dashboard <ArrowRight size={18} />
        </Link>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 20 }}>
          Redirecting automatically in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default function DashboardSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }} />}>
      <SuccessContent />
    </Suspense>
  );
}
