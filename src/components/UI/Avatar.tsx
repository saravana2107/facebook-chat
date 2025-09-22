import type { User } from "../../services/userService";

export function Avatar({ user, size = 36 }: { user: User; size?: number }) {
  return (
    <img
      src={user.avatar}
      alt={user.displayName}
      width={size}
      height={size}
      className="rounded-full object-cover border border-gray-200"
    />
  );
}
