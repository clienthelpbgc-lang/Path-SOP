import { getCurrentUser } from "@/lib/session";
import { AddMemberDialog } from "@/components/team/add-member-dialog";
import { TeamMemberList } from "@/components/team/table/team-member-list";

export default async function TeamMembersPage() {
  const user = await getCurrentUser();
  const canManage = user.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Team Members
          </h2>
          <p className="text-sm text-muted-foreground">
            Everyone with access to {user.company.name}.
          </p>
        </div>
        {canManage && <AddMemberDialog />}
      </div>

      <TeamMemberList currentUserId={user.id} currentUserRole={user.role} />
    </div>
  );
}
