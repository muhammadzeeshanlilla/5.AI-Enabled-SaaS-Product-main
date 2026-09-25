'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authStore } from '../utils/api';

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!authStore.hasSession()) {
      router.replace('/login');
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="screen-loader" role="status">
        <span className="loader-mark">IF</span>
        <span className="spinner" />
        <p>Checking your session…</p>
      </div>
    );
  }

  return children;
}
