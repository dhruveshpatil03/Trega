'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeolocationStore } from '@/stores/useGeolocationStore';
import { supabase } from '@/lib/supabase';
import { Listing } from '@/types';
import { ListingCard } from '@/components/listing/ListingCard';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { profile, session } = useAuthStore();
  const { coordinates, requestLocation, setManualLocation } = useGeolocationStore();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/auth');
      return;
    }
    const fetch = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false });
      setMyListings((data as Listing[]) || []);
    };
    fetch();
  }, [session, router]);

  const handleManualLocation = () => {
    const lat = parseFloat(prompt('Enter latitude') || '');
    const lng = parseFloat(prompt('Enter longitude') || '');
    if (!isNaN(lat) && !isNaN(lng)) {
      setManualLocation(lat, lng);
      toast.success('Location updated');
    }
  };

  if (!profile) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-8">
      <div className="card-elevated p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-overlay flex items-center justify-center text-2xl">{profile.display_name?.[0] || '?'}</div>
          <div>
            <h2 className="text-xl font-bold">{profile.display_name || 'User'}</h2>
            <p className="text-content-secondary">{profile.username}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <button onClick={requestLocation} className="text-sm bg-surface-overlay px-4 py-2 rounded-lg">
            {coordinates ? '📍 Location set' : '📍 Share location'}
          </button>
          <button onClick={handleManualLocation} className="text-sm bg-surface-overlay px-4 py-2 rounded-lg">Set Manually</button>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">My Listings</h3>
          <Link href="/dashboard/create-listing" className="bg-trust text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Listing</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myListings.map(item => <ListingCard key={item.id} listing={item} />)}
          {myListings.length === 0 && <p className="text-content-secondary col-span-full text-center py-8">You haven't listed anything yet.</p>}
        </div>
      </div>
    </div>
  );
}
