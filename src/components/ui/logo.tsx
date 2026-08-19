"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export function Logo({ href, className }: { href?: string; className?: string }) {
  const text = (
    <span
      className={cn(
        "inline-flex items-center justify-center font-pixelify text-2xl font-bold tracking-wider",
        className,
      )}
    >
      MRD
    </span>
  );

  return href ? <Link href={href}>{text}</Link> : text;
}