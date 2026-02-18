"use client";

import { useEffect, useState } from "react";

type ApiState<T> = {
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

export function useApi<T>(url: string, deps: ReadonlyArray<unknown> = []) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetch(url)
      .then(async (res) => {
        const payload = (await res.json()) as { ok: boolean; data?: T; error?: string };
        if (!res.ok || !payload.ok || !payload.data) {
          throw new Error(payload.error ?? `Request failed for ${url}`);
        }
        return payload.data;
      })
      .then((data) => {
        if (!active) {
          return;
        }
        setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        const message = error instanceof Error ? error.message : "Unknown error";
        setState({ data: null, isLoading: false, error: message });
      });

    return () => {
      active = false;
    };
  }, [url, depsKey]);

  return state;
}
