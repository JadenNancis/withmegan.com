import { SITES } from "@/sites/site-registry";
import { SiteShell } from "@/components/site-shell";

export default function BtsLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell site={SITES.bts}>{children}</SiteShell>;
}