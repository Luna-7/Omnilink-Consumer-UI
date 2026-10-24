'use client';

import { useEffect, useRef, useState } from 'react';
import { Layers } from 'lucide-react';

type CarouselItem = { title: string; description: string; image: string };

type CarouselProps = {
  items: CarouselItem[];
  baseWidth?: number;
  aspectRatio?: number;
  effect?: 'slide';
  indicator?: 'bars';
  frame?: boolean;
  arrows?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  theme?: 'light';
  peek?: number;
  gap?: number;
  radius?: number;
  draggable?: boolean;
  round?: boolean;
  onItemClick?: (index: number) => void;
};

export default function Carousel({
  items,
  baseWidth = 390,
  aspectRatio = 0.75,
  frame = true,
  loop = false,
  autoplay = true,
  autoplayDelay = 3000,
  pauseOnHover = true,
  gap = 12,
  draggable = true,
  onItemClick,
}: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  function goTo(index: number) {
    const next = loop ? (index + items.length) % items.length : Math.max(0, Math.min(items.length - 1, index));
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ left: next * (viewport.clientWidth + gap), behavior: 'smooth' });
    setActive(next);
  }

  useEffect(() => {
    if (!autoplay || items.length < 2 || (pauseOnHover && hovered) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = loop ? (current + 1) % items.length : Math.min(current + 1, items.length - 1);
        const viewport = viewportRef.current;
        if (viewport && next !== current) viewport.scrollTo({ left: next * (viewport.clientWidth + gap), behavior: 'smooth' });
        return next;
      });
    }, autoplayDelay);
    return () => window.clearInterval(timer);
  }, [autoplay, autoplayDelay, gap, hovered, items.length, loop, pauseOnHover]);

  if (!items.length) return null;

  return (
    <div className={`mx-auto w-full ${frame ? 'ui-card--floating border border-[var(--market-border)] bg-[var(--market-surface-muted)] p-2' : ''}`} style={{ maxWidth: baseWidth }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        ref={viewportRef}
        role="region"
        aria-roledescription="轮播"
        aria-label="商品建议轮播"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1); }
          if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1); }
        }}
        onScroll={(event) => setActive(Math.max(0, Math.min(items.length - 1, Math.round(event.currentTarget.scrollLeft / (event.currentTarget.clientWidth + gap)))))}
        onPointerDown={(event) => {
          if (!draggable || event.pointerType !== 'mouse') return;
          dragRef.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          const distance = event.clientX - dragRef.current.x;
          if (Math.abs(distance) > 5) dragRef.current.moved = true;
          event.currentTarget.scrollLeft = dragRef.current.scroll - distance;
        }}
        onPointerUp={() => {
          if (!dragRef.current) return;
          suppressClickRef.current = dragRef.current.moved;
          dragRef.current = null;
          window.setTimeout(() => { suppressClickRef.current = false; }, 0);
        }}
        onPointerCancel={() => { dragRef.current = null; }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-[var(--market-support)]"
        style={{ gap }}
      >
        {items.map((item, index) => <button
          key={`${item.title}-${index}`}
          type="button"
          onClick={() => { if (!suppressClickRef.current) onItemClick?.(index); }}
          aria-label={`查看${item.title}，${item.description}`}
          className="relative aspect-[3/4] w-full shrink-0 snap-center overflow-hidden !rounded-[4px] bg-[var(--market-surface)] text-left"
          style={{ aspectRatio }}
        >
          <img src={item.image} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[var(--market-ink)]" aria-hidden="true"><Layers size={20} /></span>
          <span className="absolute inset-x-0 bottom-0 bg-[var(--market-surface)]/95 px-4 py-4">
            <span className="block line-clamp-2 text-base font-semibold text-[var(--market-ink)]">{item.title}</span>
            <span className="mt-1 block text-sm text-[var(--market-text-muted)]">{item.description}</span>
          </span>
        </button>)}
      </div>
      <div className="flex items-center gap-1.5 pt-2" aria-label="轮播页码">
        {items.map((_, index) => <button key={index} type="button" onClick={() => goTo(index)} aria-label={`查看第 ${index + 1} 张`} aria-current={active === index ? 'true' : undefined} className="flex h-11 min-w-0 flex-1 items-center !rounded-[var(--radius-control)]">
          <span className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--market-border)]">
            <span key={active === index ? `active-${index}` : index} className={`absolute inset-y-0 left-0 bg-[var(--market-ink)] ${active === index && autoplay && items.length > 1 ? 'consumer-carousel-progress' : ''}`} style={{ width: index < active || (active === index && (!autoplay || items.length === 1)) ? '100%' : active === index ? '100%' : '0%', animationDuration: `${autoplayDelay}ms`, animationPlayState: hovered && pauseOnHover ? 'paused' : 'running' }} />
          </span>
        </button>)}
      </div>
    </div>
  );
}
