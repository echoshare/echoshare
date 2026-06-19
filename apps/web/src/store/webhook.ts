import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WebhookHook = "get" | "post" | "success" | "fail";

export interface WebhookSettings {
  /** Fallback URL used when a hook-specific URL is not set. */
  uniURL: string;
  getURL: string;
  postURL: string;
  successURL: string;
  failURL: string;
  /** `key=value` lines merged into the request body under `custom`. */
  customPayload: string;
}

interface WebhookStore extends WebhookSettings {
  patch: (partial: Partial<WebhookSettings>) => void;
}

export const useWebhookStore = create<WebhookStore>()(
  persist(
    (set) => ({
      uniURL: "",
      getURL: "",
      postURL: "",
      successURL: "",
      failURL: "",
      customPayload: "",
      patch: (partial) => set(partial),
    }),
    {
      name: "ECHOSHARE_WEBHOOK",
      partialize: ({ patch: _patch, ...settings }) => settings,
    },
  ),
);

function parseCustomPayload(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    result[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return result;
}

/**
 * Best-effort lifecycle webhook. Resolves the URL for the given hook (falling
 * back to `uniURL`), merges custom payload lines, and fires the request.
 * Failures are swallowed — webhooks must never break the sharing flow.
 */
export async function sendWebhook(
  settings: WebhookSettings,
  hook: WebhookHook,
  data: Record<string, unknown>,
): Promise<void> {
  const urlByHook: Record<WebhookHook, string> = {
    get: settings.getURL,
    post: settings.postURL,
    success: settings.successURL,
    fail: settings.failURL,
  };
  const url = urlByHook[hook] || settings.uniURL;
  if (!url) return;

  const method = hook === "get" && settings.getURL ? "GET" : "POST";
  const body = { ...data, custom: parseCustomPayload(settings.customPayload) };

  try {
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    /* webhooks are fire-and-forget */
  }
}
