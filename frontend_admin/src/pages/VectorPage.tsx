import { ActionBtn } from "@/components/Action"
import { Badge } from "@/components/Badge"
import { Card, StatCard } from "@/components/Card"
import { Activity, Database, Layers, RefreshCw, Trash2 } from "lucide-react"


export default function VectorDBPage() {
  const collections = [
    { name: "ws_01k9m_kb", workspace: "Acme Corp", vectors: 18420, dims: 1536, model: "text-embedding-3-large", size: "142 MB", status: "healthy" },
    { name: "ws_02a3x_kb", workspace: "NovaTech Solutions", vectors: 4810, dims: 1536, model: "text-embedding-3-large", size: "38 MB", status: "healthy" },
    { name: "ws_03f7z_kb", workspace: "Bright Retail", vectors: 2100, dims: 1536, model: "text-embedding-3-large", size: "17 MB", status: "near-full" },
    { name: "ws_05g8n_kb", workspace: "EduPlatform", vectors: 89240, dims: 768, model: "Gemini Embedding", size: "389 MB", status: "healthy" },
    { name: "system_global_kb", workspace: "System (Global)", vectors: 3280, dims: 1536, model: "text-embedding-3-large", size: "26 MB", status: "healthy" },
  ]

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Database size={16} />} label="Total Vector Collections" value="31" accent="violet" />
        <StatCard icon={<Layers size={16} />} label="Total Indexed Vectors" value="284K" delta={6} accent="sky" />
        <StatCard icon={<Activity size={16} />} label="Avg Query Latency" value="28ms" accent="emerald" />
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="text-[13px] font-semibold text-white/80">Qdrant Collections</div>
          <ActionBtn><RefreshCw size={12} />Sync</ActionBtn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Collection", "Workspace", "Vectors", "Dimensions", "Embedding Model", "Size", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {collections.map((c, i) => (
                <tr key={c.name} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === collections.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3 font-mono text-violet-400 text-[11px]">{c.name}</td>
                  <td className="px-4 py-3 text-white/70">{c.workspace}</td>
                  <td className="px-4 py-3 font-mono text-white/60">{c.vectors.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-white/50">{c.dims}</td>
                  <td className="px-4 py-3 text-white/45">{c.model}</td>
                  <td className="px-4 py-3 font-mono text-white/40">{c.size}</td>
                  <td className="px-4 py-3"><Badge color={c.status === "healthy" ? "green" : "amber"}>{c.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <ActionBtn size="xs"><RefreshCw size={11} />Re-index</ActionBtn>
                      <ActionBtn size="xs" variant="danger"><Trash2 size={11} /></ActionBtn>
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