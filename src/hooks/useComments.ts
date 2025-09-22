import { useCommentsStore } from "../store/commentsStore";

/**
 * Custom hook to manage comments
 * @returns {Object} - Comment management functions and state
 */
export function useComments() {
  const db = useCommentsStore((s) => s?.db || {});
  const addComment = useCommentsStore((s) => s.addComment);
  const editComment = useCommentsStore((s) => s.editComment);
  const deleteComment = useCommentsStore((s) => s.deleteComment);
  const toggleReaction = useCommentsStore((s) => s.toggleReaction);
  return { db, addComment, editComment, deleteComment, toggleReaction };
}
