
export function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#13181f] border border-white/10 rounded-lg px-3 py-2 text-xs">
      <div className="text-white/40 mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-white/60">{p.name}</span>
          <span className="text-white/90 font-medium ml-auto pl-4">{p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}