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

/**
 * Creates a new comment
 * @param props - Comment data
 * @returns Promise resolving to the created comment
 */
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
  return useCommentsStore.getState().addComment({
    parentId: parentId ?? null,
    content,
    attachments,
    currentUserId,
    mentions,
  });
}
