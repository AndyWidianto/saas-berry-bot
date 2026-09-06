import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Calendar, ShieldAlert, Tag, FileText, UserCheck } from "lucide-react";
import { Contact } from "@/lib/types/contact"; // Sesuaikan path interface Contact
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/Avatar";

interface ContactProfileSidebarProps {
    showProfile: boolean;
    selectedContact: Contact | null;
    onSaveNote?: (note: string) => void;
}

export function ContactProfileSidebar({
    showProfile,
    selectedContact,
    onSaveNote,
}: ContactProfileSidebarProps) {
    if (!selectedContact) return;
    const [internalNote, setInternalNote] = useState<string>(
        selectedContact.metadata?.note || ""
    );

    const displayName = selectedContact.name || selectedContact.phoneNumber || "Unknown Contact";

    // Helper pembuat inisial nama
    const getInitials = (name: string | null, phoneNumber: string | null) => {
        const text = name || phoneNumber || "User";
        return text
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Format tanggal bergabung/terdaftar
    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Ekstraksi tag dari metadata (contoh: metadata.tags = ["VIP", "Lead"])
    const tags: string[] = Array.isArray(selectedContact.metadata?.tags)
        ? selectedContact.metadata.tags
        : [];

    if (!showProfile) return null;

    return (
        <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-l border-border overflow-hidden bg-card"
        >
            <div className="w-72 h-full overflow-y-auto">
                {/* Section 1: Profil Utama & Avatar */}
                <div className="p-4 border-b border-border">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 border-2 border-border/50">
                            <AvatarImage src={selectedContact.avatarUrl || undefined} alt={displayName} />
                            <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                                {getInitials(selectedContact.name, selectedContact.phoneNumber)}
                            </AvatarFallback>
                        </Avatar>

                        <h3 className="font-semibold mt-3 text-sm text-foreground truncate max-w-full">
                            {displayName}
                        </h3>

                        {/* Badges Status */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center">
                            {selectedContact.isBlocked ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                    <ShieldAlert className="w-3 h-3" />
                                    Blocked
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <UserCheck className="w-3 h-3" />
                                    Active
                                </span>
                            )}

                            {/* Tag Tambahan dari Metadata jika ada */}
                            {selectedContact.metadata?.isVip && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    VIP
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info Kontak Detail */}
                    <div className="mt-4 space-y-2">
                        {selectedContact.phoneNumber && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                                <span className="select-all">{selectedContact.phoneNumber}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                            <span>Dibuat: {formatDate(selectedContact.createdAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Metadata Tambahan (Dinamis dari Record<string, any>) */}
                {selectedContact.metadata && Object.keys(selectedContact.metadata).length > 0 && (
                    <div className="p-4 border-b border-border">
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Metadata
                        </h4>
                        <div className="space-y-1.5">
                            {Object.entries(selectedContact.metadata)
                                .filter(([key]) => !["note", "tags", "isVip"].includes(key)) // Filter properti bawaan
                                .map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground capitalize">{key}:</span>
                                        <span className="font-medium text-foreground truncate max-w-[130px]">
                                            {String(value)}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Section 3: Catatan Internal (Internal Notes) */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center gap-1.5 mb-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Internal Notes
                        </h4>
                    </div>
                    <textarea
                        className="w-full bg-muted/60 rounded-lg p-2 text-xs resize-none border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                        rows={3}
                        placeholder="Tambah catatan tentang kontak ini..."
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        onBlur={() => onSaveNote?.(internalNote)}
                    />
                </div>

                {/* Section 4: Tags */}
                <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                            Tags
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.length > 0 ? (
                            tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                                >
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic">Belum ada tag</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}