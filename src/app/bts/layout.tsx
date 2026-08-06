import { SITES } from "@/sites/site-registry";
import { SiteShell } from "@/components/site-shell";
import { WaveDivider } from "@/components/bts-illustrations";
import "../bts-animations.css";

export default function BtsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell site={SITES.bts}>
      <div className="-mx-4 -mt-8 mb-8 h-12 overflow-hidden">
        <WaveDivider className="h-12 w-full" />
      </div>
      {children}
    </SiteShell>
  );
}