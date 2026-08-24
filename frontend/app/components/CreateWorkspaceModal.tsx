"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, PlusCircle } from "lucide-react"; // Sesuaikan icon Anda
import { Btn } from "./Button";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSave: (data: { name: string }) => void;
}

export default function CreateWorkspaceModal({
  isOpen,
  isLoading,
  onClose,
  onSave,
}: CreateWorkspaceModalProps) {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Create New Workspace
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Separate data setups for marketing teams or client integrations.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Toko Online Budi B2B"
                  name="name"
                  value={formData.name}
                  onChange={handleOnChange}
                  className="w-full h-9 px-3 text-sm rounded-lg bg-muted border border-border text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="p-4 bg-muted/40 border-t border-border flex items-center justify-end gap-2">
              <Btn variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Btn>
              <Btn
                variant="primary"
                size="sm"
                icon={isLoading ? Loader2 : PlusCircle}
                disabled={isLoading}
                onClick={() => onSave(formData)}
              >
                {isLoading ? 'Processing' : 'Create Now'}
              </Btn>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}