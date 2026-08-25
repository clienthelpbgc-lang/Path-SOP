import { requireRole } from "@/lib/session";
import { CreateKraDialog } from "@/components/kra/create-kra-dialog";
import { KraList } from "@/components/kra/table/kra-list";

export default async function KraAdminPage() {
  const user = await requireRole("ADMIN");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          KRA Admin
        </h2>
        <CreateKraDialog />
      </div>

      <KraList currentUserId={user.id} scope="all" />
    </div>
  );
}
