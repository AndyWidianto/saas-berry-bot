export function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: "green" | "red" | "amber" | "violet" | "slate" | "sky" }) {
  const colors: Record<string, string> = {
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
    slate: "bg-white/5 text-white/50 border border-white/8",
    sky: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${colors[color]}`}>
      {children}
    </span>
  )
}