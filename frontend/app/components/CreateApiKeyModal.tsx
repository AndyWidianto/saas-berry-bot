"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Copy, Check, AlertTriangle, ShieldCheck, Plus } from "lucide-react";
import { Card } from "./Cards";
import { Btn } from "./Button";
import { CreateApiKeyResponse } from "@/lib/types";


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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={handleCloseAll}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <Card className="w-full max-w-md p-6 shadow-2xl">
              {!generatedResult ? (
                /* STEP 1: FORM INPUT API KEY */
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Key className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-sm">Generate New API Key</h3>
                    </div>
                    <button
                      onClick={handleCloseAll}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {error && (
                      <div className="p-2.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        API Key Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm border border-border focus:border-primary/50 focus:outline-none placeholder:text-muted-foreground/50"
                        placeholder="e.g. Production Webhook / Development App"
                      />
                    </div>

                    {/* <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Permissions / Scope
                      </label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {AVAILABLE_PERMISSIONS.map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => handleTogglePermission(perm.id)}
                              className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                                isChecked
                                  ? "border-primary bg-primary/5 text-foreground"
                                  : "border-border hover:bg-muted/50 text-muted-foreground"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                                  isChecked
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : "border-border"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{perm.label}</p>
                                <p className="text-[11px] text-muted-foreground">{perm.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Btn
                        variant="secondary"
                        className="flex-1 justify-center"
                        onClick={handleCloseAll}
                      >
                        Cancel
                      </Btn>
                      <Btn
                        variant="primary"
                        className="flex-1 justify-center"
                        icon={Plus}
                        onClick={handleFormSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? "Generating..." : "Generate Key"}
                      </Btn>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h3 className="font-semibold text-sm">Save Your Secret Key</h3>
                    </div>
                    <button
                      onClick={handleCloseAll}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs space-y-1">
                      <p className="font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Penting: Simpan Secret Key ini sekarang!
                      </p>
                      <p className="text-[11px] text-amber-600/90 dark:text-amber-400/80 leading-relaxed">
                        Kunci ini hanya akan ditampilkan **satu kali ini saja**. Kami tidak dapat mengembalikannya jika hilang.
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                        Generated Secret Key
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={generatedResult.secretKey}
                          className="w-full bg-muted rounded-lg px-3 py-2.5 text-xs font-mono border border-border focus:outline-none select-all text-foreground"
                        />
                        <Btn
                          variant="secondary"
                          onClick={handleCopySecret}
                          className="shrink-0 text-xs px-3 py-2.5"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Btn>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Btn
                        variant="primary"
                        className="w-full justify-center"
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
        </>
      )}
    </AnimatePresence>
  );
}