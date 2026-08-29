import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { OnboardTenantForm } from "@/components/platform/onboard-tenant-form";

export default function OnboardTenantPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/platform-admin"
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Tenants
        </Link>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Onboard a tenant
        </h2>
        <p className="text-sm text-muted-foreground">
          Create the company and its first admin account in a few steps.
        </p>
      </div>

      <OnboardTenantForm />
    </div>
  );
}
