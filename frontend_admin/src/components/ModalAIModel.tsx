import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Cpu, DollarSign, Settings, Check } from "lucide-react";
import { CreateAIModel, ProviderAI } from "@/lib/types";

interface CreateAIModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: CreateAIModel) => void;
}


export default function CreateAIModelModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateAIModelModalProps) {
  const [formData, setFormData] = useState<CreateAIModel>({
    name: "",
    modelCode: "",
    provider: ProviderAI.GOOGLE,
    isChat: true,
    isEmbedding: false,
    isVision: false,
    isAudio: false,
    contextWindow: 4096,
    maxOutputToken: 1024,
    inputPricePer1M: 0,
    outputPricePer1M: 0,
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
    onClose();
  };

  const toggleCapability = (key: "isChat" | "isEmbedding" | "isVision" | "isAudio") => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-over Modal Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[520px] bg-[#0e1117] border-l border-white/[0.08] flex flex-col font-sans antialiased text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Cpu size={14} />
                </div>
                <div className="text-[14px] font-semibold text-white/90">
                  Register AI Model
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer border-0 text-white/50 transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Form Body */}
            <form id="ai-model-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Model Name */}
              <div>
                <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                  Model Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Gemini 1.5 Flash or GPT-4o"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all"
                />
              </div>

              {/* Model Code & Provider Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                    API Model Code
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.modelCode}
                    onChange={(e) => setFormData({ ...formData, modelCode: e.target.value })}
                    placeholder="e.g. gemini-1.5-flash"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/80 placeholder:text-white/20 outline-none focus:border-violet-500/50 transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                    Provider
                  </label>
                  <select
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value as ProviderAI })}
                    className="w-full bg-[#131720] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white/70 outline-none focus:border-violet-500/50 transition-all"
                  >
                    {Object.values(ProviderAI).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capabilities Section */}
              <div>
                <label className="text-[11px] font-medium text-white/40 mb-1.5 block">
                  Capabilities & Features
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "isChat", label: "Chat / Text Generation" },
                    { key: "isEmbedding", label: "Vector Embedding (RAG)" },
                    { key: "isVision", label: "Vision / Multimodal" },
                    { key: "isAudio", label: "Audio / Speech Processing" },
                  ].map((cap) => {
                    const isActive = formData[cap.key as keyof typeof formData] as boolean;
                    return (
                      <button
                        type="button"
                        key={cap.key}
                        onClick={() => toggleCapability(cap.key as any)}
                        className={`px-3 py-2 rounded-lg text-[12px] font-medium transition-all cursor-pointer border text-left flex items-center justify-between ${
                          isActive
                            ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                            : "bg-white/[0.03] border-white/[0.07] text-white/40 hover:text-white/60"
                        }`}
                      >
                        <span>{cap.label}</span>
                        {isActive && <Check size={12} className="text-violet-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tokens Configuration */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
                  <Settings size={13} className="text-violet-400" />
                  <span>Token Constraints</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Context Window (Tokens)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.contextWindow}
                      onChange={(e) => setFormData({ ...formData, contextWindow: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 outline-none focus:border-violet-500/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Max Output Token</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.maxOutputToken}
                      onChange={(e) => setFormData({ ...formData, maxOutputToken: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 outline-none focus:border-violet-500/50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Configuration */}
              <div className="p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl space-y-3">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
                  <DollarSign size={13} className="text-emerald-400" />
                  <span>Pricing per 1 Million Tokens (USD)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Input Price / 1M</label>
                    <input
                      type="number"
                      step="0.001"
                      min={0}
                      value={formData.inputPricePer1M}
                      onChange={(e) => setFormData({ ...formData, inputPricePer1M: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 outline-none focus:border-violet-500/50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/40 mb-1 block">Output Price / 1M</label>
                    <input
                      type="number"
                      step="0.001"
                      min={0}
                      value={formData.outputPricePer1M}
                      onChange={(e) => setFormData({ ...formData, outputPricePer1M: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[12px] text-white/80 outline-none focus:border-violet-500/50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status Active Switch */}
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                <div>
                  <div className="text-[12px] font-medium text-white/80">Active Status</div>
                  <div className="text-[11px] text-white/35">Enable or disable this model for workspaces</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="accent-violet-500 w-4 h-4 rounded bg-white/5 border-white/10 cursor-pointer"
                />
              </div>
            </form>

            {/* Footer Controls */}
            <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-white/[0.03] border border-white/[0.07] text-white/60 hover:text-white/80 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="ai-model-form"
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/30 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
              >
                <Plus size={12} />
                <span>Save AI Model</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}