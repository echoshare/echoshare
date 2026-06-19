# EchoShare

Context for AI assistants working on this repo.

## Overview

P2P screen/media sharing over WebRTC. Media is sent browser-to-browser; the server
only does WebRTC signaling. TypeScript monorepo (Turborepo), Bun runtime.

## Layout

```
apps/
  web/      React + TanStack Router SPA (Vite, Tailwind, shadcn/ui, zustand, i18next, tRPC client)
            src/webrtc/   framework-agnostic WebRTC core (peer, stream, sdp, stats)
            src/store/    zustand stores (peer / webhook / history), persisted to localStorage
            src/hooks/    use-share / use-receive lifecycle hooks
            src/routes/   file-based routes: index, share, receive, view, history, webhook, settings
  server/   Hono on Bun
            src/peer/     from-scratch PeerJS signaling server (relay + tests)
            src/index.ts  wires tRPC (/trpc/*) + PeerJS HTTP/WS (/peerjs*)
packages/
  api/      tRPC router + context (SignalingService interface)
  env/      typed env (@t3-oss/env-core)
  config/   shared tsconfig
```

## Key facts

- Signaling is a native WebSocket impl (`hono/bun` `createBunWebSocket`), NOT tRPC.
  CORS is scoped to `/trpc/*` and `/peerjs/*` HTTP only — never the `/peerjs` upgrade.
- Server build uses `bun build` (not tsdown). Run dev with `bun run --hot src/index.ts`.
- Frontend talks to the server via `VITE_SERVER_URL` (tRPC) and `VITE_SIGNALING_URL`
  (PeerJS). Server requires `CORS_ORIGIN`.

## Commands

- `bun install`
- `bun run dev` — web + server
- `bun run check-types`
- `bun run build`
- `bun --filter server test` / `bun --filter web test`

## Conventions

- No `any`; name exported types instead of `ReturnType<typeof fn>`.
- `Record` for static lookup tables, `Map`/`Set` for runtime collections.
- Prefer `Promise.withResolvers()` over `new Promise(executor)`.

Keep this file current when structure, deps, or workflows change.
