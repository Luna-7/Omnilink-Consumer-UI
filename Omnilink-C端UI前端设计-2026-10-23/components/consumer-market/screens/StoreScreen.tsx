import React from 'react';
import { ArrowLeft, Store, MapPin } from 'lucide-react';
import { ProductItem } from '../types';
import { useOmnilink } from '../context/OmnilinkContext';

interface StoreScreenProps {
  storeName: string;
  onClose: () => void;
  onProductClick: (product: ProductItem) => void;
}

export const StoreScreen: React.FC<StoreScreenProps> = ({
  storeName,
  onClose,
  onProductClick,
}) => {
  const { products } = useOmnilink();
  const storeProducts = products.filter(
    (p) => p.storeName.toLowerCase() === storeName.toLowerCase()
  );
  const sampleProduct = storeProducts[0] || products[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-[var(--market-ink)] select-none pb-24 animate-in fade-in duration-200">
      {/* Brand Hero Banner */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[var(--market-ink)]">
        <img
          src={sampleProduct.mainImage}
          alt={storeName}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />

        {/* Back button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-white shadow-md active:scale-95 transition-transform"
          aria-label="返回"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute bottom-6 left-6 right-6 text-white max-w-2xl mx-auto">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--market-accent)] bg-white/95 w-fit px-2 py-0.5 rounded-xs">
            <Store size={11} />
            <span>发布者</span>
          </div>
          <h1 className="mt-2 font-editorial text-3xl sm:text-4xl font-bold text-white drop-shadow-sm">
            {storeName}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-white/80 font-medium">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              <span>公开主页</span>
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 sm:px-6">
        {/* Brand Statement */}
        <div className="py-5 border-b border-[var(--market-border)]">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--market-accent)]">
            品牌理念与美学宣言
          </h2>
          <p className="mt-2 font-editorial text-base text-[var(--market-ink)] leading-relaxed">
            {sampleProduct.storeDescription ||
              '发布者介绍暂未提供。'}
          </p>
        </div>

        {/* Collection Objects */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--market-ink)]">
              品牌在售器物 ({storeProducts.length})
            </h3>
            <span className="text-[11px] text-[var(--market-text-muted)] font-semibold">店铺商品</span>
          </div>

          <div className="space-y-2.5">
            {storeProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="flex cursor-pointer items-center justify-between rounded-xl bg-[var(--market-surface)] p-3 shadow-2xs hover:shadow-xs border border-[var(--market-border)]/60 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover bg-[var(--market-surface-muted)] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[var(--market-ink)] truncate">
                      {product.name}
                    </h4>
                    <p className="mt-0.5 text-[11px] text-[var(--market-text-muted)] truncate">
                      {product.category}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[var(--market-ink)] shrink-0">
                  {product.formattedPrice}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
