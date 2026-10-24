'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, Store, Layers } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [category, setCategory] = useState('空间设计与家具');
  const [bio, setBio] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-dvh w-full bg-[var(--palette-cloud,#f5f6f8)] text-[var(--palette-ink,#18181b)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200/80">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>返回灵感市场</span>
        </Link>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Check size={28} />
            </div>
            <h2 className="font-editorial text-2xl font-bold mb-2">已提交入驻申请！</h2>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-6">
              您的店铺「{storeName || '我的美学工作室'}」已完成初审建档，现在可直接进入发布者体验模式。
            </p>
            <button
              onClick={() => router.push('/discover?demoLogin=1')}
              className="h-11 px-6 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-sm"
            >
              立即进入发布者工作台
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-base">
                <Store size={18} />
              </div>
              <div>
                <h1 className="font-editorial text-2xl font-bold tracking-tight">成为 Omnilink 发布者</h1>
                <p className="text-xs text-zinc-500">向全球生活美学爱好者发布你的设计、商品与图文作品</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">店铺 / 创作者名称</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  placeholder="例如：Alex 空间美学、极简日常选品"
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">创作专注领域</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900 bg-white transition-colors"
                >
                  <option value="空间设计与家具">空间设计与家具</option>
                  <option value="时尚与穿搭造型">时尚与穿搭造型</option>
                  <option value="数字文创与周边">数字文创与周边</option>
                  <option value="数码工位美学">数码工位美学</option>
                  <option value="香氛与生活方式">香氛与生活方式</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">品牌简介 / 设计理念</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="简单介绍你的设计理念、选品原则或合作品牌..."
                  className="w-full p-3 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900 transition-colors resize-none"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60 text-xs text-zinc-600 space-y-1.5">
                <div className="flex items-center gap-1.5 font-medium text-zinc-900">
                  <Sparkles size={13} className="text-amber-600" />
                  <span>发布者特权</span>
                </div>
                <p>• 获得专属公开店铺链接与策展横滑位</p>
                <p>• 商品可直接关联图文/短片，支持全平台出海与外链</p>
                <p>• 接入 EVA 智能顾问，AI 主动向契合风格的买家精准推荐</p>
              </div>

              <button
                type="submit"
                disabled={submitting || !storeName.trim()}
                className="w-full h-11 rounded-full bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
              >
                {submitting ? '提交申请中...' : '提交入驻并开启发布'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
