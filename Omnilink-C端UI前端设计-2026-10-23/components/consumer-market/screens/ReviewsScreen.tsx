import React, { useState } from 'react';
import { ArrowLeft, Star, Sparkles } from 'lucide-react';
import { Review } from '../types';

interface ReviewsScreenProps {
  reviews: Review[];
  onClose: () => void;
}

export const ReviewsScreen: React.FC<ReviewsScreenProps> = ({
  reviews,
  onClose,
}) => {
  const categories = [
    '全部',
    '质感工艺',
    '空间尺寸',
    '触感体验',
    '经久耐用',
    '物流保障',
  ];
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const filteredReviews =
    selectedCategory === '全部'
      ? reviews
      : reviews.filter(
          (r) =>
            r.categoryTag.toLowerCase().includes(selectedCategory.slice(0, 2).toLowerCase()) ||
            selectedCategory.includes(r.categoryTag)
        );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white text-[var(--market-ink)] select-none pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--market-border)] bg-[var(--market-surface)] px-6 py-3.5 pt-safe">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--market-surface)] text-[var(--market-ink)] border border-[var(--market-border)] hover:bg-[var(--market-surface-muted)] shadow-xs active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-editorial text-xl font-bold text-[var(--market-ink)]">
          买家真实印象与实物评价
        </h1>
        <div className="w-9" />
      </div>

      <div className="mx-auto max-w-2xl px-6 pt-4">
        {/* Aggregated Themes Filter */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--market-text-muted)] mb-3">
          <Sparkles size={13} className="text-[var(--market-accent)]" />
          <span>AI 智能汇聚评价主题</span>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-[var(--market-accent)] text-[var(--market-surface)] shadow-xs'
                    : 'bg-[var(--market-surface)] text-[var(--market-text-muted)] border border-[var(--market-border)] hover:border-[var(--market-accent)]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Reviews List */}
        <div className="mt-6 space-y-3">
          {filteredReviews.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--market-text-muted)]/60">
              该主题暂无更多评价记录。
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl bg-[var(--market-surface)] p-4 border border-[var(--market-border)] shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--market-ink)]">
                    {review.author}
                  </span>
                  <div className="flex items-center gap-1 text-[var(--market-accent)]">
                    <Star size={13} fill="currentColor" />
                    <span className="text-xs font-bold text-[var(--market-ink)]">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-[var(--market-ink)] leading-relaxed">
                  {review.text}
                </p>

                <div className="mt-2 text-[10px] text-[var(--market-text-muted)]">
                  主题分类：{review.categoryTag}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
