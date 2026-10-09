import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToLoginLink() {
  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
    >
      <ArrowLeft className="size-3" />
      Back to sign in
    </Link>
  );
}
