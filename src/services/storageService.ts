import type { CommentDB } from "../types/comment.types";

const KEYS = {
  comments: "fc_comments",
  users: "fc_users",
  attachments: "fc_attachments",
};

export const storage = {
  saveComments(db: CommentDB) {
    localStorage.setItem(KEYS.comments, JSON.stringify(db));
  },
};
