'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { hashOTP } from '@/lib/crypto';
import { EscrowState } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  chatId: string;
  escrowState: EscrowState;
  isBuyer: boolean;
}

export function OTPHandshake({ chatId, escrowState, isBuyer }: Props) {
  const [otpInput, setOtpInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myVerified = isBuyer ? escrowState.buyerVerified : escrowState.sellerVerified;

  const handleVerify = async () => {
    if (!otpInput || otpInput.length !== 4) return;
    setSubmitting(true);
    try {
      const { data: chat, error } = await supabase.from('chats').select('*').eq('id', chatId).single();
      if (error || !chat) throw new Error('Chat not found');

      const otherHash = isBuyer ? chat.escrow_state.sellerOtpHash : chat.escrow_state.buyerOtpHash;
      const inputHash = await hashOTP(otpInput);

      if (inputHash !== otherHash) {
        toast.error('Invalid OTP');
        setSubmitting(false);
        return;
      }

      const updatedEscrow = { ...chat.escrow_state };
      if (isBuyer) updatedEscrow.buyerVerified = true;
      else updatedEscrow.sellerVerified = true;

      await supabase.from('chats').update({ escrow_state: updatedEscrow }).eq('id', chatId);

      toast.success('OTP verified!');

      // If both verified, mark listing as SOLD
      if (updatedEscrow.buyerVerified && updatedEscrow.sellerVerified) {
        await supabase.from('listings').update({ status: 'SOLD' }).eq('id', chat.item_id);
        toast.success('Transaction complete!');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (myVerified) {
    return <div className="bg-trust/10 p-3 rounded-xl text-trust font-medium">✅ You have verified. Waiting for the other party.</div>;
  }

  return (
    <div className="bg-surface-overlay p-3 rounded-xl space-y-2">
      <p className="text-sm text-content-secondary">Enter the 4‑digit OTP from the other person</p>
      <div className="flex gap-2">
        <input type="text" maxLength={4} value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))} className="bg-surface border border-subtle rounded-lg px-4 py-2 w-24 text-center text-xl tracking-widest" placeholder="0000" />
        <button onClick={handleVerify} disabled={submitting || otpInput.length !== 4} className="bg-trust text-white px-4 rounded-lg font-semibold disabled:opacity-50">Verify</button>
      </div>
    </div>
  );
}
