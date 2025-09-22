
import { useCommentsStore } from '../store/commentsStore'
import type { Attachment } from '../types/attachment.types'

export async function createComment({ parentId, content, attachments = [], mentions = [], currentUserId }:
  { parentId?: string, content: string, attachments?: Attachment[], mentions?: string[], currentUserId: string }) {
  const ids: string[] = [];
  const attachementsList: {
    [key: string]: Attachment
  } = {};
  for (const attachment of attachments) {
    attachementsList[attachment.id] = attachment
    ids.push(attachment.id)
  }
  return useCommentsStore.getState().addComment({ parentId: parentId ?? null, content, attachments: ids, attachementsList, currentUserId, mentions })
}
