"use client";

import { useEffect, useState } from "react";

export function useAutoRefresh(intervalMs = 15000) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return tick;
}
