import { useState } from "react";
import { useCommentsStore } from "../../store/commentsStore";
import { CommentView } from "./Comment";

/**
 * ReplyThread component
 * @param props - Props for the component
 * @returns JSX.Element
 */
export function ReplyThread({
  commentId,
  level,
}: {
  commentId: string;
  level: number;
}) {
  const c = useCommentsStore((s) => s.db.comments[commentId]);
  const [expanded, setExpanded] = useState(true);
  if (!c || c.isDeleted) return null;
  const children = c.replies?.slice(0, expanded ? undefined : 2) ?? [];
  const hasMore = (c.replies?.length ?? 0) > children.length;

  return (
    <div className="space-y-2">
      <CommentView commentId={commentId} level={level} />
      {!!children.length && (
        <div className="ml-10 border-l pl-4 border-gray-200">
          {children.map((id) => (
            <ReplyThread key={id} commentId={id} level={level + 1} />
          ))}
          {hasMore && (
            <button
              className="text-sm text-brand-700 hover:text-brand-800"
              onClick={() => setExpanded(true)}
            >
              Show more replies
            </button>
          )}
        </div>
      )}
    </div>
  );
}
