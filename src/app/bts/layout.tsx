import type { Metadata } from "next";
import { SITES } from "@/sites/site-registry";
import { SiteShell } from "@/components/site-shell";
import "../bts-animations.css";

export const metadata: Metadata = {
  title: "Back to School with Megan",
  description:
    "A community book drive for families in Mount St. George & Goodwood, Tobago. Register your dependents, upload book lists, and collect matched resources on event day.",
};

export default function BtsLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell site={SITES.bts}>{children}</SiteShell>;
}