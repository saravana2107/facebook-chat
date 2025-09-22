
import { type ReactNode } from 'react'
export function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4" role="dialog" aria-modal>
      <div className="bg-white rounded-2xl p-4 max-w-lg w-full shadow-soft">
        <div className="text-right"><button onClick={onClose} aria-label="Close">✕</button></div>
        {children}
      </div>
    </div>
  )
}
