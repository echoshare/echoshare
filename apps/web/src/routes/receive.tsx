import { useEffect } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { Maximize, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

import { StatInspector } from "@/components/stat-inspector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { useReceive } from "@/hooks/use-receive";
import { usePeerStore } from "@/store/peer";
import type { ReceiveMode } from "@/webrtc/types";

interface ReceiveSearch {
  target?: string;
  autoplay?: boolean;
}

export const Route = createFileRoute("/receive")({
  validateSearch: (search: Record<string, unknown>): ReceiveSearch => ({
    target: typeof search.target === "string" ? search.target : undefined,
    autoplay: search.autoplay !== undefined && search.autoplay !== "false" ? true : undefined,
  }),
  component: ReceiveComponent,
});

const RECEIVE_MODES: { value: ReceiveMode; label: string }[] = [
  { value: 0, label: "videoAudio" },
  { value: 1, label: "videoOnly" },
  { value: 2, label: "audioOnly" },
];

function ReceiveComponent() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const { status, videoRef, analysis, stats, start, stop, play } = useReceive({ autoplayDefault: search.autoplay });
  const targetUID = usePeerStore((s) => s.targetUID);
  const receiveMode = usePeerStore((s) => s.receiveMode);
  const patch = usePeerStore((s) => s.patch);

  useEffect(() => {
    if (search.target) {
      patch({ targetUID: search.target });
      start(search.target);
    }
    // Auto-start once when arriving via a receive link.
  }, [search.target, start, patch]);

  const active = status !== "idle";

  return (
    <div className="container mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-xl font-semibold">{t("receive.title")}</h1>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="target">{t("receive.targetId")}</Label>
          <Input
            id="target"
            value={targetUID}
            disabled={active}
            placeholder={t("receive.targetIdPlaceholder")}
            onChange={(e) => patch({ targetUID: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rmode">{t("receive.receiveMode")}</Label>
          <NativeSelect
            id="rmode"
            value={receiveMode}
            disabled={active}
            onChange={(e) => patch({ receiveMode: Number(e.target.value) as ReceiveMode })}
          >
            {RECEIVE_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {t(`receive.modes.${mode.label}`)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {active ? (
          <Button variant="destructive" onClick={stop}>
            {t("receive.stop")}
          </Button>
        ) : (
          <Button onClick={() => start()}>{t("receive.start")}</Button>
        )}
        <Button variant="outline" size="sm" onClick={play}>
          <Play /> {t("receive.play")}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void videoRef.current?.requestFullscreen?.()}>
          <Maximize /> {t("receive.fullscreen")}
        </Button>
        <span className="text-muted-foreground text-xs">{t(`receive.${status}`)}</span>
      </div>

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} className="aspect-video w-full rounded-none bg-black" playsInline controls />

      <StatInspector snapshot={stats} analysis={analysis} />
    </div>
  );
}
