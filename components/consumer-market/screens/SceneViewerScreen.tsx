import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ScenePost, ProductItem } from '../types';
import { useOmnilink } from '../context/OmnilinkContext';

interface SceneViewerScreenProps {
  scenePosts: ScenePost[];
  initialIndex: number;
  onClose: () => void;
  onOpenProductDetail: (product: ProductItem) => void;
}

export const SceneViewerScreen: React.FC<SceneViewerScreenProps> = ({
  scenePosts,
  initialIndex,
  onClose,
  onOpenProductDetail,
}) => {
  const { addToCart, showToast } = useOmnilink();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  const scene = scenePosts[currentIndex] || scenePosts[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % scenePosts.length);
    setSelectedProductIds([]);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + scenePosts.length) % scenePosts.length);
    setSelectedProductIds([]);
  };

  const toggleProductSelect = (id: string) => {
    setSelectedProductIds((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((i) => i !== id) : [...prev, id];
      if (updated.length > 0) {
        setIsMultiSelectMode(true);
      }
      return updated;
    });
  };

  const selectAllProducts = () => {
    if (selectedProductIds.length === scene.linkedProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(scene.linkedProducts.map((p) => p.id));
      setIsMultiSelectMode(true);
    }
  };

  const activeSelections = scene.linkedProducts.filter((p) =>
    selectedProductIds.includes(p.id)
  );

  const totalPrice = activeSelections.reduce((sum, item) => sum + item.price, 0);

  const handleBatchAddToCart = () => {
    if (activeSelections.length === 0) return;
    activeSelections.forEach((p) => addToCart(p));
    showToast(`已将 ${activeSelections.length} 件艺术好物加入选品袋！`);
    setSelectedProductIds([]);
  };

  const handleBatchBuyNow = () => {
    if (activeSelections.length === 0) return;
    activeSelections.forEach((p) => addToCart(p));
    showToast(`⚡ 一键选购成功: ${activeSelections.length} 件实物单品已锁定 (¥${totalPrice.toFixed(0)})!`);
    setSelectedProductIds([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white select-none animate-in fade-in duration-200">
      {/* Top Floating Control Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 pt-safe bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md hover:bg-black/60 active:scale-95 transition-all"
          aria-label="关闭场景预览"
        >
          <X size={18} />
        </button>

        {/* Scene index indicator & Up/Down navigation */}
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs backdrop-blur-md text-white/80">
          <button
            onClick={handlePrev}
            className="p-0.5 hover:text-white transition-colors"
            title="上一个空间"
          >
            <ChevronUp size={14} />
          </button>
          <span className="font-mono text-[11px]">
            {currentIndex + 1} / {scenePosts.length}
          </span>
          <button
            onClick={handleNext}
            className="p-0.5 hover:text-white transition-colors"
            title="下一个空间"
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Main Full-screen Media Background */}
      <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
        <img
          src={scene.coverImage}
          alt={scene.title}
          className="h-full w-full object-cover"
        />

        {/* Overlay Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

        {/* Video Play/Pause Touch Area */}
        {scene.isVideo && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute z-20 flex h-14 w-14 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md border border-white/20 active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <Pause size={24} className="fill-white" />
            ) : (
              <Play size={24} className="fill-white ml-0.5" />
            )}
          </button>
        )}
      </div>

      {/* Bottom Scene Content & Linked Objects Area */}
      <div className="relative z-20 w-full bg-gradient-to-t from-black via-black/90 to-transparent p-5 pb-safe">
        {/* Editor Info & Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <img
            src={scene.editorAvatar}
            alt={scene.editorName}
            className="h-8 w-8 rounded-full border border-white/30 object-cover"
          />
          <div>
            <span className="text-xs font-semibold text-white/90">
              {scene.editorName}
            </span>
            <div className="text-[10px] text-white/60">空间策展人</div>
          </div>
        </div>

        <h3 className="font-editorial text-xl font-bold text-white leading-snug">
          {scene.title}
        </h3>
        <p className="mt-1 text-xs text-white/80 line-clamp-2 leading-relaxed">
          {scene.description}
        </p>

        {/* Linked Shoppable Objects Shelf */}
        {scene.linkedProducts.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-white/15">
            <div className="flex items-center justify-between pb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-white/70">
                空间搭配单品 ({scene.linkedProducts.length})
              </span>
              <button
                onClick={selectAllProducts}
                className="text-[11px] text-[var(--market-accent)] bg-white/90 px-2 py-0.5 rounded-full font-bold hover:bg-white"
              >
                {selectedProductIds.length === scene.linkedProducts.length
                  ? '取消全选'
                  : '长按多选 / 全选'}
              </button>
            </div>

            {/* Horizontal Linked Products Scroll */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
              {scene.linkedProducts.map((prod) => {
                const isSelected = selectedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      if (isMultiSelectMode) {
                        toggleProductSelect(prod.id);
                      } else {
                        onOpenProductDetail(prod);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setIsMultiSelectMode(true);
                      toggleProductSelect(prod.id);
                    }}
                    className={`relative flex items-center gap-2.5 rounded-xl p-2 min-w-[210px] max-w-[240px] shrink-0 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/20 border-[var(--market-accent)] ring-1 ring-[var(--market-accent)]'
                        : 'bg-white/10 border-white/15 hover:bg-white/15'
                    }`}
                  >
                    {/* Checkbox for selection */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMultiSelectMode(true);
                        toggleProductSelect(prod.id);
                      }}
                      className="text-white hover:text-[var(--market-accent)] p-0.5"
                      title="选择单品"
                    >
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-[var(--market-accent)] fill-white" />
                      ) : (
                        <Circle size={16} className="text-white/40" />
                      )}
                    </button>

                    <img
                      src={prod.mainImage}
                      alt={prod.name}
                      className="h-11 w-11 rounded-lg object-cover bg-neutral-800"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="truncate text-xs font-bold text-white">
                        {prod.name}
                      </div>
                      <div className="text-[11px] font-bold text-white/90">
                        {prod.formattedPrice}
                      </div>
                    </div>

                    {/* Quick Add icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(prod);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white active:scale-95 transition-all"
                      title="加入选品袋"
                    >
                      <ShoppingBag size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROMINENT BOTTOM BAR FOR MULTI-SELECTION */}
        {(selectedProductIds.length > 0 || isMultiSelectMode) && (
          <div className="mt-3 rounded-2xl bg-[var(--market-surface)] p-3.5 text-[var(--market-ink)] shadow-2xl border border-[var(--market-border)] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 text-xs">
              <span className="font-medium text-[var(--market-text-muted)]">
                已选{' '}
                <strong className="text-[var(--market-ink)]">
                  {activeSelections.length}
                </strong>{' '}
                件艺术单品
              </span>
              <span className="text-sm font-bold text-[var(--market-ink)]">
                合计: ¥{totalPrice.toFixed(0)}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleBatchAddToCart}
                disabled={activeSelections.length === 0}
                className="flex-1 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[var(--market-surface-muted)] border border-[var(--market-border)] text-xs font-bold text-[var(--market-ink)] hover:bg-[var(--market-surface)] disabled:opacity-40 active:scale-98 transition-all"
              >
                <ShoppingBag size={14} />
                <span>一键加入购物车</span>
              </button>

              <button
                onClick={handleBatchBuyNow}
                disabled={activeSelections.length === 0}
                className="flex-[1.3] flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--market-accent)] text-xs font-bold text-white shadow-lg hover:bg-[var(--market-accent-hover)] active:scale-98 disabled:opacity-40 transition-all"
              >
                <Zap size={16} className="fill-white animate-pulse" />
                <span className="tracking-wide">一键选购 (¥{totalPrice.toFixed(0)})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
