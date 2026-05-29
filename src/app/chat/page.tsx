'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { ChatThread } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatInboxPage() {
  const { session } = useAuthStore();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) { router.push('/auth'); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('chats')
        .select('*')
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order('updated_at', { ascending: false });
      setThreads((data as ChatThread[]) || []);
    };
    fetch();
  }, [session, router]);

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      {threads.length === 0 && <p className="text-content-secondary text-center py-12">No messages yet.</p>}
      <div className="space-y-2">
        {threads.map((t) => (
          <Link key={t.id} href={`/chat/${t.id}`} className="card-elevated p-4 flex items-center justify-between">
            <div>
              <p className="font-medium truncate">{t.last_message || 'No messages'}</p>
              <p className="text-sm text-content-secondary">{new Date(t.updated_at).toLocaleDateString()}</p>
            </div>
            {t.escrow_state?.agreedPrice && <span className="text-trust text-sm font-medium">Offer ₹{t.escrow_state.agreedPrice}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
