import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import type { WebRTCAnalysis } from "@/webrtc/analysis";
import { snapshotRows, type StatSnapshot } from "@/webrtc/stat";

export function StatInspector({
  snapshot,
  analysis,
}: {
  snapshot: StatSnapshot | null;
  analysis: WebRTCAnalysis;
}) {
  const { t } = useTranslation();
  const rows = snapshotRows(snapshot);

  return (
    <div className="rounded-none border p-3 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{t("stat.title")}</span>
        <Button variant="outline" size="xs" onClick={() => analysis.downloadLogs("echoshare-stats")}>
          {t("stat.download")}
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{t("stat.noData")}</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
          {rows.map((row) => (
            <div key={row.key} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t(`stat.${row.key}`)}</dt>
              <dd className="font-mono">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
