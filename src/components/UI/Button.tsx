import type { ButtonHTMLAttributes } from "react";
export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return <button {...props} className={`btn ${className}`} />;
}
