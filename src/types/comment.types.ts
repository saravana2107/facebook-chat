import type { Attachment } from "./attachment.types"

export type ReactionMap = Record<string, string[]>

export interface Comment {
  id: string
  parentId: string | null
  authorId: string
  content: string
  timestamp: string
  attachments: string[]
  reactions: ReactionMap
  mentions: string[]
  isEdited: boolean
  editedAt: string | null
  replies: string[]
  isDeleted?: boolean
}

export interface CommentStateMeta {
  totalComments: number
  lastUpdated: string
}

export interface CommentDB {
  comments: Record<string, Comment>
  metadata: CommentStateMeta
  attachments: Record<string, Attachment>;
}

export interface CreateCommentData {
  parentId?: string
  content: string
  attachments?: File[]
  mentions?: string[]
}
