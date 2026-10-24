import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, BookOpenCheck, Cable, CheckCircle2, LockKeyhole, Sparkles, X } from 'lucide-react';

type CapabilityKind = 'question_set' | 'skill' | 'plugin';

const kinds: Record<CapabilityKind, { label: string; icon: typeof Sparkles }> = {
  question_set: { label: '测试题', icon: BookOpenCheck },
  skill: { label: 'Skill', icon: Sparkles },
  plugin: { label: '插件', icon: Cable },
};

const previews: { id: string; kind: CapabilityKind; title: string; description: string; includes: string[]; use: string }[] = [
  {
    id: 'style-test', kind: 'question_set', title: '个人风格探索测试',
    description: '通过场景选择和偏好题，整理适合你的穿搭方向。',
    includes: ['分步答题', '个人结果报告', '可供 AI 助手参考的风格偏好'],
    use: '获得后可以在这里开始测试，结果保存在你的账号中。',
  },
  {
    id: 'outfit-skill', kind: 'skill', title: '场合穿搭规划',
    description: '结合场合、天气、预算和已有衣物，生成可执行的穿搭方案。',
    includes: ['目标与约束梳理', '候选搭配比较', '缺少单品时的购买建议'],
    use: '获得后可以在 AI 助手中选择它来处理穿搭任务。',
  },
  {
    id: 'closet-plugin', kind: 'plugin', title: '个人衣橱连接',
    description: '将你授权的衣橱资料提供给 AI 助手，用于优先搭配已有单品。',
    includes: ['衣橱资料读取', '授权范围说明', '随时断开连接'],
    use: '获得后仍需你主动连接并授权，连接完成后才能使用。',
  },
];

export function CapabilityLibrary() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selected = previews.find((item) => item.id === selectedId);

  useEffect(() => {
    if (!selectedId) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [selectedId]);

  return (
    <>
      <section className="mt-9" aria-labelledby="owned-capabilities-title">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 id="owned-capabilities-title" className="text-lg font-semibold tracking-tight">已获得的能力</h4>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--market-surface-muted)] px-3 py-1.5 text-xs text-[var(--market-text-muted)]">0 项</span>
        </div>
        <div className="mt-3 rounded-2xl border border-dashed border-[var(--market-border)] bg-[var(--market-surface-muted)]/50 px-5 py-8 text-center" role="status">
          <LockKeyhole size={20} className="mx-auto text-[var(--market-text-muted)]" aria-hidden="true" />
          <p className="mt-3 text-sm font-medium">还没有已获得的能力</p>
          <p className="mt-1 text-xs leading-5 text-[var(--market-text-muted)]">付费能力只会在付款确认并开通后出现在这里。</p>
        </div>
      </section>

      {(['question_set', 'skill', 'plugin'] as const).map((kind) => (
        <section key={kind} className="mt-9" aria-labelledby={`capability-section-${kind}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h4 id={`capability-section-${kind}`} className="text-lg font-semibold tracking-tight">{kind === 'skill' ? 'Skills' : kinds[kind].label}</h4>
            <span className="text-xs text-[var(--market-text-muted)]">功能预览 暂未上架</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2 sm:gap-x-5">
          {previews.filter((item) => item.kind === kind).map((item) => {
            const Icon = kinds[item.kind].icon;
            return (
              <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className="group flex min-h-[76px] w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-[var(--market-surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--market-accent)] sm:min-h-[88px] sm:px-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[var(--market-surface-muted)] text-[var(--market-ink)]"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[var(--market-ink)]">{item.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[var(--market-text-muted)]">{item.description}</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-[var(--market-text-muted)] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </button>
            );
          })}
          </div>
        </section>
      ))}

      {selected && createPortal((
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="capability-dialog-title" className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-xl sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-[var(--market-text-muted)]">{kinds[selected.kind].label} 功能预览</span>
              <button ref={closeButtonRef} type="button" onClick={() => setSelectedId(null)} aria-label="关闭说明" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--market-surface-muted)] focus-visible:outline-2 focus-visible:outline-[var(--market-accent)]"><X size={18} /></button>
            </div>
            <h3 id="capability-dialog-title" className="mt-3 text-xl font-semibold">{selected.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--market-text-secondary)]">{selected.description}</p>
            <h4 className="mt-6 text-xs font-semibold">包含内容</h4>
            <ul className="mt-3 space-y-2">
              {selected.includes.map((line) => <li key={line} className="flex items-start gap-2 text-sm"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--market-accent)]" aria-hidden="true" />{line}</li>)}
            </ul>
            <p className="mt-6 rounded-xl bg-[var(--market-surface-muted)] p-3 text-xs leading-5 text-[var(--market-text-secondary)]">{selected.use}</p>
            <button type="button" onClick={() => setSelectedId(null)} className="ui-interactive mt-5 flex h-11 w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--market-accent)] text-sm font-medium text-white hover:bg-[var(--market-accent-hover)] active:scale-[0.98]">知道了</button>
          </div>
        </div>
      ), document.querySelector('.consumer-market-shell') ?? document.body)}
    </>
  );
}
