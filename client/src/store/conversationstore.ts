import { create } from "zustand";
import { ConversationType, MessageType, Model } from "../lib/types";
import { apiFetch, SERVER_ENDPOINTS } from "../lib/api";

interface ConversationStore {
  // State
  conversations: ConversationType[];
  selectedConversation: ConversationType | null;
  messages: Record<string, MessageType[]>;
  models: Model[];
  selectedModel: Model | null;
  isInitialLoading: boolean;
  isMessagesLoading: boolean;
  error: string | null;

  // Actions
  fetchInitialData: () => Promise<void>;
  getConversation: (id: string) => Promise<void>;
  addMessageToConversation: (
    conversationId: string,
    message: MessageType
  ) => void;
  createNewConversation: (
    conversationId: string,
    model: string,
    firstMessage: MessageType
  ) => void;
  updateConversationTitle: (conversationId: string, title: string) => void;
  updateMessageContent: (
    conversationId: string,
    messageId: string,
    content: string
  ) => void;
  updateMessageWithThinking: (
    conversationId: string,
    messageId: string,
    content: string,
    thinking: string | null,
    thinkingTime: number | null
  ) => void;
  setSelectedConversation: (conversation: ConversationType | null) => void;
  setSelectedModel: (model: Model | null) => void;
  deleteConversation: (id: string) => Promise<void>;
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  messages: {},
  models: [],
  selectedModel: null,
  isInitialLoading: false,
  isMessagesLoading: false,
  error: null,

  fetchInitialData: async () => {
    if (get().isInitialLoading) return;
    set({ isInitialLoading: true, error: null });
    try {
      console.log("Initial data fetching");
      // await new Promise((resolve) => setTimeout(resolve, 5000));
      const [conversations, models] = await Promise.all([
        apiFetch(SERVER_ENDPOINTS.conversations),
        apiFetch(SERVER_ENDPOINTS.models),
      ]);

      set({
        conversations,
        models,
        selectedModel: models[0] || null,
        isInitialLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch initial data",
        isInitialLoading: false,
      });
    }
  },

