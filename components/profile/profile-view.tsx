"use client";

import { Building2, Calendar, Mail, Phone, ShieldCheck } from "lucide-react";

import type { UserRole } from "@/features/user/constants/role.constant";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog";
import { getAvatarColor } from "@/lib/avatar";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatMemberSince(value: string) {
  // Fixed locale, not `undefined`: the server and browser can have different
  // default locales, which would cause a hydration mismatch.
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium text-foreground">
          {value}
        </span>
      </div>
    </div>
  );
}

export function ProfileView({
  name,
  email,
  phone,
  role,
  isActive,
  createdAt,
  company,
}: {
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  company: { name: string; logo: string | null };
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden !py-0">
        <div className="relative bg-gradient-to-br from-primary to-primary/70 px-6 pt-8 pb-16">
          <div className="absolute top-4 right-4">
            <Badge
              variant="secondary"
              className="border-transparent bg-white/15 text-white backdrop-blur-sm"
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-primary-foreground/80">
            {company.name}
          </p>
        </div>

        <CardContent className="flex flex-col gap-6 px-6 pb-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <Avatar
                size="lg"
                className="size-20 shrink-0 rounded-full ring-4 ring-card after:rounded-full"
              >
                <AvatarFallback
                  className={cn(
                    "rounded-full text-xl font-semibold text-white",
                    getAvatarColor(name),
                  )}
                >
                  {initials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="text-xl font-semibold text-foreground">{name}</p>
                <Badge variant="secondary" className="w-fit capitalize">
                  <ShieldCheck className="size-3" />
                  {role.toLowerCase()}
                </Badge>
              </div>
            </div>

            <EditProfileDialog name={name} phone={phone} />
          </div>

          <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <InfoRow icon={Mail} label="Email" value={email} />
            <InfoRow
              icon={Phone}
              label="Phone"
              value={phone ?? "Not provided"}
            />
            <InfoRow
              icon={Building2}
              label="Company"
              value={
                <span className="flex items-center gap-1.5">
                  <Avatar size="sm" className="rounded-md after:rounded-md">
                    <AvatarImage
                      src={company.logo ?? undefined}
                      alt={company.name}
                      className="rounded-md object-contain"
                    />
                    <AvatarFallback className="rounded-md">
                      <Building2 className="size-3" />
                    </AvatarFallback>
                  </Avatar>
                  {company.name}
                </span>
              }
            />
            <InfoRow
              icon={Calendar}
              label="Member since"
              value={formatMemberSince(createdAt)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
