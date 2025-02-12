import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { Message } from "@/components/chat/Message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/stores/useConversationStore";

export const Chat = () => {
  const { id } = useParams();
  const [input, setInput] = useState("");
  const isNewChat = !id;

  // Get from store
  const models = useConversationStore((state) => state.models);
  const conversations = useConversationStore((state) => state.conversations);
  const fetchModels = useConversationStore((state) => state.fetchModels);
  const fetchConversationById = useConversationStore(
    (state) => state.fetchConversationById
  );

  // Local model selection for new chat
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Current conversation from store
  const conversation = useMemo(() => {
    if (!id) return null;
    return conversations.find((c) => c.ID === id);
  }, [id, conversations]);

  // Load models if new chat
  useEffect(() => {
    if (isNewChat && models.length === 0) {
      fetchModels();
    }
  }, [isNewChat, models.length, fetchModels]);

  // Load conversation if needed
  useEffect(() => {
    if (id) {
      fetchConversationById(id);
      // If conversation exists, set its model
      if (conversation) {
        setSelectedModel(conversation.Model);
      }
    } else {
      setInput("");
    }
  }, [id, fetchConversationById]);

  useEffect(() => {
    if (conversation) {
      setSelectedModel(conversation.Model);
    }
  }, [conversation]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      {isNewChat && (
        <div className="border-b p-4">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.model}>
                  {model.name} ({model.details.parameter_size})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto">
          {conversation && conversation.Messages ? (
            conversation.Messages.map((message) => (
              <Message key={message.ID} message={message} />
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {id ? "Loading messages..." : "Start a new conversation"}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input Area */}
      <div className="border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${selectedModel || "..."}`}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Will handle send message later
                console.log("Send:", input);
              }
            }}
          />
          <Button
            disabled={!input.trim() || (isNewChat && !selectedModel)}
            onClick={() => {
              // Will handle send message later
              console.log("Send:", input);
            }}
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
