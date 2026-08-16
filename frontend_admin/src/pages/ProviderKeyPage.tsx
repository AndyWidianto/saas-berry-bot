import { ActionBtn } from "@/components/Action"
import { Badge } from "@/components/Badge"
import { Card } from "@/components/Card"
import { Copy, Edit3, Eye, Hash, Key, Plus, ShieldAlert, Trash2, X } from "lucide-react"
import { useState } from "react"



const providerKeys = [
  { id: "k_01", name: "OpenAI Production Key", provider: "OpenAI", key: "sk-proj-••••••••••••••••••KqaT", lastUsed: "2 min ago", status: "active", requests: 1284 },
  { id: "k_02", name: "Gemini Primary Key", provider: "Google", key: "AIzaSy••••••••••••••••••••pX9k", lastUsed: "8 min ago", status: "active", requests: 3721 },
  { id: "k_03", name: "DeepSeek API Key", provider: "DeepSeek", key: "sk-••••••••••••••••••••••••••rR2q", lastUsed: "1 hr ago", status: "active", requests: 498 },
  { id: "k_04", name: "OpenAI Backup Key", provider: "OpenAI", key: "sk-proj-••••••••••••••••••B7mW", lastUsed: "3 days ago", status: "inactive", requests: 0 },
]

export default function ProviderKeysPage() {
  const [revealed, setRevealed] = useState<string | null>(null)
  const providerColors: Record<string, string> = {
    OpenAI: "text-emerald-400",
    Google: "text-sky-400",
    DeepSeek: "text-violet-400",
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3 p-4 bg-amber-500/8 border border-amber-500/15 rounded-xl">
        <ShieldAlert size={16} className="text-amber-400 shrink-0" />
        <div className="text-[12px] text-amber-300/80">API keys are encrypted at rest using AES-256. Keys are partially masked in the UI. Revealing a key is logged to the audit trail.</div>
      </div>

      <div className="grid gap-3">
        {providerKeys.map((k) => (
          <Card key={k.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                  <Key size={15} className={providerColors[k.provider] || "text-white/40"} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-white/80">{k.name}</div>
                  <div className="text-[11px] text-white/35 mt-0.5">{k.provider} · Last used {k.lastUsed}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={k.status === "active" ? "green" : "slate"}>{k.status}</Badge>
                <ActionBtn size="xs"><Edit3 size={11} /></ActionBtn>
                <ActionBtn size="xs" variant="danger"><Trash2 size={11} /></ActionBtn>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <code className="flex-1 font-mono text-[12px] bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-white/60">
                {revealed === k.id ? k.key.replace(/•+/, "ACTUAL_KEY_REDACTED") : k.key}
              </code>
              <ActionBtn size="xs" onClick={() => setRevealed(revealed === k.id ? null : k.id)}>
                {revealed === k.id ? <><X size={11} />Hide</> : <><Eye size={11} />Reveal</>}
              </ActionBtn>
              <ActionBtn size="xs"><Copy size={11} /></ActionBtn>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-white/35">
              <span><Hash size={10} className="inline mr-1" />{k.requests.toLocaleString()} requests this month</span>
              <span className="ml-auto font-mono text-white/25">{k.id}</span>
            </div>
          </Card>
        ))}
      </div>

      <ActionBtn variant="primary"><Plus size={12} />Add New Provider Key</ActionBtn>
    </div>
  )
}
