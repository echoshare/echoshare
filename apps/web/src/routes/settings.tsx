import { useEffect, useState } from "react";

import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { usePeerStore, VIDEO_FORMATS } from "@/store/peer";
import { requestDevicePermissions } from "@/webrtc/create-stream";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { t } = useTranslation();
  const store = usePeerStore();
  const patch = store.patch;

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  async function enumerate() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    setAudioDevices(devices.filter((device) => device.kind === "audioinput"));
    setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
  }

  async function refreshDevices() {
    await requestDevicePermissions();
    await enumerate();
  }

  useEffect(() => {
    void enumerate();
  }, []);

  return (
    <div className="container mx-auto max-w-xl space-y-4 px-4 py-6">
      <h1 className="text-xl font-semibold">{t("settings.title")}</h1>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-sm">{t("settings.serverSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="serverUrl">{t("settings.serverUrl")}</Label>
          <Input
            id="serverUrl"
            value={store.serverURL}
            onChange={(e) => patch({ serverURL: e.target.value })}
          />
          <p className="text-muted-foreground text-xs">{t("settings.serverUrlHint")}</p>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-sm">{t("settings.iceSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="ice">{t("settings.iceServers")}</Label>
          <Textarea
            id="ice"
            rows={3}
            value={store.iceServers.join("\n")}
            placeholder={"stun:stun.l.google.com:19302\nturn:turn.example.com|user|pass"}
            onChange={(e) => patch({ iceServers: e.target.value.split("\n") })}
          />
          <p className="text-muted-foreground text-xs">{t("settings.iceHint")}</p>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-sm">{t("settings.videoSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Label htmlFor="codec">{t("settings.videoFormat")}</Label>
          <NativeSelect
            id="codec"
            value={store.videoFormat}
            onChange={(e) => patch({ videoFormat: e.target.value as (typeof VIDEO_FORMATS)[number] })}
          >
            {VIDEO_FORMATS.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </NativeSelect>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm">{t("settings.deviceSection")}</CardTitle>
          <Button variant="outline" size="xs" onClick={() => void refreshDevices()}>
            {t("settings.refreshDevices")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="audioDevice">{t("settings.audioDevice")}</Label>
            <NativeSelect
              id="audioDevice"
              value={store.audioDeviceId}
              onChange={(e) => patch({ audioDeviceId: e.target.value })}
            >
              <option value="">{t("settings.defaultDevice")}</option>
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || device.deviceId}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="videoDevice">{t("settings.videoDevice")}</Label>
            <NativeSelect
              id="videoDevice"
              value={store.videoDeviceId}
              onChange={(e) => patch({ videoDeviceId: e.target.value })}
            >
              <option value="">{t("settings.defaultDevice")}</option>
              {videoDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || device.deviceId}
                </option>
              ))}
            </NativeSelect>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="text-sm">{t("settings.featureSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="justify-between">
            {t("settings.autoplay")}
            <Checkbox checked={store.autoTryPlay} onCheckedChange={(checked) => patch({ autoTryPlay: checked === true })} />
          </Label>
          <Label className="justify-between">
            {t("settings.autoRefetch")}
            <Checkbox checked={store.autoRefetch} onCheckedChange={(checked) => patch({ autoRefetch: checked === true })} />
          </Label>
        </CardContent>
      </Card>
    </div>
  );
}
