'use client';

import React, { useState } from 'react';
import { Shield, X, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Btn } from './Button';
import { Card } from './Cards';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { currentPass: string; newPass: string }) => Promise<void>;
}

export function ChangePasswordModal({ isOpen, onClose, onSubmit }: ChangePasswordModalProps) {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPass.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ currentPass, newPass });
      // Reset & Close
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-card border-border/80 shadow-2xl rounded-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">Update Password</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pastikan password baru Anda kuat dan belum pernah digunakan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password saat ini</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-muted/50 rounded-xl px-3.5 py-2 text-xs border border-border/60 focus:border-primary focus:outline-none pr-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password Baru</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
              placeholder="Minimal 8 karakter"
              className="w-full bg-muted/50 rounded-xl px-3.5 py-2 text-xs border border-border/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Konfirmasi Password Baru</label>
            <input
              type={showPass ? 'text' : 'password'}
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
              placeholder="Ulangi password baru"
              className="w-full bg-muted/50 rounded-xl px-3.5 py-2 text-xs border border-border/60 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPass ? 'Sembunyikan Password' : 'Tampilkan Password'}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
            <Btn variant="secondary" size="sm" type="button" onClick={onClose} disabled={isLoading}>
              Batal
            </Btn>
            <Btn variant="primary" size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Password'}
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
}