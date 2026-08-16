import { Bell, ChevronDown, Search } from "lucide-react";
import { useState } from "react";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const [alerts] = useState(3)
  return (
    <header className="h-14 px-6 flex items-center gap-4 border-b border-white/[0.06] bg-[#080b12] shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Search workspaces, users, keys…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/8">⌘K</kbd>
        </div>
      </div>

      {/* Page title */}
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-white/80">{title}</div>
        {subtitle && <div className="text-[11px] text-white/35">{subtitle}</div>}
      </div>

      {/* System health */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/8 border border-emerald-500/15 rounded-lg">
        <span className="relative w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-emerald-400"></span>
          <span className="pulse-dot absolute inset-0 rounded-full bg-emerald-400"></span>
        </span>
        <span className="text-[11px] text-emerald-400 font-medium">All Services Operational</span>
      </div>

      {/* Alerts */}
      <button className="relative w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors border border-white/[0.07] cursor-pointer">
        <Bell size={14} className="text-white/50" />
        {alerts > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {alerts}
          </span>
        )}
      </button>

      {/* Profile */}
      <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer border-0">
        <div className="w-6 h-6 rounded-full bg-violet-700 flex items-center justify-center text-[10px] font-bold text-white">KM</div>
        <ChevronDown size={12} className="text-white/30" />
      </button>
    </header>
  )
}
