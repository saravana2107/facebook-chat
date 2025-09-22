
export interface User {
  id: string
  username: string
  displayName: string
  avatar: string
  isOnline: boolean
  lastSeen: string
}

export interface UserDB {
  users: Record<string, User>
}
