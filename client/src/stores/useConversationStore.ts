import { create } from "zustand";
import type { Conversation } from "@/lib/types";

interface ConversationStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  deleteConversation: (id: string) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  currentConversation: null,
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations].sort(
        (a, b) =>
          new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime()
      ),
    })),
  updateConversation: (conversation) =>
    set((state) => ({
      conversations: state.conversations
        .map((c) => (c.ID === conversation.ID ? conversation : c))
        .sort(
          (a, b) =>
            new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime()
        ),
      currentConversation:
        state.currentConversation?.ID === conversation.ID
          ? conversation
          : state.currentConversation,
    })),
  deleteConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.ID !== id),
      currentConversation:
        state.currentConversation?.ID === id ? null : state.currentConversation,
    })),
}));
