'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api, { authStore, getErrorMessage } from '../utils/api';

export default function AuthForm({ mode }) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStore.hasSession()) router.replace('/dashboard');
  }, [router]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('Enter your username and password.');
      return;
    }
    if (isRegister && !form.email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (isRegister && form.password.length < 6) {
      setError('Your password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register/' : '/api/auth/login/';
      const payload = isRegister
        ? { username: form.username.trim(), email: form.email.trim(), password: form.password }
        : { username: form.username.trim(), password: form.password };
      const response = await api.post(endpoint, payload);
      authStore.setTokens(response.data.access, response.data.refresh);
      router.replace('/dashboard');
    } catch (requestError) {
      setError(getErrorMessage(
        requestError,
        isRegister ? 'Registration failed. Please review your details.' : 'Login failed. Check your username and password.',
      ));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-aside">
        <Link className="brand brand-light" href="/">
          <span className="brand-mark brand-mark-light">IF</span>
          <span>InsightFlow</span>
        </Link>
        <div className="auth-aside-copy">
          <span className="eyebrow eyebrow-light">AI SaaS Dashboard</span>
          <h1>{isRegister ? 'A clearer view of what your data says next.' : 'Welcome back to your data workspace.'}</h1>
          <p>Upload, inspect, and forecast from one focused dashboard powered by your real business data.</p>
        </div>
        <div className="auth-orbit" aria-hidden="true">
          <span className="orbit orbit-one" />
          <span className="orbit orbit-two" />
          <span className="orbit-dot orbit-dot-one" />
          <span className="orbit-dot orbit-dot-two" />
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-heading">
            <span className="mobile-brand-mark">IF</span>
            <h2>{isRegister ? 'Create your account' : 'Log in to InsightFlow'}</h2>
            <p>{isRegister ? 'Start exploring and forecasting your datasets.' : 'Continue where you left off.'}</p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>
              <span>Username</span>
              <input
                name="username"
                type="text"
                value={form.username}
                onChange={updateField}
                autoComplete="username"
                placeholder="Enter your username"
                disabled={loading}
                required
              />
            </label>

            {isRegister && (
              <label>
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                />
              </label>
            )}

            <label>
              <span>Password</span>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'At least 6 characters' : 'Enter your password'}
                minLength={isRegister ? 6 : undefined}
                disabled={loading}
                required
              />
            </label>

            <button className="button button-primary auth-submit" type="submit" disabled={loading}>
              {loading && <span className="button-spinner" />}
              {loading ? (isRegister ? 'Creating account…' : 'Logging in…') : (isRegister ? 'Create account' : 'Log in')}
            </button>
          </form>

          <p className="auth-switch">
            {isRegister ? 'Already have an account?' : 'New to InsightFlow?'}{' '}
            <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create an account'}</Link>
          </p>
          <Link className="back-link" href="/">← Back to home</Link>
        </div>
      </section>
    </main>
  );
}
