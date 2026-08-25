export const ATTACHMENT_CONTEXTS = ["initial", "completion"] as const;

export type AttachmentContext = (typeof ATTACHMENT_CONTEXTS)[number];
