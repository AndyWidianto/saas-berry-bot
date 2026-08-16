import { ActionBtn } from "@/components/Action"
import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { Activity, Download, Filter, Search } from "lucide-react"



const ledgerEntries = [
  { id: "tx_9182", workspace: "Acme Corp", wsId: "ws_01k9m", type: "USAGE_CHAT", amount: -1240, balance: 48200, model: "GPT-4o", tokens: 124000, ts: "2025-08-12 14:32:11" },
  { id: "tx_9181", workspace: "EduPlatform", wsId: "ws_05g8n", type: "TOPUP", amount: 50000, balance: 78900, model: "—", tokens: 0, ts: "2025-08-12 14:18:44" },
  { id: "tx_9180", workspace: "NovaTech", wsId: "ws_02a3x", type: "USAGE_RAG", amount: -380, balance: 3100, model: "text-embedding-3-large", tokens: 38000, ts: "2025-08-12 13:59:02" },
  { id: "tx_9179", workspace: "HealthFirst Clinic", wsId: "ws_04b1y", type: "USAGE_CHAT", amount: -890, balance: 12400, model: "Gemini 1.5 Flash", tokens: 89200, ts: "2025-08-12 13:41:30" },
  { id: "tx_9178", workspace: "MediaHouse", wsId: "ws_07h4q", type: "USAGE_CHAT", amount: -310, balance: 6700, model: "DeepSeek R1", tokens: 31000, ts: "2025-08-12 13:22:17" },
  { id: "tx_9177", workspace: "FinanceEdge", wsId: "ws_08d5r", type: "TOPUP", amount: 20000, balance: 34500, model: "—", tokens: 0, ts: "2025-08-12 12:58:45" },
  { id: "tx_9176", workspace: "Bright Retail", wsId: "ws_03f7z", type: "USAGE_CHAT", amount: -120, balance: 280, model: "Gemini 1.5 Flash", tokens: 12000, ts: "2025-08-12 12:34:09" },
  { id: "tx_9175", workspace: "Acme Corp", wsId: "ws_01k9m", type: "USAGE_RAG", amount: -540, balance: 49440, model: "text-embedding-3-large", tokens: 54000, ts: "2025-08-12 12:10:55" },
]

export default function TransactionsPage() {
  const typeColor: Record<string, "green" | "violet" | "sky" | "amber"> = {
    TOPUP: "green", USAGE_CHAT: "violet", USAGE_RAG: "sky"
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input placeholder="Search workspace, event type…" className="bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all w-64" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.07] rounded-lg text-[12px] text-white/40 hover:text-white/60 cursor-pointer transition-colors">
          <Filter size={12} />Event Type
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.07] rounded-lg text-[12px] text-white/40 hover:text-white/60 cursor-pointer transition-colors">
          <Activity size={12} />Date Range
        </button>
        <div className="ml-auto">
          <ActionBtn><Download size={12} />Export CSV</ActionBtn>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="text-[13px] font-semibold text-white/80">Credit Ledger — Real-time</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["TX ID", "Workspace", "Event Type", "Amount", "Balance After", "Model Used", "Tokens", "Timestamp"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ledgerEntries.map((tx, i) => (
                <tr key={tx.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === ledgerEntries.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3 font-mono text-violet-400 text-[11px]">{tx.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-white/75 font-medium">{tx.workspace}</div>
                    <div className="text-white/30 font-mono text-[10px]">{tx.wsId}</div>
                  </td>
                  <td className="px-4 py-3"><Badge color={typeColor[tx.type]}>{tx.type}</Badge></td>
                  <td className={`px-4 py-3 font-mono font-semibold ${tx.amount > 0 ? "text-emerald-400" : "text-white/60"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-white/55">{tx.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/45">{tx.model}</td>
                  <td className="px-4 py-3 font-mono text-white/40">{tx.tokens > 0 ? tx.tokens.toLocaleString() : "—"}</td>
                  <td className="px-4 py-3 font-mono text-white/35 text-[11px]">{tx.ts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}