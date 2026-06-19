import type { IceServer } from "../context";
import { publicProcedure, router } from "../index";

export interface SignalingConfig {
  /** Key to pass to the PeerJS `Peer` constructor. */
  key: string;
  /** Recommended ICE servers, configured on the signaling server. */
  iceServers: IceServer[];
}

export interface SignalingStats {
  peers: number;
  uptimeMs: number;
}

export const appRouter = router({
  healthCheck: publicProcedure.query(() => "OK"),
  signaling: router({
    config: publicProcedure.query(({ ctx }): SignalingConfig => {
      return { key: ctx.signaling.key, iceServers: ctx.signaling.iceServers() };
    }),
    stats: publicProcedure.query(({ ctx }): SignalingStats => {
      return { peers: ctx.signaling.peerCount(), uptimeMs: ctx.signaling.uptimeMs() };
    }),
  }),
});

export type AppRouter = typeof appRouter;
