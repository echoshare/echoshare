import { createContext } from "@echoshare-v2/api/context";
import type { IceServer } from "@echoshare-v2/api/context";
import { appRouter } from "@echoshare-v2/api/routers/index";
import { env } from "@echoshare-v2/env/server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { PeerServer } from "./peer/server";
import type { PeerConnection } from "./peer/types";

function parseIceServers(raw: string | undefined): IceServer[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is IceServer => {
      if (typeof entry !== "object" || entry === null) return false;
      const urls = (entry as { urls?: unknown }).urls;
      return typeof urls === "string" || Array.isArray(urls);
    });
  } catch {
    return [];
  }
}

const iceServers = parseIceServers(env.ICE_SERVERS);

const peerServer = new PeerServer({ key: env.PEER_KEY });
peerServer.startReaper();

const { upgradeWebSocket, websocket } = createBunWebSocket();

const app = new Hono();

// Logging + CORS are scoped to the tRPC surface only. The WebSocket upgrade at
// `/peerjs` must NOT pass through header-mutating middleware or Hono throws an
// immutable-headers error during the upgrade.
app.use("/trpc/*", logger());
app.use(
  "/trpc/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) =>
      createContext({
        context,
        signaling: {
          key: peerServer.key,
          peerCount: () => peerServer.stats().peers,
          uptimeMs: () => peerServer.stats().uptimeMs,
          iceServers: () => iceServers,
        },
      }),
  }),
);

// PeerJS HTTP API. CORS here (cross-origin GETs from the web app), but it does
// not match the bare `/peerjs` WebSocket route.
app.use("/peerjs/*", cors({ origin: env.CORS_ORIGIN, allowMethods: ["GET"] }));
app.get("/peerjs/id", (c) => c.text(peerServer.generateClientId()));
app.get("/peerjs/peers", (c) => {
  if (!env.ALLOW_DISCOVERY) return c.text("Unauthorized", 401);
  return c.json(peerServer.getClientIds());
});

// PeerJS signaling WebSocket: ws(s)://host/peerjs?key=&id=&token=
app.get(
  "/peerjs",
  upgradeWebSocket((c) => {
    const id = c.req.query("id");
    const token = c.req.query("token");
    const key = c.req.query("key");
    let conn: PeerConnection | undefined;

    return {
      onOpen(_evt, ws) {
        conn = {
          send: (data) => {
            try {
              ws.send(data);
            } catch {
              /* socket already gone */
            }
          },
          close: () => {
            try {
              ws.close();
            } catch {
              /* already closing */
            }
          },
        };
        peerServer.open({ id, token, key, conn });
      },
      onMessage(evt, _ws) {
        if (!conn) return;
        const data = evt.data;
        peerServer.message(conn, typeof data === "string" ? data : String(data));
      },
      onClose() {
        if (conn) peerServer.close(conn);
      },
    };
  }),
);

app.get("/", (c) => c.text("OK"));

export default {
  port: env.PORT,
  fetch: app.fetch,
  websocket,
};
