"use client";

import React, { useEffect, useRef } from "react";
import { Check, CheckCheck, AlertCircle, Bot, User, Image as ImageIcon, Loader2 } from "lucide-react"; // Sesuaikan icon library Anda
import cn from "../../../../components/ClassName";
import { Contact, Message } from "@/lib/types";

interface ChatMessageListProps {
  messages: Message[];
  contact: Contact | null,
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  loadMoreMessages: (contactId: string) => void;
  hasMoreMessage: boolean;
  isLoadingMoreMessage: boolean;
}

export function ChatMessageList({
  messages,
  messagesEndRef,
  contact,
  loadMoreMessages,
  hasMoreMessage,
  isLoadingMoreMessage,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isFirstLoad = useRef(true);
  const prevScrollHeightRef = useRef<number>(0);


  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  // Helper render Icon Status Pengiriman
  const renderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "read":
        return <CheckCheck className="w-3.5 h-3.5 text-sky-400" />;
      case "delivered":
        return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
      case "sent":
        return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
      case "failed":
        return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
      default:
        return <Check className="w-3.5 h-3.5 text-muted-foreground/50" />;
    }
  };


  useEffect(() => {
    if (messages.length > 0 && isFirstLoad.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
    }
  }, [messages, messagesEndRef]);


  useEffect(() => {
    if (!isFirstLoad.current && containerRef.current && prevScrollHeightRef.current > 0) {
      const container = containerRef.current;
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0; // Reset setelah dikoreksi
    }
  }, [messages]);

  const handleScroll = () => {
    if (!containerRef.current || isLoadingMoreMessage || !hasMoreMessage) return;

    const container = containerRef.current;

    // Jika scroll berada dekat dengan bagian atas (<= 30px dari top)
    if (container.scrollTop <= 30) {
      prevScrollHeightRef.current = container.scrollHeight; // Catat tinggi sebelum data bertambah
      if (contact) {
        loadMoreMessages(contact.id);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-3"
    >
      {/* Loading Spinner saat memuat pesan lama di bagian atas */}
      {isLoadingMoreMessage && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}

      {/* Render Pesan Chat */}
      {messages.map((msg) => {
        const isFromMe = msg.fromMe;
        const senderDisplayName = msg.senderName || (isFromMe ? "You" : "Contact");
        const isImage = msg.type === "image" || (msg.mediaUrl && msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i));

        return (
          <div
            key={msg.id}
            className={cn(
              "flex gap-2 max-w-[85%] md:max-w-[70%]",
              isFromMe ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            {/* Avatar Pengirim */}
            {!isFromMe && (
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-medium border border-border/50",
                  msg.type === "bot"
                    ? "bg-purple-500/10 text-purple-500"
                    : "bg-primary/10 text-primary"
                )}
              >
                {msg.type === "bot" ? (
                  <Bot className="w-3.5 h-3.5" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              {/* Nama Pengirim */}
              {!isFromMe && (
                <span className="text-[10px] text-muted-foreground mb-1 ml-1 font-medium truncate">
                  {senderDisplayName}
                </span>
              )}

              {/* Chat Bubble Container */}
              <div
                className={cn(
                  "rounded-2xl text-xs leading-relaxed break-words shadow-sm overflow-hidden flex flex-col",
                  isFromMe
                    ? "bg-primary text-primary-foreground rounded-tr-xs"
                    : "bg-card border border-border/80 text-card-foreground rounded-tl-xs",
                  msg.mediaUrl ? "p-1.5" : "px-3.5 py-2"
                )}
              >
                {/* Handling Gambar/Media (Di Atas) */}
                {msg.mediaUrl && (
                  <div className="relative rounded-xl overflow-hidden bg-black/5 group">
                    {isImage ? (
                      <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={msg.mediaUrl}
                          alt="Attachment"
                          className="max-h-72 w-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-200"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <a
                        href={msg.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 text-xs hover:underline bg-muted/50 rounded-lg"
                      >
                        <ImageIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Lihat Lampiran Media</span>
                      </a>
                    )}

                    {/* Floating timestamp jika gambar tanpa teks */}
                    {!msg.content && (
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] text-white">
                        <span>{formatTime(msg.createdAt)}</span>
                        {isFromMe && renderStatusIcon(msg.status)}
                      </div>
                    )}
                  </div>
                )}

                {/* Handling Teks / Caption (Di Bawah Gambar) */}
                {msg.content && (
                  <div className={cn("flex flex-col", msg.mediaUrl && "px-2 pt-1.5 pb-0.5")}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1 text-[10px] self-end",
                        isFromMe
                          ? msg.mediaUrl ? "text-primary-foreground/80" : "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isFromMe && renderStatusIcon(msg.status)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Anchor Element Paling Bawah */}
      <div ref={messagesEndRef} />
    </div>
  );
}