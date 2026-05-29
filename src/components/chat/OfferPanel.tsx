'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateOTP, hashOTP } from '@/lib/crypto';
import toast from 'react-hot-toast';

interface Props {
  chatId: string;
  isBuyer: boolean;
}

export function OfferPanel({ chatId, isBuyer }: Props) {
  const [offerPrice, setOfferPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const makeOffer = async () => {
    if (!offerPrice || isNaN(+offerPrice) || +offerPrice <= 0) return;
    setSubmitting(true);
    try {
      const buyerOTP = generateOTP();
      const sellerOTP = generateOTP();
      const buyerHash = await hashOTP(buyerOTP);
      const sellerHash = await hashOTP(sellerOTP);

      // Update chat with escrow state
      const { error } = await supabase
        .from('chats')
        .update({
          escrow_state: {
            agreedPrice: parseInt(offerPrice),
            buyerOtpHash: buyerHash,
            sellerOtpHash: sellerHash,
            buyerVerified: false,
            sellerVerified: false,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatId);

      if (error) throw error;

      // Send OTP messages to both parties (for demo only; use secure channel in prod)
      await supabase.from('messages').insert([
        { chat_id: chatId, sender_id: 'system', text: `🔐 Your OTP: ${buyerOTP} – share only at meet-up.`, type: 'otp' },
        { chat_id: chatId, sender_id: 'system', text: `🔐 Your OTP: ${sellerOTP} – share only at meet-up.`, type: 'otp' },
      ]);

      toast.success('Offer sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isBuyer) {
    return <div className="bg-surface-overlay p-3 rounded-xl"><p className="text-sm text-content-secondary">Wait for buyer to make an offer.</p></div>;
  }
  return (
    <div className="bg-surface-overlay p-3 rounded-xl space-y-2">
      <p className="text-sm text-content-secondary">Make an offer</p>
      <div className="flex gap-2">
        <input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder="₹ Amount" className="flex-1 bg-surface border border-subtle rounded-lg px-4 py-2" />
        <button onClick={makeOffer} disabled={submitting} className="bg-trust text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50">Offer</button>
      </div>
    </div>
  );
}
