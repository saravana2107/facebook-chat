
import { useState } from 'react'
import { searchUsers } from '../services/userService'

export function useUserMentions() {
  const [query, setQuery] = useState('')
  const results = query ? searchUsers(query) : []
  return { results, setQuery }
}
