import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '2.5rem 1.5rem' }}>
        <h1 style={{ color: 'var(--accent)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>UniSwap</h1>
        <p style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Derby Grammar School Second-Hand Uniform Exchange
        </p>

        <p style={{ fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          UniSwap connects Derby Grammar School parents to easily buy, donate, and exchange second-hand school uniform items directly with each other. Find affordable blazers, jumpers, skirts, PE kit and more without waiting for school office hours.
        </p>

        {user ? (
          <div>
            <Link href="/listings" className="btn btn-primary btn-block" style={{ fontSize: '1.1rem', padding: '0.85rem' }}>
              Browse Uniform Listings
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link href="/register" className="btn btn-primary btn-block" style={{ fontSize: '1.1rem', padding: '0.85rem' }}>
              Get Started / Register
            </Link>
            <Link href="/login" className="btn btn-secondary btn-block" style={{ fontSize: '1rem' }}>
              Log In to Your Account
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem', fontSize: '0.9rem' }}>
          <strong>1. Browse & Find</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
            Filter items by type, size, gender & condition.
          </p>
        </div>
        <div className="card" style={{ padding: '1rem', fontSize: '0.9rem' }}>
          <strong>2. Reserve</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
            Lock the item so no other parent can claim it.
          </p>
        </div>
        <div className="card" style={{ padding: '1rem', fontSize: '0.9rem' }}>
          <strong>3. Direct Handover</strong>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.35rem 0 0 0' }}>
            Message inside the app to arrange payment & pickup.
          </p>
        </div>
      </div>
    </div>
  );
}
