'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerAction, AuthState } from '@/app/actions/auth';

const initialState: AuthState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <div style={{ maxWidth: '420px', margin: '2rem auto' }}>
      <div className="card">
        <h1>Create Account</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
          Register to browse and exchange uniform items at Derby Grammar School.
        </p>

        {state?.error && (
          <div className="alert alert-danger" role="alert">
            {state.error}
          </div>
        )}

        <form action={formAction}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Sarah Jenkins"
              required
              minLength={2}
              maxLength={60}
            />
            {state?.fieldErrors?.name && (
              <p className="form-error">{state.fieldErrors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              placeholder="parent@example.com"
              required
            />
            {state?.fieldErrors?.email && (
              <p className="form-error">{state.fieldErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
            {state?.fieldErrors?.password && (
              <p className="form-error">{state.fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isPending}
            style={{ marginTop: '0.5rem' }}
          >
            {isPending ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 600 }}>
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
