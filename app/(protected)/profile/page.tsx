import { Building2, Mail, Phone, Shield } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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

      <Card className="max-w-2xl">
        <CardContent className="flex flex-col gap-6 px-6 py-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="text-base">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-foreground">
                {user.name}
              </p>
              <Badge variant="secondary" className="w-fit capitalize">
                <Shield className="size-3" />
                {user.role.toLowerCase()}
              </Badge>
            </div>
          </div>

          <Separator />

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.email}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd className="text-sm font-medium text-foreground">
                  {user.phone ?? "Not provided"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:col-span-2">
              <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col">
                <dt className="text-xs text-muted-foreground">Company</dt>
                <dd className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Avatar size="sm" className="rounded-md after:rounded-md">
                    <AvatarImage
                      src={user.company.logo ?? undefined}
                      alt={user.company.name}
                      className="rounded-md object-contain"
                    />
                    <AvatarFallback className="rounded-md">
                      <Building2 className="size-3" />
                    </AvatarFallback>
                  </Avatar>
                  {user.company.name}
                </dd>
              </div>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
