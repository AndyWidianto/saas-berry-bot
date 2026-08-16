import { ArrowDownRight, ArrowUpRight } from "lucide-react";


export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0e1117] border border-white/[0.07] rounded-xl ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ icon, label, value, delta, deltaLabel, accent = "violet" }: {
  icon: React.ReactNode; label: string; value: string; delta?: number; deltaLabel?: string; accent?: "violet" | "emerald" | "amber" | "sky"
}) {
  const accents: Record<string, { bg: string; text: string }> = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400" },
    emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400" },
    sky: { bg: "bg-sky-500/10", text: "text-sky-400" },
  }
  const a = accents[accent]
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center ${a.text}`}>
          {icon}
        </div>
        {delta !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {delta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-white/90">{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
      {deltaLabel && <div className="text-[11px] text-white/30 mt-0.5">{deltaLabel}</div>}
    </Card>
  )
}