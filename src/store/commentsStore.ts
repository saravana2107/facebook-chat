import { create } from "zustand";
import { v4 as uuid } from "uuid";
import { formatISO } from "date-fns";
import type { Comment, CommentDB } from "../types/comment.types";
import { storage } from "../services/storageService";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Attachment } from "../types/attachment.types";

interface State {
  db: CommentDB;
  load: () => void;
  addComment: (data: {
    currentUserId: string;
    parentId?: string | null;
    content: string;
    attachments?: Attachment[];
    mentions?: string[];
  }) => string;
  editComment: (id: string, content: string, files: Attachment[]) => void;
  deleteComment: (id: string) => void;
  toggleReaction: (
    id: string,
    userId: string,
    emoji: string | undefined,
  ) => void;
}

export const useCommentsStore = create<State>()(
  persist(
    immer((set) => ({
      db: {
        comments: {},
        metadata: { totalComments: 0, lastUpdated: formatISO(new Date()) },
        attachments: {},
      },
      load: () =>
        set((s) => {
          const db = storage.loadComments();
          if (db) s.db = db;
        }),
      addComment: ({
        parentId = null,
        content,
        currentUserId,
        attachments = [],
        mentions = [],
      }) => {
        const id = `comment_${uuid()}`;
        const now = formatISO(new Date());
        set((s) => {
          const c: Comment = {
            id,
            parentId,
            authorId: currentUserId,
            content,
            timestamp: now,
            attachments: attachments.map((a) => a.id),
            reactions: {},
            mentions,
            isEdited: false,
            editedAt: null,
            replies: [],
          };
          s.db.comments[id] = c;
          if (parentId) s.db.comments[parentId]?.replies.push(id);
          s.db.metadata.totalComments = Object.values(s.db.comments).filter(
            (x) => !x.isDeleted,
          ).length;
          s.db.metadata.lastUpdated = now;
          if (attachments.length) {
            s.db.attachments = {
              ...s.db.attachments,
              ...attachments.reduce(
                (acc, a) => {
                  acc[a.id] = a;
                  return acc;
                },
                {} as Record<string, Attachment>,
              ),
            };
          }
          storage.saveComments(s.db);
        });
        return id;
      },
      editComment: (id, content, attachments) =>
        set((s) => {
          const c = s.db.comments[id];
          if (!c || c.isDeleted) return;
          c.content = content;
          c.isEdited = true;
          c.editedAt = formatISO(new Date());
          s.db.metadata.lastUpdated = c.editedAt!;

          if (attachments.length) {
            const attachmentIds = attachments.map((a) => a.id);
            c.attachments = attachmentIds;
            s.db.attachments = {
              ...s.db.attachments,
              ...attachments.reduce(
                (acc, a) => {
                  acc[a.id] = a;
                  return acc;
                },
                {} as Record<string, Attachment>,
              ),
            };
          } else {
            c.attachments = [];
          }
          storage.saveComments(s.db);
        }),
      deleteComment: (id) =>
        set((s) => {
          const c = s.db.comments[id];
          if (!c) return;
          c.isDeleted = true;
          s.db.metadata.totalComments = Object.values(s.db.comments).filter(
            (x) => !x.isDeleted,
          ).length;
          s.db.metadata.lastUpdated = formatISO(new Date());
          storage.saveComments(s.db);
        }),
      toggleReaction: (id: string, userId: string, emoji?: string) =>
        set((state) => {
          const c = state.db.comments[id];
          if (!c || c.isDeleted) return {};

          const uid = userId;
          const reactions = c.reactions ?? {};

          const currentEmoji = Object.keys(reactions).find((e) =>
            reactions[e]?.includes(uid),
          );

          const newReactions: Record<string, string[]> = {};
          for (const [e, users] of Object.entries(reactions)) {
            newReactions[e] = users.slice(); // copy arrays
          }

          const removeFrom = (e: string) => {
            const arr = newReactions[e] || [];
            const idx = arr.indexOf(uid);
            if (idx >= 0) arr.splice(idx, 1);
            if (arr.length === 0) delete newReactions[e];
            else newReactions[e] = arr;
          };

          const addTo = (e: string) => {
            const arr = newReactions[e] ? newReactions[e].slice() : [];
            if (!arr.includes(uid)) arr.push(uid);
            newReactions[e] = arr;
          };

          if (!emoji) {
            if (currentEmoji) removeFrom(currentEmoji);
          } else if (currentEmoji === emoji) {
            removeFrom(emoji);
          } else {
            if (currentEmoji) removeFrom(currentEmoji);
            addTo(emoji);
          }

          const next = {
            ...state,
            db: {
              ...state.db,
              comments: {
                ...state.db.comments,
                [id]: {
                  ...c,
                  reactions: newReactions,
                },
              },
            },
          };

          // persist
          storage.saveComments(next.db);
          return next;
        }),
    })),
    {
      name: "comments-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
