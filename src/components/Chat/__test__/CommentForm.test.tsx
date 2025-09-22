import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CommentForm } from "../CommentForm";
import type { Attachment } from "../../../services/commentService";

const { editCommentSpy, createCommentSpy } = vi.hoisted(() => ({
  editCommentSpy: vi.fn(),
  createCommentSpy: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("react-mentions", () => ({
  MentionsInput: (props: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    inputRef: React.RefObject<HTMLTextAreaElement>;
  }) => (
    <textarea
      data-testid="comment-input"
      value={props.value}
      onChange={props.onChange}
      placeholder={props.placeholder}
      ref={props.inputRef}
    />
  ),
  Mention: () => null,
}));

vi.mock("../../../hooks/useFileUpload", () => ({
  useFileUpload: () => {
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      error: "",
    };
  },
}));

vi.mock("../../UI/Button", () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{props.children}</button>
  ),
}));

vi.mock("../../../services/userService", () => ({
  getUsers: () => ({
    u1: {
      id: "u1",
      displayName: "Alice",
      username: "alice",
      avatar: "/alice.png",
    },
    u2: { id: "u2", displayName: "Bob", username: "bob", avatar: "/bob.png" },
  }),
}));

vi.mock("emoji-picker-react", () => ({
  __esModule: true,
  default: (props: { onEmojiClick: (e: { emoji: string }) => void }) => (
    <div data-testid="emoji-picker">
      <button onClick={() => props.onEmojiClick({ emoji: "😊" })}>😊</button>
    </div>
  ),
}));

vi.mock("../../../services/commentService", () => ({
  createComment: (...args: [string, string, File[]]) =>
    createCommentSpy(...args),
}));

vi.mock("../../../store/commentsStore", () => {
  const mockState = { editComment: editCommentSpy, db: { attachments: {} } };
  const useCommentsStore = (selector: (s: typeof mockState) => unknown) =>
    selector(mockState);
  (
    useCommentsStore as unknown as { getState: () => typeof mockState }
  ).getState = () => mockState;
  return { useCommentsStore };
});

const typeIn = async (el: HTMLElement, text: string) => {
  await userEvent.clear(el);
  await userEvent.type(el, text);
};

describe("CommentForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows placeholder with current user's name", () => {
    render(<CommentForm />);
    expect(screen.getByTestId("comment-input")).toHaveAttribute(
      "placeholder",
      "Comment as Alice",
    );
  });

  it("does not submit on Shift+Enter (just inserts newline)", async () => {
    render(<CommentForm />);
    const input = screen.getByTestId("comment-input");

    await typeIn(input, "hi");
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });

    expect(createCommentSpy).not.toHaveBeenCalled();

    expect((input as HTMLTextAreaElement).value).toContain("hi");
  });

  it("edit mode: calls editComment with trimmed content & files and then onCancel", async () => {
    const onCancel = vi.fn();
    const initialAtts = [
      { id: "a1", path: "/p1.jpg", originalName: "p1.jpg" },
      { id: "a2", path: "/p2.jpg", originalName: "p2.jpg" },
    ];
    render(
      <CommentForm
        editId="c123"
        initialContent=" old text "
        attachments={initialAtts as Attachment[]}
        onCancel={onCancel}
      />,
    );

    const input = screen.getByTestId("comment-input");
    await typeIn(input, "  new text  ");

    fireEvent.keyDown(input, { key: "Enter", shiftKey: false });

    expect(editCommentSpy).toHaveBeenCalledTimes(1);
    const [idArg, contentArg, filesArg] = editCommentSpy.mock.calls[0];
    expect(idArg).toBe("c123");
    expect(contentArg).toBe("new text");
    expect(filesArg).toEqual(initialAtts);

    expect(onCancel).toHaveBeenCalled();
    expect(createCommentSpy).not.toHaveBeenCalled();
  });

  it("submit button is disabled when content is empty/whitespace", async () => {
    render(<CommentForm />);
    const submit = screen.getByRole("button", { name: /send/i });
    expect(submit).toBeDisabled();

    const input = screen.getByTestId("comment-input");
    await typeIn(input, "  ");
    expect(submit).toBeDisabled();

    await userEvent.clear(input);
    await typeIn(input, "ok");
    expect(submit).not.toBeDisabled();
  });
});
