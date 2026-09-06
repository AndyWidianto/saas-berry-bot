import React, { useState } from "react";
import { X, Camera, Shield, Mail, User as UserIcon, Key } from "lucide-react";
import { User, UserRole } from "@/lib/types";


interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null; // Jika null -> mode Tambah, Jika ada data -> mode Edit
  onSave: (formData: Partial<User>) => Promise<void>;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<Partial<User>>({});

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  }

  const isEditMode = Boolean(user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white">
            {isEditMode ? "Edit User" : "Tambah User Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 text-xs"
        >
          {/* Avatar Upload / Preview */}
          <div className="flex items-center gap-4 pb-2">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-lg font-bold text-white border border-white/10 overflow-hidden">
                {user?.thumbnail ? (
                  <img src={user.thumbnail} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  (user?.name || user?.username || "U").substring(0, 2).toUpperCase()
                )}
              </div>
              <button
                type="button"
                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">Foto Profil / Thumbnail</p>
              <p className="text-[11px] text-white/40">JPG, PNG atau GIF (Maks. 2MB)</p>
            </div>
          </div>

          {/* Input Name */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium flex items-center gap-1.5">
              <UserIcon size={12} /> Nama Lengkap
            </label>
            <input
              type="text"
              defaultValue={user?.name ?? formData.name ?? ""}
              placeholder="Masukkan nama lengkap"
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Grid Username & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-white/60 font-medium">Username</label>
              <input
                type="text"
                required
                defaultValue={user?.username ?? formData.username ?? ""}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
                className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/60 font-medium flex items-center gap-1.5">
                <Shield size={12} /> Role
              </label>
              <select
                defaultValue={user?.role ?? formData.role ?? "USER"}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#141419] border border-white/10 text-white focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
              </select>
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium flex items-center gap-1.5">
              <Mail size={12} /> Email
            </label>
            <input
              type="email"
              required
              defaultValue={user?.email ??formData.email ?? ""}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Password (Hanya opsional jika mode edit / wajib jika buat baru) */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium flex items-center gap-1.5">
              <Key size={12} /> Password
            </label>
            <input
              type="password"
              required={!isEditMode}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder={isEditMode ? "Kosongkan jika tidak ingin diubah" : "Masukkan password"}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Input Profile URL */}
          <div className="space-y-1.5">
            <label className="text-white/60 font-medium">Profile URL (Opsional)</label>
            <input
              type="url"
              defaultValue={user?.profileUrl ?? ""}
              placeholder="https://example.com/user/profile"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors shadow-lg shadow-violet-600/20"
            >
              {isEditMode ? "Simpan Perubahan" : "Buat User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};