  getConversation: async (id: string) => {
    set({ isMessagesLoading: true, error: null });
    console.log("GOT ID in STORE", id);

    try {
      const existingConversation = get().conversations.find(
        (conv) => conv.ID === id
      );

      if (existingConversation) {
        if (get().messages[id]) {
          set({
            selectedConversation: {
              ...existingConversation,
              Messages: get().messages[id],
            },
            isMessagesLoading: false,
          });
          return;
        }
      }

      const conversationWithMessages: ConversationType = await apiFetch(
        `${SERVER_ENDPOINTS.conversations}/${id}`
      );

      set((state) => ({
        selectedConversation: conversationWithMessages,
        messages: {
          ...state.messages,
          [id]: conversationWithMessages.Messages || [],
        },
        isMessagesLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch conversation";
      const isNotFoundError = errorMessage.includes("not found");

      set({
        isMessagesLoading: false,
        selectedConversation: null,
        error: isNotFoundError ? null : errorMessage,
      });

      throw error;
    }
  },

  addMessageToConversation: (conversationId: string, message: MessageType) => {
    set((state) => {
      const existingConversation = state.conversations.find(
        (conv) => conv.ID === conversationId
      );

      if (!existingConversation) {
        console.error(`Conversation ${conversationId} not found`);
        return state;
      }

      const updateSelectedConversation =
        state.selectedConversation?.ID === conversationId
          ? {
              ...state.selectedConversation,
              Messages: [
                ...(state.selectedConversation.Messages || []),
                message,
              ],
            }
          : state.selectedConversation;

      const existingMessages = state.messages[conversationId] || null;
      const updatedMessages = {
        ...state.messages,
        [conversationId]: [...existingMessages, message],
      };

      const updatedConversations = state.conversations.map((conv) =>
        conv.ID === conversationId
          ? { ...conv, UpdatedAt: message.CreatedAt }
          : conv
      );

      return {
        messages: updatedMessages,
        selectedConversation: updateSelectedConversation,
        conversations: updatedConversations,
      };
    });
  },

  createNewConversation: (
    conversationId: string,
    model: string,
    firstMessage: MessageType
  ) => {
    set((state) => {
      const defaultTitle =
        firstMessage.Content.slice(0, 30) +
        (firstMessage.Content.length > 30 ? "..." : "");

      const newConversation: ConversationType = {
        ID: conversationId,
        Title: defaultTitle,
        Model: model,
        CreatedAt: firstMessage.CreatedAt,
        UpdatedAt: firstMessage.CreatedAt,
        Messages: [firstMessage],
      };

      const updatesConversations = [newConversation, ...state.conversations];

      return {
        conversations: updatesConversations,
        selectedConversation: newConversation,
        messages: {
          ...state.messages,
          [conversationId]: [firstMessage],
        },
      };
    });
  },

  updateConversationTitle: (conversationId: string, title: string) => {
    set((state) => {
      const updatedConversations = state.conversations.map((conv) =>
        conv.ID === conversationId ? { ...conv, Title: title } : conv
      );

      const updateSelectedConversation =
        state.selectedConversation?.ID === conversationId
          ? { ...state.selectedConversation, Title: title }
          : state.selectedConversation;

      return {
        conversations: updatedConversations,
        selectedConversation: updateSelectedConversation,
      };
    });
  },

  updateMessageContent: (
    conversationId: string,
    messageId: string,
    content: string
  ) => {
    set((state) => {
      // If conversation isn't selected or doesn't match, do nothing
      if (state.selectedConversation?.ID !== conversationId) {
        return state;
      }

      // Update message in selected conversation
      const updatedMessages =
        state.selectedConversation.Messages?.map((msg) =>
          msg.ID === messageId
            ? { ...msg, Content: content, RawContent: content }
            : msg
        ) || [];

      // Update in messages cache
      const cachedMessages = state.messages[conversationId] || [];
      const updatedCachedMessages = cachedMessages.map((msg) =>
        msg.ID === messageId
          ? { ...msg, Content: content, RawContent: content }
          : msg
      );

      return {
        selectedConversation: {
          ...state.selectedConversation,
          Messages: updatedMessages,
          UpdatedAt: new Date().toISOString(),
        },
        messages: {
          ...state.messages,
          [conversationId]: updatedCachedMessages,
        },
        // Update the conversation in the list for timestamp
        conversations: state.conversations.map((conv) =>
          conv.ID === conversationId
            ? { ...conv, UpdatedAt: new Date().toISOString() }
            : conv
        ),
      };
    });
  },

  // Update a message with final content and thinking information
  updateMessageWithThinking: (
    conversationId: string,
    messageId: string,
    content: string,
    thinking: string | null,
    thinkingTime: number | null
  ) => {
    set((state) => {
      // If conversation isn't selected or doesn't match, do nothing
      if (state.selectedConversation?.ID !== conversationId) {
        return state;
      }

      // Update message in selected conversation
      const updatedMessages =
        state.selectedConversation.Messages?.map((msg) =>
          msg.ID === messageId
            ? {
                ...msg,
                Content: content,
                RawContent: content,
                Thinking: thinking || null,
                ThinkingTime: thinkingTime,
              }
            : msg
        ) || [];

      // Update in messages cache
      const cachedMessages = state.messages[conversationId] || [];
      const updatedCachedMessages = cachedMessages.map((msg) =>
        msg.ID === messageId
          ? {
              ...msg,
              Content: content,
              RawContent: content,
              Thinking: thinking || null,
              ThinkingTime: thinkingTime,
            }
          : msg
      );

      return {
        selectedConversation: {
          ...state.selectedConversation,
          Messages: updatedMessages,
          UpdatedAt: new Date().toISOString(),
        },
        messages: {
          ...state.messages,
          [conversationId]: updatedCachedMessages,
        },
        // Update the conversation in the list for timestamp
        conversations: state.conversations.map((conv) =>
          conv.ID === conversationId
            ? { ...conv, UpdatedAt: new Date().toISOString() }
            : conv
        ),
      };
    });
  },
  deleteConversation: async (id: string) => {
    set({ error: null });

    try {
      await apiFetch(`${SERVER_ENDPOINTS.conversations}/${id}`, {
        method: "DELETE",
      });

      set((state) => ({
        conversations: state.conversations.filter((conv) => conv.ID !== id),
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(([key]) => key !== id)
        ),

        selectedConversation:
          state.selectedConversation?.ID === id
            ? null
            : state.selectedConversation,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete conversation",
      });
      throw error;
    }
  },

  setSelectedConversation: (conversation) => {
    set({ selectedConversation: conversation });
  },

  setSelectedModel: (model) => {
    set({ selectedModel: model });
  },
}));
