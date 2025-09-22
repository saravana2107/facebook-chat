import { useCallback, useEffect, useRef, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import Picker from "emoji-picker-react";
import { useFileUpload } from "../../hooks/useFileUpload";
import { useCommentsStore } from "../../store/commentsStore";
import { createComment, type Attachment } from "../../services/commentService";
import { getUsers } from "../../services/userService";
import { Button } from "../UI/Button";

/**
 * CommentForm component
 * @param props - Props for the component
 * @returns JSX.Element
 */
export function CommentForm({
  parentId,
  onCancel,
  initialContent = "",
  editId,
  attachments,
}: {
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
  allowAttachments?: boolean;
  initialContent?: string;
  editId?: string;
  attachments?: Attachment[];
}) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [content, setContent] = useState(initialContent);
  const [files, setFiles] = useState<Attachment[]>(attachments || []);
  const [showPicker, setShowPicker] = useState(false);
  const edit = useCommentsStore((s) => s.editComment);
  const users = Object.values(getUsers());

  const { getRootProps, getInputProps, error } = useFileUpload({
    onFiles: (f) => setFiles(f),
    currentUserId: users[0].id,
  });

  const onSubmit = useCallback(async () => {
    if (!content.trim()) return;
    if (editId) {
      edit(editId, content.trim(), files);
      onCancel?.();
      return;
    }
    await createComment({
      parentId,
      content: content.trim(),
      attachments: files,
      currentUserId: users[0].id,
      mentions: [],
    });
    setContent("");
    setFiles([]);
    onCancel?.();
  }, [content, editId, edit, files, parentId, users, onCancel]);

  const safeMarkup = "[@__display__]";

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === "Enter" && !evt.shiftKey) {
        evt.preventDefault();
        onSubmit();
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [onSubmit]);

  return (
    <form onSubmit={onSubmit}>
      <div className="card">
        <MentionsInput
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Comment as ${users[0].displayName}`}
          className="w-full text-sm mention-input"
          style={{
            control: { background: "transparent" },
            highlighter: { padding: 8 },
            input: { padding: 8 },
          }}
          inputRef={(ref: HTMLTextAreaElement) => {
            inputRef.current = ref;
          }}
        >
          <Mention
            trigger="@"
            markup={safeMarkup}
            displayTransform={(_, display) => `@${display}`}
            data={users.map((u) => ({ id: u.id, display: u.username }))}
          />
        </MentionsInput>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-xl cursor-pointer"
              onClick={() => setShowPicker((v) => !v)}
              aria-label="Insert an emoji"
            >
              <img
                src="/facebook-chat/smile.svg"
                alt="emoji"
                className="h-5 w-5"
              />
            </button>
            {!files.length && (
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <span className="cursor-pointer" aria-label="Attach a photo">
                  <img
                    src="/facebook-chat/camera.svg"
                    alt="Upload"
                    className="h-5 w-5"
                  />
                </span>
              </div>
            )}
            {showPicker && (
              <div className="absolute z-10">
                <Picker
                  onEmojiClick={(a) => {
                    setContent((c) => c + a.emoji);
                    setShowPicker(false);
                  }}
                  searchDisabled
                  skinTonesDisabled
                />
              </div>
            )}
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Button
              type="submit"
              disabled={!content.trim()}
              className="filter-bright bg-transparent border-0 p-0 hover:bg-transparent focus:ring-0 active:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <img
                src="/facebook-chat/send.svg"
                alt="Send"
                className="h-5 w-5"
              />
            </Button>
            {onCancel && (
              <button
                type="button"
                className="text-gray-600"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
      {!!files.length && (
        <div className="mt-4 ml-2 flex items-start">
          {files
            .filter((f) => f?.path)
            .map((f, i) => (
              <div key={i}>
                <img
                  src={f.path}
                  alt="Attachment"
                  className="inline w-20 h-20 mr-1"
                />
              </div>
            ))}
          {files.filter((f) => f?.path).length > 0 && (
            <span
              className="cursor-pointer"
              aria-label="Remove photo"
              onClick={() => setFiles([])}
            >
              <img
                src="/facebook-chat/close.svg"
                alt="Close"
                className="h-8 w-8"
              />
            </span>
          )}
        </div>
      )}
    </form>
  );
}
