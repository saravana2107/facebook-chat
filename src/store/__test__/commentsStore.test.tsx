import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useCommentsStore } from "../commentsStore";
import { storage } from "../../services/storageService";
import type { CommentDB } from "../../types/comment.types";
import type { Attachment } from "../../types/attachment.types";

vi.mock("../../services/storageService", () => ({
  storage: {
    loadComments: vi.fn(),
    saveComments: vi.fn(),
  },
}));

let uuidCalls = 0;
vi.mock("uuid", () => ({
  v4: () => {
    uuidCalls += 1;
    return ["1111", "2222", "3333", "4444"][uuidCalls - 1] ?? `id${uuidCalls}`;
  },
}));

function StoreProbe() {
  const db = useCommentsStore((s) => s.db);
  return (
    <div>
      <div data-testid="total">{db.metadata.totalComments}</div>
      <div data-testid="comments-json">{JSON.stringify(db.comments)}</div>
      <div data-testid="attachments-json">{JSON.stringify(db.attachments)}</div>
    </div>
  );
}

const resetStore = () => {
  const state = useCommentsStore.getState();
  useCommentsStore.setState({
    ...state,
    db: {
      comments: {},
      metadata: { totalComments: 0, lastUpdated: new Date().toISOString() },
      attachments: {},
    },
  });
  uuidCalls = 0;
  vi.clearAllMocks();
};

