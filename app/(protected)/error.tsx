"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProtectedError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-20 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Something went wrong
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            An unexpected error occurred while loading this page. Try again,
            or come back later if the problem persists.
          </p>
          {error.digest ? (
            <p className="mt-1 text-xs text-muted-foreground/70">
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
        <Button className="mt-2" onClick={() => unstable_retry()}>
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}
