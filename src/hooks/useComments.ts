
import { useCommentsStore } from '../store/commentsStore'

export function useComments() {
  const db = useCommentsStore(s => s?.db || {})
  const addComment = useCommentsStore(s => s.addComment)
  const editComment = useCommentsStore(s => s.editComment)
  const deleteComment = useCommentsStore(s => s.deleteComment)
  const toggleReaction = useCommentsStore(s => s.toggleReaction)
  return { db, addComment, editComment, deleteComment, toggleReaction }
}
