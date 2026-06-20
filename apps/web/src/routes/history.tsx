import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/store/history";
import { formatDate } from "@/webrtc/stat";

export const Route = createFileRoute("/history")({
  component: HistoryComponent,
});

function HistoryComponent() {
  const { t } = useTranslation();
  const records = useHistoryStore((s) => s.records);
  const clear = useHistoryStore((s) => s.clear);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t("history.title")}</h1>
        {records.length > 0 ? (
          <Button variant="outline" size="sm" onClick={clear}>
            {t("common.clear")}
          </Button>
        ) : null}
      </div>

      {records.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("history.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="text-muted-foreground text-left">
              <tr className="border-b">
                <th className="py-2 pr-3 font-medium">{t("history.time")}</th>
                <th className="py-2 pr-3 font-medium">{t("history.action")}</th>
                <th className="py-2 pr-3 font-medium">{t("history.result")}</th>
                <th className="py-2 font-medium">{t("history.roomId")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.timestamp}-${record.uid}`} className="border-b last:border-0">
                  <td className="py-2 pr-3 font-mono">{formatDate(new Date(record.timestamp))}</td>
                  <td className="py-2 pr-3">{t(`history.${record.action}`)}</td>
                  <td className={`py-2 pr-3 ${record.result === "success" ? "text-green-500" : "text-destructive"}`}>
                    {t(`history.${record.result}`)}
                  </td>
                  <td className="py-2 font-mono break-all">{record.uid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
