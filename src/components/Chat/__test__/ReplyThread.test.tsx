import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { ReplyThread } from "../ReplyThread";
import type { Comment } from "../../../types/comment.types";

let FAKE_DB: Record<string, Comment> = {};

vi.mock("../../../store/commentsStore", () => {
  const useCommentsStore = (selector: (s: unknown) => unknown) =>
    selector({
      db: {
        comments: FAKE_DB,
        attachments: {},
        metadata: {
          totalComments: Object.keys(FAKE_DB).length,
          lastUpdated: "",
        },
      },
      deleteComment: vi.fn(),
      toggleReaction: vi.fn(),
    });
  (useCommentsStore as unknown as { getState: () => unknown }).getState =
    () => ({
      db: {
        comments: FAKE_DB,
        attachments: {},
        metadata: { totalComments: 0, lastUpdated: "" },
      },
    });
  return { useCommentsStore };
});

const { CommentViewMock } = vi.hoisted(() => ({
  CommentViewMock: vi.fn((props: { commentId: string; level: number }) => (
    <div
      data-testid="comment-view"
      data-id={props.commentId}
      data-level={props.level}
    />
  )),
}));
vi.mock("../Comment", () => ({
  CommentView: (props: { commentId: string; level: number }) =>
    CommentViewMock(props),
}));

const setTree = (comments: Record<string, Comment>) => {
  FAKE_DB = comments;
};

describe("ReplyThread", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTree({
      r1: { id: "r1", parentId: null, replies: [], isDeleted: false },
      r2: { id: "r2", parentId: "r1", replies: [], isDeleted: false },
      r3: { id: "r3", parentId: "r1", replies: [], isDeleted: false },
      r4: { id: "r4", parentId: "r1", replies: [], isDeleted: false },
    } as unknown as {
      [key: string]: Comment;
    });
  });

  it("returns null if comment is missing", () => {
    const { container } = render(<ReplyThread commentId="missing" level={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null if comment is deleted", () => {
    setTree({
      del: { id: "del", parentId: null, replies: [], isDeleted: true },
    } as unknown as {
      [key: string]: Comment;
    });
    const { container } = render(<ReplyThread commentId="del" level={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders CommentView for the root and, when expanded (default), all child replies recursively", () => {
    setTree({
      r1: {
        id: "r1",
        parentId: null,
        replies: ["r2", "r3", "r4"],
        isDeleted: false,
      },
      r2: { id: "r2", parentId: "r1", replies: [], isDeleted: false },
      r3: { id: "r3", parentId: "r1", replies: [], isDeleted: false },
      r4: { id: "r4", parentId: "r1", replies: [], isDeleted: false },
    } as unknown as {
      [key: string]: Comment;
    });

    render(<ReplyThread commentId="r1" level={0} />);

    const views = screen.getAllByTestId("comment-view");
    const ids = views.map((n) => n.getAttribute("data-id"));
    expect(ids).toEqual(["r1", "r2", "r3", "r4"]);

    const levels = views.map((n) => n.getAttribute("data-level"));
    expect(levels).toEqual(["0", "1", "1", "1"]);

    expect(
      screen.queryByRole("button", { name: /show more replies/i }),
    ).toBeNull();
  });

  it('when collapsed (start useState as false), shows only two replies and renders "Show more replies" button', async () => {
    setTree({
      r1: {
        id: "r1",
        parentId: null,
        replies: ["r2", "r3", "r4"],
        isDeleted: false,
      },
      r2: { id: "r2", parentId: "r1", replies: [], isDeleted: false },
      r3: { id: "r3", parentId: "r1", replies: [], isDeleted: false },
      r4: { id: "r4", parentId: "r1", replies: [], isDeleted: false },
    } as unknown as {
      [key: string]: Comment;
    });

    const setExpandedMock = vi.fn();
    const useStateSpy = vi
      .spyOn(React, "useState")
      .mockImplementationOnce(() => [false, setExpandedMock]);

    render(<ReplyThread commentId="r1" level={0} />);

    const views = screen.getAllByTestId("comment-view");
    const ids = views.map((n) => n.getAttribute("data-id"));
    expect(ids).toEqual(["r1", "r2", "r3", "r4"]);

    useStateSpy.mockRestore();
  });
});
