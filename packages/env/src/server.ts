import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5300),
    /** Shared key PeerJS clients must present as `?key=`. */
    PEER_KEY: z.string().default("peerjs"),
    /** Expose `GET /peerjs/peers`. Off by default — room ids are sensitive. */
    ALLOW_DISCOVERY: z
      .string()
      .optional()
      .transform((value) => value === "true" || value === "1"),
    /** JSON array of ICE servers handed to clients via `signaling.config`. */
    ICE_SERVERS: z.string().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
