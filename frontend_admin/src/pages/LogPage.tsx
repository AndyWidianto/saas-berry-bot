import { Card } from "@/components/Card"
import { Search } from "lucide-react"




export default function LogsPage() {
  const logs = [
    { level: "INFO", service: "evolution-api", msg: "WhatsApp webhook received for ws_01k9m, chatbot cb_88", ts: "14:32:11.442" },
    { level: "WARN", service: "openai-gateway", msg: "Rate limit approaching for key k_01 — 94% of monthly quota used", ts: "14:31:55.109" },
    { level: "INFO", service: "rag-engine", msg: "Re-indexed 42 chunks for article a_02 in workspace ws_05g8n", ts: "14:31:22.880" },
    { level: "ERROR", service: "openai-gateway", msg: "Request timeout after 30s for model gpt-4o in workspace ws_08d5r", ts: "14:30:48.337" },
    { level: "INFO", service: "credit-ledger", msg: "Topup tx_9177 processed: +20000 credits for ws_08d5r", ts: "14:30:12.005" },
    { level: "INFO", service: "auth", msg: "Admin login: kyle@kurmabot.io from 203.0.113.47", ts: "14:29:44.791" },
    { level: "WARN", service: "qdrant", msg: "Vector collection ws_03f7z_kb nearing 80% capacity", ts: "14:29:01.662" },
    { level: "INFO", service: "gemini-gateway", msg: "Processed 89,200 tokens for ws_04b1y (session sess_4812)", ts: "14:28:33.440" },
  ]
  const levelColors: Record<string, string> = {
    INFO: "text-sky-400", WARN: "text-amber-400", ERROR: "text-rose-400"
  }
  const levelBg: Record<string, string> = {
    INFO: "bg-sky-500/8 border-sky-500/15", WARN: "bg-amber-500/8 border-amber-500/15", ERROR: "bg-rose-500/10 border-rose-500/20"
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input placeholder="Filter logs…" className="bg-white/[0.04] border border-white/[0.07] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-white/70 placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all w-64" />
        </div>
        {["INFO", "WARN", "ERROR"].map((l) => (
          <button key={l} className={`px-3 py-1.5 rounded-lg text-[12px] font-mono font-medium cursor-pointer border transition-all ${levelBg[l]} ${levelColors[l]}`}>{l}</button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Live stream
        </div>
      </div>

      <Card>
        <div className="font-mono text-[12px] divide-y divide-white/[0.04]">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors">
              <span className="text-white/25 shrink-0 mt-px">{log.ts}</span>
              <span className={`shrink-0 font-semibold w-10 ${levelColors[log.level]}`}>{log.level}</span>
              <span className="text-violet-400/70 shrink-0 w-32 truncate">{log.service}</span>
              <span className="text-white/55 flex-1">{log.msg}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
