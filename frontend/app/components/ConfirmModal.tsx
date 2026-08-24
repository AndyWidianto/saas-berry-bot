import React, { useEffect } from "react";
import { AlertTriangle, Info, Trash2, X, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) => {
  // Handle Close via Keyboard ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantConfig = {
    primary: {
      icon: <Info className="w-5 h-5 text-primary" />,
      iconBg: "bg-primary/10 border-primary/20",
      btnClass: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      iconBg: "bg-amber-500/10 border-amber-500/20",
      btnClass: "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500/20",
    },
    danger: {
      icon: <Trash2 className="w-5 h-5 text-destructive" />,
      iconBg: "bg-destructive/10 border-destructive/20",
      btnClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/20",
    },
  };

  const currentVariant = variantConfig[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl border border-border/80 animate-in zoom-in-95 fade-in duration-200 z-10">
        {/* Close Button Header */}
        <button
          type="button"
          disabled={isLoading}
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Section */}
        <div className="flex items-start gap-4">
          {/* Variant Icon */}
          <div className={`p-2.5 rounded-xl border shrink-0 ${currentVariant.iconBg}`}>
            {currentVariant.icon}
          </div>

          <div className="space-y-1.5 pr-4">
            <h3 className="text-base font-bold text-foreground leading-tight">
              {title}
            </h3>
            <div className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Action Footer Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] focus:ring-2 disabled:opacity-50 ${currentVariant.btnClass}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};