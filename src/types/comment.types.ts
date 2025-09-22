import type { Attachment } from "../services/commentService";

export interface Comment {
  id: string;
  parentId: string | null;
  authorId: string;
  content: string;
  timestamp: string;
  attachments: string[];
  reactions: Record<string, string[]>;
  mentions: string[];
  isEdited: boolean;
  editedAt: string | null;
  replies: string[];
  isDeleted?: boolean;
}

export interface CommentDB {
  comments: Record<string, Comment>;
  attachments: Record<string, Attachment>;
}
