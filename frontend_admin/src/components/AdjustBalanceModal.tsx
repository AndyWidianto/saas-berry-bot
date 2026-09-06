import { useState } from "react"
import { motion } from "framer-motion"
import { Minus, Plus, X } from "lucide-react"
import { ActionBtn } from "./Action"
import { Workspace } from "@/lib/types";



export function AdjustBalanceModal({ workspace, onClose }: { workspace: Workspace; onClose: () => void }) {
  const [op, setOp] = useState<"add" | "sub">("add")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative z-10 w-full max-w-sm bg-[#0e1117] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[14px] font-semibold text-white/90">Adjust Credit Balance</div>
            <div className="text-[12px] text-white/40 mt-0.5">{workspace.name} · {workspace.id}</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer border-0 text-white/50">
            <X size={13} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setOp("add")}
              className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition-all cursor-pointer ${op === "add" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : "bg-white/3 border-white/8 text-white/40 hover:text-white/60"}`}
            ><Plus size={12} className="inline mr-1" />Add Credits</button>
            <button
              onClick={() => setOp("sub")}
              className={`flex-1 py-2 rounded-lg text-[12px] font-medium border transition-all cursor-pointer ${op === "sub" ? "bg-rose-500/15 border-rose-500/30 text-rose-400" : "bg-white/3 border-white/8 text-white/40 hover:text-white/60"}`}
            ><Minus size={12} className="inline mr-1" />Deduct Credits</button>
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">Amount (credits)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-white/40 mb-1.5 block">Reason / Note</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Manual topup for plan upgrade"
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all resize-none"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <ActionBtn onClick={onClose}>Cancel</ActionBtn>
            <ActionBtn variant="primary">
              {op === "add" ? <Plus size={12} /> : <Minus size={12} />}
              {op === "add" ? "Add" : "Deduct"} Credits
            </ActionBtn>
          </div>
        </div>
      </motion.div>
    </div>
  )
}