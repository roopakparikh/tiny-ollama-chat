import { Conversation } from "@/lib/types";
import { create } from "zustand";

interface ConversationStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  conversations: [],
  currentConversation: null,
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) =>
    set({ currentConversation: conversation }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),
  updateConversation: (conversation) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.ID === conversation.ID ? conversation : c
      ),
      currentConversation:
        state.currentConversation?.ID === conversation.ID
          ? conversation
          : state.currentConversation,
    })),
}));
