"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KraTemplatePresetForm } from "@/components/platform/kra-template-preset-form";

// Unlike a company's own template, a preset has no source KRA to copy from
// -- so unlike CreateKraTemplateDialog (name-only), this asks for the full
// field set upfront, sharing the same form as EditKraTemplatePresetDialog.
export function CreateKraTemplatePresetDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        New preset
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New KRA preset</DialogTitle>
          <DialogDescription>
            Available to every company as a starting point for a new KRA.
          </DialogDescription>
        </DialogHeader>

        <KraTemplatePresetForm
          preset={null}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
