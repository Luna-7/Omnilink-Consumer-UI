'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink, X } from 'lucide-react'
import type { ProductItem, ScenePost } from '../types'

export function CreatorPostReader({ post, onClose, onOpenProduct }: {
  post: ScenePost
  onClose: () => void
  onOpenProduct: (product: ProductItem) => void
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  return (
    <div role="dialog" aria-modal="true" aria-label={post.title} className="fixed inset-0 z-50 overflow-y-auto bg-[#FCFDFE] text-[var(--market-ink)]">
      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <div className="sticky top-0 z-10 flex h-14 items-center justify-between bg-[#FCFDFE]">
          <span className="text-sm font-semibold">内容</span>
          <button type="button" autoFocus onClick={onClose} aria-label="关闭内容" className="grid size-10 place-items-center rounded-[var(--radius-control)] hover:bg-[#E9EDF2] focus-visible:outline-2 focus-visible:outline-[#315BFF]"><X size={20} /></button>
        </div>
        <Image unoptimized src={post.coverImage} alt="" width={800} height={600} className="aspect-[4/3] w-full rounded-[var(--radius-card)] object-cover" />
        <p className="mt-6 text-sm text-[var(--market-text-secondary)]">{post.editorName}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">{post.title}</h1>
        <div className="mt-6 space-y-7">{post.blocks?.length ? post.blocks.map((block) => {
          if (block.type === 'text') return <p key={block.id} className="whitespace-pre-wrap text-base leading-8">{block.text}</p>
          if (block.type === 'image') return block.url ? <Image key={block.id} unoptimized src={block.url} alt="" width={800} height={500} className="w-full rounded-[var(--radius-card)]" /> : null
          if (block.type === 'video') return block.url ? <video key={block.id} controls playsInline preload="metadata" className="max-h-[70vh] w-full rounded-[var(--radius-card)] bg-black" aria-label="作品视频"><source src={block.url} type={new URL(block.url).pathname.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'} />浏览器不支持播放此视频。</video> : null
          const products = block.productIds.map((id) => post.linkedProducts.find((item) => item.id === id)).filter((item): item is ProductItem => Boolean(item))
          return <div key={block.id} className={block.type === 'group' ? 'grid gap-4 sm:grid-cols-2' : ''}>{products.map((product) => <button key={product.id} type="button" onClick={() => onOpenProduct(product)} className="flex w-full items-center gap-3 rounded-[var(--radius-control)] p-2 text-left hover:bg-[#E9EDF2] focus-visible:outline-2 focus-visible:outline-[#315BFF]"><Image unoptimized src={product.mainImage} alt="" width={72} height={72} className="size-18 rounded-[var(--radius-control)] object-cover" /><span className="min-w-0"><span className="block text-sm font-semibold">{product.name}</span><span className="mt-1 block text-sm text-[var(--market-text-secondary)]">{product.formattedPrice}</span></span></button>)}</div>
        }) : <p className="whitespace-pre-wrap text-base leading-8">{post.description}</p>}</div>
        <section aria-labelledby="post-products" className="mt-10 border-t border-[var(--market-border)] pt-6">
          <h2 id="post-products" className="mb-4 text-lg font-semibold">相关商品</h2>
          <div className="space-y-3">{post.linkedProducts.map((product, index) => {
            const links = Object.entries(product.outboundLinks ?? {}).filter((entry): entry is ['xiaohongshu' | 'douyin', string] => Boolean(entry[1]));
            return <div key={product.id} className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-[var(--radius-card)] p-2 hover:bg-[#E9EDF2] sm:grid-cols-[96px_minmax(0,1fr)]">
              <button type="button" onClick={() => onOpenProduct(product)} aria-label={`查看${product.name}`} className="focus-visible:outline-2 focus-visible:outline-[#315BFF]"><Image unoptimized src={product.mainImage} alt="" width={96} height={96} className="aspect-square w-full rounded-[var(--radius-control)] object-cover" /></button>
              <div className="min-w-0"><p className="text-xs text-[var(--market-text-secondary)]">{String(index + 1).padStart(2, '0')}</p><button type="button" onClick={() => onOpenProduct(product)} className="mt-1 text-left text-sm font-semibold hover:underline">{product.name}</button><p className="mt-1 text-sm text-[var(--market-text-secondary)]">{product.formattedPrice}</p><div className="mt-2 flex flex-wrap gap-3">{links.map(([platform, url]) => <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 text-sm text-[#315BFF] hover:underline focus-visible:outline-2 focus-visible:outline-[#315BFF]">前往{platform === 'xiaohongshu' ? '小红书' : '抖音'}<ExternalLink size={13} /></a>)}</div></div>
            </div>
          })}</div>
        </section>
      </div>
    </div>
  )
}
