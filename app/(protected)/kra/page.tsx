import { getCurrentUser } from "@/lib/session";
import { KraList } from "@/components/kra/table/kra-list";

export default async function KraPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        My KRAs
      </h2>

      <KraList currentUserId={user.id} />
    </div>
  );
}
