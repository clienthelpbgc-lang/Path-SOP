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
import { TaskTemplatePresetForm } from "@/components/platform/task-template-preset-form";

// Unlike a company's own template, a preset has no source task to copy
// from -- so unlike CreateTaskTemplateDialog (name-only), this asks for the
// full field set upfront, sharing the same form as EditTaskTemplatePresetDialog.
export function CreateTaskTemplatePresetDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus />
        New preset
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New task preset</DialogTitle>
          <DialogDescription>
            Available to every company as a starting point for a new task.
          </DialogDescription>
        </DialogHeader>

        <TaskTemplatePresetForm
          preset={null}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
