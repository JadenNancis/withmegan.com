"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteConfig } from "./site-registry";

const SiteCtx = createContext<SiteConfig | null>(null);

export function SiteProvider({ site, children }: { site: SiteConfig; children: ReactNode }) {
  return <SiteCtx.Provider value={site}>{children}</SiteCtx.Provider>;
}

export function useSite(): SiteConfig {
  const ctx = useContext(SiteCtx);
  if (!ctx) throw new Error("useSite must be used inside <SiteProvider>");
  return ctx;
}