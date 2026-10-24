"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

type MessageAlign = "start" | "end"
type ScrollerContextValue = { autoScroll: boolean }

const ScrollerContext = React.createContext<ScrollerContextValue>({ autoScroll: false })

function MessageScrollerProvider({ autoScroll = false, children }: { autoScroll?: boolean; children: React.ReactNode }) {
  return <ScrollerContext.Provider value={{ autoScroll }}>{children}</ScrollerContext.Provider>
}

function MessageScroller({ className, children, ...props }: React.ComponentProps<"div">) {
  const { autoScroll } = React.useContext(ScrollerContext)
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const wasAtLiveEdge = React.useRef(true)
  const lastAnchorId = React.useRef<string | null>(null)

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!autoScroll || !viewport || !wasAtLiveEdge.current) return

    const anchors = viewport.querySelectorAll<HTMLElement>('[data-scroll-anchor="true"]')
    const lastAnchor = anchors.item(anchors.length - 1)
    if (lastAnchor && lastAnchor.dataset.messageId !== lastAnchorId.current) {
      lastAnchorId.current = lastAnchor.dataset.messageId ?? null
      viewport.scrollTo({ top: Math.max(0, lastAnchor.offsetTop - viewport.offsetTop - 16), behavior: "smooth" })
    } else {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" })
    }
  }, [children, autoScroll])

  return (
    <div
      ref={viewportRef}
      data-slot="message-scroller"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      onScroll={(event) => {
        const viewport = event.currentTarget
        const { scrollTop, scrollHeight, clientHeight } = viewport
        const anchor = viewport.querySelector<HTMLElement>('[data-scroll-anchor="true"]')
        const anchorNearTop = anchor ? anchor.offsetTop - viewport.offsetTop - scrollTop < 120 : false
        wasAtLiveEdge.current = scrollHeight - scrollTop - clientHeight < 96 || anchorNearTop
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function MessageScrollerContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-scroller-content" className={cn("flex min-h-full flex-col", className)} {...props} />
}

function MessageScrollerItem({ messageId, scrollAnchor = false, className, ...props }: React.ComponentProps<"article"> & { messageId: string; scrollAnchor?: boolean }) {
  return <article data-slot="message-scroller-item" data-message-id={messageId} data-scroll-anchor={scrollAnchor ? "true" : undefined} className={className} {...props} />
}

function MessageScrollerButton({ onClick, className, ...props }: React.ComponentProps<"button">) {
  return (
    <button type="button" aria-label="跳到最新消息" onClick={onClick} className={cn("absolute bottom-4 right-4 z-10 grid size-9 place-items-center rounded-full bg-[var(--text-primary)] text-[var(--surface)] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]", className)} {...props}>
      <ArrowDown className="size-4" aria-hidden="true" />
    </button>
  )
}

function Message({ align = "start", className, ...props }: React.ComponentProps<"div"> & { align?: MessageAlign }) {
  return <div data-slot="message" data-align={align} className={cn("flex w-full", align === "end" ? "justify-end" : "justify-start", className)} {...props} />
}

function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-content" className={cn("flex min-w-0 max-w-full flex-col", className)} {...props} />
}

function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="message-footer" className={cn("mt-2 flex items-center gap-1", className)} {...props} />
}

function Bubble({ align = "start", variant = "default", className, ...props }: React.ComponentProps<"div"> & { align?: MessageAlign; variant?: "default" | "muted" }) {
  return <div data-slot="bubble" data-align={align} data-variant={variant} className={cn("max-w-full text-sm leading-6", variant === "muted" ? "rounded-[14px] rounded-br-md bg-[var(--text-primary)] px-4 py-3 text-[var(--surface)]" : "text-[var(--text-primary)]", className)} {...props} />
}

function BubbleContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bubble-content" className={cn("whitespace-pre-wrap", className)} {...props} />
}

export { Bubble, BubbleContent, Message, MessageContent, MessageFooter, MessageScroller, MessageScrollerButton, MessageScrollerContent, MessageScrollerItem, MessageScrollerProvider }
