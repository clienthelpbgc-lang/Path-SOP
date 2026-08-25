import { getCurrentUser } from "@/lib/session";
import { ProfileView } from "@/components/profile/profile-view";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Profile
        </h2>
        <p className="text-sm text-muted-foreground">
          Your account and company details.
        </p>
      </div>

      <ProfileView
        name={user.name}
        email={user.email}
        phone={user.phone}
        role={user.role}
        isActive={user.isActive}
        createdAt={user.createdAt.toISOString()}
        company={user.company}
      />
    </div>
  );
}
