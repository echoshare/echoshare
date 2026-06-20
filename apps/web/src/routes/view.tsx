import { useEffect } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReceive } from "@/hooks/use-receive";
import { usePeerStore } from "@/store/peer";

interface ViewSearch {
  target?: string;
}

export const Route = createFileRoute("/view")({
  validateSearch: (search: Record<string, unknown>): ViewSearch => ({
    target: typeof search.target === "string" ? search.target : undefined,
  }),
  component: ViewComponent,
});

function ViewComponent() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const { status, videoRef, start, play, muted, unmute } = useReceive({ autoplayDefault: true });
  const targetUID = usePeerStore((s) => s.targetUID);
  const patch = usePeerStore((s) => s.patch);

  useEffect(() => {
    const target = search.target ?? usePeerStore.getState().targetUID;
    if (target) start(target);
  }, [search.target, start]);

  return (
    <div className="relative h-full w-full bg-black">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} className="h-full w-full object-contain" playsInline controls autoPlay />

      {status !== "playing" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-white">
          <Input
            value={targetUID}
            placeholder={t("receive.targetIdPlaceholder")}
            className="max-w-xs text-center text-white"
            onChange={(e) => patch({ targetUID: e.target.value })}
          />
          <div className="flex gap-2">
            <Button onClick={() => start()}>{t("receive.start")}</Button>
            <Button variant="outline" onClick={play}>
              {t("receive.play")}
            </Button>
          </div>
          <span className="text-xs opacity-70">{t(`receive.${status}`)}</span>
        </div>
      ) : null}
      {status === "playing" && muted ? (
        <Button className="absolute bottom-4 left-4 shadow-md" onClick={unmute}>
          <VolumeX /> {t("receive.unmute")}
        </Button>
      ) : null}
    </div>
  );
}
