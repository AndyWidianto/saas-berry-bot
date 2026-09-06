"use client";
import {
  Eye, FileText, Headphones, ImageIcon, Loader2, Mic, MoreHorizontal, Paperclip, Plus, Search,
  SendHorizontal, ShieldAlert, Smile, Sparkles,
  X
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/Avatar";
import cn from "@/app/components/ClassName";
import { Btn } from "@/app/components/Button";
import { useParams } from "next/navigation";
import { ContactProfileSidebar } from "./_components/ContactProfileSidebar";
import { ChatMessageList } from "./_components/ChatMessageList";
import useConverstation from "./_hook/HookConverstation";
import { formatTime } from "@/app/components/Format";




const getInitials = (name: string | null, fallback: string | null) => {
  const displayName = name || fallback || "User";
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function InboxPage() {
  const { workspace: workspaceId } = useParams();
  const {
    filters,
    setFilter,
    filter,
    selectedContact,
    contacts,
    sendMessage,
    message,
    setMessage,
    messages,
    onSelectContact,
    setShowProfile,
    showProfile,
    messagesEndRef,
    displayName,
    isHandledByAi,
    onTakeOver,
    formatLastActive,
    imageRef,
    fileRef,
    handleSelectFile,
    imagePreview,
    file,
    setFile,
    setImagePreview,
    loadMoreMessages,
    hasMoreMessage,
    isLoadingMoreMessage,
    loadMoreContacts,
    hasMoreContact,
    isLoadingContact,
    isLoadingMoreContact
  } = useConverstation({ workspaceId: workspaceId as string });

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: Conversation List */}
      <div className="w-72 xl:w-80 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-sm flex-1">Conversations</h2>
            <Btn variant="primary" size="sm" icon={Plus}>New</Btn>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className="w-full bg-muted rounded-lg pl-8 pr-3 py-1.5 text-xs border border-transparent focus:border-primary/30 focus:outline-none" placeholder="Search contacts..." />
          </div>
        </div>
        <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn("flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors", filter === f.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
            >
              {f.label}{f.count ? ` (${f.count})` : ""}
            </button>
          ))}
        </div>
        <div
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            // Panggil loadMoreContacts saat sisa scroll ke bawah <= 50px
            if (scrollHeight - scrollTop - clientHeight <= 50) {
              if (!isLoadingMoreContact && hasMoreContact) {
                loadMoreContacts();
              }
            }
          }}
          className="flex-1 overflow-y-auto px-2 py-1 space-y-1"
        >
          {/* State Loading Awal (Saat pertama kali data dimuat) */}
          {isLoadingContact && contacts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Memuat kontak...</span>
            </div>
          )}

          {/* Render Daftar Kontak */}
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
                  <Avatar className={cn(
                    "h-11 w-11 transition-transform duration-200 group-hover:scale-105 shadow-xs",
                    isSelected ? "ring-2 ring-primary/30" : "ring-1 ring-border/40"
                  )}>
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

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-xs truncate tracking-tight transition-colors",
                      isSelected ? "font-bold text-foreground" : hasUnread ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                    )}>
                      {displayName}
                    </span>
                    <span className={cn(
                      "text-[10px] flex-shrink-0 transition-colors",
                      hasUnread ? "text-primary font-bold" : "text-muted-foreground/80 font-medium"
                    )}>
                      {formatTime(contact.lastMessageAt)}
                    </span>
                  </div>

                  {/* Baris 2: Last Message & Unread Badge */}
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className={cn(
                      "text-[11px] truncate leading-normal flex-1 transition-colors",
                      hasUnread
                        ? "text-foreground font-semibold"
                        : isSelected
                          ? "text-muted-foreground font-medium"
                          : "text-muted-foreground/70"
                    )}>
                      {contact.lastMessage || (
                        <span className="italic opacity-60 font-normal">Tidak ada pesan</span>
                      )}
                    </p>

                    {/* Badge Unread Count dengan Efek Glow */}
                    {hasUnread && (
                      <span className="flex-shrink-0 h-4.5 min-w-[18px] px-1.5 inline-flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full font-bold shadow-xs shadow-primary/30 animate-in zoom-in-50 duration-200">
                        {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {isLoadingMoreContact && (
            <div className="flex justify-center items-center py-3 gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <span className="text-[11px] text-muted-foreground font-medium">Memuat kontak lainnya...</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        <div className="h-16 border-b border-border flex items-center gap-3 px-4 bg-card flex-shrink-0">
          <Avatar className="h-10 w-10 border border-border/50">
            <AvatarImage src={selectedContact?.avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {getInitials(selectedContact?.name || "", selectedContact?.phoneNumber || "")}
            </AvatarFallback>
          </Avatar>

          {/* Info Kontak Section */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate text-foreground">
                {displayName}
              </span>

              {/* Badge Status Bot / AI */}
              {isHandledByAi && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  Handled by AI
                </span>
              )}

              {/* Badge Blocked Status */}
              {selectedContact?.isBlocked && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive">
                  <ShieldAlert className="w-3 h-3" />
                  Blocked
                </span>
              )}
            </div>

            {/* Nomor Telepon & Waktu Aktif Terakhir */}
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
              {selectedContact?.phoneNumber && (
                <>
                  <span>{selectedContact?.phoneNumber}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatLastActive(selectedContact?.lastActiveAt || "")}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isHandledByAi && (
              <button
                onClick={onTakeOver}
                className="h-8 px-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>Take Over</span>
              </button>
            )}

            {/* Tombol Toggle Profile Sidebar */}
            <button
              onClick={() => setShowProfile(!showProfile)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${showProfile ? "bg-muted text-foreground" : "hover:bg-muted text-muted-foreground"
                }`}
              title="Lihat Detail Kontak"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Tombol More Options */}
            {/* <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              title="Opsi Lainnya"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button> */}
          </div>
        </div>

        {/* Messages */}
        <ChatMessageList
          messages={messages}
          contact={selectedContact}
          messagesEndRef={messagesEndRef}
          loadMoreMessages={loadMoreMessages}
          isLoadingMoreMessage={isLoadingMoreMessage}
          hasMoreMessage={hasMoreMessage} />

        {/* Input Bar */}
        {!selectedContact?.phoneNumber?.includes("berry_") && <div className="border-t border-border p-3 bg-card flex-shrink-0 space-y-2">
          {file && (
            <div className="relative inline-flex items-center gap-3 p-2 bg-muted/80 rounded-xl border border-border/60 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Box Thumbnail / Icon */}
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border/40 bg-background flex items-center justify-center flex-shrink-0 group">
                {imagePreview ? (
                  // Tampilkan gambar jika ada imagePreview
                  <img
                    src={imagePreview}
                    alt="File Preview"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <FileText className="w-6 h-6 text-primary" />
                )}
              </div>

              {/* Informasi Detail File */}
              <div className="flex-1 min-w-0 pr-6">
                <p className="text-xs font-semibold truncate text-foreground">
                  {file.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              {/* Tombol Hapus / Batal */}
              <button
                type="button"
                onClick={() => {
                  if (imageRef.current) imageRef.current.value = "";
                  setFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors text-muted-foreground shadow-xs cursor-pointer"
                title="Batal kirim file"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Main Input Bar */}
          <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 focus-within:ring-1 focus-within:ring-primary/40 transition-all">
            <div className="flex items-center gap-1">
              <input
                type="file"
                name="image"
                id="image"
                ref={imageRef}
                onChange={(e) => handleSelectFile("image", e)}
                accept="image/*"
                hidden
              />
              <input
                type="file"
                name="image"
                id="image"
                ref={fileRef}
                onChange={(e) => handleSelectFile("file", e)}
                hidden
              />
              {/* <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className={cn(
                  "w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors",
                  imagePreview ? "text-primary bg-background shadow-xs" : "text-muted-foreground"
                )}
              >
                <ImageIcon className="w-4 h-4" />
              </button> */}
            </div>

            <input
              className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              placeholder="Type a message... or / for canned responses"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <div className="flex items-center gap-1">
              {/* <button
                type="button"
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-background transition-colors text-muted-foreground"
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </button> */}

              <button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim() && !file}
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                  message.trim() || file
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs cursor-pointer"
                    : "bg-muted-foreground/20 text-muted-foreground cursor-not-allowed"
                )}
              >
                <SendHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>}
      </div>

      {/* Right: Customer Profile */}
      <AnimatePresence>
        <ContactProfileSidebar showProfile={showProfile} selectedContact={selectedContact} onSaveNote={() => { }} />
      </AnimatePresence>
    </div>
  );
}