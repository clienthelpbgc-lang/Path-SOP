import { PresetsView } from "@/components/platform/presets-view";

export default function PlatformAdminPresetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Presets
        </h2>
        <p className="text-sm text-muted-foreground">
          Task and KRA templates available as a starting point to every
          company.
        </p>
      </div>

      <PresetsView />
    </div>
  );
}
