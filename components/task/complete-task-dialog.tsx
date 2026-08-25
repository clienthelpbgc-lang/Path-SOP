"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  useCreateTaskAttachment,
  useUpdateTask,
} from "@/features/task/hooks";
import { deleteUploadedTaskAttachmentRequest } from "@/features/task/hooks/task.api";
import type { Task } from "@/features/task/types";
import {
  TaskAttachmentsField,
  type AttachmentItem,
} from "@/components/task/task-attachments-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CompleteTaskDialogProps = {
  task: Task | null;
  onOpenChange: (open: boolean) => void;
};

export function CompleteTaskDialog({
  task,
  onOpenChange,
}: CompleteTaskDialogProps) {
  const [remarks, setRemarks] = useState("");
  const [attachmentItems, setAttachmentItems] = useState<AttachmentItem[]>(
    [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: updateTask } = useUpdateTask();
  const { mutateAsync: createAttachment } = useCreateTaskAttachment();

  // Files that finished uploading but were never attached to a completed
  // task (dialog cancelled/closed before submit) would otherwise leak in
  // storage.
  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      setRemarks("");

      for (const item of attachmentItems) {
        if (item.status === "done" && item.fileKey) {
          deleteUploadedTaskAttachmentRequest(item.fileKey).catch(() => {});
        }
      }

      setAttachmentItems([]);
    }
  }

  const isUploadingAttachments = attachmentItems.some(
    (item) => item.status === "uploading",
  );

  // The status machine only allows pending -> in_progress -> completed, so a
  // still-pending task needs an intermediate transition before it can be
  // marked completed. Attachments are linked while the task is still
  // editable, then the final transition to "completed" locks it down.
  async function handleComplete() {
    if (!task || isUploadingAttachments) return;

    setIsSubmitting(true);

    try {
      if (task.status === "pending") {
        await updateTask({ id: task.id, input: { status: "in_progress" } });
      }

      const doneAttachments = attachmentItems.filter(
        (item) => item.status === "done" && item.fileKey,
      );

      for (const item of doneAttachments) {
        await createAttachment({
          taskId: task.id,
          input: {
            context: "completion",
            fileKey: item.fileKey!,
            fileName: item.file.name,
            mimeType: item.mimeType,
            sizeBytes: item.sizeBytes,
          },
        });
      }

      await updateTask({
        id: task.id,
        input: {
          status: "completed",
          completionRemarks: remarks.trim() ? remarks.trim() : undefined,
        },
      });

      setAttachmentItems([]);
      handleOpenChange(false);
    } catch {
      // Errors are already surfaced via the mutations' own toasts.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={task !== null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete task</DialogTitle>
          <DialogDescription>
            Mark &quot;{task?.title}&quot; as completed.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="completionRemarks">
              Completion remarks{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="completionRemarks"
              placeholder="Add any notes about how this was completed"
              rows={3}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>
              Attachments{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <TaskAttachmentsField
              items={attachmentItems}
              onItemsChange={setAttachmentItems}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting || isUploadingAttachments}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Completing...
              </>
            ) : (
              "Complete task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
