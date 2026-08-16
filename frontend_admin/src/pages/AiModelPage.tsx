import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, Plus, Edit3, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Card } from "@/components/Card"
import { ActionBtn } from "@/components/Action"
import { Badge } from "@/components/Badge"
import CreateAIModelModal from "@/components/ModalAIModel"
import useAxios from "@/lib/axios.control"
import { AIModel, CreateAIModel } from "@/types"
import { toast } from "sonner"
import axios from "axios"


export default function AIModelsPage() {
  const { AxiosPrivate } = useAxios()
  const [isOpen, setIsOpen] = useState(false);
  const [aimodels, setAimodels] = useState<AIModel[]>([]);

  const handleClose = () => {
    setIsOpen(false);
  }
  const fetchModels = async () => {
    try {
      const res = await AxiosPrivate.get("aimodels");
      const result = res.data;
      setAimodels(result.data);
      console.log(result);
    } catch (err) {
      console.error("Fetch error: ", err);
    }
  }

  const handleSubmit = async (data: CreateAIModel) => {
    try {
      const res = await AxiosPrivate.post("aimodels", data);
      const result = res.data;
      toast.success("Berhasil membuat model baru.")
      setAimodels(prev => [result.data, ...prev]);
      console.log(result);
    } catch (err) {
      console.error("Fetch error: ", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Gagal membuat model";
        toast.error(message);
      }
    }
  }

  const handleDeleteModel = async (model: AIModel) => {
    if (!confirm(`Apakah anda yakin ingin menghapus model ${model.name}?`)) return;
    try {
      const res = await AxiosPrivate.delete(`aimodels/${model.id}`);
      const result = res.data;
      console.log(result);
      setAimodels(prev => prev.filter(p => p.id !== model.id));
      toast.success("Berhasil hapus model.");
    } catch (err) {
      setAimodels(prev => [model, ...prev]);
      console.error("Fetch error: ", err);
      if (axios.isAxiosError(err)) {
        const message = err.response?.data.message || "Gagal menghapus model.";
        toast.error(message);
      }
    }
  }

  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="p-6 space-y-5">
      {/* Fallback strategy */}
      {/* <Card className="p-4 flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
          <ShieldAlert size={16} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-medium text-white/80">Global Fallback Strategy</div>
          <div className="text-[11px] text-white/40 mt-0.5">If primary LLM rate-limits or fails, route to fallback model automatically</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/40">Primary: <span className="text-white/70">Gemini 1.5 Flash</span></span>
          <span className="text-[12px] text-white/40">→ Fallback: <span className="text-white/70">DeepSeek R1</span></span>
          <button onClick={() => setFallbackEnabled(!fallbackEnabled)} className="cursor-pointer border-0 bg-transparent">
            {fallbackEnabled
              ? <ToggleRight size={28} className="text-emerald-400" />
              : <ToggleLeft size={28} className="text-white/25" />}
          </button>
        </div>
      </Card> */}

      <CreateAIModelModal isOpen={isOpen} onClose={handleClose} onSubmit={(data) => handleSubmit(data)} />

      {/* Models table */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="text-[13px] font-semibold text-white/80">Registered AI Models</div>
          <ActionBtn variant="primary" onClick={() => setIsOpen(true)}><Plus size={12} />Register Model</ActionBtn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Model", "Provider", "Capabilities", "Input $/1M", "Output $/1M", "Markup", "Context", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {aimodels.map((m, i) => (
                <tr key={m.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${i === aimodels.length - 1 ? "border-0" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white/80">{m.name}</div>
                    <div className="text-white/30 font-mono text-[10px]">{m.modelCode}</div>
                  </td>
                  <td className="px-4 py-3 text-white/55">{m.provider}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {m.isChat && <Badge color="violet">Chat</Badge>}
                      {m.isEmbedding && <Badge color="sky">Embed</Badge>}
                      {m.isVision && <Badge color="amber">Vision</Badge>}
                      {m.isAudio && <Badge color="green">Audio</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/60">${m.inputPricePer1M.toFixed(3)}</td>
                  <td className="px-4 py-3 font-mono text-white/60">{m.outputPricePer1M > 0 ? `$${m.outputPricePer1M.toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{m.tenantMarkup}×</td>
                  <td className="px-4 py-3 font-mono text-white/55">{m.contextWindow.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge color={m.isActive ? "green" : "slate"}>
                      {m.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <ActionBtn size="xs"><Edit3 size={11} /></ActionBtn>
                      <ActionBtn size="xs" onClick={() => handleDeleteModel(m)} variant="danger"><Trash2 size={11} /></ActionBtn>
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