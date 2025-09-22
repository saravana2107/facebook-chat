
import { useCommentsStore } from '../store/commentsStore'
import type { Attachment } from '../types/attachment.types'

export async function createComment({ parentId, content, attachments = [], mentions = [], currentUserId }:
  { parentId?: string, content: string, attachments?: Attachment[], mentions?: string[], currentUserId: string }) {
  return useCommentsStore.getState().addComment({ parentId: parentId ?? null, content, attachments, currentUserId, mentions })
}
