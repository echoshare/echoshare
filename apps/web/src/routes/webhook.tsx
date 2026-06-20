import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendWebhook, useWebhookStore, type WebhookSettings } from "@/store/webhook";

export const Route = createFileRoute("/webhook")({
  component: WebhookComponent,
});

const URL_FIELDS: { key: keyof WebhookSettings; label: string }[] = [
  { key: "uniURL", label: "uniUrl" },
  { key: "getURL", label: "getUrl" },
  { key: "postURL", label: "postUrl" },
  { key: "successURL", label: "successUrl" },
  { key: "failURL", label: "failUrl" },
];

function WebhookComponent() {
  const { t } = useTranslation();
  const store = useWebhookStore();

  async function sendTest() {
    await sendWebhook(useWebhookStore.getState(), "success", { action: "test", uid: "test" });
    toast.success(t("webhook.sent"));
  }

  return (
    <div className="mx-auto max-w-xl space-y-5 px-4 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("webhook.title")}</h1>
        <p className="text-muted-foreground mt-1 text-xs">{t("webhook.hint")}</p>
      </div>

      {URL_FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={field.key}>{t(`webhook.${field.label}`)}</Label>
          <Input
            id={field.key}
            type="url"
            value={store[field.key]}
            placeholder="https://"
            onChange={(e) => store.patch({ [field.key]: e.target.value })}
          />
        </div>
      ))}

      <div className="space-y-1.5">
        <Label htmlFor="payload">{t("webhook.customPayload")}</Label>
        <Textarea
          id="payload"
          rows={4}
          value={store.customPayload}
          placeholder={"token=abc\nroom=demo"}
          onChange={(e) => store.patch({ customPayload: e.target.value })}
        />
        <p className="text-muted-foreground text-xs">{t("webhook.payloadHint")}</p>
      </div>

      <Button onClick={() => void sendTest()}>{t("webhook.test")}</Button>
    </div>
  );
}
