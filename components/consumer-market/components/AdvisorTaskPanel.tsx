'use client'

import Link from 'next/link'
import { advisorQuestionOptions, isStyleDiscoveryGoal, styleDirectionFromAnswers, type AdvisorTask } from '@/lib/consumer-advisor/task-contract'
import { isProfileGoal, profileFieldLabel, profileQuestionMeta, PROFILE_SECTIONS } from '@/lib/consumer-advisor/profile-intake'

type Props = {
  task: AdvisorTask
  busy: boolean
  revising: boolean
  onAnswer: (answer: string) => void
  onRevise: () => void
  onRestartProfile: () => void
  onCancel: () => void
  onAddLook: (ids: string[]) => void
}

const statusLabel = {
  waiting_for_user: '等待你的回答', running: '正在执行', completed: '方案已完成', failed: '执行失败', cancelled: '已取消',
} as const

export function AdvisorTaskPanel({ task, busy, revising, onAnswer, onRevise, onRestartProfile, onCancel, onAddLook }: Props) {
  const result = task.result
  const byId = new Map(result?.products.map((product) => [product.id, product]) ?? [])
  const choices = advisorQuestionOptions(task.question)
  const styleDirection = styleDirectionFromAnswers(task.goal, task.answers)
  const profileTask = isProfileGoal(task.goal)
  const profile = result?.mode === 'profile' ? result.profile : null
  const questionMeta = profileQuestionMeta(task.question)
  return (
    <section id="consumer-advisor-task" aria-label="个人形象管理任务" className="ui-card mb-5 scroll-mt-16 border border-[var(--market-border)] bg-[var(--market-surface)] p-4 text-[var(--market-ink)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--market-text-muted)]">个人形象管理 {profileTask ? '首次建档' : isStyleDiscoveryGoal(task.goal) ? '风格探索' : '穿搭规划'}{task.preview ? ' 本地演示任务' : ''}</p>
          <h2 className="mt-1 text-base font-semibold">{task.goal}</h2>
        </div>
        <span className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] border border-[var(--market-border)] px-3 text-xs font-medium">
          <span aria-hidden="true">{task.status === 'completed' ? '✓' : task.status === 'failed' ? '!' : '•'}</span>{task.status === 'completed' && profileTask ? '档案已建立' : task.status === 'completed' && result?.mode === 'catalog_fallback' ? '目录候选已整理' : statusLabel[task.status]}
        </span>
      </div>

      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {task.steps.map((step) => <li key={step.stepNo} className="ui-card--nested flex min-h-11 items-center gap-2 border border-[var(--market-border)] bg-[var(--market-surface-muted)] px-3 py-2 text-xs">
          <span className="w-5 shrink-0 text-center font-bold" aria-hidden="true">{step.status === 'completed' ? '✓' : step.stepNo}</span>
          <span className="min-w-0 flex-1"><span className="block font-semibold">{step.label}</span>{step.outputSummary && <span className="mt-0.5 block text-[var(--market-text-muted)]">{step.outputSummary}</span>}</span>
          <span className="shrink-0 text-[var(--market-text-muted)]">{step.status === 'running' ? '进行中' : step.status === 'waiting_for_user' ? '待回答' : step.status === 'failed' ? '失败' : ''}</span>
        </li>)}
      </ol>
      {busy && <p role="status" className="mt-3 text-xs text-[var(--market-text-muted)]">正在更新任务，请稍候…</p>}
      {profileTask && task.status === 'waiting_for_user' && questionMeta && <div className="mt-4 border-t border-[var(--market-border)] pt-4">
        <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold">{questionMeta.section}</span><span className="text-[var(--market-text-muted)]">第 {questionMeta.index} / {questionMeta.total} 题</span></div>
        <div role="progressbar" aria-label="首次建档进度" aria-valuenow={questionMeta.index - 1} aria-valuemin={0} aria-valuemax={questionMeta.total} className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--market-surface-muted)]"><span className="block h-full bg-[var(--accent-secondary)]" style={{ width: `${((questionMeta.index - 1) / questionMeta.total) * 100}%` }} /></div>
        {questionMeta.index === 1 && <p className="mt-3 text-xs leading-5 text-[var(--market-text-muted)]">先记录你自己的日常感受与喜好。每题都可以跳过；不需要上传照片或提供身体测量数据。</p>}
      </div>}
      {!profileTask && task.answers.length > 0 && <div className="mt-4 border-t border-[var(--market-border)] pt-4">
        <p className="text-xs font-semibold text-[var(--market-text-muted)]">已记录的选择与补充</p>
        <div className="mt-2 flex flex-wrap gap-2">{task.answers.map((answer, index) => <span key={`${index}-${answer}`} className="inline-flex min-h-9 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] px-3 py-1 text-xs">{answer}</span>)}</div>
      </div>}

      {task.status === 'waiting_for_user' && task.question && <div className="mt-4 border-t border-[var(--market-border)] pt-4">
        <p className="text-sm font-medium">{task.question}</p>
        {choices.length > 0 && <div role="group" aria-label={task.question} className="mt-3 grid gap-2 sm:grid-cols-2">
          {choices.map((choice) => <button key={choice} type="button" disabled={busy} onClick={() => onAnswer(choice)} className="ui-card--nested flex min-h-11 items-center !rounded-[var(--radius-control)] border border-[var(--market-border)] bg-[var(--market-surface-muted)] px-3 py-2 text-left text-xs font-medium transition-colors hover:border-[var(--market-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--market-accent)] disabled:opacity-50">{choice}</button>)}
        </div>}
        <div className="mt-3 flex items-center gap-2">
          <button type="button" disabled={busy} onClick={() => onAnswer('跳过')} className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] px-4 text-xs font-semibold disabled:opacity-50">跳过</button>
          <span className="text-xs text-[var(--market-text-muted)]">也可以在下方输入自己的答案；这些选择仅用于了解偏好。</span>
        </div>
      </div>}

      {task.status === 'failed' && <p role="alert" className="mt-4 text-sm text-[var(--market-accent)]">{task.errorMessage || '任务执行失败，请重试。'}</p>}

      {profile && <div className="mt-4 space-y-4 border-t border-[var(--market-border)] pt-4">
        <p className="text-sm leading-6">{result?.summary}</p>
        <div className="grid gap-3 sm:grid-cols-2">{PROFILE_SECTIONS.map((section) => <div key={section.label} className="ui-card--nested border border-[var(--market-border)] bg-[var(--market-surface-muted)] p-3">
          <h3 className="text-sm font-semibold">{section.label}</h3>
          <dl className="mt-3 space-y-2">{section.keys.map((key) => <div key={key} className="grid grid-cols-[88px_1fr] gap-2 text-xs"><dt className="text-[var(--market-text-muted)]">{profileFieldLabel(key)}</dt><dd className="font-medium">{profile.selfReported[key] ?? '未提供'}</dd></div>)}</dl>
        </div>)}</div>
        <p className="text-xs leading-5 text-[var(--market-text-muted)]">下次提出穿搭目标时会参考这份档案；预算、尺码和必须避开的商品仍会在具体任务中确认。</p>
      </div>}

      {result && result.mode !== 'profile' && <div className="mt-4 space-y-4 border-t border-[var(--market-border)] pt-4">
        {styleDirection && <p className="text-sm leading-6">{styleDirection}</p>}
        <p className="text-sm leading-6">{result.summary}</p>
        {result.mode === 'catalog_fallback' && <p className="text-xs font-medium text-[var(--market-text-muted)]">目录规则候选 模型解读未完成</p>}
        {result.source !== 'published' && <p className="text-xs text-[var(--market-text-muted)]">包含演示商品快照；价格和供货情况需要向商家核对。</p>}
        {result.looks.map((look, index) => <article key={`${task.revision}-${index}`} className="ui-card--nested border border-[var(--market-border)] bg-[var(--market-surface-muted)] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold">{look.title}</h3><span className="text-xs font-semibold">合计 {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: look.currency }).format(look.total)}</span></div>
          <p className="mt-2 text-xs leading-5 text-[var(--market-text-secondary)]">{look.reason}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{look.productIds.map((id) => {
            const product = byId.get(id)
            if (!product) return null
            const content = <><span className="min-w-0 flex-1"><strong className="block truncate text-xs">{product.name}</strong><span className="mt-1 block text-xs text-[var(--market-text-muted)]">{product.storeName} {new Intl.NumberFormat('zh-CN', { style: 'currency', currency: product.currency }).format(product.price)}</span></span></>
            return product.storeSlug
              ? <Link key={id} href={`/store/${product.storeSlug}/products/${id}`} className="flex min-h-12 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] bg-[var(--market-surface)] px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--market-accent)]">{content}</Link>
              : <div key={id} className="flex min-h-12 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] bg-[var(--market-surface)] px-3">{content}</div>
          })}</div>
          {look.productIds.every((id) => byId.get(id)?.source === 'published') && <button type="button" onClick={() => onAddLook(look.productIds)} className="mt-3 inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[var(--market-accent)] px-4 text-xs font-semibold text-[var(--market-surface)]">确认加入购物车</button>}
        </article>)}
        {result.unknowns.length > 0 && <p className="text-xs leading-5 text-[var(--market-text-muted)]">仍需核对：{result.unknowns.join('；')}</p>}
      </div>}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--market-border)] pt-4">
        {task.status === 'completed' && profileTask && <button type="button" onClick={onRestartProfile} className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] px-4 text-xs font-semibold">重新建档</button>}
        {task.status === 'completed' && !profileTask && <button type="button" onClick={onRevise} className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] px-4 text-xs font-semibold">{revising ? '在下方输入修改要求' : '修改这次方案'}</button>}
        {task.status === 'failed' && <button type="button" disabled={busy} onClick={() => onAnswer('重试上一步')} className="inline-flex h-10 items-center rounded-[var(--radius-control)] bg-[var(--market-accent)] px-4 text-xs font-semibold text-[var(--market-surface)] disabled:opacity-50">重试</button>}
        {task.status !== 'cancelled' && task.status !== 'running' && !(profileTask && task.status === 'completed') && <button type="button" disabled={busy} onClick={onCancel} className="inline-flex h-10 items-center rounded-[var(--radius-control)] border border-[var(--market-border)] px-4 text-xs text-[var(--market-text-muted)] disabled:opacity-50">结束任务</button>}
      </div>
    </section>
  )
}
