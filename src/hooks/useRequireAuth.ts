'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export function useRequireAuth() {
  const { session, loading } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth');
    }
  }, [session, loading, router]);
  return { user: session?.user ?? null, loading };
}
