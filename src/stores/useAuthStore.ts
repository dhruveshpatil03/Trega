import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (session) => {
    set({ session, loading: false });
    if (session?.user) {
      get().fetchProfile();
    } else {
      set({ profile: null });
    }
  },
  fetchProfile: async () => {
    const { session } = get();
    if (!session?.user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (data) {
      set({ profile: data as UserProfile });
    } else {
      // Create minimal profile on first login
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({ id: session.user.id, phone: session.user.phone })
        .select()
        .single();
      set({ profile: newProfile as UserProfile });
    }
  },
  updateProfile: async (data) => {
    const { session } = get();
    if (!session?.user) return;
    await supabase.from('profiles').upsert({ id: session.user.id, ...data });
    await get().fetchProfile();
  },
}));
