import React from 'react';
import { MessageSquare, Image, FileText, Video, Mic } from 'lucide-react';
import { Message } from '@/lib/types';

interface MessageToastProps {
    message: Message;
}

export const MessageToast: React.FC<MessageToastProps> = ({ message }) => {
    // Helper untuk menampilkan badge platform (contoh: WHATSAPP, TELEGRAM, dll)
    const renderPlatformBadge = (platform: string) => {
        return (
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {platform}
            </span>
        );
    };

    // Helper preview konten berdasarkan type pesan
    const renderContentPreview = () => {
        switch (message.type.toLowerCase()) {
            case 'image':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Image className="w-3.5 h-3.5" />
                        <span>Foto</span>
                    </div>
                );
            case 'video':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Video className="w-3.5 h-3.5" />
                        <span>Video</span>
                    </div>
                );
            case 'audio':
            case 'voice':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Mic className="w-3.5 h-3.5" />
                        <span>Pesan Suara</span>
                    </div>
                );
            case 'document':
            case 'file':
                return (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dokumen</span>
                    </div>
                );
            default:
                return (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {message.content || 'Menerima pesan'}
                    </p>
                );
        }
    };

    return (
        <div className="flex items-start gap-3 w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-lg">
            {/* Avatar / Thumbnail Pengirim */}
            <div className="relative flex-shrink-0">
                {message.thumbnail ? (
                    <img
                        src={message.thumbnail}
                        alt={message.senderName || 'Sender'}
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                        <MessageSquare className="w-5 h-5 text-slate-400" />
                    </div>
                )}
            </div>

            {/* Konten Pesan */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {message.senderName || 'Pengirim'}
                    </h4>
                    {renderPlatformBadge(message.platform)}
                </div>

                {/* Preview Pesan */}
                {renderContentPreview()}
            </div>
        </div>
    );
};