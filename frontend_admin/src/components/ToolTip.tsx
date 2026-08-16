import { useState } from "react";

export function Tooltip2({ content, children }: { content: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-[#1a2030] border border-white/10 text-[11px] text-white/70 whitespace-nowrap pointer-events-none">
          {content}
        </span>
      )}
    </span>
  )
}