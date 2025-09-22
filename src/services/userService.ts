import type { User, UserDB } from "../types/user.types";
import { storage } from "./storageService";
import Users from "../data/users.json";

let cache: UserDB | null = null;

export function getUsers(): Record<string, User> {
  if (!cache) cache = storage.loadUsers() ?? { users: Users.users };
  return cache.users;
}

export function searchUsers(query: string): User[] {
  const q = query.toLowerCase();
  return Object.values(getUsers())
    .filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q),
    )
    .slice(0, 8);
}
