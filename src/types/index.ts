export interface UserProfile {
  id: string;
  display_name?: string;
  username?: string;
  phone?: string;
  location_geohash?: string;
  location_lat?: number;
  location_lng?: number;
}

export interface Listing {
  id: number;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  condition: 'Mint' | 'Excellent' | 'Good' | 'Fair';
  category: string;
  images: string[];
  location_geohash: string;
  location_lat: number;
  location_lng: number;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  created_at: string;
}

export interface ChatThread {
  id: string;
  item_id: number;
  buyer_id: string;
  seller_id: string;
  last_message: string;
  updated_at: string;
  escrow_state: EscrowState | null;
}

export interface EscrowState {
  agreedPrice: number;
  buyerOtpHash: string;
  sellerOtpHash: string;
  buyerVerified: boolean;
  sellerVerified: boolean;
}

export interface Message {
  id: number;
  chat_id: string;
  sender_id: string;
  text: string;
  type: 'text' | 'offer' | 'otp';
  timestamp: string;
}
