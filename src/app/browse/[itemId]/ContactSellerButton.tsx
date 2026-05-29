'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import toast from 'react-hot-toast';

export function ContactSellerButton({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { session } = useAuthStore();

  const handleContact = async () => {
    const user = session?.user;
    if (!user) {
      router.push('/auth');
      return;
    }
    const chatId = `${user.id}_${listing.seller_id}_${listing.id}`;
    // Create chat if not exists
    const { error } = await supabase.from('chats').upsert({
      id: chatId,
      item_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
    }, { onConflict: 'id' });
    if (error) {
      toast.error('Could not start chat');
    } else {
      router.push(`/chat/${chatId}`);
    }
  };

  return (
    <button onClick={handleContact} className="w-full py-3 bg-trust text-white font-semibold rounded-xl">
      Contact Seller
    </button>
  );
}
