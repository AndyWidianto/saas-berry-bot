import { useState, useEffect } from "react"
import { Search, Plus, Eye, Ban, RefreshCw } from "lucide-react"
import { ActionBtn } from "@/components/Action"
import { Card } from "@/components/Card"
import { Tooltip2 } from "@/components/ToolTip"
import { Badge } from "@/components/Badge"


const platformUsers = [
  { id: "u_01", avatar: "SC", name: "Sarah Chen", email: "sarah.chen@acmecorp.com", workspaces: 2, role: "PLATFORM_CLIENT", registered: "2024-01-12", status: "verified" },
  { id: "u_02", avatar: "JO", name: "James Okafor", email: "james@novatech.io", workspaces: 1, role: "PLATFORM_CLIENT", registered: "2024-02-28", status: "verified" },
  { id: "u_03", avatar: "PN", name: "Priya Nair", email: "priya.nair@bright.com", workspaces: 1, role: "PLATFORM_CLIENT", registered: "2024-03-15", status: "verified" },
  { id: "u_04", avatar: "MW", name: "Marcus Webb", email: "m.webb@healthfirst.org", workspaces: 3, role: "PLATFORM_CLIENT", registered: "2024-04-02", status: "verified" },
  { id: "u_05", avatar: "AD", name: "Aisha Diallo", email: "aisha@eduplatform.io", workspaces: 1, role: "PLATFORM_CLIENT", registered: "2024-04-19", status: "blocked" },
  { id: "u_06", avatar: "KM", name: "Kyle Martin", email: "kyle@kurmabot.io", workspaces: 0, role: "SUPER_ADMIN", registered: "2023-11-01", status: "verified" },
  { id: "u_07", avatar: "RP", name: "Rachel Park", email: "r.park@kurmabot.io", workspaces: 0, role: "SUPPORT", registered: "2024-01-05", status: "verified" },
]

const roleColor: Record<string, "violet" | "sky" | "slate"> = {
  SUPER_ADMIN: "violet", SUPPORT: "sky", PLATFORM_CLIENT: "slate"
}

export default function UsersPage() {
  const [search, setSearch] = useState("")
  const filtered = platformUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all" />
        </div>
        <div className="ml-auto"><ActionBtn variant="primary"><Plus size={12} />Add Admin User</ActionBtn></div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["User", "Email", "Workspaces", "Role", "Status", "Registered", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-700 to-indigo-900 flex items-center justify-center text-[10px] font-bold text-white">{u.avatar}</div>
                      <span className="font-medium text-white/80">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3 text-white/60 font-mono">{u.workspaces}</td>
                  <td className="px-4 py-3"><Badge color={roleColor[u.role]}>{u.role}</Badge></td>
                  <td className="px-4 py-3"><Badge color={u.status === "verified" ? "green" : "red"}>{u.status}</Badge></td>
                  <td className="px-4 py-3 text-white/40">{u.registered}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Tooltip2 content="Reset password"><ActionBtn size="xs"><RefreshCw size={11} /></ActionBtn></Tooltip2>
                      <Tooltip2 content="View audit trail"><ActionBtn size="xs"><Eye size={11} /></ActionBtn></Tooltip2>
                      <Tooltip2 content="Ban user"><ActionBtn size="xs" variant="danger"><Ban size={11} /></ActionBtn></Tooltip2>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}