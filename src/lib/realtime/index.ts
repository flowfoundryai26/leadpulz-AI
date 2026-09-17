"use client";

/**
 * Realtime transport abstraction.
 *
 * Channels: `org:{orgId}:calls`, `call:{callId}:transcript`, `org:{orgId}:agents`,
 * `campaign:{id}:progress`, `user:{id}:notifications`.
 *
 * Production wires this to Supabase Realtime (or a WebSocket gateway). The mock
 * implementation is used when NEXT_PUBLIC_REALTIME=mock or Supabase env is absent.
 */
export type RealtimeHandler<T = unknown> = (payload: T) => void;

export interface RealtimeClient {
  subscribe<T = unknown>(channel: string, handler: RealtimeHandler<T>): () => void;
}

class MockRealtime implements RealtimeClient {
  subscribe<T>(channel: string, handler: RealtimeHandler<T>) {
    void channel;
    void handler;
    return () => {};
  }
}

class SupabaseRealtime implements RealtimeClient {
  // Lazy import keeps the SDK out of the bundle until configured.
  subscribe<T>(channel: string, handler: RealtimeHandler<T>) {
    let unsub = () => {};
    import("@supabase/supabase-js")
      .then(({ createClient }) => {
        const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const ch = client.channel(channel).on("broadcast", { event: "*" }, (msg) => handler(msg.payload as T)).subscribe();
        unsub = () => { void client.removeChannel(ch); };
      })
      .catch(() => {
        /* SDK not installed — stays a no-op */
      });
    return () => unsub();
  }
}

export const realtime: RealtimeClient =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_REALTIME !== "mock" ? new SupabaseRealtime() : new MockRealtime();
