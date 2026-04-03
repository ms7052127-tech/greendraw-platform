'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Search, ExternalLink, ArrowLeft, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const EMOJIS = ['🏌️', '🎖️', '🌿', '💚', '🏆', '⭐', '🎯', '🌍'];

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });
      setCharities(data || []);
      setFiltered(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(charities.filter(c =>
      c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
    ));
  }, [search, charities]);

  const featured = filtered.find(c => c.is_featured);
  const rest = filtered.filter(c => !c.is_featured);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,15,10,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⛳</div>
            <span className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>GreenDraw</span>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Sign In</Link>
            <Link href="/subscribe" className="btn-primary" style={{ padding: '8px 20px', textDecoration: 'none', fontSize: '0.875rem' }}>Start Playing</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px' }}>
        {/* Header */}
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.875rem', marginBottom: 40 }}>
          <ArrowLeft size={16} /> Back to home
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, color: '#f472b6', fontSize: '0.85rem' }}>
            <Heart size={14} fill="currentColor" /> Supporting causes that matter
          </div>
          <h1 className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: 16 }}>
            Charities We Support
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 560, margin: '0 auto' }}>
            Choose the cause closest to your heart. At least 10% of your subscription goes directly to your chosen charity every month.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto 48px' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
            placeholder="Search charities..."
            style={{ paddingLeft: 48 }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}
          </div>
        ) : (
          <>
            {/* Featured charity */}
            {featured && (
              <div className="glass-card" style={{ padding: 0, marginBottom: 32, overflow: 'hidden', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div style={{ padding: '8px 20px', background: 'rgba(251,191,36,0.08)', borderBottom: '1px solid rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⭐ Featured Charity</span>
                </div>
                <div style={{ padding: 32, display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {featured.image_url && (
                    <img src={featured.image_url} alt={featured.name} style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 14, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 10 }}>{featured.name}</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20, fontSize: '0.95rem' }}>{featured.description}</p>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Total raised</span>
                        <div style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.2rem' }}>{formatCurrency(featured.total_raised)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {featured.website_url && (
                          <a href={featured.website_url} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', padding: '8px 16px', fontSize: '0.875rem' }}>
                            Visit <ExternalLink size={14} />
                          </a>
                        )}
                        <Link href="/subscribe" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Heart size={14} /> Support This Charity
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All charities grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {rest.map((charity, i) => (
                <div key={charity.id} className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  {charity.image_url && (
                    <div style={{ height: 160, overflow: 'hidden' }}>
                      <img src={charity.image_url} alt={charity.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    </div>
                  )}
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: '1.5rem' }}>{EMOJIS[(i + 1) % EMOJIS.length]}</span>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{charity.name}</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 20 }}>{charity.description}</p>

                    {/* Upcoming events */}
                    {charity.upcoming_events && charity.upcoming_events.length > 0 && (
                      <div style={{ marginBottom: 16, padding: '12px', background: 'rgba(74,222,128,0.06)', borderRadius: 10 }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming Events</div>
                        {charity.upcoming_events.slice(0, 2).map((evt: any, j: number) => (
                          <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                            📅 {evt.title} — {evt.date}
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Total raised</span>
                        <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{formatCurrency(charity.total_raised)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {charity.website_url && (
                          <a href={charity.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', textDecoration: 'none' }}>
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <Link href="/subscribe" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                          <Heart size={13} /> Support
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>💚</div>
                No charities found matching &quot;{search}&quot;
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div style={{ marginTop: 80, textAlign: 'center', padding: '60px 24px', background: 'rgba(15,25,15,0.5)', borderRadius: 24, border: '1px solid var(--border-subtle)' }}>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 12 }}>Ready to make a difference?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '1.05rem' }}>
            Subscribe to GreenDraw and start supporting your chosen charity today.
          </p>
          <Link href="/subscribe" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', fontSize: '1rem' }}>
            <Heart size={18} /> Start Supporting Now
          </Link>
        </div>
      </div>
    </div>
  );
}
