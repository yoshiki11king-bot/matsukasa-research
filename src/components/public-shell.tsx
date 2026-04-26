import { HeaderImageCarousel } from "@/components/header-image-carousel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PublicSidebar } from "@/components/public-sidebar";
import type { MethodologyEntry, ResearchReport, ResearcherProfile } from "@/lib/types";

type PublicShellProps = {
  children: React.ReactNode;
  researchers: ResearcherProfile[];
  methodologies: MethodologyEntry[];
  reports: ResearchReport[];
  rightRail?: React.ReactNode;
  showSidebar?: boolean;
};

function getPublicShellLayoutClassName(showSidebar: boolean, hasRightRail: boolean) {
  if (showSidebar && hasRightRail) {
    return "grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_300px]";
  }

  if (showSidebar) {
    return "grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]";
  }

  if (hasRightRail) {
    return "grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]";
  }

  return "block";
}

export function PublicShell({
  children,
  researchers,
  methodologies,
  reports,
  rightRail,
  showSidebar = true,
}: PublicShellProps) {
  const layoutClassName = getPublicShellLayoutClassName(showSidebar, Boolean(rightRail));

  return (
    <div className="public-surface ui-page-flow ui-future-shell min-h-screen bg-[color:var(--color-background)]">
      <SiteHeader />
      <HeaderImageCarousel />
      <main className="ui-site-settle mx-auto w-full max-w-[1480px] px-5 py-8 lg:px-8 lg:py-10">
        <div className="ui-accent-rule mb-8 h-px w-full" />
        <div className={layoutClassName}>
          {showSidebar ? (
            <PublicSidebar
              researchers={researchers.slice(0, 3)}
              methodologies={methodologies.slice(0, 3)}
              reports={reports.slice(0, 2)}
            />
          ) : null}
          <div className="ui-content-flow min-w-0">{children}</div>
          {rightRail ? <aside className="space-y-6 xl:sticky xl:top-6">{rightRail}</aside> : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
