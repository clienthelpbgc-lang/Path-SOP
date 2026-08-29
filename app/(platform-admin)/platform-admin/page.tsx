import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TenantList } from "@/components/platform/tenant-list";

export default function PlatformAdminPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Tenants
          </h2>
          <p className="text-sm text-muted-foreground">
            Every company onboarded onto the platform.
          </p>
        </div>
        <Button
          render={<Link href="/platform-admin/onboard" />}
          nativeButton={false}
        >
          <Plus />
          Onboard tenant
        </Button>
      </div>

      <TenantList />
    </div>
  );
}
