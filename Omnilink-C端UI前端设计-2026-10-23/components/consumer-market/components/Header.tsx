import React from 'react';
import { Search } from 'lucide-react';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import { useOmnilink } from '../context/OmnilinkContext';

export const Header: React.FC = () => {
  const { setSearchOpen } = useOmnilink();

  return (
    <header className="sticky top-0 z-30 w-full">
      <LiquidGlass
        radius={0}
        bevelDepth={0}
        scale={0}
        aberration={0}
        frost={12}
        tint={0.34}
        className="consumer-market-header w-full border-b border-[var(--market-glass-border)]"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-11 w-full max-w-4xl items-center rounded-[var(--radius-control)] bg-transparent px-3.5 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="搜索空间美学、单品或品牌"
          >
            <Search size={16} className="shrink-0" aria-hidden="true" />
          </button>
        </div>
      </LiquidGlass>
    </header>
  );
};
