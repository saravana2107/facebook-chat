
import * as React from 'react'
export function Tooltip({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <span className="relative group">
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-soft">{label}</span>
    </span>
  )
}
