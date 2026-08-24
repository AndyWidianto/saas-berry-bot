"use client";

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, Phone, User, Image, Hash, Tag } from 'lucide-react';
import { Card } from './Cards';
import { Btn } from './Button';

export interface Contact {
  id?: string;
  senderId?: string;
  workspaceId?: string;
  name: string | null;
  phoneNumber: string | null;
  avatarUrl: string | null;
  isBlocked?: boolean;
  metadata?: Record<string, any> | null;
}

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Contact> & { phoneOrSenderId: string }) => Promise<void> | void;
  initialData?: Contact | null; // Jika diisi = Mode Update, Jika null/undefined = Mode Add
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const isEditMode = Boolean(initialData?.id);

  // Form State
  const [phoneOrSenderId, setPhoneOrSenderId] = useState('');
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load Data saat Modal Dibuka / Mode Update
  useEffect(() => {
    if (initialData) {
      setPhoneOrSenderId(initialData.phoneNumber || initialData.senderId || '');
      setName(initialData.name || '');
      setAvatarUrl(initialData.avatarUrl || '');
      setTags(
        initialData.metadata?.tags
          ? Array.isArray(initialData.metadata.tags)
            ? initialData.metadata.tags.join(', ')
            : String(initialData.metadata.tags)
          : ''
      );
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setPhoneOrSenderId('');
    setName('');
    setAvatarUrl('');
    setTags('');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse tags dari comma-separated string menjadi array di metadata
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        phoneOrSenderId,
        name: name.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
        metadata: {
          ...initialData?.metadata,
          ...(tagArray.length > 0 && { tags: tagArray }),
        },
      };

      await onSubmit(payload);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Overlay Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* Modal Card */}
      <Card className="w-full max-w-md shadow-2xl border-border bg-background overflow-hidden p-0">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {isEditMode ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {isEditMode ? 'Edit Kontak' : 'Tambah Kontak Baru'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isEditMode
                  ? 'Perbarui rincian kontak pengguna ini'
                  : 'Tambahkan kontak ke workspace Anda'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            {/* Field 1: Phone Number / Sender ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Nomor Telepon / Sender ID <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditMode} // Mencegah perubahan senderId/nomor jika mode edit
                placeholder="Contoh: 08123456789 atau 628123456789"
                value={phoneOrSenderId}
                onChange={(e) => setPhoneOrSenderId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed font-mono"
              />
            </div>

            {/* Field 2: Nama Kontak */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Masukkan nama kontak"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Field 3: Avatar URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5 text-muted-foreground" />
                URL Foto Profil (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Field 4: Tags (Metadata) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                Tags (Pisahkan dengan koma)
              </label>
              <input
                type="text"
                placeholder="VIP, Leads, Customer"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3.5 bg-muted/20">
            <Btn
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Btn>
            <Btn
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
            >
              {isEditMode ? 'Simpan Perubahan' : 'Tambah Kontak'}
            </Btn>
          </div>
        </form>
      </Card>
    </div>
  );
};