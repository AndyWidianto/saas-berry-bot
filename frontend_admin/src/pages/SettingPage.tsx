import { ActionBtn } from "@/components/Action"
import { Card } from "@/components/Card"
import { ToggleLeft, ToggleRight } from "lucide-react"
import { useState } from "react"




export default function SettingsPage() {
  const [smtp, setSmtp] = useState("smtp.kurmabot.io:587")
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [debugLogging, setDebugLogging] = useState(false)

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      <Card className="p-5 space-y-4">
        <div className="text-[13px] font-semibold text-white/80 pb-2 border-b border-white/[0.06]">General Platform Settings</div>
        {[
          { label: "Platform Name", value: "KurmaBot" },
          { label: "Support Email", value: "support@kurmabot.io" },
          { label: "SMTP Server", value: smtp },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-[11px] text-white/40 mb-1.5 block">{f.label}</label>
            <input defaultValue={f.value} onChange={f.label === "SMTP Server" ? (e) => setSmtp(e.target.value) : undefined} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/70 outline-none focus:border-violet-500/50 transition-all" />
          </div>
        ))}
      </Card>

      <Card className="p-5 space-y-4">
        <div className="text-[13px] font-semibold text-white/80 pb-2 border-b border-white/[0.06]">System Toggles</div>
        {[
          { label: "Maintenance Mode", desc: "All tenant access blocked, admin-only", val: maintenanceMode, set: setMaintenanceMode, color: "text-rose-400" },
          { label: "Debug Logging", desc: "Enable verbose logging across all services", val: debugLogging, set: setDebugLogging, color: "text-amber-400" },
        ].map((t) => (
          <div key={t.label} className="flex items-center justify-between">
            <div>
              <div className="text-[13px] text-white/75">{t.label}</div>
              <div className="text-[11px] text-white/35 mt-0.5">{t.desc}</div>
            </div>
            <button onClick={() => t.set(!t.val)} className="cursor-pointer border-0 bg-transparent">
              {t.val
                ? <ToggleRight size={28} className={t.color} />
                : <ToggleLeft size={28} className="text-white/25" />}
            </button>
          </div>
        ))}
      </Card>

      <div className="flex gap-2">
        <ActionBtn variant="primary">Save Changes</ActionBtn>
        <ActionBtn>Reset to Defaults</ActionBtn>
      </div>
    </div>
  )
}