describe("useCommentsStore + RTL", () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads DB from storage", () => {
    const mockDb: CommentDB = {
      comments: {
        comment_legacy: {
          id: "comment_legacy",
          parentId: null,
          authorId: "u1",
          content: "hello",
          timestamp: "2020-01-01T00:00:00.000Z",
          attachments: [],
          reactions: {},
          mentions: [],
          isEdited: false,
          editedAt: null,
          replies: [],
        },
      },
      metadata: { totalComments: 1, lastUpdated: "2020-01-01T00:00:00.000Z" },
      attachments: {},
    };

    (
      storage.loadComments as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockDb);

    render(<StoreProbe />);

    act(() => {
      useCommentsStore.getState().load();
    });

    expect(screen.getByTestId("total").textContent).toBe("1");
    const comments = JSON.parse(
      screen.getByTestId("comments-json").textContent || "{}"
    );
    expect(comments.comment_legacy.content).toBe("hello");
  });

  it("adds a root comment and persists", () => {
    render(<StoreProbe />);

    let id = "";
    act(() => {
      id = useCommentsStore.getState().addComment({
        currentUserId: "u1",
        content: "first post",
      });
    });

    expect(id).toBe("comment_1111");
    expect(screen.getByTestId("total").textContent).toBe("1");

    const comments = JSON.parse(
      screen.getByTestId("comments-json").textContent || "{}"
    );
    expect(comments[id].content).toBe("first post");
    expect(storage.saveComments).toHaveBeenCalledTimes(1);
  });

  it("adds a reply and links to parent", () => {
    render(<StoreProbe />);

    let parentId = "";
    let childId = "";
    act(() => {
      parentId = useCommentsStore.getState().addComment({
        currentUserId: "u1",
        content: "parent",
      });
      childId = useCommentsStore.getState().addComment({
        currentUserId: "u2",
        content: "child",
        parentId,
      });
    });

    const comments = JSON.parse(
      screen.getByTestId("comments-json").textContent || "{}"
    );
    expect(comments[parentId].replies).toEqual([childId]);
    expect(screen.getByTestId("total").textContent).toBe("2");
  });

  it("adds with attachments and stores them in DB", () => {
    render(<StoreProbe />);

    const atts: Attachment[] = [
      {
        id: "a1",
        filename: "file1.png",
        originalName: "file1.png",
        path: "u1",
        type: "image/png",
        size: 1234,
        uploadedBy: "u1",
        uploadedAt: new Date().toISOString(),
      },
      {
        id: "a2",
        filename: "file2.jpg",
        originalName: "file2.jpg",
        path: "u2",
        type: "image/jpeg",
        size: 2345,
        uploadedBy: "u2",
        uploadedAt: new Date().toISOString(),
      },
    ];

    let id = "";
    act(() => {
      id = useCommentsStore.getState().addComment({
        currentUserId: "u1",
        content: "with files",
        attachments: atts,
      });
    });

    const comments = JSON.parse(
      screen.getByTestId("comments-json").textContent || "{}"
    );
    expect(comments[id].attachments).toEqual(["a1", "a2"]);

    const attachments = JSON.parse(
      screen.getByTestId("attachments-json").textContent || "{}"
    );
    expect(Object.keys(attachments)).toEqual(["a1", "a2"]);
  });

  it("edits a comment, toggles isEdited, replaces attachments, and persists", () => {
    render(<StoreProbe />);

    let id = "";
    act(() => {
      id = useCommentsStore.getState().addComment({
        currentUserId: "u1",
        content: "old",
      });
    });

    const newAtts: Attachment[] = [
      {
        id: "a1",
        filename: "file1.png",
        originalName: "file1.png",
        path: "u1",
        type: "image/png",
        size: 1234,
        uploadedBy: "u1",
        uploadedAt: new Date().toISOString(),
      },
    ];

    act(() => {
      useCommentsStore.getState().editComment(id, "new content", newAtts);
    });

    const comments = JSON.parse(
      screen.getByTestId("comments-json").textContent || "{}"
    );
    const edited = comments[id];

    expect(edited.content).toBe("new content");
    expect(edited.isEdited).toBe(true);
    expect(edited.attachments).toEqual(["a1"]);
    expect(storage.saveComments).toHaveBeenCalledTimes(2);
  });

  it("editComment on missing/deleted comment is a no-op", () => {
    render(<StoreProbe />);

    act(() => {
      useCommentsStore.getState().editComment("nope", "x", []);
    });
    expect(storage.saveComments).not.toHaveBeenCalled();

    let id = "";
    act(() => {
      id = useCommentsStore
        .getState()
        .addComment({ currentUserId: "u", content: "x" });
      useCommentsStore.getState().deleteComment(id);
    });

    vi.clearAllMocks();
    act(() => {
      useCommentsStore.getState().editComment(id, "after delete", []);
    });
    expect(storage.saveComments).not.toHaveBeenCalled();
  });

  it("deletes a comment (soft delete) and updates totals", () => {
    render(<StoreProbe />);

    let a = "",
      b = "";
    act(() => {
      a = useCommentsStore
        .getState()
        .addComment({ currentUserId: "u", content: "A" });
      b = useCommentsStore
        .getState()
        .addComment({ currentUserId: "u", content: "B" });
    });

    expect(screen.getByTestId("total").textContent).toBe("2");

    act(() => {
      useCommentsStore.getState().deleteComment(a);
    });

    const comments = JSON.parse(
      screen.getByTestId("comments-json").textContent || "{}"
    );
    expect(comments[a].isDeleted).toBe(true);
    expect(screen.getByTestId("total").textContent).toBe("1");
    expect(storage.saveComments).toHaveBeenCalledTimes(3);
  });

  describe("toggleReaction — one reaction per user per comment", () => {
    it("adds new emoji when none exists", () => {
      render(<StoreProbe />);
      let id = "";
      act(() => {
        id = useCommentsStore
          .getState()
          .addComment({ currentUserId: "u1", content: "hi" });
        useCommentsStore.getState().toggleReaction(id, "userA", "👍");
      });

      const comments = JSON.parse(
        screen.getByTestId("comments-json").textContent || "{}"
      );
      expect(comments[id].reactions).toEqual({ "👍": ["userA"] });
      expect(storage.saveComments).toHaveBeenCalledTimes(2);
    });

    it("switches emoji if clicking a different one", () => {
      render(<StoreProbe />);
      let id = "";
      act(() => {
        id = useCommentsStore
          .getState()
          .addComment({ currentUserId: "u1", content: "hi" });
        useCommentsStore.getState().toggleReaction(id, "userA", "👍");
        useCommentsStore.getState().toggleReaction(id, "userA", "❤️");
      });

      const comments = JSON.parse(
        screen.getByTestId("comments-json").textContent || "{}"
      );
      expect(comments[id].reactions).toEqual({ "❤️": ["userA"] });
    });

    it("removes emoji if clicking the same again", () => {
      render(<StoreProbe />);
      let id = "";
      act(() => {
        id = useCommentsStore
          .getState()
          .addComment({ currentUserId: "u1", content: "hi" });
        useCommentsStore.getState().toggleReaction(id, "userA", "😂");
        useCommentsStore.getState().toggleReaction(id, "userA", "😂");
      });

      const comments = JSON.parse(
        screen.getByTestId("comments-json").textContent || "{}"
      );
      expect(comments[id].reactions).toEqual({});
    });

    it("clears any existing emoji when called with undefined", () => {
      render(<StoreProbe />);
      let id = "";
      act(() => {
        id = useCommentsStore
          .getState()
          .addComment({ currentUserId: "u1", content: "hi" });
        useCommentsStore.getState().toggleReaction(id, "userA", "👍");
        useCommentsStore.getState().toggleReaction(id, "userA", undefined);
      });

      const comments = JSON.parse(
        screen.getByTestId("comments-json").textContent || "{}"
      );
      expect(comments[id].reactions).toEqual({});
    });

    it("does nothing for missing or deleted comments", () => {
      render(<StoreProbe />);

      act(() => {
        useCommentsStore.getState().toggleReaction("nope", "u", "👍");
      });
      expect(storage.saveComments).not.toHaveBeenCalled();

      let id = "";
      act(() => {
        id = useCommentsStore
          .getState()
          .addComment({ currentUserId: "u1", content: "x" });
        useCommentsStore.getState().deleteComment(id);
      });
      vi.clearAllMocks();

      act(() => {
        useCommentsStore.getState().toggleReaction(id, "u2", "👍");
      });
      expect(storage.saveComments).not.toHaveBeenCalled();
    });
  });
});
