import type { Conversation, Model } from "@/lib/types";

const BASE_URL = "http://localhost:8080/api";

export const api = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    console.log("Call to All conovos");

    const response = await fetch(`${BASE_URL}/conversations`);
    const data = await response.json();
    return data.conversations;
  },

  // Get single conversation
  getConversation: async (id: string): Promise<Conversation> => {
    console.log("Call to Single conovo");
    const response = await fetch(`${BASE_URL}/conversations/${id}`);
    if (!response.ok) {
      throw new Error("Conversation not found");
    }
    return await response.json();
  },

  // Delete conversation
  deleteConversation: async (id: string): Promise<void> => {
    console.log("Call to delete conovo");
    const response = await fetch(`${BASE_URL}/conversations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete conversation");
    }
  },

  // Get available models
  getModels: async (): Promise<Model[]> => {
    console.log("Call to All models");
    const response = await fetch(`${BASE_URL}/models`);
    const data = await response.json();
    return data.models;
  },
};
