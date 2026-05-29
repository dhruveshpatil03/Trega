import { create } from 'zustand';
import ngeohash from 'ngeohash';

interface GeoState {
  coordinates: { lat: number; lng: number } | null;
  geohash: string | null;
  error: string | null;
  requestLocation: () => void;
  setManualLocation: (lat: number, lng: number) => void;
}

export const useGeolocationStore = create<GeoState>((set) => ({
  coordinates: null,
  geohash: null,
  error: null,
  requestLocation: () => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocation not supported' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // ngeohash uses .encode(lat, lng, precision)
        const gh = ngeohash.encode(lat, lng, 9);
        set({ coordinates: { lat, lng }, geohash: gh, error: null });
        document.cookie = `geohash=${gh}; path=/; max-age=86400`;
      },
      (err) => set({ error: err.message }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },
  setManualLocation: (lat, lng) => {
    // ngeohash uses .encode(lat, lng, precision)
    const gh = ngeohash.encode(lat, lng, 9);
    set({ coordinates: { lat, lng }, geohash: gh, error: null });
    document.cookie = `geohash=${gh}; path=/; max-age=86400`;
  },
}));