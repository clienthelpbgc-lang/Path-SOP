"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import "./globals.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// global-error replaces the root layout entirely when the layout itself
// throws, so it can't rely on anything RootLayout provides (fonts,
// providers) -- it brings its own <html>/<body> and imports globals.css
// directly for the design tokens Card/Button need.
export default function GlobalError({
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
    <html lang="en" className={cn("h-full", "antialiased")}>
      <body className="min-h-full">
        <title>Something went wrong</title>
        <div className="flex min-h-full items-center justify-center bg-background px-6 py-20">
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Something went wrong
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  The app hit an unexpected error and couldn&apos;t load.
                  Try again, or come back later if the problem persists.
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
        </div>
      </body>
    </html>
  );
}
