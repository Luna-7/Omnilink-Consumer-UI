'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'consumer' | 'creator'>('creator');
  const [name, setName] = useState('Alex 空间美学');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('omnilink_user_role', role);
      window.localStorage.setItem('omnilink_user_name', name || (role === 'creator' ? 'Alex 空间美学' : '体验访客'));
    }
    router.push('/discover?demoLogin=1');
  };

  return (
    <div className="min-h-dvh w-full bg-[var(--palette-cloud,#f5f6f8)] text-[var(--palette-ink,#18181b)] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200/80">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 mb-6 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>返回灵感市场</span>
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-base">
            O
          </div>
          <div>
            <h1 className="font-editorial text-2xl font-bold tracking-tight">Omnilink 账号登录</h1>
            <p className="text-xs text-zinc-500">体验买家好物发现与创作者发布功能</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-2">选择体验身份</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole('creator');
                  setName('Alex 空间美学');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'creator'
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Sparkles size={16} className={role === 'creator' ? 'text-amber-600' : 'text-zinc-400'} />
                  {role === 'creator' && <CheckCircle2 size={14} className="text-zinc-900" />}
                </div>
                <div className="text-xs font-semibold text-zinc-900">创作者 / 发布者</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">发布作品、好物与空间设计</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('consumer');
                  setName('灵感探索者');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'consumer'
                    ? 'border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900'
                    : 'border-zinc-200 hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <User size={16} className={role === 'consumer' ? 'text-indigo-600' : 'text-zinc-400'} />
                  {role === 'consumer' && <CheckCircle2 size={14} className="text-zinc-900" />}
                </div>
                <div className="text-xs font-semibold text-zinc-900">买家 / 访客</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">浏览选品、EVA 形象建档</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">展示昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-zinc-900 transition-colors"
              placeholder="请输入您的称呼"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-full bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800 active:scale-98 transition-all shadow-sm"
          >
            以「{role === 'creator' ? '创作者' : '买家'}」身份进入
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span>无需复杂验证码</span>
          <Link href="/onboarding" className="text-zinc-800 font-medium hover:underline">
            申请成为认证创作者 →
          </Link>
        </div>
      </div>
    </div>
  );
}
