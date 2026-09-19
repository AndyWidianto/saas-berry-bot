"use client";
import useAxios from "@/lib/axios-service";
import { useSocket } from "@/lib/context/SocketContext";
import { useChatStore } from "@/lib/store/chatStore";
import { Contact, Message, PlatformIntegration, ResponseApi, ResponseUpload } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";


type ConvFilter = "all" | PlatformIntegration;

export default function useConverstation({ workspaceId }: { workspaceId?: string }) {
    const filters: { id: ConvFilter; label: string; count?: number }[] = [
        { id: "all", label: "All", count: 28 },
        { id: "WHATSAPP_BAYLIES", label: "Whatsapp", count: 8 },
        { id: "API", label: "Fetch API", count: 5 },
    ];
    const { socket } = useSocket();
    const { selectedContact, setSelectedContact, messages, addMessages, addMessage, updateMessage, deleteMessage, resetMessage } = useChatStore();
    const [filter, setFilter] = useState<ConvFilter>("all");
    const [contacts, setContacts] = useState<Contact[]>([]);

    // State Infinite Scroll untuk Contact
    const [nextCursorContact, setNextCursorContact] = useState<string | null>(null);
    const [hasMoreContact, setHasMoreContact] = useState(true);
    const [isLoadingContact, setIsLoadingContact] = useState(false);
    const [isLoadingMoreContact, setIsLoadingMoreContact] = useState(false);

    // State Infinite Scroll untuk Message
    const [message, setMessage] = useState("");
    const [showProfile, setShowProfile] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [nextCursorMessage, setNextCursorMessage] = useState<string | null>(null);
    const [hasMoreMessage, setHasMoreMessage] = useState(true);
    const [isLoadingMoreMessage, setIsLoadingMoreMessage] = useState(false);

    const imageRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { AxiosPrivate } = useAxios();

    // Fetch Awal Contacts
    const fetchConverstation = useCallback(async () => {
        if (!workspaceId) return;
        setIsLoadingContact(true);
        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/contacts`, {
                params: {
                    limit: 10,
                    platform: filter === "all" ? undefined : filter
                }
            });
            const result = res.data as ResponseApi;
            setContacts(result.data || []);
            setNextCursorContact(result.nextId ?? null);
            setHasMoreContact(Boolean(result.nextId));
        } catch (err) {
            console.error("Fetch contacts error: ", err);
        } finally {
            setIsLoadingContact(false);
        }
    }, [workspaceId, filter, AxiosPrivate]);

    // Load More Contacts (Di-trigger saat scroll ke bawah)
    const loadMoreContacts = useCallback(async () => {
        if (!workspaceId || !nextCursorContact || isLoadingMoreContact || !hasMoreContact) return;

        setIsLoadingMoreContact(true);
        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/contacts`, {
                params: {
                    limit: 10,
                    platform: filter === "all" ? undefined : filter,
                    cursor: nextCursorContact
                }
            });
            const result = res.data as ResponseApi;

            // Append data kontak baru ke belakang array
            setContacts(prev => [...prev, ...result.data]);
            setNextCursorContact(result.nextId ?? null);
            setHasMoreContact(Boolean(result.nextId));
        } catch (err) {
            console.error("Load more contacts error: ", err);
        } finally {
            setIsLoadingMoreContact(false);
        }
    }, [workspaceId, filter, nextCursorContact, isLoadingMoreContact, hasMoreContact, AxiosPrivate]);

    const fetchMessages = useCallback(async (contactId: string) => {
        if (!workspaceId || !contactId) return;

        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/messages/${contactId}`, {
                params: { limit: 20 }
            });
            const result = res.data;

            resetMessage();
            addMessages(result.data);
            setNextCursorMessage(result.nextId ?? null);
            setHasMoreMessage(Boolean(result.nextId));
        } catch (err) {
            console.error("Fetch messages error: ", err);
        }
    }, [workspaceId, AxiosPrivate]);

    const loadMoreMessages = useCallback(async (contactId: string) => {
        if (!workspaceId || !contactId || !nextCursorMessage || isLoadingMoreMessage || !hasMoreMessage) return;

        setIsLoadingMoreMessage(true);
        try {
            const res = await AxiosPrivate.get(`/${workspaceId}/messages/${contactId}`, {
                params: {
                    limit: 20,
                    cursor: nextCursorMessage
                }
            });
            const result = res.data as ResponseApi;

            addMessages(result.data);
            setNextCursorMessage(result.nextId ?? null);
            if ((result.data as Message[]).length < 20) {
                setHasMoreMessage(false);
                console.log("Tidak menambah data lagi");
            }
        } catch (err) {
            console.error("Load more messages error: ", err);
        } finally {
            setIsLoadingMoreMessage(false);
        }
    }, [workspaceId, nextCursorMessage, isLoadingMoreMessage, hasMoreMessage, AxiosPrivate]);

    const onSelectContact = async (contact: Contact) => {
        setSelectedContact(contact);
        await fetchMessages(contact.id);
    };

    const onTakeOver = () => { };

    const sendMessage = async () => {
        if (!message.trim()) return;
        if (!workspaceId || !selectedContact) return;
        let messageTemporary = message;
        let fileTemporary = file;
        let imagePreviewTemporary = imagePreview;
        let messageIdTemorary = uuid();
        try {
            setMessage("");
            setFile(null);

            const findMesage = messages[0];
            if (!findMesage) return;

            const messageToSend = {
                platform: findMesage.platform ?? "WHATSAPP_BAYLIES",
                providerMessageId: null,
                fromMe: true,
                senderId: findMesage.senderId,
                senderName: findMesage.senderName,
                content: messageTemporary,
                thumbnail: "",
                type: fileTemporary ? imagePreviewTemporary ? "image" : "document" : "text",
                mediaUrl: fileTemporary ? imagePreviewTemporary ? imagePreviewTemporary : URL.createObjectURL(fileTemporary) : null,
            }

            const newMessage: Message = {
                ...messageToSend,
                id: messageIdTemorary,
                workspaceId: findMesage.workspaceId,
                contactId: findMesage.contactId,
                status: "delivered",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            addMessage(newMessage);

            let responseUpload: ResponseUpload | null = null;
            if (fileTemporary) {
                const fileToSend = new FormData();
                fileToSend.append("file", fileTemporary);
                const res = await AxiosPrivate.post(`workspaces/${workspaceId}/upload`, fileToSend, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });
                responseUpload = res.data as ResponseUpload;
            }
            if (responseUpload) {
                messageToSend.mediaUrl = responseUpload?.url;
                messageToSend.thumbnail = responseUpload.thumbnail;
            }

            const res = await AxiosPrivate.post(`/${workspaceId}/messages/sendMessage`, messageToSend);
            const result = res.data as ResponseApi;
            updateMessage(messageIdTemorary, result.data as Message);
            toast.success("Message sent");
        } catch (err) {
            console.error("Send message error: ", err);
            deleteMessage(messageIdTemorary);
            setMessage(messageTemporary);
            setFile(fileTemporary);
            setImagePreview(imagePreviewTemporary);
        }
    };

    const handleSelectFile = (type: "image" | "file", e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === "image") setImagePreview(URL.createObjectURL(file));
            setFile(file);
        }
    };

    const displayName = selectedContact?.name || selectedContact?.phoneNumber || "Unknown Contact";

    const formatLastActive = (dateString: string) => {
        if (!dateString) return "Tidak diketahui";
        const date = new Date(dateString);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return `Aktif hari ini pukul ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
        }
        return `Terakhir aktif ${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })}`;
    };

    const isHandledByAi = selectedContact?.metadata?.isBot ?? selectedContact?.metadata?.handledByAi ?? false;

    useEffect(() => {
        fetchConverstation();
    }, [fetchConverstation]);

    useEffect(() => {
        if (!socket) return;
        socket.on("message.upsert", (data: Message) => {
            if (workspaceId !== data.workspaceId) return;
            addMessage(data)
        })
    }, [socket]);

    return {
        filters,
        fetchConverstation,
        contacts,
        setContacts,
        selectedContact,
        setSelectedContact,
        setFilter,
        filter,
        formatLastActive,
        messages,
        setMessage,
        message,
        onTakeOver,
        displayName,
        isHandledByAi,
        onSelectContact,
        sendMessage,
        messagesEndRef,
        showProfile,
        setShowProfile,
        imageRef,
        handleSelectFile,
        imagePreview,
        setImagePreview,
        file,
        setFile,
        fileRef,
        setIsLoadingMoreMessage,
        isLoadingMoreMessage,
        hasMoreMessage,
        setHasMoreMessage,
        loadMoreMessages,
        // Properti Baru untuk Infinite Scroll Contacts
        loadMoreContacts,
        hasMoreContact,
        isLoadingContact,
        isLoadingMoreContact
    };
}
