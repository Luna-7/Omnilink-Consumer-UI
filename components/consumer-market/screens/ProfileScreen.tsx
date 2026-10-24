import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  ChevronRight,
  Store,
  Bookmark,
  ArrowLeft,
} from 'lucide-react';
import { useOmnilink } from '../context/OmnilinkContext';
import { EVA_SERVICES, editEvaProfile, emptyEvaProfile, readEvaProfile, type EvaProfile } from '@/lib/consumer-advisor/eva-onboarding';

export const ProfileScreen: React.FC<{ profileName: string | null; publisherReady: boolean; preview?: boolean }> = ({ profileName, publisherReady, preview = false }) => {
  const { products, savedProductIds, openProductDetail } = useOmnilink();
  const [collectionView, setCollectionView] = useState<'saved' | 'stores'>('saved');
  const [showImageProfile, setShowImageProfile] = useState(false);
  const [evaProfile, setEvaProfile] = useState<EvaProfile | null>(null);
  const [draft, setDraft] = useState<EvaProfile | null>(null);
  const [memoryText, setMemoryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!profileName) return;
    if (preview) {
      let saved: unknown = null;
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        const stored = window.localStorage.getItem('omnilink-eva-demo-profile');
        try { saved = stored ? JSON.parse(stored) : null; } catch { /* Invalid preview data starts fresh. */ }
      }
      const next = readEvaProfile(saved ?? { ...emptyEvaProfile, name: profileName, stage: 'done' });
      setEvaProfile(next);
      setDraft(next);
      return;
    }
    void fetch('/api/consumer/eva-profile', { credentials: 'include' })
      .then(async (response) => response.ok ? response.json() as Promise<{ profile: EvaProfile }> : null)
      .then((result) => { if (result?.profile) { const next = readEvaProfile(result.profile); setEvaProfile(next); setDraft(next); } })
      .catch(() => {});
  }, [profileName, preview]);

  async function save(payload: Record<string, unknown>) {
    if (!evaProfile) return;
    setSaving(true);
    setFeedback('');
    try {
      let next: EvaProfile;
      if (preview) {
        next = editEvaProfile(evaProfile, payload);
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          window.localStorage.setItem('omnilink-eva-demo-profile', JSON.stringify(next));
        }
      } else {
        const response = await fetch('/api/consumer/eva-profile', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json() as { profile?: EvaProfile; error?: string };
        if (!response.ok || !result.profile) throw new Error(result.error || '保存失败，请重试。');
        next = readEvaProfile(result.profile);
      }
      setEvaProfile(next);
      setDraft(next);
      setMemoryText('');
      setFeedback('已保存');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '保存失败，请重试。');
    } finally { setSaving(false); }
  }

  const savedProducts = products.filter((product) =>
    savedProductIds.includes(product.id)
  );

  if (showImageProfile) return <div className="min-h-screen bg-white px-4 pb-32 pt-5 text-[var(--market-ink)] sm:px-6"><div className="mx-auto max-w-3xl">
    <button type="button" onClick={() => setShowImageProfile(false)} className="mb-5 flex h-11 items-center gap-2 text-sm focus-visible:outline-2 focus-visible:outline-[var(--market-support)]"><ArrowLeft size={18} aria-hidden="true" />返回个人</button>
    <h1 className="text-2xl font-semibold">我的信息</h1>
    {draft && <div className="mt-6 space-y-5"><section className="py-1"><h2 className="text-base font-semibold">基本资料</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="text-sm">称呼<input value={draft.name} maxLength={40} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1 h-11 w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3" /></label><label className="text-sm">年龄段<input value={draft.ageRange} maxLength={40} onChange={(event) => setDraft({ ...draft, ageRange: event.target.value })} className="mt-1 h-11 w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3" /></label><label className="text-sm">性别<input value={draft.gender} maxLength={40} onChange={(event) => setDraft({ ...draft, gender: event.target.value })} className="mt-1 h-11 w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3" /></label></div></section><section className="py-1"><h2 className="text-base font-semibold">穿搭</h2><textarea aria-label="穿搭偏好" value={draft.preferences.clothing} maxLength={2000} rows={7} onChange={(event) => setDraft({ ...draft, preferences: { ...draft.preferences, clothing: event.target.value } })} className="mt-4 w-full resize-y rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3 py-3" /></section><section className="py-1"><h2 className="text-base font-semibold">其他偏好</h2><textarea aria-label="其他个人偏好" value={draft.preferences.other} maxLength={2000} rows={10} onChange={(event) => setDraft({ ...draft, preferences: { ...draft.preferences, other: event.target.value } })} className="mt-4 w-full resize-y rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3 py-3" /></section><button type="button" disabled={saving} onClick={() => void save({ action: 'update', name: draft.name, ageRange: draft.ageRange, gender: draft.gender, preferences: draft.preferences })} className="h-11 rounded-[var(--radius-control)] bg-[var(--market-accent)] px-5 text-sm font-semibold text-white disabled:opacity-50">保存信息</button><section className="py-1"><h2 className="text-base font-semibold">记忆</h2><div className="mt-4 flex flex-wrap items-center gap-2"><input aria-label="新增记忆" value={memoryText} maxLength={120} onChange={(event) => setMemoryText(event.target.value)} className="h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3 text-sm" /><button type="button" disabled={saving || !memoryText.trim()} onClick={() => void save({ action: 'memory', domain: 'other', text: memoryText })} className="h-11 rounded-[var(--radius-control)] bg-[var(--market-surface-muted)] px-4 text-sm disabled:opacity-50">添加</button></div>{evaProfile?.memories.length ? <ul className="mt-4 space-y-2">{evaProfile.memories.map((memory) => <li key={memory.id} className="flex min-h-11 items-center justify-between gap-3 border-b border-[var(--market-border)]/50 py-2 text-sm last:border-0"><span><span className="mr-2 text-xs text-[var(--market-text-muted)]">{EVA_SERVICES.find((service) => service.id === memory.domain)?.label || '其他'}</span>{memory.text}</span><button type="button" aria-label={`删除记忆：${memory.text}`} disabled={saving} onClick={() => void save({ action: 'forget', id: memory.id })} className="shrink-0 text-xs text-[var(--market-text-muted)]">删除</button></li>)}</ul> : null}</section><p role="status" className="text-sm text-[var(--market-support)]">{feedback}</p></div>}
    {!profileName && <Link href="/login" className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-control)] bg-[var(--market-accent)] px-4 text-sm font-semibold text-white">登录后建立档案</Link>}
  </div></div>;

  return (
    <div className="min-h-screen w-full bg-white pb-32 pt-3 text-[var(--market-ink)]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <section className="rounded-3xl border border-[var(--market-border)]/80 bg-[var(--market-surface)] p-5 shadow-xs sm:p-6">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setShowImageProfile(true)} aria-label="查看我的信息" className="flex min-w-0 items-center gap-4 text-left focus-visible:outline-2 focus-visible:outline-[var(--market-support)]">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--market-border)] bg-[var(--market-surface-muted)] text-xl font-semibold" aria-hidden="true">{profileName?.slice(0, 1).toUpperCase() ?? '访'}</span>
              <div className="min-w-0">
                <h2 className="break-all font-editorial text-2xl font-normal text-[var(--market-ink)]">
                  {profileName ?? '访客'}
                </h2>
                <p className="mt-1 text-xs text-[var(--market-text-muted)]">
                  {publisherReady ? '浏览者 / 发布者' : '浏览者'}
                </p>
              </div>
            </button>

          </div>

          <Link href={!profileName ? '/login' : publisherReady ? '/dashboard/products' : '/onboarding'} className="mt-5 flex h-11 w-full items-center justify-between rounded-[var(--radius-control)] bg-[var(--market-accent)] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--market-support)]">
            <span>{!profileName ? '登录后成为发布者' : publisherReady ? '进入发布工作台' : '成为发布者'}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-5 border-b border-[var(--market-border)]/70 px-1">
            <button
              type="button"
              onClick={() => setCollectionView('saved')}
              className={`relative flex min-h-10 items-center gap-1.5 text-sm transition-colors ${collectionView === 'saved' ? 'font-semibold text-[var(--market-ink)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--market-accent)]' : 'text-[var(--market-text-muted)] hover:text-[var(--market-ink)]'}`}
              aria-pressed={collectionView === 'saved'}
            >
              <Bookmark size={15} />
              我的收藏 <span className="text-xs font-normal">{savedProducts.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setCollectionView('stores')}
              className={`relative flex min-h-10 items-center gap-1.5 text-sm transition-colors ${collectionView === 'stores' ? 'font-semibold text-[var(--market-ink)] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[var(--market-accent)]' : 'text-[var(--market-text-muted)] hover:text-[var(--market-ink)]'}`}
              aria-pressed={collectionView === 'stores'}
            >
              <Store size={15} />
              关注店铺
            </button>
          </div>

          {collectionView === 'stores' ? (
            <div className="rounded-2xl border border-[var(--market-border)]/80 bg-[var(--market-surface)] p-10 text-center shadow-2xs">
              <Store size={30} className="mx-auto mb-2 text-[var(--market-border)]" />
              <p className="text-xs text-[var(--market-text-muted)]">关注的店铺会显示在这里</p>
            </div>
          ) : savedProducts.length === 0 ? (
            <div className="rounded-2xl border border-[var(--market-border)]/80 bg-[var(--market-surface)] p-10 text-center shadow-2xs">
              <Heart size={32} className="mx-auto mb-2 text-[var(--market-border)]" />
              <p className="text-xs text-[var(--market-text-muted)]">
                您暂未收藏单品，在商品详情中点击心形图标即可收藏
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {savedProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => openProductDetail(product)}
                  className="group flex min-h-[88px] items-center justify-between rounded-[var(--radius-card)] bg-[var(--market-canvas)] p-3.5 text-left transition-colors hover:bg-[var(--market-hover)] active:scale-[0.99]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="h-14 w-14 shrink-0 rounded-xl border border-[var(--market-border)]/60 bg-[var(--market-surface-muted)] object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-bold text-[var(--market-ink)] transition-colors">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--market-text-muted)]">
                        {product.storeName}
                      </span>
                      <span className="mt-1 block text-xs font-bold text-[var(--market-ink)]">
                        {product.formattedPrice}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    size={15}
                    className="ml-2 shrink-0 text-[var(--market-text-muted)] transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
