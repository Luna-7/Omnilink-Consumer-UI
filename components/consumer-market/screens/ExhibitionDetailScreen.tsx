import React from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Exhibition, ProductItem } from '../types';

interface ExhibitionDetailScreenProps {
  exhibition: Exhibition;
  onClose: () => void;
  onProductClick: (product: ProductItem) => void;
}

export const ExhibitionDetailScreen: React.FC<ExhibitionDetailScreenProps> = ({
  exhibition,
  onClose,
  onProductClick,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-[var(--market-ink)] select-none pb-24 animate-in fade-in duration-200">
      {/* Editorial Hero Header */}
      <div className="relative h-[60vh] min-h-[380px] w-full overflow-hidden bg-[var(--market-ink)]">
        <img
          src={exhibition.coverImage}
          alt={exhibition.title}
          className="h-full w-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

        {/* Floating Back Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-white shadow-md backdrop-blur-md active:scale-95 transition-transform"
          aria-label="返回"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Hero Title & Subtitle */}
        <div className="absolute bottom-8 left-0 right-0 px-6 text-white max-w-2xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--market-accent)] bg-white/90 px-2 py-0.5 rounded-xs">
            线上专题策展
          </span>
          <h1 className="mt-2 font-editorial text-3xl sm:text-4xl font-bold leading-tight text-white drop-shadow-sm">
            {exhibition.title}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-white/90 leading-relaxed">
            {exhibition.subtitle}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6">
        {/* Curator Overview Statement */}
        <div className="py-6 border-b border-[var(--market-border)]">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--market-accent)]">
            策展人述评
          </h2>
          <p className="mt-2.5 font-editorial text-base sm:text-lg text-[var(--market-ink)] leading-relaxed italic">
            &ldquo;{exhibition.description}&rdquo;
          </p>
        </div>

        {/* Chapters Flow */}
        <div className="divide-y divide-[var(--market-border)]">
          {exhibition.chapters.map((chapter, idx) => (
            <div key={idx} className="py-8">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--market-accent)]">
                {chapter.chapterNumber}
              </span>
              <h3 className="mt-1 font-editorial text-2xl font-bold text-[var(--market-ink)]">
                {chapter.title}
              </h3>

              {/* Chapter Image with Shoppable Hotspot Badges */}
              <div className="relative mt-4 aspect-16/10 w-full overflow-hidden rounded-xl bg-[var(--market-surface-muted)] shadow-xs border border-[var(--market-border)]">
                <img
                  src={chapter.image}
                  alt={chapter.title}
                  className="h-full w-full object-cover"
                />

                {/* Hotspot Badges */}
                <div className="absolute bottom-3 right-3 flex flex-wrap gap-2 justify-end">
                  {chapter.taggedProducts.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => onProductClick(prod)}
                      className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[var(--market-ink)] shadow-md border border-[var(--market-border)]/60 active:scale-95 transition-all"
                    >
                      <ShoppingBag size={12} className="text-[var(--market-accent)]" />
                      <span>{prod.name}</span>
                      <span className="text-[var(--market-text-muted)] font-semibold">
                        • {prod.formattedPrice}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapter text */}
              <p className="mt-4 text-xs sm:text-sm text-[var(--market-ink)]/90 leading-relaxed font-medium">
                {chapter.contentText}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
