# EchoShare

Peer-to-peer screen & media sharing over WebRTC. The browser captures your screen
or camera and streams it **directly** to viewers — media never passes through a
server. A small self-hosted signaling server (PeerJS protocol on Hono + Bun) only
brokers the WebRTC handshake.

## Stack

- **Web** (`apps/web`) — React + TanStack Router (SPA, Vite), Tailwind + shadcn/ui,
  zustand (persisted settings), i18next (en / zh / ja), tRPC client.
- **Server** (`apps/server`) — Hono on Bun, with two surfaces:
  - `POST /trpc/*` — tRPC API (`signaling.config`, `signaling.stats`, `healthCheck`).
  - `GET /peerjs` (WebSocket) + `GET /peerjs/id` + `GET /peerjs/peers` — a
    from-scratch, wire-compatible **PeerJS signaling server**
    (`apps/server/src/peer`), so the stock `peerjs` client needs no patches.
- **WebRTC core** (`apps/web/src/webrtc`) — framework-agnostic TS: peer/stream
  lifecycle, SDP codec preference, audio mixing, `getStats` analysis.
- `packages/api` (tRPC router + context), `packages/env` (typed env), `packages/config`.

## Develop

```bash
bun install
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
bun run dev          # web → http://localhost:5301, server → http://localhost:5300
```

## Test / typecheck / build

```bash
bun run check-types
bun run build
bun --filter server test   # signaling relay unit tests
bun --filter web test      # webrtc core unit tests (sdp / ice / stats)
```

## Configuration

**Web** (build-time, `VITE_` prefix):

- `VITE_SERVER_URL` — tRPC API origin.
- `VITE_SIGNALING_URL` — PeerJS server origin (HTTPS in prod → resolves to WSS).
  Leave blank or set to `https://0.peerjs.com/` to use the **public PeerJS cloud**
  instead of a self-hosted server.

**Server**:

- `CORS_ORIGIN` (**required**) — web origin allowed on the tRPC + `/peerjs/*` HTTP routes.
- `PORT` (default `5300`), `PEER_KEY` (default `peerjs`).
- `ALLOW_DISCOVERY` (default `false`) — expose `GET /peerjs/peers`.
- `ICE_SERVERS` — JSON array of STUN/TURN servers advertised to clients.

### Signaling fallback

The client treats the public PeerJS cloud as a safety net. When a session starts
and the configured signaling server is unreachable (a connection-class error
before the peer opens), **both ends transparently fail over to `0.peerjs.com`**
and pair there by the same room id (a down server fails both ends symmetrically,
so they meet on the cloud). The public cloud is free, rate-limited, and
best-effort — no TURN, no SLA — fine as a backstop or for demos, not for
production load. Set `VITE_SIGNALING_URL` blank to use it as the primary target.

## Deploy

The two halves deploy differently.

### Web → Vercel

`apps/web/vercel.json` builds the SPA and includes a history-fallback rewrite. Set
`VITE_SERVER_URL` and `VITE_SIGNALING_URL` (pointing at your signaling server's
**HTTPS** origin) as Vercel build-time env vars.

### Signaling server → self-host (NOT Vercel)

The signaling server holds **long-lived WebSocket connections and in-memory peer
state**, so it cannot run on Vercel serverless/edge. Run it as a long-lived process
(Docker, Fly.io, Railway, a VPS, …) behind **HTTPS/WSS** — WebRTC capture requires a
secure context.

```bash
docker build -f apps/server/Dockerfile -t echoshare-signal .
docker run -p 5300:5300 -e CORS_ORIGIN=https://your-web.vercel.app echoshare-signal
```

Configure `ICE_SERVERS` with a TURN server for clients behind restrictive NATs. A
single instance is correct; horizontal scaling needs sticky sessions or an external
pub/sub fan-out, since the peer registry is process-local.

## Notes

- The legacy app (`../echoshare`) was a pure-frontend SPA leaning on the public
  `0.peerjs.com` node. This rewrite self-hosts the signaling layer but keeps that
  node as a zero-config primary / automatic fallback (see *Signaling fallback*).
- Not yet ported from the original: PWA install and LAN dev-HTTPS (no app icons,
  and `vite-plugin-pwa` does not target Vite 8 at the time of writing).
