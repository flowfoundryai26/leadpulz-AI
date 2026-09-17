"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceError } from "@/services/types";

export interface QueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: ServiceError | null;
  refetch: () => Promise<void>;
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
}

/**
 * Minimal async data hook with loading/error state and manual refetch.
 * Keeps the UI decoupled from any particular data-fetching library.
 */
export function useQuery<T>(fetcher: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ServiceError | null>(null);
  const fetcherRef = useRef(fetcher);
  const seq = useRef(0);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const run = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (id === seq.current) setData(result);
    } catch (e) {
      if (id === seq.current) setError(e instanceof ServiceError ? e : new ServiceError((e as Error)?.message ?? "Something went wrong", "api"));
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Data-fetching hook: kicking off the request on mount / dep change is the intent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const set = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setData((prev) => (typeof updater === "function" ? (updater as (p: T | undefined) => T)(prev) : updater));
  }, []);

  return { data, loading, error, refetch: run, setData: set };
}

/** Async action helper with pending state — for buttons that call services. */
export function useMutation<Args extends unknown[], R>(fn: (...args: Args) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ServiceError | null>(null);
  const mutate = useCallback(
    async (...args: Args) => {
      setPending(true);
      setError(null);
      try {
        return await fn(...args);
      } catch (e) {
        const err = e instanceof ServiceError ? e : new ServiceError((e as Error)?.message ?? "Something went wrong", "api");
        setError(err);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [fn],
  );
  return { mutate, pending, error };
}
