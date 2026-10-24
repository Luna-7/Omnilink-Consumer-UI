'use client';

import { useState } from 'react';
import './PillNav.css';

export type NavItem = {
  label: string;
  href: string;
  badge?: number;
};

type PillNavProps = {
  logoAlt: string;
  items: NavItem[];
  activeHref: string;
  onItemClick: (href: string) => void;
  intro: boolean;
};

export default function PillNav({ logoAlt, items, activeHref, onItemClick, intro }: PillNavProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const activeIndex = Math.max(0, items.findIndex((item) => item.href === activeHref));
  const pillIndex = hovered ?? (activeIndex >= 0 ? activeIndex : 0);
  const itemCount = Math.max(1, items.length);
  const isEvaActive = activeHref === '/eva' || activeHref === '/discover/eva';

  return (
    <div className={`pill-nav__layout pointer-events-auto mx-auto flex w-full max-w-[500px] items-center gap-2.5 select-none ${intro ? 'pill-nav--intro' : ''}`}>
      {/* EVA Floating Orb (Apple Liquid Glass Sphere) */}
      <button
        type="button"
        onClick={() => onItemClick('/eva')}
        aria-label={logoAlt}
        title="EVA 智能生活与形象顾问"
        className={`pill-nav__orb flex h-13 w-13 sm:h-14 sm:w-14 shrink-0 flex-col items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
          isEvaActive
            ? 'bg-zinc-950 border border-zinc-900 text-white shadow-[0_12px_28px_rgba(0,0,0,0.32),inset_0_1px_0.5px_rgba(255,255,255,0.3)] ring-2 ring-zinc-900 ring-offset-2'
            : 'bg-white/75 dark:bg-zinc-900/75 hover:bg-white/90 border border-white/80 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04),inset_0_1.5px_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-180 hover:shadow-lg'
        }`}
      >
        <span className={`font-bold text-[12px] leading-tight ${isEvaActive ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>EVA</span>
        <span className={`text-[9px] font-medium leading-none ${isEvaActive ? 'text-white/80' : 'text-zinc-500'}`}>顾问</span>
      </button>

      {/* Main Track Tabs - Apple Liquid Glass Capsule Bar */}
      <nav
        role="navigation"
        aria-label="底部导航"
        className="pill-nav flex-1 min-w-0 h-13 sm:h-14 rounded-full border border-white/80 dark:border-white/10 bg-white/72 dark:bg-zinc-900/72 backdrop-blur-2xl backdrop-saturate-180 p-1 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.04),inset_0_1.5px_1px_0_rgba(255,255,255,0.9)]"
      >
        <div
          className="pill-nav__track relative grid h-full w-full items-center rounded-full"
          style={{ gridTemplateColumns: `repeat(${itemCount}, minmax(0, 1fr))` }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Active Glide Indicator - Apple Segmented Control Easing */}
          {!isEvaActive && (
            <span
              aria-hidden="true"
              className="pill-nav__glide pointer-events-none absolute bottom-0.5 top-0.5 rounded-full bg-zinc-950 dark:bg-white shadow-[0_4px_14px_rgba(0,0,0,0.22),inset_0_1px_0.5px_rgba(255,255,255,0.35)] transition-[left,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                width: `calc(100% / ${itemCount})`,
                left: `calc(100% / ${itemCount} * ${pillIndex})`,
              }}
            />
          )}

          {/* Navigation Tab Buttons */}
          {items.map((item, index) => {
            const isActive = !isEvaActive && item.href === activeHref;
            const isTabHovered = hovered === index;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => onItemClick(item.href)}
                onMouseEnter={() => setHovered(index)}
                onFocus={() => setHovered(index)}
                onBlur={() => setHovered(null)}
                aria-current={isActive ? 'page' : undefined}
                className={`pill-nav__item relative z-10 flex h-full min-w-0 items-center justify-center rounded-full px-1 text-xs sm:text-sm font-semibold transition-colors duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 ${
                  isActive
                    ? 'text-white dark:text-zinc-950'
                    : isTabHovered
                    ? 'text-zinc-950 dark:text-white font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <span className="relative inline-flex items-center gap-1">
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f24822] px-1 text-[10px] font-bold text-white shadow-[0_2px_6px_rgba(242,72,34,0.4)] leading-none"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
