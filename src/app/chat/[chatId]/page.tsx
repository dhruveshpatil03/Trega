'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { OfferPanel } from '@/components/chat/OfferPanel';
import { OTPHandshake } from '@/components/transaction/OTPHandshake';
import { Message, ChatThread } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { profile, session } = useAuthStore();
  const [chatData, setChatData] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch chat details
    supabase.from('chats').select('*').eq('id', chatId).single().then(({ data }) => setChatData(data as ChatThread));

    // Fetch initial messages
    supabase.from('messages').select('*').eq('chat_id', chatId).order('timestamp', { ascending: true }).then(({ data }) => setMessages(data as Message[]));

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !session?.user) return;
    const { error } = await supabase.from('messages').insert({
      chat_id: chatId,
      sender_id: session.user.id,
      text: newMsg,
      type: 'text',
    });
    if (!error) {
      setNewMsg('');
      await supabase.from('chats').update({ last_message: newMsg.slice(0, 50), updated_at: new Date().toISOString() }).eq('id', chatId);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!profile || !chatData || !session) return <div className="p-8 text-center">Loading...</div>;

  const isBuyer = session.user.id === chatData.buyer_id;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      <header className="card-elevated px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-overlay flex items-center justify-center text-lg">{isBuyer ? chatData.seller_id[0] : chatData.buyer_id[0]}</div>
        <div><h2 className="font-semibold">{isBuyer ? 'Seller' : 'Buyer'}</h2></div>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('max-w-[80%] p-3 rounded-xl', msg.sender_id === session.user.id ? 'bg-trust/10 ml-auto' : 'bg-surface-overlay')}>
            <p>{msg.text}</p>
            {msg.timestamp && <span className="text-xs text-content-secondary mt-1 block">{format(new Date(msg.timestamp), 'HH:mm')}</span>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-subtle p-4 space-y-3">
        {chatData.escrow_state?.agreedPrice ? (
          <OTPHandshake chatId={chatId} escrowState={chatData.escrow_state} isBuyer={isBuyer} />
        ) : (
          <OfferPanel chatId={chatId} isBuyer={isBuyer} />
        )}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-surface-overlay border border-subtle rounded-xl px-4 py-2" />
          <button type="submit" className="bg-trust px-4 rounded-xl font-semibold">Send</button>
        </form>
      </div>
    </div>
  );
}
