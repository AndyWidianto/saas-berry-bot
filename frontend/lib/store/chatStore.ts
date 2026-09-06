import { create } from "zustand";
import { Contact, Message } from "../types";

export interface ChatStore {
    messages: Message[],
    selectedContact: Contact | null,
    addMessage: (data: Message) => void;
    addMessages: (data: Message[]) => void;
    resetMessage: () => void;
    setSelectedContact: (data: Contact) => void;
    updateMessage: (id: string, data: Message) => void;
    deleteMessage: (id: string) => void;
}

export const useChatStore = create<ChatStore>(
    (set) => ({
        messages: [],
        selectedContact: null,
        addMessages: (data) => set((state) => ({
            messages: [...data, ...state.messages]
        })),
        addMessage: (data) => set((state) => ({
            messages: [...state.messages, data]
        })),
        setSelectedContact: (data) => set({
            selectedContact: data
        }),
        updateMessage: (id, data) => set((state) => ({
            messages: state.messages.map(m => m.id === id ? data : m)
        })),
        deleteMessage: (id) => set((state) => ({
            messages: state.messages.filter(m => m.id !== id)
        })),
        resetMessage: () => set({
            messages: []
        })
    })
)