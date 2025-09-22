import Users from "../data/users.json";

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
}

/**
 * Retrieves the list of users
 * @returns {Record<string, User>} - A record of users
 */
export function getUsers(): Record<string, User> {
  return Users.users;
}
