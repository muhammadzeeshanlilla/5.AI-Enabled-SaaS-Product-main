'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authStore } from '../utils/api';

export default function Header({ username }) {
  const router = useRouter();

  function logout() {
    authStore.clearTokens();
    router.replace('/login');
  }

  return (
    <header className="app-header">
      <Link className="brand" href="/dashboard">
        <span className="brand-mark">IF</span>
        <span>InsightFlow</span>
      </Link>
      <div className="header-actions">
        <div className="user-chip">
          <span className="user-avatar">{username?.charAt(0).toUpperCase() || 'U'}</span>
          <div><span>Signed in as</span><strong>{username || 'User'}</strong></div>
        </div>
        <button className="button button-ghost logout-button" type="button" onClick={logout}>Log out</button>
      </div>
    </header>
  );
}
