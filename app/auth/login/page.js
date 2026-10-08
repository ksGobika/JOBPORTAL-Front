"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return <div className="p-8 text-center text-xs text-slate-400">Redirecting to Login...</div>;
}