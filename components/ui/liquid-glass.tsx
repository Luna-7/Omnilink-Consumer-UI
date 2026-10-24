"use client";

import React, { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LiquidGlassProps = HTMLAttributes<HTMLDivElement> & {
  contentClassName?: string;
  radius?: number;
  bevelDepth?: number;
  scale?: number;
  aberration?: number;
  frost?: number;
  tint?: number;
};

export function LiquidGlass({
  children,
  className,
  contentClassName,
  radius = 999,
  bevelDepth,
  scale,
  aberration,
  frost = 20,
  tint = 0.2,
  style,
  ...rest
}: LiquidGlassProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden backdrop-blur-2xl bg-white/75 dark:bg-zinc-900/80 border border-white/30 shadow-sm transition-all",
        className
      )}
      style={{
        borderRadius: radius,
        WebkitBackdropFilter: `blur(${frost}px) saturate(160%)`,
        backdropFilter: `blur(${frost}px) saturate(160%)`,
        ...style,
      }}
      {...rest}
    >
      {contentClassName ? (
        <div className={contentClassName}>{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
