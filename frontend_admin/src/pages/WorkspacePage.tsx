import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, Search, Plus, Ban, Download, ChevronLeft, ChevronRight, LogIn, Bot, Sliders, Clock } from "lucide-react"
import { ActionBtn } from "@/components/Action"
import { Card } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Tooltip2 } from "@/components/ToolTip"
import { AdjustBalanceModal } from "@/components/AdjustBalanceModal"
import useWorkspaceHook from "@/hooks/WorkspaceHook"
import { Workspace } from "@/lib/types"



export default function WorkspacesPage() {
  const { workspaces, setWorkspaces } = useWorkspaceHook();

  // State manajemen
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [adjustTarget, setAdjustTarget] = useState<Workspace | null>(null);

  // Logika pencarian & filter berdasarkan isAiActive
  const filtered = workspaces.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.ownerId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && w.isAiActive) ||
      (statusFilter === "inactive" && !w.isAiActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-4">
      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspace, owner, ID…"
            className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all"
          />
        </div>

        {/* Status Filter Buttons */}
        {(["all", "active", "inactive"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer border ${statusFilter === s
                ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60"
              }`}
          >
            {s === "all" ? "All" : s === "active" ? "AI Active" : "AI Inactive"}
          </button>
        ))}

        {/* Global Actions */}
        <div className="ml-auto flex items-center gap-2">
          <ActionBtn>
            <Download size={12} /> Export
          </ActionBtn>
          <ActionBtn variant="primary">
            <Plus size={12} /> New Workspace
          </ActionBtn>
        </div>
      </div>

      {/* Table Section */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  "Workspace",
                  "AI Status",
                  "Chat Model",
                  "Chunk / Overlap",
                  "Working Hours",
                  "Timezone",
                  "Created At",
                  "Actions",
                ].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => {
                const avatarFallback = w.name.substring(0, 2).toUpperCase();

                return (
                  <tr
                    key={w.id}
                    className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === filtered.length - 1 ? "border-0" : ""
                      }`}
                  >
                    {/* Workspace & Logo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {w.logoUrl ? (
                          <img src={w.logoUrl} alt={w.name} className="w-7 h-7 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-700 to-indigo-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {avatarFallback}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white/80">{w.name}</div>
                          <div className="text-white/35 font-mono text-[10px]">{w.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* AI Status */}
                    <td className="px-4 py-3">
                      <Badge color={w.isAiActive ? "green" : "red"}>
                        {w.isAiActive ? "Active" : "Disabled"}
                      </Badge>
                    </td>

                    {/* Chat Model */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-white/70">
                        <Bot size={12} className="text-violet-400 shrink-0" />
                        <span className="font-mono text-[11px] truncate max-w-[120px]">
                          {w.activeChatModelId ?? "Not Set"}
                        </span>
                      </div>
                    </td>

                    {/* Chunk Size / Overlap */}
                    <td className="px-4 py-3 font-mono text-white/60">
                      {w.chunkSize} / {w.chunkOverlap}
                    </td>

                    {/* Working Hours */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-white/60">
                        <Clock size={12} className={w.workingHoursEnabled ? "text-emerald-400" : "text-white/20"} />
                        <span>{w.workingHoursEnabled ? "Enabled" : "Off"}</span>
                      </div>
                    </td>

                    {/* Timezone */}
                    <td className="px-4 py-3 text-white/50 font-mono text-[11px]">
                      {w.timezone}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 text-white/40">
                      {new Date(w.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Tooltip2 content="Impersonate">
                          <ActionBtn size="xs">
                            <LogIn size={11} />
                          </ActionBtn>
                        </Tooltip2>
                        <Tooltip2 content="Settings / Config">
                          <ActionBtn size="xs" onClick={() => setAdjustTarget(w)}>
                            <Sliders size={11} />
                          </ActionBtn>
                        </Tooltip2>
                        <Tooltip2 content="Suspend">
                          <ActionBtn size="xs" variant="danger">
                            <Ban size={11} />
                          </ActionBtn>
                        </Tooltip2>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
          <span className="text-[11px] text-white/30">
            Showing {filtered.length} of {workspaces.length} workspaces
          </span>
          <div className="flex items-center gap-1">
            <ActionBtn size="xs">
              <ChevronLeft size={12} /> Prev
            </ActionBtn>
            <span className="px-2 py-1 text-[11px] text-white/60 bg-violet-600/20 rounded border border-violet-500/20">
              1
            </span>
            <ActionBtn size="xs">
              Next <ChevronRight size={12} />
            </ActionBtn>
          </div>
        </div>
      </Card>

      {/* Modal Section */}
      <AnimatePresence>
        {adjustTarget && (
          <AdjustBalanceModal workspace={adjustTarget} onClose={() => setAdjustTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}