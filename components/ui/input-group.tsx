import * as React from "react"
import { cn } from "@/lib/utils"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-group" className={cn("flex min-w-0 flex-col", className)} {...props} />
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="input-group-control" className={cn("min-w-0 flex-1 resize-none bg-transparent outline-none", className)} {...props} />
}

function InputGroupAddon({ align = "block-end", className, ...props }: React.ComponentProps<"div"> & { align?: "block-start" | "block-end" }) {
  return <div data-slot="input-group-addon" data-align={align} className={cn("flex items-center gap-1", align === "block-start" ? "order-first" : "order-last", className)} {...props} />
}

function InputGroupButton({ className, size = "icon-sm", variant = "ghost", ...props }: React.ComponentProps<"button"> & { size?: "icon-sm" | "sm"; variant?: "ghost" | "outline" | "default" }) {
  const sizeClass = size === "sm" ? "h-9 px-3" : "size-9"
  const variantClass = variant === "default" ? "bg-[var(--text-primary)] text-[var(--surface)]" : variant === "outline" ? "border border-[var(--border-subtle)]" : "hover:bg-[var(--surface-muted)]"
  return <button data-slot="input-group-button" data-size={size} data-variant={variant} className={cn("inline-flex shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] disabled:pointer-events-none disabled:opacity-50", sizeClass, variantClass, className)} {...props} />
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea }
