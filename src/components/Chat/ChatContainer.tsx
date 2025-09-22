
import { useComments } from '../../hooks/useComments'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'

export function ChatContainer() {
  const { db } = useComments()
  const roots = Object.values(db.comments)
    .filter(c => !c.parentId && !c.isDeleted)
    .sort((a,b)=> new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return (
    <div className="space-y-4">
      <CommentForm />
      <CommentList comments={roots} />
    </div>
  )
}
