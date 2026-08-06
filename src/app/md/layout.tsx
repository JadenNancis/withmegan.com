import { SITES } from "@/sites/site-registry";
import { SiteShell } from "@/components/site-shell";
import { SunsetWaveDivider } from "@/components/md-illustrations";
import "../md-animations.css";

export default function MdLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell site={SITES.md}>
      <div className="relative w-full">
        <SunsetWaveDivider className="w-full h-[24px] block opacity-80 -mt-2" />
      </div>
      {children}
    </SiteShell>
  );
}