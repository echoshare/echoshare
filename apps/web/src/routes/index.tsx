import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function HomeComponent() {
  const { t } = useTranslation();
  const stats = useQuery(trpc.signaling.stats.queryOptions());
  const online = stats.isSuccess;

  return (
    <div className="mx-auto flex min-h-full max-w-3xl flex-col items-center justify-center px-4 py-12 text-center sm:py-16">
      <span className="bg-muted text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
        <span className={`size-1.5 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
        {stats.isLoading ? "…" : online ? t("home.online") : t("home.offline")}
        {stats.data ? (
          <span className="text-muted-foreground/70">· {t("home.peersOnline", { count: stats.data.peers })}</span>
        ) : null}
      </span>

      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {t("home.heroTitle")}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-prose text-pretty sm:text-lg">
        {t("home.heroSubtitle")}
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" className="w-full sm:w-auto" render={<Link to="/share" />}>
          {t("home.startShare")}
        </Button>
        <Button size="lg" variant="outline" className="w-full sm:w-auto" render={<Link to="/receive" />}>
          {t("home.startReceive")}
        </Button>
      </div>

      {stats.data ? (
        <p className="text-muted-foreground mt-8 text-xs">
          {t("home.serverStatus")} · {t("home.uptime", { value: formatUptime(stats.data.uptimeMs) })}
        </p>
      ) : null}
    </div>
  );
}
