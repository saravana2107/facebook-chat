import { useCommentsStore } from "../store/commentsStore";
export function useEmojiReactions() {
  const toggle = useCommentsStore((s) => s.toggleReaction);
  return { toggle };
}
