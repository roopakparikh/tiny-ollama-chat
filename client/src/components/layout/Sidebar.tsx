import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/stores/useConversationStore";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/stores/useUIStore";

export const Sidebar = () => {
  const { conversations } = useConversationStore();
  const { isSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col relative">
      {/* Only show on mobile and within Sheet context */}
      {typeof window !== "undefined" && window.innerWidth < 768 && (
        <div className="absolute right-2 top-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="p-4">
        <Button
          className={`w-full ${
            isSidebarOpen ? "justify-start" : "justify-center"
          } gap-2`}
          onClick={() => navigate("/")}
        >
          <MessageSquarePlus className="h-4 w-4" />
          {isSidebarOpen && "New Chat"}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {isSidebarOpen
          ? conversations.map((conversation) => (
              <Button
                key={conversation.ID}
                variant="ghost"
                className="w-full justify-start text-left font-normal mb-1"
                onClick={() => navigate(`/chat/${conversation.ID}`)}
              >
                {conversation.Title}
              </Button>
            ))
          : conversations.map((conversation) => (
              <Button
                key={conversation.ID}
                variant="ghost"
                size="icon"
                className="w-full mb-1"
                onClick={() => navigate(`/chat/${conversation.ID}`)}
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            ))}
      </ScrollArea>
    </div>
  );
};
