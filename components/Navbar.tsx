import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { logoutAction } from '@/app/actions/auth';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="header">
      <div className="nav-container">
        <div>
          <Link href={user ? "/listings" : "/"} className="brand">
            UniSwap
          </Link>
          <span className="school-tag">Derby Grammar School</span>
        </div>

        <nav className="nav-links">
          {user ? (
            <>
              <Link href="/listings" className="nav-link">
                Browse
              </Link>
              <Link href="/listings/new" className="nav-link">
                List an item
              </Link>
              <Link href="/my-items" className="nav-link">
                My items
              </Link>
              <Link href="/messages" className="nav-link">
                Messages
              </Link>
              <form action={logoutAction} style={{ display: 'inline' }}>
                <button type="submit" className="nav-button">
                  Log out ({user.name.split(' ')[0]})
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
