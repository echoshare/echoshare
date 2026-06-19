import { Link, createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useShare } from "@/hooks/use-share";
import { MEDIA_MODES, usePeerStore } from "@/store/peer";

export const Route = createFileRoute("/share")({
  component: ShareComponent,
});

function ShareComponent() {
  const { t } = useTranslation();
  const { status, roomId, viewers, start, stop } = useShare();
  const customUID = usePeerStore((s) => s.customUID);
  const mediaModeValue = usePeerStore((s) => s.mediaModeValue);
  const patch = usePeerStore((s) => s.patch);

  const busy = status !== "idle";
  const live = status === "live";
  const receiveLink = roomId ? `${window.location.origin}/receive?target=${encodeURIComponent(roomId)}` : "";

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("toast.copied"));
    } catch {
      toast.error(t("toast.copyFailed"));
    }
  }

  return (
    <div className="container mx-auto max-w-xl space-y-4 px-4 py-6">
      <h1 className="text-xl font-semibold">{t("share.title")}</h1>

      <div className="space-y-1.5">
        <Label htmlFor="customId">{t("share.customId")}</Label>
        <Input
          id="customId"
          value={customUID}
          disabled={busy}
          placeholder={t("share.customIdPlaceholder")}
          onChange={(e) => patch({ customUID: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mode">{t("share.mediaMode")}</Label>
        <NativeSelect
          id="mode"
          value={mediaModeValue}
          disabled={busy}
          onChange={(e) => patch({ mediaModeValue: Number(e.target.value) })}
        >
          {MEDIA_MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>
              {t(`share.modes.${mode.label}`)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex items-center gap-2">
        {live ? (
          <Button variant="destructive" onClick={stop}>
            {t("share.stop")}
          </Button>
        ) : (
          <Button onClick={() => void start()} disabled={busy}>
            {status === "requesting" ? t("share.requesting") : t("share.start")}
          </Button>
        )}
        <span className="text-muted-foreground text-xs">{t(`share.${status}`)}</span>
      </div>

      {live ? (
        <div className="space-y-2 rounded-none border p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">{t("share.roomId")}</span>
            <span className="font-mono break-all">{roomId}</span>
          </div>
          <p className="text-muted-foreground text-xs">{t("share.roomIdHint")}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void copy(roomId)}>
              <Copy /> {t("share.copyId")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => void copy(receiveLink)}>
              <Copy /> {t("share.copyLink")}
            </Button>
            <Button size="sm" variant="ghost" render={<Link to="/view" search={{ target: roomId }} />}>
              {t("nav.view")}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {t("share.live")} · {viewers}
          </p>
        </div>
      ) : null}
    </div>
  );
}
