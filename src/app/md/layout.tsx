import { SITES } from "@/sites/site-registry";
import { SiteShell } from "@/components/site-shell";

export default function MdLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell site={SITES.md}>{children}</SiteShell>;
}