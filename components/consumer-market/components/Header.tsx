import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';
import { useOmnilink } from '../context/OmnilinkContext';

export const Header: React.FC = () => {
  const router = useRouter();
  const { setSearchOpen, selectTab, cartItems, mainTab, openAiPage } = useOmnilink();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleTabSwitch = (tab: 'WORLD' | 'CART', href: string) => {
    selectTab(tab);
    try {
      router.push(href);
    } catch {
      // ignore
    }
  };

  const handleEvaSwitch = () => {
    openAiPage();
    try {
      router.push('/eva');
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/[0.06] dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl backdrop-saturate-180 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.85),0_2px_10px_-2px_rgba(0,0,0,0.03)] transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3.5 py-2.5 sm:px-6">
        {/* Logo / Brand button - Apple Glass Emblem */}
        <button
          type="button"
          onClick={() => handleTabSwitch('WORLD', '/')}
          className="flex items-center gap-2.5 text-left cursor-pointer outline-none group"
          aria-label="返回发现首页"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-zinc-800 to-zinc-950 text-xs font-bold text-white shadow-[0_2px_8px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.3)] group-hover:scale-105 active:scale-95 transition-transform duration-200">
            O
          </span>
          <div className="hidden xs:flex flex-col">
            <span className="font-editorial text-base font-bold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100">
              Omnilink
            </span>
            <span className="text-[10px] tracking-wider text-zinc-500 font-medium leading-none">
              灵感市场
            </span>
          </div>
        </button>

        {/* Search Trigger Input Box - Apple Spotlight / Safari Glass Style */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex h-9.5 flex-1 max-w-md items-center justify-between rounded-full border border-black/[0.06] dark:border-white/10 bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.07] dark:hover:bg-white/15 px-3.5 text-xs text-zinc-600 dark:text-zinc-300 transition-all duration-200 shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.05),0_1px_0_0_rgba(255,255,255,0.8)] dark:shadow-none cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-900/10 active:scale-[0.995]"
          aria-label="搜索空间美学、单品或品牌"
        >
          <span className="flex items-center gap-2 min-w-0">
            <Search size={14} className="shrink-0 text-zinc-400 dark:text-zinc-400" aria-hidden="true" />
            <span className="truncate text-zinc-500 font-normal">搜索单品、空间风格...</span>
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-white/80 dark:bg-white/15 px-2 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-300 border border-black/5 dark:border-white/10 shadow-2xs">
            ⌘K
          </span>
        </button>

        {/* Right Action Icons - Apple Liquid Glass Capsules */}
        <div className="flex items-center gap-2">
          {/* 购物车选品袋入口 */}
          <button
            type="button"
            onClick={() => handleTabSwitch('CART', '/cart')}
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 cursor-pointer outline-none active:scale-95 ${
              mainTab === 'CART'
                ? 'bg-zinc-950 text-white shadow-[0_4px_14px_rgba(0,0,0,0.22),inset_0_1px_0_0_rgba(255,255,255,0.25)] border border-zinc-900'
                : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 hover:bg-white border border-black/5 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-md'
            }`}
            aria-label={`选品袋，共有 ${cartCount} 件商品`}
            title="选品袋 / 购物车"
          >
            <ShoppingBag size={15} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f24822] px-1 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(242,72,34,0.4)] leading-none border border-white/80">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
