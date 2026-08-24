'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Btn } from './Button';
import { Card } from './Cards';


interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  expectedName: string;
  inputLabel: string;
  isLoading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  expectedName,
  inputLabel,
  isLoading = false,
}: DeleteConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatch = inputValue.trim() === expectedName.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-card border-destructive/30 shadow-2xl rounded-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Validation Area */}
        <div className="space-y-2 bg-muted/40 p-3.5 rounded-xl border border-border/60">
          <label className="text-xs font-medium text-foreground block">
            {inputLabel} ketik <span className="font-mono font-bold select-all text-destructive">{expectedName}</span>
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={expectedName}
            className="w-full bg-background rounded-lg px-3 py-2 text-xs border border-border focus:border-destructive focus:ring-1 focus:ring-destructive focus:outline-none font-mono"
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Btn variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Btn>
          <Btn
            variant="danger"
            size="sm"
            disabled={!isMatch || isLoading}
            onClick={onConfirm}
            className="gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isLoading ? 'Hapus...' : 'Konfirmasi Hapus'}
          </Btn>
        </div>
      </Card>
    </div>
  );
}