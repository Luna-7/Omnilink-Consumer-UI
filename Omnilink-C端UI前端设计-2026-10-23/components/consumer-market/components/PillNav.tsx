'use client';

import { useState } from 'react';
import { LiquidGlass } from '@/components/ui/liquid-glass';
import './PillNav.css';

type Item = { label: string; href: string };
type PillNavProps = {
  logoAlt: string;
  items: Item[];
  activeHref: string;
  onItemClick: (href: string) => void;
  intro: boolean;
};

export default function PillNav({ logoAlt, items, activeHref, onItemClick, intro }: PillNavProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = Math.max(0, items.findIndex((item) => item.href === activeHref));
  const pillIndex = hovered ?? activeIndex;

  return <div className={`pill-nav__layout pointer-events-none mx-auto flex w-full max-w-[470px] items-center gap-2 ${intro ? 'pill-nav--intro' : ''}`}>
    <LiquidGlass
      radius={999}
      scale={48}
      aberration={14}
      bevelDepth={37}
      frost={0.4}
      tint={0.12}
      className="pill-nav__orb pointer-events-auto h-14 w-14 shrink-0 border border-[var(--market-border)]/70 shadow-sm"
    >
      <button type="button" className="pill-nav__logo flex h-full w-full items-center justify-center rounded-full text-xs font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-support)]" onClick={() => onItemClick('/discover/eva')} aria-label={logoAlt}>
        EVA
      </button>
    </LiquidGlass>
    <LiquidGlass
      role="navigation"
      aria-label="底部导航"
      radius={32}
      bevelDepth={8}
      scale={12}
      aberration={1}
      frost={12}
      tint={0.34}
      className="pill-nav pointer-events-auto h-14 min-w-0 flex-1 border border-[var(--market-glass-border)] p-[3px] shadow-sm"
    >
      <div className="pill-nav__track relative grid h-12 min-w-0 grid-cols-3 items-center rounded-full p-1" onMouseLeave={() => setHovered(null)}>
        <span
          aria-hidden="true"
          className="pill-nav__glide pointer-events-none absolute bottom-1 top-1"
          style={{ width: 'calc((100% - 8px) / 3)', left: `calc(4px + (100% - 8px) / 3 * ${pillIndex})` }}
        />
        {items.map((item, index) => <button key={item.href} type="button" onClick={() => onItemClick(item.href)} onMouseEnter={() => setHovered(index)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} aria-current={item.href === activeHref ? 'page' : undefined} className="pill-nav__item relative z-10 flex h-10 min-w-0 items-center justify-center rounded-full px-1 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
          {item.label}
        </button>)}
      </div>
    </LiquidGlass>
  </div>;
}
