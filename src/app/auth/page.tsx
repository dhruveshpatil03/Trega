'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeolocationStore } from '@/stores/useGeolocationStore';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const { fetchProfile } = useAuthStore();
  const { requestLocation } = useGeolocationStore();
  const router = useRouter();

  const requestOTP = async () => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      toast.error(error.message);
    } else {
      setStep('otp');
      toast.success('OTP sent');
    }
  };

  const verifyOTP = async () => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    if (error) {
      toast.error(error.message);
    } else {
      await fetchProfile();
      setStep('profile');
    }
  };

  const completeProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !username) return;
    await useAuthStore.getState().updateProfile({ display_name: displayName, username: `@${username}` });
    requestLocation();
    toast.success('Profile saved!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 pb-16">
      {step === 'phone' && (
        <div className="card-elevated p-6 max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold mb-2">Welcome to Trega</h1>
          <p className="text-content-secondary mb-6">Enter your phone number to start</p>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+919876543210" className="w-full bg-surface-overlay border border-subtle rounded-lg p-3 text-white mb-4" />
          <button onClick={requestOTP} className="w-full py-3 bg-trust text-white rounded-lg font-semibold">Send OTP</button>
        </div>
      )}
      {step === 'otp' && (
        <div className="card-elevated p-6 max-w-md mx-auto w-full">
          <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6} placeholder="123456" className="w-full bg-surface-overlay border border-subtle rounded-lg p-3 text-white mb-4 text-center tracking-widest text-2xl" />
          <button onClick={verifyOTP} className="w-full py-3 bg-trust text-white rounded-lg font-semibold">Verify</button>
        </div>
      )}
      {step === 'profile' && (
        <form onSubmit={completeProfile} className="card-elevated p-6 max-w-md mx-auto w-full space-y-4">
          <h2 className="text-xl font-semibold">Complete your profile</h2>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" className="w-full bg-surface-overlay border border-subtle rounded-lg p-3" required />
          <div className="flex items-center bg-surface-overlay border border-subtle rounded-lg p-3">
            <span className="text-content-secondary">@</span>
            <input value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} placeholder="username" className="bg-transparent flex-1 ml-2 outline-none" required />
          </div>
          <button type="submit" className="w-full py-3 bg-trust text-white rounded-lg font-semibold">Finish & Explore</button>
        </form>
      )}
    </div>
  );
}
