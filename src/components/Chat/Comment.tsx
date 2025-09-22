import { useEffect, useRef, useState } from "react";
import { useCommentsStore } from "../../store/commentsStore";
import { getUsers } from "../../services/userService";
import { CommentForm } from "./CommentForm";
import { formatCompact } from "../../utils/dateUtils";

export function CommentView({
  commentId,
}: {
  commentId: string;
  level: number;
}) {
  const c = useCommentsStore((s) => s.db.comments[commentId]);
  const del = useCommentsStore((s) => s.deleteComment);
  const users = getUsers();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const toggleReaction = useCommentsStore((s) => s.toggleReaction);
  const attachments = useCommentsStore((s) => s.db.attachments);

  if (!c || c.isDeleted) return null;
  const author = users[c.authorId];
  const usersArr = Object.values(users);

  return (
    <article>
      <header className="flex items-start gap-3">
        <img
          src={author.avatar}
          className="h-8 w-8 rounded-full"
          alt={author.displayName}
        />
        <div className="flex-1">
          <div className="mt-1 flex items-center gap-4">
            <div className={editing ? "flex-1" : ""}>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{author.displayName}</span>

                {c.isEdited && (
                  <span className="text-gray-400" aria-label="edited">
                    (edited)
                  </span>
                )}
              </div>

              {!editing ? (
                <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
              ) : (
                <CommentForm
                  parentId={c.parentId ?? undefined}
                  initialContent={c.content}
                  editId={c.id}
                  onCancel={() => setEditing(false)}
                  attachments={
                    c.attachments?.map((id) => attachments[id]) || []
                  }
                />
              )}
              {!!c.attachments?.length && !editing && (
                <div className="mt-2">
                  {c.attachments.map((id) => (
                    <AttachmentPreview key={id} id={id} />
                  ))}
                </div>
              )}
            </div>

            {!editing && (
              <CommentActionsMenu
                onEdit={() => {
                  setEditing(true);
                }}
                onDelete={() => del(c.id)}
              />
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-sm">
            <span className="text-gray-400">
              {formatCompact(new Date(c.timestamp))}
            </span>
            <LikeButton
              commentId={c.id}
              userId={usersArr[0].id}
              onReact={(emoji) =>
                toggleReaction(c.id, usersArr[0].id, emoji || undefined)
              }
            />
            <button
              className="inline-flex cursor-pointer items-center gap-1 text-gray-600 hover:text-gray-900"
              onClick={() => setReplying((v) => !v)}
            >
              Reply
            </button>
            <ReactionBar commentId={c.id} />
          </div>

          {replying && (
            <div className="mt-2 ml-10">
              <CommentForm
                parentId={c.id}
                onCancel={() => setReplying(false)}
              />
            </div>
          )}
        </div>
      </header>
    </article>
  );
}

function LikeButton({
  commentId,
  onReact,
  userId,
}: {
  commentId: string;
  userId: string;
  onReact: (emoji: string | null) => void;
}) {
  const reactions = [
    { emoji: "👍", label: "Like" },
    { emoji: "❤️", label: "Love" },
    { emoji: "😂", label: "Haha" },
    { emoji: "😮", label: "Wow" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😡", label: "Angry" },
  ];

  const [showReactions, setShowReactions] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const c = useCommentsStore((s) => s.db.comments[commentId]);

  useEffect(() => {
    if (c) {
      setSelected(
        Object.entries(c.reactions).find(([, list]) =>
          list.includes(userId),
        )?.[0] || null,
      );
    }
  }, [c, userId]);

  if (!c) return null;

  return (
    <div className="relative">
      <span
        onClick={() => {
          if (!selected) {
            setShowReactions((v) => !v);
          } else {
            onReact(null);
          }
        }}
        className={`text-sm font-medium cursor-pointer select-none
              ${selected ? "text-blue-600" : "text-gray-600"}`}
      >
        Like
      </span>
      {showReactions && (
        <div
          className="absolute -top-14 left-0 flex space-x-2 bg-white shadow-lg 
                     rounded-full px-3 py-2 border border-gray-200 animate-fadeIn z-10"
        >
          {reactions.map((r) => (
            <button
              key={r.label}
              onClick={() => {
                onReact(selected ? null : r.emoji);
                setShowReactions(false);
              }}
              className="text-2xl hover:scale-125 transition-transform"
              title={r.label}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ReactionBar({ commentId }: { commentId: string }) {
  const c = useCommentsStore((s) => s.db.comments[commentId]);
  if (!c) return null;
  const emojis = Object.entries(c.reactions);
  return (
    <div className="flex items-center gap-1">
      {emojis.length > 0 && (
        <div className="ml-2 flex gap-2 text-xs">
          {emojis.map(([e, list]) => (
            <span
              key={e}
              className="inline-flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5"
            >
              {e}
              <b>{list.length}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentPreview({ id }: { id: string }) {
  const attachments = useCommentsStore((s) => s.db.attachments);

  const att = attachments[id];
  if (!att) return null;

  return (
    <>
      <img
        src={att.path}
        alt={att.originalName}
        className="rounded-lg border object-cover w-full h-28"
      />
    </>
  );
}

function CommentActionsMenu({
  canEdit = true,
  onEdit,
  onDelete,
}: {
  canEdit?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !btnRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>(
      '[data-menuitem="1"]',
    );
    first?.focus();
  }, [open]);

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="p-1 rounded-full hover:bg-gray-100 active:scale-95 transition"
      >
        <img
          src="/facebook-chat/menu-dots.svg"
          alt="Action"
          className="inline h-4 w-4"
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Comment actions"
          className={`absolute left-0 z-20 w-40 origin-top origin-top-left
                      rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5
                      animate-[scaleIn_.12s_ease-out]`}
        >
          <ul className="py-1">
            {canEdit && (
              <li>
                <button
                  data-menuitem="1"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onEdit();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown")
                      (
                        e.currentTarget.nextElementSibling as HTMLElement
                      )?.focus();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  {/* Pencil */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    className="fill-gray-500"
                  >
                    <path d="M3 17.25V21h3.75l11-11L14 6.25 3 17.25zm14.71-9.96c.39-.39.39-1.02 0-1.41l-1.59-1.59a.9959.9959 0 0 0-1.41 0L12.13 5.96 15.04 8.87l2.67-2.58z" />
                  </svg>
                  Edit
                </button>
              </li>
            )}

            <li>
              <button
                data-menuitem="2"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    const prev = canEdit
                      ? (e.currentTarget.previousElementSibling as HTMLElement)
                      : null;
                    prev?.querySelector<HTMLElement>("button")?.focus();
                  }
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none"
              >
                {/* Trash */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  className="fill-red-500"
                >
                  <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                Delete
              </button>
            </li>
          </ul>
        </div>
      )}

      {/* tiny keyframe for pop-in */}
      <style>{`
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
