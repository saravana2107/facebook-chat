import type { Comment } from "../../types/comment.types";
import { ReplyThread } from "./ReplyThread";

/**
 * CommentList component
 * @param props - Props for the component
 * @returns JSX.Element
 */
export function CommentList({ comments }: { comments: Comment[] }) {
  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id}>
          <ReplyThread commentId={c.id} level={0} />
        </li>
      ))}
    </ul>
  );
}
