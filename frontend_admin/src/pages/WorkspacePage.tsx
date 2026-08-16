import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Search, Plus, Ban, Download, ChevronLeft, ChevronRight,  LogIn } from "lucide-react"
import { ActionBtn } from "@/components/Action"
import { Card } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Tooltip2 } from "@/components/ToolTip"
import { AdjustBalanceModal } from "@/components/AdjustBalanceModal"



const workspaces = [
  { id: "ws_01k9m", name: "Acme Corp", owner: "Sarah Chen", plan: "Enterprise", credits: 48200, usage: 91, status: "active", registered: "2024-01-12", chatbots: 8 },
  { id: "ws_02a3x", name: "NovaTech Solutions", owner: "James Okafor", plan: "Growth", credits: 3100, usage: 67, status: "active", registered: "2024-02-28", chatbots: 3 },
  { id: "ws_03f7z", name: "Bright Retail", owner: "Priya Nair", plan: "Starter", credits: 280, usage: 94, status: "overdue", registered: "2024-03-15", chatbots: 1 },
  { id: "ws_04b1y", name: "HealthFirst Clinic", owner: "Marcus Webb", plan: "Growth", credits: 12400, usage: 43, status: "active", registered: "2024-04-02", chatbots: 4 },
  { id: "ws_05g8n", name: "EduPlatform", owner: "Aisha Diallo", plan: "Enterprise", credits: 78900, usage: 29, status: "active", registered: "2024-04-19", chatbots: 12 },
  { id: "ws_06c2p", name: "SwiftLogistics", owner: "Tom Hendricks", plan: "Starter", credits: 0, usage: 100, status: "suspended", registered: "2024-05-07", chatbots: 1 },
  { id: "ws_07h4q", name: "MediaHouse", owner: "Lena Vogel", plan: "Growth", credits: 6700, usage: 51, status: "active", registered: "2024-05-22", chatbots: 5 },
  { id: "ws_08d5r", name: "FinanceEdge", owner: "Carlos Rivera", plan: "Enterprise", credits: 34500, usage: 72, status: "active", registered: "2024-06-01", chatbots: 9 },
]

export default function WorkspacesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [adjustTarget, setAdjustTarget] = useState<(typeof workspaces)[0] | null>(null)

  const filtered = workspaces.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.owner.toLowerCase().includes(search.toLowerCase()) || w.id.includes(search)
    const matchStatus = statusFilter === "all" || w.status === statusFilter
    return matchSearch && matchStatus
  })

  const statusColor: Record<string, "green" | "red" | "amber"> = {
    active: "green", suspended: "red", overdue: "amber"
  }

  return (
    <div className="p-6 space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspace, owner, ID…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all"
          />
        </div>
        {(["all", "active", "overdue", "suspended"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border ${
              statusFilter === s ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <ActionBtn><Download size={12} />Export</ActionBtn>
          <ActionBtn variant="primary"><Plus size={12} />New Workspace</ActionBtn>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Workspace", "Plan", "Chatbots", "Credits", "Usage", "Status", "Registered", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white/80">{w.name}</div>
                    <div className="text-white/35 font-mono text-[10px] mt-0.5">{w.id}</div>
                    <div className="text-white/40 text-[11px]">{w.owner}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={w.plan === "Enterprise" ? "violet" : w.plan === "Growth" ? "sky" : "slate"}>
                      {w.plan}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/60">{w.chatbots}</td>
                  <td className="px-4 py-3 font-mono text-white/70">{w.credits.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden w-16">
                        <div
                          className={`h-full rounded-full ${w.usage > 90 ? "bg-rose-500" : w.usage > 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${w.usage}%` }}
                        />
                      </div>
                      <span className="font-mono text-white/50">{w.usage}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={statusColor[w.status]}>{w.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-white/40">{w.registered}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Tooltip2 content="Impersonate"><ActionBtn size="xs"><LogIn size={11} /></ActionBtn></Tooltip2>
                      <Tooltip2 content="Adjust balance"><ActionBtn size="xs" onClick={() => setAdjustTarget(w)}><CreditCard size={11} /></ActionBtn></Tooltip2>
                      <Tooltip2 content="Suspend"><ActionBtn size="xs" variant="danger"><Ban size={11} /></ActionBtn></Tooltip2>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[11px] text-white/30">Showing {filtered.length} of {workspaces.length} workspaces</span>
          <div className="flex items-center gap-1">
            <ActionBtn size="xs"><ChevronLeft size={12} />Prev</ActionBtn>
            <span className="px-2 py-1 text-[11px] text-white/60 bg-violet-600/20 rounded border border-violet-500/20">1</span>
            <ActionBtn size="xs">Next<ChevronRight size={12} /></ActionBtn>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {adjustTarget && <AdjustBalanceModal workspace={adjustTarget} onClose={() => setAdjustTarget(null)} />}
      </AnimatePresence>
    </div>
  )
}