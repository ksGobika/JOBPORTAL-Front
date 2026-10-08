"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SeekerMessagesRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/messages');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs text-slate-400">
      Loading messages...
    </div>
  );
}