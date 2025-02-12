// src/stores/useConversationStore.ts
import { create } from "zustand";
import type { Conversation, Message, Model } from "@/lib/types";
import { api } from "@/services/api";

interface ConversationStore {
  // State
  conversations: Conversation[];
  models: Model[];
  isLoading: boolean;
  error: string | null;

  // Actions for conversations
  setConversations: (conversations: Conversation[]) => void;
  updateConversationMessages: (id: string, messages: Message[]) => void;
  deleteConversation: (id: string) => Promise<void>;

  // Actions for models
  setModels: (models: Model[]) => void;

  // Fetch actions
  initializeApp: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchConversationById: (id: string) => Promise<void>;
  fetchModels: () => Promise<void>;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  models: [],
  isLoading: false,
  error: null,

  initializeApp: async () => {
    try {
      set({ isLoading: true, error: null });
      const conversations = await api.getConversations();
      set({ conversations, isLoading: false });
    } catch (error) {
      set({ error: "Failed to connect to API", isLoading: false });
    }
  },

  fetchModels: async () => {
    if (get().models.length > 0) return;
    try {
      const models = await api.getModels();
      set({ models });
    } catch (error) {
      console.error("Failed to fetch models:", error);
      throw error;
    }
  },

  fetchConversationById: async (id: string) => {
    // Check if we already have messages
    const existingConv = get().conversations.find((c) => c.ID === id);
    if (existingConv?.Messages && existingConv.Messages.length > 0) {
      return; // Don't fetch if we already have messages
    }

    try {
      const conversation = await api.getConversation(id);
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.ID === id ? conversation : conv
        ),
      }));
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      throw error;
    }
  },

  setConversations: (conversations) => set({ conversations }),
  setModels: (models) => set({ models }),

  updateConversationMessages: (id, messages) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.ID === id ? { ...conv, Messages: messages } : conv
      ),
    })),

  deleteConversation: async (id) => {
    try {
      await api.deleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((conv) => conv.ID !== id),
      }));
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      throw error;
    }
  },

  fetchConversations: async () => {
    try {
      const conversations = await api.getConversations();
      set({ conversations });
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      throw error;
    }
  },
}));
