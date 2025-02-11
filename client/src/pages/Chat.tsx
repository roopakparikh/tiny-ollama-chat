import { useEffect, useState } from "react";
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
import { api } from "@/services/api";
import type { Model, Conversation } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Chat = () => {
  const { id } = useParams();
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [models, setModels] = useState<Model[]>([]);
  const [input, setInput] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const isNewChat = !id;

  // Load available models for new chat
  useEffect(() => {
    if (isNewChat) {
      api.getModels().then(setModels).catch(console.error);
    }
  }, [isNewChat]);

  // Load existing conversation
  useEffect(() => {
    if (id) {
      api
        .getConversation(id)
        .then((conv) => {
          setConversation(conv);
          setSelectedModel(conv.Model);
        })
        .catch(console.error);
    } else {
      setConversation(null);
      setInput("");
    }
  }, [id]);

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
          {conversation?.Messages.map((message) => (
            <Message key={message.ID} message={message} />
          ))}
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
