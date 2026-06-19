# syntax=docker/dockerfile:1
# Self-hosted PeerJS signaling + tRPC server.
# Build context is the MONOREPO ROOT:
#   docker build -f apps/server/Dockerfile -t echoshare-signal .
#   docker run -p 3000:3000 -e CORS_ORIGIN=https://your-web.vercel.app echoshare-signal

FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN cd apps/server && bun build ./src/index.ts --outdir dist --target bun

FROM oven/bun:1-slim AS runtime
WORKDIR /app
COPY --from=build /app/apps/server/dist/index.js ./index.js
# CORS_ORIGIN MUST be overridden with your web app's origin in production.
ENV NODE_ENV=production \
    PORT=3000 \
    CORS_ORIGIN=http://localhost:3001 \
    PEER_KEY=peerjs \
    ALLOW_DISCOVERY=false
EXPOSE 3000
CMD ["bun", "run", "index.js"]
