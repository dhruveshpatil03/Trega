'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ListingCard } from '@/components/listing/ListingCard';
import { useFilterStore } from '@/stores/useFilterStore';
import { Listing } from '@/types';

const CATEGORIES = ['All', 'Tech/Phones', 'Audio', 'Laptops', 'Fashion', 'Others'];

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { category, setCategory } = useFilterStore();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase.from('listings').select('*').eq('status', 'AVAILABLE').order('created_at', { ascending: false }).limit(50);
      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      const { data } = await query;
      setListings((data as Listing[]) || []);
      setLoading(false);
    };
    fetch();
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-24">
      <h2 className="text-2xl font-bold mb-4">Browse All</h2>
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat === 'All' ? null : cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${(category || 'All') === cat ? 'bg-trust text-white' : 'bg-surface-overlay text-content-secondary border border-subtle'}`}>{cat}</button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (<div key={i} className="card-elevated h-64 animate-pulse" />))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listings.map(item => <ListingCard key={item.id} listing={item} />)}
        </div>
      )}
    </div>
  );
}
