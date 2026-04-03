'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Check, ArrowLeft, Heart } from 'lucide-react';

declare global {
  interface Window { Razorpay: any; }
}

function SubscribeForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [plan, setPlan] = useState<'monthly' | 'yearly'>(
    (searchParams.get('plan') as 'monthly' | 'yearly') || 'monthly'
  );
  const [charityId, setCharityId] = useState('');
  const [charityPct, setCharityPct] = useState(10);
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);

  const price = plan === 'monthly' ? '£9.99/month' : '£89.99/year';
  const charityAmount = plan === 'monthly'
    ? `£${(9.99 * charityPct / 100).toFixed(2)}/month`
    : `£${(89.99 * charityPct / 100).toFixed(2)}/year`;

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/signup'); return; }
      setUser(user);
      const { data } = await supabase.from('charities').select('*').eq('is_active', true);
      if (data) setCharities(data);
    }
    load();

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function handleSubscribe() {
    if (!charityId) { alert('Please select a charity first.'); return; }
    setLoading(true);

    try {
      // Create Razorpay order
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, charityId, charityPct }),
      });

      const { orderId, amount, error } = await res.json();
      if (error) { alert('Order creation failed: ' + error); setLoading(false); return; }

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: 'INR',
        name: 'GreenDraw',
        description: `GreenDraw ${plan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              charityId,
              charityPct,
              userId: user.id,
            }),
          });
          const { success } = await verifyRes.json();
          if (success) {
            router.push('/dashboard');
          } else {
            router.push('/dashboard');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: { color: '#4ade80' },
        modal: {
          ondismiss: function() { setLoading(false); }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert('Payment failed: ' + err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', padding: '24px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 40 }}>
          <ArrowLeft size={16} /> Back
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⛳</div>
          <span className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700 }}>GreenDraw</span>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 48 }}>
          {[{ n: 1, label: 'Choose Plan' }, { n: 2, label: 'Select Charity' }, { n: 3, label: 'Payment' }].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'initial' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: step >= s.n ? 'linear-gradient(135deg, #4ade80, #10b981)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= s.n ? '#0a0f0a' : 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {step > s.n ? <Check size={14} /> : s.n}
                </div>
                <span style={{ fontSize: '0.75rem', color: step >= s.n ? 'var(--accent-green)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 1, background: step > s.n ? 'rgba(74,222,128,0.3)' : 'var(--border-subtle)', margin: '0 12px', marginBottom: 24 }} />}
            </div>
          ))}
        </div>

        {/* Step 1: Plan */}
        {step === 1 && (
          <div>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Choose your plan</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Both plans include full access to all features.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {[
                { key: 'monthly', price: '£9.99', period: '/month', label: 'Monthly', features: ['Monthly draw entry', 'Score tracking', 'Charity giving', 'Full dashboard'] },
                { key: 'yearly', price: '£89.99', period: '/year', label: 'Yearly — Save 25%', subtext: '£7.50/month', features: ['All monthly features', 'Priority support', 'Early draw access', 'Annual report'] },
              ].map(p => (
                <div key={p.key} onClick={() => setPlan(p.key as any)} className="glass-card" style={{ padding: 24, cursor: 'pointer', border: plan === p.key ? '2px solid rgba(74,222,128,0.5)' : '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                  {(p as any).subtext && <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', marginBottom: 8 }}>{(p as any).subtext}</div>}
                  <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{p.price}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>{p.period}</div>
                  <ul style={{ listStyle: 'none' }}>
                    {p.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                        <Check size={12} color="var(--accent-green)" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              Continue with {plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan →
            </button>
          </div>
        )}

        {/* Step 2: Charity */}
        {step === 2 && (
          <div>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Choose your charity</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>At least 10% of your subscription goes directly to them.</p>
            <div style={{ display: 'grid', gap: 12, marginBottom: 32 }}>
              {charities.map((charity, i) => (
                <div key={charity.id} onClick={() => setCharityId(charity.id)} className="glass-card" style={{ padding: '20px 24px', cursor: 'pointer', border: charityId === charity.id ? '2px solid rgba(74,222,128,0.5)' : '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: '2rem' }}>{['🏌️', '🎖️', '🌿', '💚'][i % 4]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{charity.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{charity.description}</div>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${charityId === charity.id ? '#4ade80' : 'var(--text-muted)'}`, background: charityId === charity.id ? '#4ade80' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {charityId === charity.id && <Check size={12} color="#0a0f0a" />}
                  </div>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: 24, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Heart size={16} color="var(--accent-green)" />
                  <span style={{ fontWeight: 500 }}>Charity contribution</span>
                </div>
                <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.1rem' }}>{charityPct}%</span>
              </div>
              <input type="range" min={10} max={50} step={5} value={charityPct} onChange={e => setCharityPct(Number(e.target.value))} style={{ width: '100%', accentColor: '#4ade80', marginBottom: 8 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>10% (minimum)</span><span>50%</span>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(74,222,128,0.08)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                You&apos;ll donate <strong style={{ color: 'var(--accent-green)' }}>{charityAmount}</strong> to your chosen charity
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary" disabled={!charityId} style={{ flex: 2, padding: '14px', fontSize: '1rem', opacity: charityId ? 1 : 0.5 }}>
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div>
            <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Review & Pay</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>You&apos;re almost there!</p>
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>Order Summary</div>
              {[
                { label: 'Plan', value: plan === 'monthly' ? 'Monthly — £9.99/month' : 'Yearly — £89.99/year' },
                { label: 'Charity', value: `${charityPct}% → ${charities.find(c => c.id === charityId)?.name || '—'}` },
                { label: 'Prize pool', value: '50% of subscription' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{row.label}</span>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 20px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 12, marginBottom: 28, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              🔒 Payments secured by Razorpay — PCI DSS compliant. Cancel anytime.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1, padding: '14px' }}>← Back</button>
              <button onClick={handleSubscribe} className="btn-primary" disabled={loading} style={{ flex: 2, padding: '14px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Opening Payment...' : `Pay ${price} →`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0f0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>}>
      <SubscribeForm />
    </Suspense>
  );
}
