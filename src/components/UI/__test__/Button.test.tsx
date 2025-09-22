import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button component", () => {
  it("renders with default class", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toHaveClass("btn");
  });

  it("merges provided className with default", () => {
    render(<Button className="extra-class">Hello</Button>);
    const btn = screen.getByRole("button", { name: /hello/i });
    expect(btn).toHaveClass("btn");
    expect(btn).toHaveClass("extra-class");
  });

  it("forwards other props like type and disabled", () => {
    render(
      <Button type="submit" disabled>
        Submit
      </Button>,
    );
    const btn = screen.getByRole("button", { name: /submit/i });
    expect(btn).toHaveAttribute("type", "submit");
    expect(btn).toBeDisabled();
  });

  it("handles onClick", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press</Button>);
    const btn = screen.getByRole("button", { name: /press/i });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
