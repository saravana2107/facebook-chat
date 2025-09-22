import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatContainer } from "../ChatContainer";

vi.mock("../CommentForm", () => ({
  CommentForm: () => <div data-testid="comment-form">FORM</div>,
}));

let receivedComments: Comment[] | null = null;
vi.mock("../CommentList", () => ({
  CommentList: (props: { comments: Comment[] }) => {
    receivedComments = props.comments;
    return (
      <div data-testid="comment-list">
        {JSON.stringify(props.comments.map((c) => c.id))}
      </div>
    );
  },
}));

vi.mock("../../../hooks/useComments", () => ({
  useComments: vi.fn(),
}));

import { useComments } from "../../../hooks/useComments";
import type { Comment } from "../../../types/comment.types";

describe("ChatContainer", () => {
  beforeEach(() => {
    receivedComments = null;
    vi.clearAllMocks();

    (useComments as unknown as Mock).mockReturnValue({
      db: {
        comments: {
          c1: {
            id: "c1",
            parentId: null,
            isDeleted: false,
            timestamp: "2025-01-01T10:00:00.000Z",
            content: "root older",
          },
          c2: {
            id: "c2",
            parentId: "c1",
            isDeleted: false,
            timestamp: "2025-01-01T11:00:00.000Z",
            content: "reply to c1",
          },
          c3: {
            id: "c3",
            parentId: null,
            isDeleted: false,
            timestamp: "2025-01-01T12:00:00.000Z",
            content: "root newer",
          },
          c4: {
            id: "c4",
            parentId: null,
            isDeleted: true,
            timestamp: "2025-01-01T09:00:00.000Z",
            content: "deleted root",
          },
          c5: {
            id: "c5",
            parentId: null,
            isDeleted: false,
            timestamp: "2025-01-01T11:30:00.000Z",
            content: "root mid",
          },
        },
        attachments: {},
      },
    });
  });

  it("passes only non-deleted root comments to CommentList, sorted by timestamp asc", () => {
    render(<ChatContainer />);

    expect(receivedComments).toBeTruthy();
    const ids = (receivedComments ?? []).map((c) => c.id);
    expect(ids).toEqual(["c1", "c5", "c3"]);

    const listJson = screen.getByTestId("comment-list").textContent || "[]";
    expect(JSON.parse(listJson)).toEqual(["c1", "c5", "c3"]);
  });

  it("updates when hook returns a different DB (sanity check)", () => {
    const { rerender } = render(<ChatContainer />);
    let ids = (receivedComments ?? []).map((c) => c.id);
    expect(ids).toEqual(["c1", "c5", "c3"]);

    (useComments as unknown as Mock).mockReturnValue({
      db: {
        comments: {
          x1: {
            id: "x1",
            parentId: null,
            isDeleted: false,
            timestamp: "2025-02-01T10:00:00.000Z",
            content: "only root",
          },
        },
        attachments: {},
      },
    });

    rerender(<ChatContainer />);
    ids = (receivedComments ?? []).map((c) => c.id);
    expect(ids).toEqual(["x1"]);
  });
});
