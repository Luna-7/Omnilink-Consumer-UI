import React from 'react';
import { Search, X, Compass } from 'lucide-react';
import { ProductItem } from '../types';

interface SearchScreenProps {
  query: string;
  results: ProductItem[];
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onProductClick: (product: ProductItem) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({
  query,
  results,
  onQueryChange,
  onClose,
  onProductClick,
}) => {
  const suggestedContexts = [
    '包豪斯书房',
    '侘寂阅读角',
    '重磅亚麻工装',
    '复古机械键盘',
    '日光绿植客厅',
    '空间监听耳机',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--market-canvas)] text-[var(--market-ink)] select-none p-5 sm:p-6 pt-safe pb-24 animate-in fade-in duration-200">
      <div className="mx-auto w-full max-w-5xl">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--market-text-muted)]"
            />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="搜索单品、材质、品牌、空间风格..."
              className="w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-[var(--market-surface)] py-3 pl-10 pr-10 text-sm text-[var(--market-ink)] placeholder-[var(--market-text-muted)]/50 outline-hidden focus:border-[var(--market-support)] focus:ring-1 focus:ring-[var(--market-support)]"
            />
            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--market-text-muted)] hover:text-[var(--market-ink)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--market-surface)] text-[var(--market-ink)] hover:bg-[var(--market-hover)] active:scale-95 transition-all"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        {/* Suggested Contexts */}
        <div className="mt-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--market-text-muted)]">
            推荐搜索灵感
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedContexts.map((contextTag) => (
              <button
                key={contextTag}
                onClick={() => onQueryChange(contextTag)}
                className="rounded-full bg-[var(--market-surface)] px-3.5 py-1.5 text-xs text-[var(--market-ink)] hover:bg-[var(--market-hover)] transition-colors"
              >
                {contextTag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-8">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--market-text-muted)]">
              <Compass size={36} strokeWidth={1.5} className="text-[var(--market-text-muted)]/40" />
              <h4 className="mt-4 font-editorial text-2xl font-normal text-[var(--market-ink)]">
                视觉灵感搜索空间
              </h4>
              <p className="mt-1 text-xs text-[var(--market-text-muted)] max-w-xs">
                支持按形态、材质、创作者或空间情绪检索美学单品
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--market-text-muted)]">
                  搜索结果 ({results.length})
                </span>
              </div>

              {results.length === 0 ? (
                <div className="py-12 text-center text-xs text-[var(--market-text-muted)]">
                  未找到与 &ldquo;{query}&rdquo; 匹配的实物单品。
                </div>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {results.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => onProductClick(product)}
                      className="flex cursor-pointer items-center justify-between rounded-[var(--radius-card)] bg-[var(--market-canvas)] p-3 hover:bg-[var(--market-hover)] transition-colors active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="h-16 w-16 rounded-lg object-cover bg-[var(--market-surface-muted)] border border-[var(--market-border)]"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-[var(--market-ink)]">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[var(--market-text-muted)]">
                            {product.creator} • {product.category}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[var(--market-ink)] pr-2">
                        {product.formattedPrice}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
