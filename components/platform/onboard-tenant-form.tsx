"use client";

import { Fragment, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ClipboardCheck,
  ImageIcon,
  Loader2,
  Pencil,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import {
  ALLOWED_LOGO_MIME_TYPES,
  MAX_LOGO_SIZE_BYTES,
} from "@/features/company/constants/logo.constant";
import { deleteUploadedCompanyLogoRequest } from "@/features/company/hooks/company.api";
import { useOnboardTenant, useUploadCompanyLogo } from "@/features/company/hooks";
import { onboardTenantSchema } from "@/features/company/validation";
import { formatFileSize } from "@/lib/format-file-size";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type LogoState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | {
      status: "done";
      fileKey: string;
      url: string;
      fileName: string;
      sizeBytes?: number;
    }
  | { status: "error"; fileName: string; error: string };

// Relaxed vs. the base schema: an empty input submits "" rather than
// undefined, so these optional fields shouldn't fail their format checks
// just for being left blank (same trick as add-member-dialog.tsx's phone
// field).
const onboardTenantFormSchema = onboardTenantSchema.extend({
  logo: onboardTenantSchema.shape.logo.or(z.literal("")),
  phone: onboardTenantSchema.shape.phone.or(z.literal("")),
  address: onboardTenantSchema.shape.address.or(z.literal("")),
});

type FormInput = z.input<typeof onboardTenantFormSchema>;
type FormOutput = z.output<typeof onboardTenantFormSchema>;

const defaultValues: FormInput = {
  name: "",
  logo: "",
  email: "",
  phone: "",
  address: "",
  admin: { name: "", email: "", password: "" },
};

const STEPS = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "admin", label: "Admin account", icon: ShieldCheck },
  { id: "review", label: "Review", icon: ClipboardCheck },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function StepIndicator({ currentStep }: { currentStep: StepId }) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <ol className="flex items-center">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <Fragment key={step.id}>
            <li className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary",
                  !isComplete && !isCurrent && "border-border text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="size-4" />
                ) : (
                  <step.icon className="size-4" />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  isCurrent || isComplete
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </li>
            {index < STEPS.length - 1 && (
              <li
                aria-hidden
                className={cn(
                  "mx-3 h-px flex-1 transition-colors",
                  isComplete ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}

export function OnboardTenantForm() {
  const router = useRouter();
  const [step, setStep] = useState<StepId>("company");
  const { mutate, isPending } = useOnboardTenant();
  const { mutate: uploadLogo } = useUploadCompanyLogo();
  const [logoState, setLogoState] = useState<LogoState>({ status: "idle" });
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(onboardTenantFormSchema),
    defaultValues,
  });

  const values = watch();

  function handleLogoSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.error("Logo images must be 5 MB or smaller.");
      return;
    }

    if (
      !ALLOWED_LOGO_MIME_TYPES.includes(
        file.type as (typeof ALLOWED_LOGO_MIME_TYPES)[number],
      )
    ) {
      toast.error("Logo must be a PNG, JPEG, WebP, or SVG image.");
      return;
    }

    const previousFileKey =
      logoState.status === "done" ? logoState.fileKey : undefined;

    setLogoState({ status: "uploading", fileName: file.name });

    uploadLogo(file, {
      onSuccess: (result) => {
        setValue("logo", result.url, { shouldValidate: true });
        setLogoState({
          status: "done",
          fileKey: result.fileKey,
          url: result.url,
          fileName: result.fileName,
          sizeBytes: result.sizeBytes,
        });
        if (previousFileKey) {
          deleteUploadedCompanyLogoRequest(previousFileKey).catch(() => {});
        }
      },
      onError: () => {
        setLogoState({
          status: "error",
          fileName: file.name,
          error: "Upload failed",
        });
      },
    });
  }

  function removeLogo() {
    if (logoState.status === "done") {
      deleteUploadedCompanyLogoRequest(logoState.fileKey).catch(() => {});
    }
    setValue("logo", "", { shouldValidate: true });
    setLogoState({ status: "idle" });
  }

  async function goToNextStep() {
    if (step === "company") {
      const valid = await trigger(["name", "email", "phone", "address", "logo"]);
      if (valid) setStep("admin");
      return;
    }

    if (step === "admin") {
      const valid = await trigger([
        "admin.name",
        "admin.email",
        "admin.password",
      ]);
      if (valid) setStep("review");
    }
  }

  function goToPreviousStep() {
    if (step === "admin") setStep("company");
    else if (step === "review") setStep("admin");
  }

  function onSubmit(formValues: FormOutput) {
    if (step !== "review") return;

    mutate(
      {
        ...formValues,
        logo: formValues.logo || undefined,
        phone: formValues.phone || undefined,
        address: formValues.address || undefined,
        isActive: true,
      },
      {
        onSuccess: () => {
          router.push("/platform-admin");
        },
      },
    );
  }

  const currentStep = STEPS.find((item) => item.id === step)!;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <StepIndicator currentStep={step} />

      <Card>
        {step === "company" && (
          <>
            <CardHeader>
              <CardTitle>Company details</CardTitle>
              <CardDescription>
                Shown across the app wherever this tenant&apos;s branding
                appears.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Company name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Acme Inc."
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="logo">
                  Logo{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <input
                  ref={logoInputRef}
                  id="logo"
                  type="file"
                  accept={ALLOWED_LOGO_MIME_TYPES.join(",")}
                  className="hidden"
                  onChange={(event) => {
                    handleLogoSelected(event.target.files);
                    event.target.value = "";
                  }}
                />

                {logoState.status === "idle" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload />
                    Upload logo
                  </Button>
                )}

                {logoState.status !== "idle" && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 py-1.5 pr-1.5 pl-2">
                    {logoState.status === "done" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoState.url}
                        alt=""
                        className="size-8 shrink-0 rounded object-contain"
                      />
                    ) : (
                      <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {logoState.fileName}
                      </span>
                      <span
                        className={
                          logoState.status === "error"
                            ? "truncate text-xs text-destructive"
                            : "truncate text-xs text-muted-foreground"
                        }
                      >
                        {logoState.status === "uploading" && "Uploading..."}
                        {logoState.status === "error" && logoState.error}
                        {logoState.status === "done" &&
                          logoState.sizeBytes !== undefined &&
                          formatFileSize(logoState.sizeBytes)}
                      </span>
                    </span>
                    {logoState.status === "uploading" && (
                      <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label="Remove logo"
                      onClick={
                        logoState.status === "uploading"
                          ? undefined
                          : () => removeLogo()
                      }
                      disabled={logoState.status === "uploading"}
                    >
                      <X />
                    </Button>
                  </div>
                )}

                {errors.logo && (
                  <p className="text-xs text-destructive">
                    {errors.logo.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Company email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="billing@acme.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">
                  Phone{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 555 123 4567"
                  aria-invalid={!!errors.phone}
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="address">
                  Address{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="123 Market St, San Francisco, CA"
                  aria-invalid={!!errors.address}
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </CardContent>
          </>
        )}

        {step === "admin" && (
          <>
            <CardHeader>
              <CardTitle>First admin account</CardTitle>
              <CardDescription>
                This person can sign in immediately and will manage the
                tenant from here on.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-name">Full name</Label>
                <Input
                  id="admin-name"
                  placeholder="e.g. Jordan Smith"
                  aria-invalid={!!errors.admin?.name}
                  {...register("admin.name")}
                />
                {errors.admin?.name && (
                  <p className="text-xs text-destructive">
                    {errors.admin.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="jordan@acme.com"
                  aria-invalid={!!errors.admin?.email}
                  {...register("admin.email")}
                />
                {errors.admin?.email && (
                  <p className="text-xs text-destructive">
                    {errors.admin.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-password">Temporary password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="At least 8 characters"
                  aria-invalid={!!errors.admin?.password}
                  {...register("admin.password")}
                />
                {errors.admin?.password && (
                  <p className="text-xs text-destructive">
                    {errors.admin.password.message}
                  </p>
                )}
              </div>
            </CardContent>
          </>
        )}

        {step === "review" && (
          <>
            <CardHeader>
              <CardTitle>Review &amp; confirm</CardTitle>
              <CardDescription>
                Double-check the details below before onboarding this tenant.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Company
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setStep("company")}
                  >
                    <Pencil />
                    Edit
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar size="lg" className="rounded-lg after:rounded-lg">
                    <AvatarImage
                      src={values.logo || undefined}
                      alt=""
                      className="rounded-lg object-contain"
                    />
                    <AvatarFallback className="rounded-lg">
                      <Building2 className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium text-foreground">
                      {values.name || "—"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {values.email || "—"}
                    </span>
                  </div>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="text-foreground">{values.phone || "—"}</dd>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="text-foreground">{values.address || "—"}</dd>
                </dl>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Admin account
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => setStep("admin")}
                  >
                    <Pencil />
                    Edit
                  </Button>
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {values.admin?.name || "—"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {values.admin?.email || "—"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  A temporary password has been set. This person can sign in
                  and change it at any time.
                </p>
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="justify-between">
          {step === "company" ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              render={<Link href="/platform-admin" />}
              nativeButton={false}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={goToPreviousStep}
            >
              <ArrowLeft />
              Back
            </Button>
          )}

          {step === "review" ? (
            <Button
              type="submit"
              disabled={isPending || logoState.status === "uploading"}
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Onboarding...
                </>
              ) : (
                "Onboard tenant"
              )}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={logoState.status === "uploading"}
              onClick={goToNextStep}
            >
              Next
              <ArrowRight />
            </Button>
          )}
        </CardFooter>
      </Card>

      <p className="sr-only" aria-live="polite">
        Step {STEPS.findIndex((item) => item.id === step) + 1} of{" "}
        {STEPS.length}: {currentStep.label}
      </p>
    </form>
  );
}
