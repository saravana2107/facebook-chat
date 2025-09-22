import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const { ChatContainerMock } = vi.hoisted(() => ({
  ChatContainerMock: vi.fn(() => <div data-testid="chat-container-mock" />),
}));

vi.mock("../components/Chat", () => ({
  ChatContainer: () => ChatContainerMock(),
}));

import App from "../App";

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the header title", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { level: 1, name: /comment/i }),
    ).toBeInTheDocument();
  });

  it("includes ChatContainer in the main content", () => {
    render(<App />);
    expect(screen.getByTestId("chat-container-mock")).toBeInTheDocument();
    expect(ChatContainerMock).toHaveBeenCalledTimes(1);
  });

  it("applies top-level layout classes", () => {
    const { container } = render(<App />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("min-h-screen", "bg-gray-50");

    const header = container.querySelector("header") as HTMLElement;
    expect(header).toHaveClass("bg-brand-800", "text-white");

    const main = container.querySelector("main") as HTMLElement;
    expect(main).toHaveClass(
      "max-w-3xl",
      "mx-auto",
      "px-8",
      "py-12",
      "space-y-4",
    );
  });
});
