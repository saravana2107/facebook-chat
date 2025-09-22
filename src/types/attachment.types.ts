export interface AttachmentMeta {
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  path: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface AttachmentDB {
  attachments: Record<string, Attachment>;
}
