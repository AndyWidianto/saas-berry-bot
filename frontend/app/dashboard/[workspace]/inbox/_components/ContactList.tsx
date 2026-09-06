import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/Avatar";
import cn from "@/app/components/ClassName";
import { formatTime } from "@/app/components/Format";
import { Contact } from "@/lib/types";

interface ContactListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  loadMoreContacts: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  isLoading: boolean;
}

const getInitials = (name: string | null, fallback: string | null) => {
  const displayName = name || fallback || "User";
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};


export function ContactList({
  contacts,
  selectedContact,
  onSelectContact,
  loadMoreContacts,
  hasMore,
  isLoadingMore,
  isLoading,
}: ContactListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Handler Infinite Scroll Down
  const handleScroll = () => {
    if (!containerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Jika sisa jarak ke bawah <= 50px, pemicu loadMoreContacts()
    if (scrollHeight - scrollTop - clientHeight <= 50) {
      loadMoreContacts();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto px-2 py-1 space-y-1"
    >
      {/* State Loading Awal */}
      {isLoading && contacts.length === 0 && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}

      {/* Item Contacts */}
      {contacts.map((contact) => {
        const isSelected = selectedContact?.id === contact.id;
        const displayName = contact.name || contact.phoneNumber || "Unknown Contact";
        const hasUnread = contact.unreadCount > 0;

        return (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 text-left relative group select-none",
              "hover:bg-muted/70 active:scale-[0.99]",
              isSelected
                ? "bg-accent/90 text-accent-foreground shadow-xs ring-1 ring-border/50"
                : "text-foreground"
            )}
          >
            {isSelected && (
              <span className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-full shadow-xs" />
            )}

            <div className="relative flex-shrink-0">
              <Avatar
                className={cn(
                  "h-11 w-11 transition-transform duration-200 group-hover:scale-105 shadow-xs",
                  isSelected ? "ring-2 ring-primary/30" : "ring-1 ring-border/40"
                )}
              >
                {contact.avatarUrl && (
                  <AvatarImage src={contact.avatarUrl} alt={displayName} className="object-cover" />
                )}
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {getInitials(contact.name, contact.phoneNumber)}
                </AvatarFallback>
              </Avatar>

              {/* Indikator Status Blocked */}
              {contact.isBlocked && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-destructive rounded-full border-2 border-background flex items-center justify-center text-[8px] text-destructive-foreground font-bold shadow-xs"
                  title="Blocked"
                >
                  ✕
                </span>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              {/* Baris 1: Nama & Waktu */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-xs truncate tracking-tight transition-colors",
                    isSelected
                      ? "font-bold text-foreground"
                      : hasUnread
                      ? "font-bold text-foreground"
                      : "font-semibold text-foreground/90"
                  )}
                >
                  {displayName}
                </span>
                <span
                  className={cn(
                    "text-[10px] flex-shrink-0 transition-colors",
                    hasUnread ? "text-primary font-bold" : "text-muted-foreground/80 font-medium"
                  )}
                >
                  {formatTime(contact.lastMessageAt)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-1">
                <p
                  className={cn(
                    "text-[11px] truncate leading-normal flex-1 transition-colors",
                    hasUnread
                      ? "text-foreground font-semibold"
                      : isSelected
                      ? "text-muted-foreground font-medium"
                      : "text-muted-foreground/70"
                  )}
                >
                  {contact.lastMessage || (
                    <span className="italic opacity-60 font-normal">Tidak ada pesan</span>
                  )}
                </p>

                {/* Badge Unread Count */}
                {hasUnread && (
                  <span className="flex-shrink-0 h-4.5 min-w-[18px] px-1.5 inline-flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full font-bold shadow-xs shadow-primary/30 animate-in zoom-in-50 duration-200">
                    {contact.unreadCount > 99 ? "99+" : contact.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {/* Indikator Loading di Bawah Saat Fetch Data Tambahan */}
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
      )}
    </div>
  );
}