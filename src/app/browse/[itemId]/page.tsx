import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ConditionBadge } from '@/components/listing/ConditionBadge';
import Image from 'next/image';
import { ContactSellerButton } from './ContactSellerButton';

export default async function ItemDetailPage({ params }: { params: { itemId: string } }) {
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.itemId)
    .single();

  if (!listing) notFound();

  const firstMedia = listing.images[0];
  const isVideo = firstMedia && /\.(mp4|webm|ogg)$/i.test(firstMedia);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-surface-overlay">
            {firstMedia ? (
              isVideo ? (
                <video src={firstMedia} controls className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <Image src={firstMedia} alt={listing.title} fill className="object-cover" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-content-secondary">No media</div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {listing.images.slice(1).map((url: string, i: number) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                {/\.(mp4|webm|ogg)$/i.test(url) ? (
                  <video src={url} className="w-full h-full object-cover" />
                ) : (
                  <Image src={url} alt="" fill className="object-cover" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-trust">₹{listing.price.toLocaleString()}</span>
            <ConditionBadge condition={listing.condition} />
          </div>
          <p className="text-content-secondary">{listing.description}</p>
          <div className="text-sm text-content-secondary">
            <span className="block">Category: {listing.category}</span>
            <span className="block">Listed: {new Date(listing.created_at).toLocaleDateString()}</span>
          </div>
          <ContactSellerButton listing={listing} />
        </div>
      </div>
    </div>
  );
}
