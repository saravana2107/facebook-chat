import Users from "../data/users.json";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

export function getUsers(): Record<string, User> {
  return Users.users;
}
