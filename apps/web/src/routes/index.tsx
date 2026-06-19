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
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("home.heroTitle")}</h1>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">{t("home.heroSubtitle")}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button render={<Link to="/share" />}>{t("home.startShare")}</Button>
        <Button variant="outline" render={<Link to="/receive" />}>
          {t("home.startReceive")}
        </Button>
      </div>

      <section className="mt-8 rounded-none border p-4 text-sm">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-red-500"}`} />
          <span className="font-medium">{t("home.serverStatus")}</span>
          <span className="text-muted-foreground">
            {stats.isLoading ? "…" : online ? t("home.online") : t("home.offline")}
          </span>
        </div>
        {stats.data ? (
          <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-xs">
            <span>{t("home.peersOnline", { count: stats.data.peers })}</span>
            <span>{t("home.uptime", { value: formatUptime(stats.data.uptimeMs) })}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
