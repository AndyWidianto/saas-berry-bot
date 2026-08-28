"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Copy, Check, AlertTriangle, ShieldCheck, Plus } from "lucide-react";
import { Card } from "./Cards";
import { Btn } from "./Button";
import { CreateApiKeyResponse } from "@/lib/types";
import CodeBlock from "./CodeBlock";


interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: { name: string }) => Promise<CreateApiKeyResponse>;
}

const AVAILABLE_PERMISSIONS = [
  { id: "chat:read", label: "Read Chat", desc: "Melihat log dan percakapan" },
  { id: "chat:write", label: "Write Chat", desc: "Mengirim dan membalas pesan" },
  { id: "knowledge:read", label: "Read RAG", desc: "Melihat basis pengetahuan / dokumen" },
  { id: "knowledge:write", label: "Write RAG", desc: "Mengunggah dan mengelola basis pengetahuan" },
];

export default function CreateApiKeyModal({ isOpen, onClose, onSubmit }: CreateApiKeyModalProps) {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["chat:read", "chat:write"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk menyimpan hasil secret key yang baru dibuat
  const [generatedResult, setGeneratedResult] = useState<{ secretKey: string; prefix: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleFormSubmit = async () => {
    if (!name.trim()) {
      setError("Nama API Key tidak boleh kosong.");
      return;
    }
    if (selectedPermissions.length === 0) {
      setError("Pilih minimal satu permission.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await onSubmit({
        name,
      });

      // Simpan secretKey untuk ditampilkan di step berikutnya
      setGeneratedResult({
        secretKey: res.secretKey,
        prefix: res.data.keyPrefix,
      });
    } catch (err: any) {
      setError(err?.message || "Gagal membuat API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (generatedResult?.secretKey) {
      navigator.clipboard.writeText(generatedResult.secretKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCloseAll = () => {
    // Reset ketersediaan state saat modal ditutup
    setName("");
    setSelectedPermissions(["chat:read", "chat:write"]);
    setGeneratedResult(null);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseAll}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md z-10 my-auto"
          >
            <Card className="w-full p-6 shadow-2xl border border-border/50 bg-background rounded-xl overflow-hidden">
              {!generatedResult ? (
                /* STEP 1: FORM INPUT API KEY */
                <>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-foreground leading-none mb-1">
                          Generate New API Key
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Buat kunci akses baru untuk integrasi aplikasi.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseAll}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs flex items-start gap-2 border border-destructive/20">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-tight">{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-medium text-foreground block mb-1.5">
                        API Key Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-muted/50 rounded-lg px-3.5 py-2.5 text-sm border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-muted-foreground/50"
                        placeholder="e.g. Production Webhook / Dev App"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Btn
                        variant="secondary"
                        className="flex-1 justify-center py-2.5 text-sm font-medium"
                        onClick={handleCloseAll}
                      >
                        Cancel
                      </Btn>
                      <Btn
                        variant="primary"
                        className="flex-1 justify-center py-2.5 text-sm font-medium"
                        icon={Plus}
                        onClick={handleFormSubmit}
                        disabled={isLoading || !name.trim()}
                      >
                        {isLoading ? "Generating..." : "Generate Key"}
                      </Btn>
                    </div>
                  </div>
                </>
              ) : (
                /* STEP 2: DISPLAY SECRET KEY */
                <>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/40">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-foreground leading-none mb-1">
                          Save Your Secret Key
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Simpan kredensial ini di tempat aman.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCloseAll}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-lg text-xs space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        Penting: Simpan Secret Key ini sekarang!
                      </p>
                      <p className="text-[11px] leading-relaxed opacity-90 pl-5">
                        Kunci ini hanya akan ditampilkan <strong>satu kali ini saja</strong>. Kami tidak dapat mengembalikannya jika hilang.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Generated Secret Key
                      </label>
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          readOnly
                          value={generatedResult.secretKey}
                          className="w-full bg-muted/80 rounded-lg px-3.5 py-2 text-xs font-mono border border-border focus:outline-none select-all text-foreground"
                        />
                        <Btn
                          variant="secondary"
                          onClick={handleCopySecret}
                          className="shrink-0 text-xs px-3 py-2 h-[34px] flex items-center justify-center min-w-[70px]"
                        >
                          {copied ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <Check className="w-3.5 h-3.5" /> Copied
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Copy className="w-3.5 h-3.5" /> Copy
                            </span>
                          )}
                        </Btn>
                      </div>

                      <div className="rounded-lg overflow-hidden border border-border/60">
                        <CodeBlock prefix={generatedResult.prefix} apikey={generatedResult.secretKey} />
                      </div>
                    </div>

                    <div className="pt-2">
                      <Btn
                        variant="primary"
                        className="w-full justify-center py-2.5 text-sm font-medium"
                        onClick={handleCloseAll}
                      >
                        Saya Sudah Menyimpannya
                      </Btn>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}