"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/states";
import { ServiceError } from "@/services/types";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const err = error instanceof ServiceError ? error : new ServiceError(error.message || "An unexpected error occurred while loading this page.", "api");
  return (
    <div className="mx-auto max-w-2xl py-10">
      <ErrorState error={err} onRetry={reset} />
      {error.digest ? <p className="mt-3 text-center font-mono text-[11px] text-faint">Error ID: {error.digest}</p> : null}
    </div>
  );
}
