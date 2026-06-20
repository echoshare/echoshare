import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

type ImportMetaEnvRecord = Record<string, string | boolean | undefined>;

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    /** Base URL of the tRPC/HTTP API. */
    VITE_SERVER_URL: z.url().default("http://localhost:5300"),
    /** Base URL of the PeerJS signaling server (parsed into host/port/path). */
    VITE_SIGNALING_URL: z.url().default("http://localhost:5300/"),
  },
  runtimeEnv: (import.meta as ImportMeta & { env: ImportMetaEnvRecord }).env,
  emptyStringAsUndefined: true,
});
