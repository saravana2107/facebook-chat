import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CommentList } from "../CommentList";
import type { Comment } from "../../../types/comment.types";

const { ReplyThreadMock } = vi.hoisted(() => ({
  ReplyThreadMock: vi.fn((props: { commentId: string; level: number }) => (
    <div
      data-testid="reply-thread"
      data-id={props.commentId}
      data-level={props.level}
    />
  )),
}));

vi.mock("../ReplyThread", () => ({
  ReplyThread: (props: { commentId: string; level: number }) =>
    ReplyThreadMock(props),
}));

describe("CommentList", () => {
  beforeEach(() => {
    ReplyThreadMock.mockClear();
  });

  it("renders an empty list when no comments", () => {
    render(<CommentList comments={[]} />);
    expect(screen.queryByTestId("reply-thread")).toBeNull();
    const ul = screen.getByRole("list");
    expect(ul).toHaveClass("space-y-3");
  });

  it("renders one ReplyThread per comment, passing id and level=0", () => {
    const comments = [
      { id: "c1", parentId: null },
      { id: "c2", parentId: null },
      { id: "c3", parentId: null },
    ] as Comment[];

    render(<CommentList comments={comments} />);

    const items = screen.getAllByTestId("reply-thread");
    expect(items).toHaveLength(3);

    expect(items.map((n) => n.getAttribute("data-id"))).toEqual([
      "c1",
      "c2",
      "c3",
    ]);
    items.forEach((n) => expect(n.getAttribute("data-level")).toBe("0"));

    expect(ReplyThreadMock).toHaveBeenCalledTimes(3);
    expect(
      ReplyThreadMock.mock.calls.map(([props]) => props.commentId),
    ).toEqual(["c1", "c2", "c3"]);
    expect(
      ReplyThreadMock.mock.calls.every(([props]) => props.level === 0),
    ).toBe(true);
  });

  it("wraps each ReplyThread in a list item", () => {
    const comments = [{ id: "a" }, { id: "b" }] as Comment[];
    render(<CommentList comments={comments} />);

    const list = screen.getByRole("list");
    const listItems = list.querySelectorAll("li");
    expect(listItems.length).toBe(2);
  });
});
