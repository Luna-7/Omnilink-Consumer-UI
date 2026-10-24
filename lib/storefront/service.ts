export interface StorefrontDiscoveryProduct {
  id: string;
  name: string;
  price: number;
  currency?: string;
  priceMode?: 'amount' | 'inquiry' | 'free';
  imageUrl?: string;
  images?: string[];
  description?: string;
  attributes: Record<string, any>;
  options?: any[];
  variants?: any[];
  outboundLinks?: any;
}

export interface StorefrontDiscoveryStore {
  id: string;
  name: string;
  slug?: string;
}

export interface StorefrontDiscoveryItem {
  product: StorefrontDiscoveryProduct;
  store: StorefrontDiscoveryStore;
}

export async function getStorefrontDiscoveryItems(limit = 100): Promise<StorefrontDiscoveryItem[]> {
  return [];
}
