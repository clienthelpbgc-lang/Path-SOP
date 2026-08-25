"use client";

import { FileIcon, Loader2, Paperclip, X } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import {
  MAX_ATTACHMENT_SIZE_BYTES,
  MAX_TASK_ATTACHMENTS,
} from "@/features/task/constants/attachment-limits.constant";
import { deleteUploadedTaskAttachmentRequest } from "@/features/task/hooks/task.api";
import { useUploadTaskAttachment } from "@/features/task/hooks";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/format-file-size";
import { cn } from "@/lib/utils";

export type AttachmentItem = {
  id: string;
  file: File;
  status: "uploading" | "done" | "error";
  error?: string;
  fileKey?: string;
  mimeType?: string;
  sizeBytes?: number;
};

type TaskAttachmentsFieldProps = {
  items: AttachmentItem[];
  onItemsChange: (
    updater: (items: AttachmentItem[]) => AttachmentItem[],
  ) => void;
};

export function TaskAttachmentsField({
  items,
  onItemsChange,
}: TaskAttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadFile } = useUploadTaskAttachment();

  function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const availableSlots = MAX_TASK_ATTACHMENTS - items.length;
    if (availableSlots <= 0) {
      toast.error(`You can attach at most ${MAX_TASK_ATTACHMENTS} files.`);
      return;
    }

    const files = Array.from(fileList);
    const accepted = files.slice(0, availableSlots);
    if (files.length > accepted.length) {
      toast.error(`You can attach at most ${MAX_TASK_ATTACHMENTS} files.`);
    }

    const picked: AttachmentItem[] = accepted.map((file) => {
      const oversized = file.size > MAX_ATTACHMENT_SIZE_BYTES;
      return {
        id: crypto.randomUUID(),
        file,
        status: oversized ? "error" : "uploading",
        error: oversized ? "File exceeds 100 MB limit" : undefined,
      };
    });

    onItemsChange((prev) => [...prev, ...picked]);

    for (const item of picked) {
      if (item.status === "error") continue;

      uploadFile(item.file)
        .then((result) => {
          onItemsChange((prev) =>
            prev.map((existing) =>
              existing.id === item.id
                ? {
                    ...existing,
                    status: "done",
                    fileKey: result.fileKey,
                    mimeType: result.mimeType,
                    sizeBytes: result.sizeBytes,
                  }
                : existing,
            ),
          );
        })
        .catch(() => {
          onItemsChange((prev) =>
            prev.map((existing) =>
              existing.id === item.id
                ? { ...existing, status: "error", error: "Upload failed" }
                : existing,
            ),
          );
        });
    }
  }

  function removeItem(item: AttachmentItem) {
    onItemsChange((prev) => prev.filter((existing) => existing.id !== item.id));
    if (item.status === "done" && item.fileKey) {
      deleteUploadedTaskAttachmentRequest(item.fileKey).catch(() => {});
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          handleFilesSelected(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={items.length >= MAX_TASK_ATTACHMENTS}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip />
          Attach file
        </Button>
        <span className="text-xs text-muted-foreground">
          {items.length}/{MAX_TASK_ATTACHMENTS} files &middot; up to 100 MB
          each
        </span>
      </div>

      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border border-border bg-muted/40 py-1.5 pr-1.5 pl-2",
                item.status === "error" &&
                  "border-destructive/40 bg-destructive/5",
              )}
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {item.file.name}
                </span>
                <span
                  className={cn(
                    "truncate text-xs text-muted-foreground",
                    item.status === "error" && "text-destructive",
                  )}
                >
                  {item.status === "uploading" && "Uploading..."}
                  {item.status === "error" && (item.error ?? "Upload failed")}
                  {item.status === "done" &&
                    formatFileSize(item.sizeBytes ?? item.file.size)}
                </span>
              </span>
              {item.status === "uploading" && (
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${item.file.name}`}
                onClick={() => removeItem(item)}
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
