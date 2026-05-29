import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types';
import { ConditionBadge } from './ConditionBadge';

export function ListingCard({ listing }: { listing: Listing }) {
  const firstMedia = listing.images[0];
  const isVideo = firstMedia && /\.(mp4|webm|ogg)$/i.test(firstMedia);
  return (
    <Link href={`/browse/${listing.id}`} className="card-elevated overflow-hidden group block">
      <div className="relative aspect-square bg-surface-overlay">
        {firstMedia ? (
          isVideo ? (
            <video src={firstMedia} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Image src={firstMedia} alt={listing.title} fill className="object-cover group-hover:scale-105 transition" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-content-secondary">No media</div>
        )}
        <div className="absolute top-2 right-2">
          <ConditionBadge condition={listing.condition} />
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold truncate">{listing.title}</h3>
        <span className="text-trust font-bold text-lg">₹{listing.price.toLocaleString()}</span>
      </div>
    </Link>
  );
}
