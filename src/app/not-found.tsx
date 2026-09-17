import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center lp-ambient px-6 text-center">
      <Logo className="mb-10" />
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-surface text-primary">
        <Compass className="size-7" />
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">The page you are looking for does not exist or was moved. Your agents are still answering calls.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild><Link href="/dashboard">Go to dashboard</Link></Button>
        <Button asChild variant="secondary"><Link href="/help">Help centre</Link></Button>
      </div>
    </div>
  );
}
