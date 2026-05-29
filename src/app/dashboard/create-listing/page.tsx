'use client';
import { useState, useRef } from 'react';
import { compressImage } from '@/lib/compressImage';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import { useGeolocationStore } from '@/stores/useGeolocationStore';
import { encode } from 'geohash';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/solid';

const CATEGORIES = ['Tech/Phones', 'Audio', 'Laptops', 'Fashion', 'Others'];
const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair'];
const MAX_MEDIA = 5;

export default function CreateListingPage() {
  const { profile, session } = useAuthStore();
  const { coordinates } = useGeolocationStore();
  const router = useRouter();
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState(CONDITIONS[1]);
  const [price, setPrice] = useState('');
  const [uploading, setUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setMediaFiles((prev) => [...prev, ...newFiles].slice(0, MAX_MEDIA));
  };

  const removeFile = (index: number) => setMediaFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !coordinates) {
      toast.error('Please enable location in dashboard.');
      return;
    }
    if (mediaFiles.length === 0) {
      toast.error('Capture at least one photo or video.');
      return;
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of mediaFiles) {
        let blob: Blob = file;
        if (file.type.startsWith('image/')) {
          blob = await compressImage(file);
        } else if (file.size > 50 * 1024 * 1024) {
          throw new Error(`Video ${file.name} is too large (max 50MB).`);
        }
        const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, blob, { upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(filePath);
        urls.push(publicUrl);
      }

      const geohash = encode(coordinates.lat, coordinates.lng, 9);
      const { error } = await supabase.from('listings').insert({
        seller_id: session.user.id,
        title,
        description,
        price: parseInt(price),
        condition,
        category,
        images: urls,
        location_geohash: geohash,
        location_lat: coordinates.lat,
        location_lng: coordinates.lng,
        status: 'AVAILABLE',
      });
      if (error) throw error;

      toast.success('Listing published!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish listing');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Create Listing</h1>
      <div className="flex gap-3">
        <button type="button" onClick={() => photoInputRef.current?.click()} className="flex-1 py-3 bg-surface-overlay border border-subtle rounded-xl font-medium">📸 Take Photo</button>
        <button type="button" onClick={() => videoInputRef.current?.click()} className="flex-1 py-3 bg-surface-overlay border border-subtle rounded-xl font-medium">🎥 Record Video</button>
        <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {mediaFiles.map((file, idx) => (
            <div key={idx} className="relative group">
              {file.type.startsWith('image/') ? (
                <img src={URL.createObjectURL(file)} alt="preview" className="h-24 w-full object-cover rounded-lg" />
              ) : (
                <video src={URL.createObjectURL(file)} className="h-24 w-full object-cover rounded-lg" />
              )}
              <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"><XMarkIcon className="h-4 w-4 text-white" /></button>
            </div>
          ))}
        </div>
      )}
      {mediaFiles.length === 0 && <p className="text-content-secondary text-sm">Tap a button above to capture up to 5 photos/videos.</p>}

      <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 60))} placeholder="Title (max 60 chars)" required className="w-full bg-surface-overlay border border-subtle rounded-lg p-3" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 1000))} placeholder="Description (max 1000 chars)" rows={4} required className="w-full bg-surface-overlay border border-subtle rounded-lg p-3" />
      <div className="grid grid-cols-2 gap-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-surface-overlay border border-subtle rounded-lg p-3">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="bg-surface-overlay border border-subtle rounded-lg p-3">
          {CONDITIONS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (₹)" required min="1" className="w-full bg-surface-overlay border border-subtle rounded-lg p-3" />
      <button type="submit" disabled={uploading || !coordinates} className="w-full py-3 bg-trust text-white font-semibold rounded-xl disabled:opacity-50">{uploading ? 'Publishing...' : 'Publish Listing'}</button>
      {!coordinates && <p className="text-red-400 text-sm">Set your location in Dashboard first.</p>}
    </form>
  );
}
