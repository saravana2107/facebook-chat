import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CommentView } from "../Comment";

vi.mock("../../../services/userService", () => ({
  getUsers: vi.fn(() => ({
    u1: {
      id: "u1",
      displayName: "Alice",
      avatar: "/alice.png",
    },
    u2: {
      id: "u2",
      displayName: "Bob",
      avatar: "/bob.png",
    },
  })),
}));

vi.mock("../../../utils/dateUtils", () => ({
  formatCompact: vi.fn(() => "5m"),
}));

vi.mock("../CommentForm", () => ({
  CommentForm: (props: { editId?: string }) => (
    <div data-testid="comment-form-mock">
      FORM: {props?.editId ? `edit:${props.editId}` : "new"}
    </div>
  ),
}));

const deleteCommentSpy = vi.fn();
const toggleReactionSpy = vi.fn();

type FakeComment = {
  id: string;
  parentId: string | null;
  authorId: string;
  content: string;
  timestamp: string;
  attachments: string[];
  reactions: Record<string, string[]>;
  isEdited?: boolean;
  editedAt?: string | null;
  isDeleted?: boolean;
};

let FAKE_STATE: {
  db: {
    comments: Record<string, FakeComment>;
    attachments: Record<
      string,
      { id: string; path: string; originalName: string }
    >;
    metadata: { totalComments: number; lastUpdated: string };
  };
  deleteComment: typeof deleteCommentSpy;
  toggleReaction: typeof toggleReactionSpy;
};

vi.mock("../../../store/commentsStore", () => {
  const hook = (selector: (s: typeof FAKE_STATE) => unknown) =>
    selector(FAKE_STATE);
  (
    hook as unknown as {
      getState: () => typeof FAKE_STATE;
    }
  ).getState = () => FAKE_STATE;
  return { useCommentsStore: hook };
});

const resetState = (overrides?: Partial<typeof FAKE_STATE>) => {
  deleteCommentSpy.mockReset();
  toggleReactionSpy.mockReset();

  FAKE_STATE = {
    db: {
      comments: {
        c1: {
          id: "c1",
          parentId: null,
          authorId: "u1",
          content: "Root comment",
          timestamp: "2025-01-01T10:00:00.000Z",
          attachments: [],
          reactions: {},
          isEdited: false,
          editedAt: null,
          isDeleted: false,
        },
      },
      attachments: {
        a1: { id: "a1", path: "/file-a1.jpg", originalName: "image-a1.jpg" },
      },
      metadata: { totalComments: 1, lastUpdated: "2025-01-01T10:00:00.000Z" },
    },
    deleteComment: deleteCommentSpy,
    toggleReaction: toggleReactionSpy,
    ...overrides,
  };
};

describe("CommentView", () => {
  beforeEach(() => {
    resetState();
  });

  it("renders author avatar, name, content and relative time", () => {
    render(<CommentView commentId="c1" level={0} />);
    expect(screen.getByAltText("Alice")).toHaveAttribute("src", "/alice.png");
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Root comment")).toBeInTheDocument();
    expect(screen.getByText("5m")).toBeInTheDocument();
  });

  it("shows (edited) badge when comment is edited", () => {
    resetState({
      db: {
        ...FAKE_STATE.db,
        comments: {
          ...FAKE_STATE.db.comments,
          c1: { ...FAKE_STATE.db.comments.c1, isEdited: true },
        },
      },
    });
    render(<CommentView commentId="c1" level={0} />);
    expect(screen.getByLabelText("edited")).toBeInTheDocument();
  });

  it("renders attachments via AttachmentPreview", () => {
    resetState({
      db: {
        ...FAKE_STATE.db,
        comments: {
          ...FAKE_STATE.db.comments,
          c1: { ...FAKE_STATE.db.comments.c1, attachments: ["a1"] },
        },
      },
    });

    render(<CommentView commentId="c1" level={0} />);
    const img = screen.getByAltText("image-a1.jpg");
    expect(img).toHaveAttribute("src", "/file-a1.jpg");
  });

  it("opens actions menu and triggers Edit (shows CommentForm in edit mode)", async () => {
    render(<CommentView commentId="c1" level={0} />);
    const user = userEvent.setup();

    const menuButton = screen.getByRole("button", { name: /action/i });
    await user.click(menuButton);

    const editBtn = screen.getByRole("menuitem", { name: /edit/i });
    await user.click(editBtn);

    expect(screen.getByTestId("comment-form-mock")).toHaveTextContent(
      "edit:c1",
    );
  });

  it("opens actions menu and triggers Delete", async () => {
    render(<CommentView commentId="c1" level={0} />);
    const user = userEvent.setup();

    const menuButton = screen.getByRole("button", { name: /action/i });
    await user.click(menuButton);

    const deleteBtn = screen.getByRole("menuitem", { name: /delete/i });
    await user.click(deleteBtn);

    expect(deleteCommentSpy).toHaveBeenCalledTimes(1);
    expect(deleteCommentSpy).toHaveBeenCalledWith("c1");
  });

  it("clicking Like with an existing selection clears the reaction (calls with undefined)", async () => {
    resetState({
      db: {
        ...FAKE_STATE.db,
        comments: {
          ...FAKE_STATE.db.comments,
          c1: {
            ...FAKE_STATE.db.comments.c1,
            reactions: { "👍": ["u1"] },
          },
        },
      },
    });

    render(<CommentView commentId="c1" level={0} />);
    const user = userEvent.setup();

    await user.click(screen.getByText("Like"));
    expect(toggleReactionSpy).toHaveBeenCalledWith("c1", "u1", undefined);
  });

  it("renders ReactionBar with counts", () => {
    resetState({
      db: {
        ...FAKE_STATE.db,
        comments: {
          ...FAKE_STATE.db.comments,
          c1: {
            ...FAKE_STATE.db.comments.c1,
            reactions: { "👍": ["u1", "u2"], "😂": ["u2"] },
          },
        },
      },
    });
    render(<CommentView commentId="c1" level={0} />);

    expect(screen.getByText("👍")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("😂")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders reply form when Reply is toggled", async () => {
    render(<CommentView commentId="c1" level={0} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: /reply/i }));
    expect(screen.getByTestId("comment-form-mock")).toHaveTextContent("new");

    await user.click(screen.getByRole("button", { name: /reply/i }));
    expect(screen.queryByTestId("comment-form-mock")).not.toBeInTheDocument();
  });
});
