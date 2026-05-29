import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/listing/ListingCard';
import { Suspense } from 'react';
import { ListingGridSkeleton } from '@/components/listing/ListingGridSkeleton';

export default async function HomePage() {
  const cookieStore = cookies();
  const geohash = cookieStore.get('geohash')?.value || 'te7t4sv8z'; // fallback Pune
  const prefix = geohash.substring(0, 4);

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'AVAILABLE')
    .like('location_geohash', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <main className="max-w-7xl mx-auto px-4 pt-6 pb-24">
      <h1 className="text-3xl font-bold mb-1">Trega</h1>
      <p className="text-content-secondary mb-8">Discover verified items near you</p>
      <Suspense fallback={<ListingGridSkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings?.map((item: any) => <ListingCard key={item.id} listing={item} />)}
          {listings?.length === 0 && <p className="text-content-secondary col-span-full text-center py-12">No listings nearby yet.</p>}
        </div>
      </Suspense>
    </main>
  );
}
