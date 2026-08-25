import { getCurrentUser } from "@/lib/session";
import { TemplatesView } from "@/components/templates/templates-view";

export default async function TemplatesPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        Templates
      </h2>

      <TemplatesView role={user.role} />
    </div>
  );
}
