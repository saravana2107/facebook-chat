import type { CommentDB } from "../types/comment.types";
import type { UserDB } from "../types/user.types";
import type { AttachmentDB } from "../types/attachment.types";

const KEYS = {
  comments: "fc_comments",
  users: "fc_users",
  attachments: "fc_attachments",
};

export const storage = {
  loadComments(): CommentDB | null {
    const raw = localStorage.getItem(KEYS.comments);
    return raw ? JSON.parse(raw) : null;
  },
  saveComments(db: CommentDB) {
    localStorage.setItem(KEYS.comments, JSON.stringify(db));
  },
  loadUsers(): UserDB | null {
    const raw = localStorage.getItem(KEYS.users);
    return raw ? JSON.parse(raw) : null;
  },
  saveUsers(db: UserDB) {
    localStorage.setItem(KEYS.users, JSON.stringify(db));
  },
  loadAttachments(): AttachmentDB | null {
    const raw = localStorage.getItem(KEYS.attachments);
    return raw ? JSON.parse(raw) : null;
  },
  saveAttachments(db: AttachmentDB) {
    localStorage.setItem(KEYS.attachments, JSON.stringify(db));
  },
};
