import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { ProductItem } from '../types';

interface AiCartComparisonDialogProps {
  pair: [ProductItem, ProductItem] | null;
  onClose: () => void;
}

export const AiCartComparisonDialog: React.FC<AiCartComparisonDialogProps> = ({
  pair,
  onClose,
}) => {
  if (!pair) return null;
  const [p1, p2] = pair;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[var(--market-surface)] p-6 shadow-2xl border border-[var(--market-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--market-border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--market-accent)]" />
            <h2 className="font-editorial text-2xl font-bold text-[var(--market-ink)]">
              AI 单品智能对比
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--market-surface-muted)] text-[var(--market-ink)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Side by side items */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[p1, p2].map((product, idx) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl bg-[var(--market-surface)] p-3.5 border border-[var(--market-border)] shadow-xs"
            >
              <div className="relative h-28 w-full overflow-hidden rounded-lg bg-[var(--market-surface-muted)] border border-[var(--market-border)]/60">
                <img
                  src={product.mainImage}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 rounded-xs bg-[var(--market-ink)] px-1.5 py-0.5 text-[9px] text-white font-mono">
                  单品 {idx + 1}
                </span>
              </div>
              <h4 className="mt-2.5 font-medium text-xs text-[var(--market-ink)] line-clamp-1">
                {product.name}
              </h4>
              <span className="text-xs font-bold text-[var(--market-accent)]">
                {product.formattedPrice}
              </span>
              <div className="mt-2 space-y-1 border-t border-[var(--market-border)]/60 pt-2 text-[10px] text-[var(--market-text-muted)]">
                <div>
                  <span className="text-[var(--market-text-muted)]/70">类别：</span>{' '}
                  <span className="text-[var(--market-ink)]">{product.category}</span>
                </div>
                <div>
                  <span className="text-[var(--market-text-muted)]/70">材质：</span>{' '}
                  <span className="text-[var(--market-ink)] line-clamp-1">
                    {product.specs['材质'] ||
                      product.specs['Material'] ||
                      product.specs['Timber'] ||
                      product.specs['Frame'] ||
                      '自然材质工艺'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Curator Conclusion */}
        <div className="mt-4 rounded-xl border border-[var(--market-accent)]/20 bg-[var(--market-accent)]/8 p-3.5 text-xs text-[var(--market-ink)]">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--market-accent)]">
            <Sparkles size={12} />
            <span>AI 空间策展人结论</span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--market-ink)]">
            {p1.category === p2.category
              ? `两件器物均展现了独特的建筑空间结构。若注重细腻触感与温润光影，${p1.name} 能营造宁静的私密焦点；而 ${p2.name} 具有更强烈的空间雕塑存在感。`
              : `检测到互补搭配关系。${p1.name}（${p1.category}）与 ${p2.name}（${p2.category}）在同一当代生活空间中放置时，材质与色调能产生和谐自然的呼应。`}
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-[var(--market-accent)] py-2.5 text-xs font-bold text-white hover:bg-[var(--market-accent-hover)] transition-colors shadow-xs"
        >
          我知道了
        </button>
      </div>
    </div>
  );
};
