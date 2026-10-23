'use client'

import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { LiquidGlass } from '@/components/ui/liquid-glass'
import { advanceEvaProfile, EVA_SERVICES, emptyEvaProfile, questionsForService, type EvaProfile } from '@/lib/consumer-advisor/eva-onboarding'

const ageRanges = ['不填写', '18 岁以下', '18–24 岁', '25–34 岁', '35–44 岁', '45 岁以上']
const genders = ['不填写', '女', '男', '其他']

export function EvaWelcomeFlow({ initialProfile, preview = false }: { initialProfile?: EvaProfile; preview?: boolean }) {
  const [profile, setProfile] = useState<EvaProfile>(initialProfile ?? emptyEvaProfile)
  const [name, setName] = useState(profile.name)
  const [ageRange, setAgeRange] = useState(profile.ageRange || '不填写')
  const [gender, setGender] = useState(profile.gender || '不填写')
  const [selection, setSelection] = useState({ key: '', value: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const question = profile.service && profile.stage === 'quiz'
    ? questionsForService(profile.service).find((item) => !(item.key in profile.answers))
    : null
  const selectedAnswer = question && selection.key === question.key ? selection.value : ''
  const serviceLabel = EVA_SERVICES.find((item) => item.id === profile.service)?.label
  const completedAnswers = profile.service ? questionsForService(profile.service).filter((item) => item.key in profile.answers) : []

  async function save(payload: Record<string, string>) {
    setBusy(true)
    setError(null)
    try {
      if (preview) { setProfile((current) => advanceEvaProfile(current, payload)); return }
      const response = await fetch('/api/consumer/eva-profile', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json() as { profile?: EvaProfile; error?: string }
      if (!response.ok || !result.profile) throw new Error(result.error || '保存失败，请重试。')
      setProfile(result.profile)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '保存失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  return <div className="flex min-h-dvh flex-col bg-white text-[var(--market-ink)]">
    <header className="sticky top-0 z-10 border-b border-[var(--market-border)] bg-white/95 px-4 py-3 text-white backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <a href="/discover" aria-label="返回发现" className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-white/80 focus-visible:outline-2 focus-visible:outline-white"><ArrowLeft size={18} /></a>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--market-support-soft)] text-xs font-bold text-white">EVA</span>
        <div><h1 className="text-sm font-semibold text-white">EVA</h1><p className="text-xs text-white/70">个人助手</p></div>
      </div>
    </header>

    <main className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 pb-36 pt-8 sm:px-6" aria-live="polite">
      <div className="max-w-[88%]"><p className="mb-2 text-xs font-medium text-[var(--market-support)]">EVA</p><p className="text-sm leading-6">你好，我是 EVA。先填几项资料，之后你可以选择想体验的服务。</p></div>
      {profile.stage === 'basic' && <div className="max-w-[92%]"><p className="mb-2 text-xs font-medium text-[var(--market-support)]">EVA</p><form onSubmit={(event) => { event.preventDefault(); void save({ action: 'basic', name, ageRange, gender }) }} className="ui-card--nested space-y-4 border border-[var(--market-border)] bg-[var(--market-surface-muted)] p-4" aria-label="填写个人资料">
        <label className="block text-sm font-medium">怎么称呼你？<input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required className="mt-2 h-11 w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3 outline-none focus-visible:border-[var(--market-support)]" placeholder="填写昵称" /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="block text-sm font-medium">年龄段（选填）<select value={ageRange} onChange={(event) => setAgeRange(event.target.value)} className="mt-2 h-11 w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3">{ageRanges.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="block text-sm font-medium">性别（选填）<select value={gender} onChange={(event) => setGender(event.target.value)} className="mt-2 h-11 w-full rounded-[var(--radius-control)] border border-[var(--market-border)] bg-white px-3">{genders.map((value) => <option key={value}>{value}</option>)}</select></label></div>
        <button type="submit" disabled={busy || !name.trim()} className="h-11 rounded-[var(--radius-control)] bg-[var(--market-accent)] px-5 text-sm font-semibold text-white disabled:opacity-50">发给 EVA</button>
      </form></div>}

      {profile.stage !== 'basic' && <div className="ml-auto flex max-w-[85%] items-center justify-end gap-2"><p className="ui-card--nested bg-[var(--market-surface-muted)] px-3 py-2 text-sm">叫我 {profile.name}{profile.ageRange && profile.ageRange !== '不填写' ? ` · ${profile.ageRange}` : ''}{profile.gender && profile.gender !== '不填写' ? ` · ${profile.gender}` : ''}</p><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--market-border)] bg-[var(--market-surface-muted)] text-sm" aria-label="我的头像">{profile.name.slice(0, 1)}</span></div>}

      {(profile.stage === 'choice' || profile.stage === 'quiz' || profile.stage === 'done') && <div className="max-w-[92%]"><p className="mb-2 text-xs font-medium text-[var(--market-support)]">EVA</p><p className="text-sm leading-6">好的，{profile.name}。你想先从哪一项开始？</p>{profile.stage === 'choice' && <div className="mt-3 grid gap-2 sm:grid-cols-2">{EVA_SERVICES.map((service) => <button key={service.id} type="button" disabled={busy} onClick={() => void save({ action: 'service', service: service.id })} className="ui-card--nested flex h-14 items-center border border-[var(--market-border)] bg-[var(--market-surface-muted)] px-4 text-left text-sm font-medium hover:border-[var(--market-support)] disabled:opacity-50">{service.label}</button>)}<button type="button" disabled={busy} onClick={() => void save({ action: 'service', service: 'browse' })} className="ui-card--nested flex h-14 items-center border border-[var(--market-border)] bg-[var(--market-surface-muted)] px-4 text-left text-sm font-medium hover:border-[var(--market-support)] disabled:opacity-50">先逛逛</button></div>}</div>}

      {profile.service && profile.stage !== 'choice' && <div className="ml-auto max-w-[85%] rounded-[var(--radius-control)] bg-[var(--market-surface-muted)] px-3 py-2 text-sm">{serviceLabel}</div>}
      {completedAnswers.map((item) => <div key={item.key} className="space-y-2"><div className="max-w-[88%]"><p className="mb-1 text-xs font-medium text-[var(--market-support)]">EVA</p><p className="text-sm">{item.prompt}</p></div><p className="ml-auto w-fit max-w-[85%] rounded-[var(--radius-control)] bg-[var(--market-surface-muted)] px-3 py-2 text-sm">{profile.answers[item.key]}</p></div>)}
      {profile.stage === 'quiz' && question && (() => {
        const questions = questionsForService(profile.service!)
        const current = completedAnswers.length + 1
        return <section className="max-w-[92%]" aria-label={`第 ${current} 题，共 ${questions.length} 题`}>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--market-ink)]">第 {current} 题</span>
              <span className="text-[var(--market-text-muted)]">{current}/{questions.length}</span>
            </div>
            <div role="progressbar" aria-label="问卷进度" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={current} className="h-1 overflow-hidden rounded-full bg-[var(--market-surface-muted)]">
              <div className="h-full rounded-full bg-[var(--market-ink)] transition-[width]" style={{ width: `${(current / questions.length) * 100}%` }} />
            </div>
          </div>
          <fieldset className="m-0 min-w-0 border-0 p-0">
            <legend className="text-base font-semibold leading-6">{question.prompt}</legend>
            <div role="radiogroup" aria-label={question.prompt} className="mt-4 grid gap-2">
              {question.options.map((option) => {
                const checked = selectedAnswer === option
                return <label key={option} className="cursor-pointer">
                  <input type="radio" name={`eva-${question.key}`} value={option} checked={checked} disabled={busy} onChange={() => setSelection({ key: question.key, value: option })} className="peer sr-only" />
                  <span className={`flex min-h-12 items-center gap-3 rounded-[var(--radius-card-nested)] border px-4 text-sm transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--market-support)] ${checked ? 'border-[var(--market-ink)] bg-[var(--market-surface-muted)]' : 'border-[var(--market-border)] bg-white hover:bg-[var(--market-hover)]'}`}>
                    <span aria-hidden="true" className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${checked ? 'border-[var(--market-ink)]' : 'border-[var(--market-text-muted)]'}`}>
                      {checked && <span className="h-2 w-2 rounded-full bg-[var(--market-ink)]" />}
                    </span>
                    <span className="flex-1">{option}</span>
                  </span>
                </label>
              })}
            </div>
          </fieldset>
          <div className="mt-4 flex items-center justify-between">
            <button type="button" disabled={busy} onClick={() => void save({ action: 'answer', answer: '跳过' })} className="h-11 px-3 text-sm text-[var(--market-text-muted)] disabled:opacity-50">跳过</button>
            <button type="button" disabled={busy || !selectedAnswer} onClick={() => void save({ action: 'answer', answer: selectedAnswer })} className="h-11 rounded-[var(--radius-control)] bg-[var(--market-accent)] px-5 text-sm font-semibold text-white disabled:opacity-40">下一题</button>
          </div>
        </section>
      })()}
      {profile.stage === 'done' && <div className="max-w-[88%]"><p className="mb-2 text-xs font-medium text-[var(--market-support)]">EVA</p><p className="text-sm leading-6">{preview ? '预览完成。' : '资料已存到「我的形象」。'}接下来想聊什么？</p><div className="mt-3 flex flex-wrap gap-2"><a href="/discover?openEva=1" className="inline-flex h-11 items-center rounded-[var(--radius-control)] bg-[var(--market-accent)] px-4 text-sm font-semibold text-white">继续和 EVA 聊</a><a href="/discover" className="inline-flex h-11 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] px-4 text-sm">先逛逛</a></div></div>}
      {error && <p role="alert" className="text-sm text-[var(--market-accent)]">{error}</p>}
    </main>

    <div className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-6"><LiquidGlass radius={14} bevelDepth={7} scale={18} aberration={1} frost={8} tint={0.24} className="mx-auto flex max-w-3xl items-center gap-2 border border-[var(--market-glass-border)] p-1.5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] text-xl text-white" aria-hidden="true">+</span><input disabled value="" readOnly aria-label="聊天输入" placeholder={profile.stage === 'done' ? '继续和 EVA 聊…' : '先完成上方的填写或选择…'} className="h-11 min-w-0 flex-1 rounded-[var(--radius-control)] bg-transparent px-3 text-sm text-white placeholder:text-white/65" /><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--market-accent)] text-white opacity-40" aria-hidden="true"><Send size={18} /></span></LiquidGlass></div>
  </div>
}
