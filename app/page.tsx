'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Trophy, TrendingUp, Users, ChevronRight, Award, Shield, Zap, ArrowRight, Check, Menu, X } from 'lucide-react';

const CHARITIES = [
  { name: 'Birdies for Kids', raised: '£12,400', desc: 'Golf scholarships for underprivileged children', emoji: '🏌️' },
  { name: 'Veterans on the Fairway', raised: '£8,750', desc: 'Therapeutic golf for armed forces veterans', emoji: '🎖️' },
  { name: 'Green Minds Foundation', raised: '£6,320', desc: 'Mental health through outdoor golf therapy', emoji: '🌿' },
  { name: 'Cancer Research Golf Alliance', raised: '£15,900', desc: 'Critical cancer research funding', emoji: '💚' },
];

const STATS = [
  { value: '£43,370', label: 'Total donated to charity' },
  { value: '2,840', label: 'Active subscribers' },
  { value: '£18,600', label: 'Prizes paid out' },
  { value: '4', label: 'Partner charities' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,15,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16 }}>⛳</span>
            </div>
            <span className="font-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>GreenDraw</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
            <Link href="/charities" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Charities</Link>
            <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Sign In</Link>
            <Link href="/subscribe" className="btn-primary" style={{ padding: '8px 20px', textDecoration: 'none', fontSize: '0.875rem' }}>Start Playing</Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }} className="mobile-menu-btn">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ background: 'rgba(10,15,10,0.98)', borderTop: '1px solid var(--border-subtle)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }} className="mobile-menu">
            <Link href="/charities" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>Charities</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>Sign In</Link>
            <Link href="/subscribe" onClick={() => setMobileMenuOpen(false)} className="btn-primary" style={{ textDecoration: 'none', textAlign: 'center', padding: '12px' }}>Start Playing</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(251,191,36,0.06) 0%, transparent 50%), #0a0f0a`, padding: '120px 24px 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="animate-fade-in-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 32, color: 'var(--accent-green)', fontSize: '0.85rem', fontWeight: 500 }}>
            <Heart size={14} fill="currentColor" /> £43,370 raised for charity this year
          </div>
          <h1 className="font-display animate-fade-in-up delay-100" style={{ fontSize: 'clamp(2.2rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: 24 }}>
            Play golf.<br /><span className="gradient-text">Give back.</span><br />Win prizes.
          </h1>
          <p className="animate-fade-in-up delay-200" style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 48px' }}>
            Subscribe to GreenDraw, enter your Stableford scores, and participate in monthly prize draws — while supporting the charity you care about most.
          </p>
          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/subscribe" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 'clamp(0.875rem, 2vw, 1rem)', padding: '14px 32px' }}>
              Start for £9.99/month <ArrowRight size={16} />
            </Link>
            <Link href="#how-it-works" className="btn-secondary" style={{ textDecoration: 'none' }}>See how it works</Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ background: 'rgba(15,25,15,0.8)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 24, textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i}>
              <div className="font-display" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, background: i % 2 === 0 ? 'linear-gradient(135deg, #4ade80, #10b981)' : 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: 'clamp(60px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: 16 }}>Simple. Meaningful. Rewarding.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Three steps to play, give, and win every month.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {[
              { icon: <Zap size={28} />, number: '01', title: 'Subscribe & Choose', desc: 'Pick a monthly or yearly plan. Select the charity you want to support — 10% or more of your subscription goes directly to them.', color: '#4ade80' },
              { icon: <TrendingUp size={28} />, number: '02', title: 'Enter Your Scores', desc: 'Log your last 5 Stableford golf scores (1–45). Your scores become your draw numbers — your game is your ticket.', color: '#fbbf24' },
              { icon: <Trophy size={28} />, number: '03', title: 'Win the Monthly Draw', desc: 'Every month, 5 winning numbers are drawn. Match 3, 4, or all 5 to win your share of the prize pool. Jackpot rolls over if unclaimed.', color: '#10b981' },
            ].map((step, i) => (
              <div key={i} className="glass-card" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 16, right: 20, fontSize: '3.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.03)', fontFamily: 'Playfair Display, serif', lineHeight: 1 }}>{step.number}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `rgba(${step.color === '#4ade80' ? '74,222,128' : step.color === '#fbbf24' ? '251,191,36' : '16,185,129'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, color: step.color }}>{step.icon}</div>
                <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 10 }}>{step.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize Pool */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) 24px', background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.06) 0%, transparent 70%)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', fontWeight: 700, marginBottom: 16 }}>Monthly Prize Pool</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 48, fontSize: '1rem' }}>50% of every subscription goes into the prize pool, split across three tiers.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { tier: '5-Number Match', share: '40%', desc: 'Rolls over if unclaimed', icon: '👑', color: '#fbbf24' },
              { tier: '4-Number Match', share: '35%', desc: 'Split among winners', icon: '🥈', color: '#94a3a4' },
              { tier: '3-Number Match', share: '25%', desc: 'Split among winners', icon: '🥉', color: '#cd7c2f' },
            ].map((prize, i) => (
              <div key={i} className="glass-card" style={{ padding: 24 }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{prize.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: prize.color, marginBottom: 4 }}>{prize.share}</div>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '0.9rem' }}>{prize.tier}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prize.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charities */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', fontWeight: 700, marginBottom: 8 }}>Your Impact Matters</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Choose a charity at signup. At least 10% of your subscription goes directly to them.</p>
            </div>
            <Link href="/charities" style={{ color: 'var(--accent-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>View all <ChevronRight size={16} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {CHARITIES.map((charity, i) => (
              <div key={i} className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{charity.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 6 }}>{charity.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{charity.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total raised</span>
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.9rem' }}>{charity.raised}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 70%)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.3rem)', fontWeight: 700, marginBottom: 16 }}>One Simple Subscription</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>Play every month. Cancel anytime.</p>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, marginBottom: 36 }}>
            {(['monthly', 'yearly'] as const).map(plan => (
              <button key={plan} onClick={() => setActiveTab(plan)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: activeTab === plan ? 'rgba(74,222,128,0.15)' : 'transparent', color: activeTab === plan ? 'var(--accent-green)' : 'var(--text-secondary)', fontWeight: activeTab === plan ? 600 : 400, fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', fontSize: '0.875rem' }}>
                {plan === 'yearly' ? 'Yearly (Save 25%)' : 'Monthly'}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { plan: 'monthly', price: '£9.99', period: '/month', features: ['Monthly prize draws', 'Score tracking', 'Charity contribution', 'Full dashboard'] },
              { plan: 'yearly', price: '£89.99', period: '/year', subtext: '£7.50/month — save £29.89', features: ['All monthly features', '25% discount', 'Priority support', 'Annual summary report'], recommended: true },
            ].map((plan, i) => (
              <div key={i} className="glass-card" style={{ padding: 24, border: plan.recommended ? '1px solid rgba(74,222,128,0.3)' : undefined, position: 'relative' }}>
                {plan.recommended && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #4ade80, #10b981)', color: '#0a0f0a', fontSize: '0.7rem', fontWeight: 700, padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>BEST VALUE</div>}
                <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{plan.price}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>{plan.period}</div>
                {(plan as any).subtext && <div style={{ color: 'var(--accent-green)', fontSize: '0.8rem', marginBottom: 16 }}>{(plan as any).subtext}</div>}
                {!(plan as any).subtext && <div style={{ marginBottom: 16 }} />}
                <ul style={{ listStyle: 'none', marginBottom: 20, textAlign: 'left' }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Check size={13} color="var(--accent-green)" />{f}
                    </li>
                  ))}
                </ul>
                <Link href={`/subscribe?plan=${plan.plan}`} className={plan.recommended ? 'btn-primary' : 'btn-secondary'} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section style={{ padding: '48px 24px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 4vw, 48px)', flexWrap: 'wrap' }}>
          {[
            { icon: <Shield size={18} />, label: 'Razorpay Secured Payments' },
            { icon: <Award size={18} />, label: 'Verified Winners Process' },
            { icon: <Users size={18} />, label: 'Transparent Draw Engine' },
            { icon: <Heart size={18} />, label: 'Guaranteed Charity Contribution' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              <span style={{ color: 'var(--accent-green)' }}>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 8vw, 80px) 24px', background: `radial-gradient(ellipse at center, rgba(16,185,129,0.12) 0%, transparent 60%)`, textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: 16 }}>Ready to make your game meaningful?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1rem' }}>Join thousands of golfers who play for purpose.</p>
          <Link href="/subscribe" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '1rem', padding: '14px 36px' }}>
            Join GreenDraw Today <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px 28px', borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>GreenDraw</div>
            <div>Golf. Give. Win. © 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[{ title: 'Platform', links: ['How it Works', 'Charities', 'Prize Pool'] }, { title: 'Account', links: ['Sign Up', 'Sign In', 'Dashboard'] }].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ marginBottom: 8 }}><Link href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</Link></div>)}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
