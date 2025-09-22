import { useCommentsStore } from "../store/commentsStore";

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

export async function createComment({
  parentId,
  content,
  attachments = [],
  mentions = [],
  currentUserId,
}: {
  parentId?: string;
  content: string;
  attachments?: Attachment[];
  mentions?: string[];
  currentUserId: string;
}) {
  return useCommentsStore
    .getState()
    .addComment({
      parentId: parentId ?? null,
      content,
      attachments,
      currentUserId,
      mentions,
    });
}
