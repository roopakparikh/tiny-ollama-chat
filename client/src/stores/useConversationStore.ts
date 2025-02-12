// src/stores/useConversationStore.ts
import { create } from "zustand";
import type { Conversation, CurrentMessage, Message, Model } from "@/lib/types";
import { api } from "@/services/api";
import { wsService } from "@/services/websocket";

interface ConversationStore {
  // State
  conversations: Conversation[];
  models: Model[];
  currentMessage: CurrentMessage | null;
  isLoading: boolean;
  error: string | null;
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Actions for conversations
  setConversations: (conversations: Conversation[]) => void;
  updateConversationMessages: (id: string, messages: Message[]) => void;
  deleteConversation: (id: string) => Promise<void>;
  addConversation: (conversation: Conversation) => void;
  addUserMessage: (id: string, content: string) => void;

  // Actions for incoming chunks
  addChunkToCurrentMessage: (chunk: string) => void;
  setThinkingState: (thinking: boolean, content?: string) => void;
  finalizeCurrentMessage: (conversationId: string) => void;

  // Actions for models
  setModels: (models: Model[]) => void;

  // Fetch actions
  initializeApp: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchConversationById: (id: string) => Promise<void>;
  fetchModels: () => Promise<void>;

  // WebSocket actions
  startNewConversation: (model: string, message: string) => void;
  resumeConversation: (id: string) => void;
  sendMessage: (id: string, message: string, model: string) => void;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  models: [],
  isLoading: false,
  error: null,
  currentMessage: null,
  selectedModel: "",
  setSelectedModel: (model: string) => set({ selectedModel: model }),

  addChunkToCurrentMessage: (chunk: string) =>
    set((state) => ({
      currentMessage: {
        role: "assistant",
        content: (state.currentMessage?.content || "") + chunk,
        thinking: state.currentMessage?.thinking
          ? {
              ...state.currentMessage.thinking,
              timeEnd: state.currentMessage.thinking.timeEnd || Date.now(),
            }
          : null,
      },
    })),

  addUserMessage: (id: string, content: string) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.ID === id
          ? {
              ...conv,
              Messages: [
                ...conv.Messages,
                {
                  ID: crypto.randomUUID(),
                  ConversationID: id,
                  Role: "user",
                  Content: content,
                  RawContent: content,
                  CreatedAt: new Date().toISOString(),
                  Thinking: null,
                  ThinkingTime: null,
                },
              ],
            }
          : conv
      ),
    })),

  setThinkingState: (thinking: boolean, content?: string) =>
    set((state) => ({
      currentMessage: {
        role: "assistant",
        content: state.currentMessage?.content || "",
        thinking: thinking
          ? {
              content: content
                ? (state.currentMessage?.thinking?.content || "") + content
                : state.currentMessage?.thinking?.content || "",
              isThinking: thinking,
              timeStart:
                state.currentMessage?.thinking?.timeStart || Date.now(),
              timeEnd: null, // Reset timeEnd when thinking is active
            }
          : state.currentMessage?.thinking
          ? {
              ...state.currentMessage.thinking,
              isThinking: false,
              timeEnd: Date.now(), // Set timeEnd when thinking stops
            }
          : null,
      },
    })),

  finalizeCurrentMessage: (conversationId: string) =>
    set((state) => {
      if (!state.currentMessage) return state;

      const thinkingTime = state.currentMessage.thinking
        ? (state.currentMessage.thinking.timeEnd! -
            state.currentMessage.thinking.timeStart) /
          1000
        : null;

      const newMessage = {
        ID: crypto.randomUUID(),
        ConversationID: conversationId,
        Role: state.currentMessage.role,
        Content: state.currentMessage.content,
        RawContent: state.currentMessage.content,
        Thinking: state.currentMessage.thinking?.content || null,
        ThinkingTime: thinkingTime,
        CreatedAt: new Date().toISOString(),
      };

      const conversations = state.conversations.map((conv) =>
        conv.ID === conversationId
          ? {
              ...conv,
              Messages: Array.isArray(conv.Messages)
                ? [...conv.Messages, newMessage]
                : [newMessage],
            }
          : conv
      );

      return {
        conversations,
        currentMessage: null,
      };
    }),

  addConversation: (newConversation: Conversation) =>
    set((state) => ({
      conversations: [
        {
          ...newConversation,
          Messages: [], // Ensure Messages is initialized as empty array
          Model: state.selectedModel || newConversation.Model,
        },
        ...state.conversations,
      ],
    })),

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

  startNewConversation: (model: string, message: string) => {
    wsService.sendMessage({
      type: "start_conversation",
      model,
      message,
    });
  },

  resumeConversation: (id: string) => {
    wsService.sendMessage({
      type: "resume_conversation",
      convo_id: id,
    });
  },

  sendMessage: (id: string, message: string, model: string) => {
    wsService.sendMessage({
      type: "message",
      convo_id: id,
      model,
      message,
    });
  },
}));
