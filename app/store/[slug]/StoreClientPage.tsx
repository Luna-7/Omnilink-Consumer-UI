'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OmnilinkProvider } from '@/components/consumer-market/context/OmnilinkContext';
import { StoreScreen } from '@/components/consumer-market/screens/StoreScreen';
import { ProductDetailScreen } from '@/components/consumer-market/screens/ProductDetailScreen';
import { ReviewsScreen } from '@/components/consumer-market/screens/ReviewsScreen';
import { productsList } from '@/components/consumer-market/data/mockData';
import type { ProductItem } from '@/components/consumer-market/types';

export default function StoreClientPage({ storeName }: { storeName: string }) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [isReviewsOpen, setReviewsOpen] = useState(false);

  return (
    <div className="consumer-market-shell min-h-dvh w-full bg-white">
      <OmnilinkProvider initialProducts={productsList}>
        <StoreScreen
          storeName={storeName}
          onClose={() => router.push('/discover')}
          onProductClick={(product) => setSelectedProduct(product)}
        />

        {selectedProduct && (
          <ProductDetailScreen
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOpenStore={() => setSelectedProduct(null)}
            onOpenReviews={() => setReviewsOpen(true)}
          />
        )}

        {isReviewsOpen && selectedProduct && (
          <ReviewsScreen
            reviews={selectedProduct.reviews}
            onClose={() => setReviewsOpen(false)}
          />
        )}
      </OmnilinkProvider>
    </div>
  );
}
