import { wsService } from "@/services/websocket";
import { useConversationStore } from "@/stores/useConversationStore";
import { createContext, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const WebSocketContext = createContext<null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const initializeApp = useConversationStore((state) => state.initializeApp);
  const navigate = useNavigate();

  useEffect(() => {
    const waitForConnection = () => {
      if (wsService.isConnected()) {
        initializeApp();
      } else {
        setTimeout(waitForConnection, 100);
      }
    };
    waitForConnection();

    const unsubscribe = wsService.subscribe((data) => {
      const store = useConversationStore.getState();

      switch (data.type) {
        case "conversation_started": {
          const newId: string = data.content;
          store.addConversation({
            ID: newId,
            Title: store.currentMessage?.content.slice(0, 30) || "New Chat",
            Model: store.selectedModel || "",
            CreatedAt: new Date().toISOString(),
            UpdatedAt: new Date().toISOString(),
            Messages: [],
          });
          navigate(`/chat/${newId}`);
          break;
        }

        case "conversation_resumed": {
          // Conversation is ready to receive messages
          console.log("Conversation resumed:", data.content);
          break;
        }

        case "thinking_start": {
          store.setThinkingState(true);
          break;
        }

        case "thinking_chunk": {
          if (data.content?.trim()) {
            store.setThinkingState(true, data.content);
          }
          break;
        }

        case "thinking_end": {
          store.setThinkingState(false);
          break;
        }

        case "response_chunk": {
          if (data.content?.trim()) {
            store.addChunkToCurrentMessage(data.content);
          }
          break;
        }

        case "done": {
          const currentConvoId = window.location.pathname.split("/").pop();
          if (currentConvoId) {
            store.finalizeCurrentMessage(currentConvoId);
          }
          break;
        }

        case "error": {
          // Handle any errors
          console.error("WebSocket error:", data.content);
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [initializeApp, navigate]);

  return (
    <WebSocketContext.Provider value={null}>
      {children}
    </WebSocketContext.Provider>
  );
}
