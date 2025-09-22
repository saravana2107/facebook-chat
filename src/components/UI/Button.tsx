import type { ButtonHTMLAttributes } from "react";

/**
 * Button component
 * @param props - Props for the component
 * @returns JSX.Element
 */
export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return <button {...props} className={`btn ${className}`} />;
}
